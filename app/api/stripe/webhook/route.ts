import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// Initialize Stripe lazily to avoid build errors when key is not set
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2025-08-27.basil",
  });
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;
  let stripe: Stripe;

  try {
    stripe = getStripe();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Stripe not configured";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 },
    );
  }

  // Helper function to get customer email from various Stripe objects
  const getCustomerEmail = (object: any): string => {
    // Try different paths where email might be stored depending on the event type
    return (
      object.customer_email ||
      object.metadata?.email ||
      object.receipt_email ||
      (object.customer && typeof object.customer === "string"
        ? // If customer is just an ID, we can't get the email directly
          ""
        : object.customer?.email) ||
      ""
    );
  };

  // Helper function to get customer name from various Stripe objects
  const getCustomerName = (object: any): string => {
    return object.metadata?.name || object.customer?.name || "";
  };

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Handle AgentTodo credit purchases (support both old and new names)
      if (paymentIntent.metadata?.productType === "first_edition" || paymentIntent.metadata?.productType === "founding_members") {
        try {
          const userId = paymentIntent.metadata.userId;
          const credits = parseInt(paymentIntent.metadata.credits || "3");
          const hasBump = paymentIntent.metadata.bumpSelected === "true";

          if (userId && userId !== "anonymous") {
            // Update user's credit count in the database
            // Note: Make sure your users table has these columns:
            // - story_credits (integer, default 0)
            // - is_founding_member (boolean, default false)
            // - has_adventure_pack (boolean, default false)
            try {
              const supabase = await createClient();

              // Get current credits (handle missing column gracefully)
              const { data: userData, error: fetchError } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

              if (fetchError) {
                console.error("Error fetching user:", fetchError);
              } else {
                const currentCredits = (userData as Record<string, unknown>)?.story_credits as number || 0;
                const newCredits = currentCredits + credits;

                // Update credits - use upsert to handle missing fields
                const { error: updateError } = await supabase
                  .from("users")
                  .update({
                    story_credits: newCredits,
                    is_founding_member: true,
                    has_adventure_pack: hasBump,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", userId);

                if (updateError) {
                  console.error("Error updating user credits:", updateError);
                } else {
                  console.log(
                    `Successfully added ${credits} credits to user ${userId}. New total: ${newCredits}`
                  );
                }
              }
            } catch (dbError) {
              console.error("Database error updating credits:", dbError);
              // Don't fail the webhook - payment was still successful
            }
          }

          console.log(
            `AgentTodo payment succeeded: ${credits} credits, user: ${userId}, bump: ${hasBump}`
          );
        } catch (error) {
          console.error("Error processing AgentTodo payment:", error);
        }
      }
      break;

    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      // Handle AgentTodo embedded checkout
      if (checkoutSession.metadata?.productType === "first_edition" || checkoutSession.metadata?.productType === "founding_members") {
        try {
          const userId = checkoutSession.metadata.userId;
          const credits = parseInt(checkoutSession.metadata.credits || "3");
          const hasBump = checkoutSession.metadata.bumpSelected === "true";

          if (userId && userId !== "anonymous") {
            try {
              const supabase = await createClient();

              // Get current credits
              const { data: userData, error: fetchError } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

              if (fetchError) {
                console.error("Error fetching user:", fetchError);
              } else {
                const currentCredits = (userData as Record<string, unknown>)?.story_credits as number || 0;
                const newCredits = currentCredits + credits;

                // Update credits
                const { error: updateError } = await supabase
                  .from("users")
                  .update({
                    story_credits: newCredits,
                    is_founding_member: true,
                    has_adventure_pack: hasBump,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", userId);

                if (updateError) {
                  console.error("Error updating user credits:", updateError);
                } else {
                  console.log(
                    `Successfully added ${credits} credits to user ${userId}. New total: ${newCredits}`
                  );
                }
              }
            } catch (dbError) {
              console.error("Database error updating credits:", dbError);
            }
          }

          console.log(
            `AgentTodo checkout completed: ${credits} credits, user: ${userId}, bump: ${hasBump}`
          );
        } catch (error) {
          console.error("Error processing AgentTodo checkout:", error);
        }
      } else if (checkoutSession.metadata?.product === "unfollow-challenge") {
        // Legacy unfollow-challenge handling
        try {
          const customerName = getCustomerName(checkoutSession);
          const customerEmail = getCustomerEmail(checkoutSession);

          if (customerEmail) {
            console.log(
              `Processing successful payment for ${customerName} (${customerEmail})`,
            );
          } else {
            console.error("No customer email found in checkout session");
          }
        } catch (error) {
          console.error("Error processing successful payment:", error);
        }
      }
      console.log("Checkout session completed:", checkoutSession.id);
      break;

    case "charge.failed":
    case "payment_intent.payment_failed":
    case "checkout.session.async_payment_failed":
      // Handle failed payments
      try {
        const failedPayment = event.data.object;
        const customerEmail = getCustomerEmail(failedPayment);
      } catch (error) {
        console.error("Error processing failed payment:", error);
      }
      break;

    case "charge.refunded":
      // Handle refunds
      try {
        const refund = event.data.object;
        const customerEmail = getCustomerEmail(refund);

        if (customerEmail) {
          console.log(`Processing refund for ${customerEmail}`);
        }
      } catch (error) {
        console.error("Error processing refund:", error);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
