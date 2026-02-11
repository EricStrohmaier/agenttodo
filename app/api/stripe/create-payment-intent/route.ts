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

export async function POST(req: Request) {
  try {
    const { amount, credits, bumpSelected, userId, email } = await req.json();

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Get authenticated user if available
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const customerEmail = email || user?.email;
    const customerId = userId || user?.id;

    const stripe = getStripe();

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: customerId || "anonymous",
        credits: credits.toString(),
        bumpSelected: bumpSelected ? "true" : "false",
        productType: "first_edition",
      },
      receipt_email: customerEmail || undefined,
      description: bumpSelected
        ? "AgentBoard First Edition + Adventure Pack (6 Story Credits)"
        : "AgentBoard First Edition (3 Story Credits)",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    console.error("Error creating payment intent:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create payment intent";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
