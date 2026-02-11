import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy-initialize Stripe to avoid build errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
};

export async function POST(req: Request) {
  try {
    // Check if Stripe API key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Payment processing is not configured. Please contact the site administrator.",
        },
        { status: 500 },
      );
    }

    // Get the authenticated user
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userData = user?.user;

    // Check if user is authenticated when required
    const requestData = await req.json();
    const {
      formData,
      userId,
      priceId,
      amount,
      productName,
      requireAuth,
      successUrl,
      cancelUrl,
    } = requestData;

    // Check if user authentication is required
    if (requireAuth && !userData) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Handle both pricing models: direct price/product and project submission
    const lineItems = [];

    if (priceId) {
      // Direct pricing model (e.g., subscription plan)
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: productName || "Unlimited Plan",
            description: "Monthly subscription",
          },
          unit_amount: amount ? Math.round(amount * 100) : 9900, // Default to $99 if not specified
        },
        quantity: 1,
      });
    } else if (formData) {
      // Project submission model
      // Calculate payment amounts
      const projectBudget = parseFloat(formData.budget || "0");
      const applicationFee = 25; // Fixed application fee
      let paymentAmount = applicationFee;

      // Calculate payment based on selected option
      if (formData.paymentOption === "full") {
        paymentAmount += projectBudget;
      } else if (formData.paymentOption === "partial_50") {
        paymentAmount += projectBudget * 0.5;
      } else if (formData.paymentOption === "partial_25") {
        paymentAmount += projectBudget * 0.25;
      }

      // Create line items for project submission
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Application Fee",
            description: "One-time application fee",
          },
          unit_amount: applicationFee * 100,
        },
        quantity: 1,
      });
    } else {
      return NextResponse.json(
        { error: "Missing payment information" },
        { status: 400 },
      );
    }

    // Create a Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Set up session parameters
    const stripe = getStripe();
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: userData?.email || undefined,
      success_url:
        successUrl ||
        `${baseUrl}/submit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/submit/payment?canceled=true`,
      metadata: {
        userId: userId || userData?.id || "anonymous",
        // Include projectId only if formData exists and has a projectId
        ...(formData?.projectId && { projectId: formData.projectId }),
        // Add priceId if it exists
        ...(priceId && { priceId }),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
