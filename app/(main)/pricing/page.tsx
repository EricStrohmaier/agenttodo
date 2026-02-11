import { PLANS } from "@/lib/plans";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
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
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Get Started
            </Link>
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
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
