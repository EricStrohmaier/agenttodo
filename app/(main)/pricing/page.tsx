import { createClient } from "@/utils/supabase/server";
import { getUserPlan, isStripeEnabled } from "@/lib/user-plan";
import PricingClient from "./pricing-client";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stripeEnabled = isStripeEnabled();
  const userPlan = user ? await getUserPlan(user.id) : { plan: "free" as const, stripeCustomerId: null, stripeSubscriptionId: null, currentPeriodEnd: null };

  return (
    <PricingClient
      user={user ? { id: user.id, email: user.email ?? undefined } : null}
      userPlan={userPlan}
      stripeEnabled={stripeEnabled}
    />
  );
}
