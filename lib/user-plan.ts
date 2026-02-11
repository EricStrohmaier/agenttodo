import { supabaseAdmin } from "@/utils/supabase/admin";

export function isStripeEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

export type UserPlan = {
  plan: "free" | "pro";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
};

export async function getUserPlan(userId: string): Promise<UserPlan> {
  // Self-hosters without Stripe get unlimited (pro) access
  if (!isStripeEnabled()) {
    return {
      plan: "pro",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    };
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("user_plans")
    .select("plan, stripe_customer_id, stripe_subscription_id, current_period_end")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return {
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    };
  }

  return {
    plan: data.plan as "free" | "pro",
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    currentPeriodEnd: data.current_period_end,
  };
}
