import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Get the appropriate Stripe key based on environment
const getStripeKey = () => {
  const key =
    process.env.NODE_ENV === "development"
      ? process.env.STRIPE_TEST_SECRET_KEY
      : process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Stripe secret key is not configured");
  }
  return key;
};

// Lazy-initialize Stripe
const getStripe = () => {
  return new Stripe(getStripeKey(), {
    apiVersion: "2025-08-27.basil",
  });
};

// Pricing constants
const FIRST_EDITION_PRICE = 29;
const ADVENTURE_PACK_PRICE = 29;

export async function POST(req: Request) {
  try {
    const { bumpSelected } = await req.json();

    // Get authenticated user if available
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Calculate totals
    const totalCredits = bumpSelected ? 6 : 3;

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "AgentTodo First Edition",
            description: "3 personalized storybooks with all launch themes",
          },
          unit_amount: FIRST_EDITION_PRICE * 100,
        },
        quantity: 1,
      },
    ];

    // Add bump if selected
    if (bumpSelected) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Adventure Pack",
            description: "3 extra story credits + all future themes",
          },
          unit_amount: ADVENTURE_PACK_PRICE * 100,
        },
        quantity: 1,
      });
    }

    // Create Checkout Session with embedded mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      return_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&credits=${totalCredits}`,
      customer_email: user?.email || undefined,
      metadata: {
        userId: user?.id || "anonymous",
        credits: totalCredits.toString(),
        bumpSelected: bumpSelected ? "true" : "false",
        productType: "first_edition",
      },
      payment_method_types: ["card", "paypal", "link"],
      // Enable Link for faster checkout
      payment_method_options: {
        link: {
          persistent_token: undefined,
        },
      },
      // Allow promo codes
      allow_promotion_codes: true,
      // Collect billing address for tax purposes
      billing_address_collection: "auto",
      // Custom text
      custom_text: {
        submit: {
          message: "Your storybook credits will be available immediately after payment.",
        },
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
    });
  } catch (error: unknown) {
    console.error("Error creating embedded checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
