"use client";

import { PLANS } from "@/lib/plans";
import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { UserPlan } from "@/lib/user-plan";

type Props = {
  user: { id: string; email?: string } | null;
  userPlan: UserPlan;
  stripeEnabled: boolean;
};

export default function PricingClient({ user, userPlan, stripeEnabled }: Props) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription-checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned:", data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: userPlan.stripeCustomerId,
          returnUrl: window.location.origin + "/pricing",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No portal URL returned:", data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error("Portal error:", err);
      setLoading(false);
    }
  };

  const isPro = userPlan.plan === "pro";

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Simple pricing
          </h1>
          <p className="text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 px-4 py-3 text-sm text-green-800 dark:text-green-200">
            Your subscription is active! Welcome to Pro.
          </div>
        )}
        {canceled && (
          <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
            Checkout was canceled. You can try again anytime.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="border rounded-lg p-6 flex flex-col">
            <h2 className="text-lg font-semibold">{PLANS.free.name}</h2>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {PLANS.free.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {user && !isPro ? (
              <span className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground cursor-default">
                Current Plan
              </span>
            ) : user && isPro ? (
              <span className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground cursor-default opacity-50">
                Free
              </span>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Pro */}
          <div className="border-2 border-primary rounded-lg p-6 flex flex-col relative">
            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              Recommended
            </div>
            <h2 className="text-lg font-semibold">{PLANS.pro.name}</h2>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold">$4.99</span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {PLANS.pro.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {user && isPro ? (
              <button
                onClick={handleManage}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Manage Subscription"}
              </button>
            ) : user && !isPro ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Upgrade to Pro"}
              </button>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
