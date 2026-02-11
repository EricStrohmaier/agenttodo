import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
};

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();

    // Look up existing stripe_customer_id
    const sb = supabaseAdmin();
    const { data: planRow } = await sb
      .from("user_plans")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const existingCustomerId = planRow?.stripe_customer_id ?? undefined;

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            product_data: { name: "AgentTodo Pro" },
            unit_amount: 499,
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout";
    console.error("Subscription checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
