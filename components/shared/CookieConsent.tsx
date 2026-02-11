"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import posthog from "posthog-js";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

type ConsentStatus = "pending" | "accepted" | "declined";

export function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;

    if (savedConsent === "accepted") {
      enableTracking();
      setStatus("accepted");
    } else if (savedConsent === "declined") {
      setStatus("declined");
    } else {
      setStatus("pending");
    }
  }, []);

  const enableTracking = () => {
    // Opt in to PostHog tracking
    posthog.opt_in_capturing();
    // Enable session recording
    posthog.set_config({ disable_session_recording: false });
    // Capture the initial pageview
    posthog.capture("$pageview", { $current_url: window.location.href });
  };

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    enableTracking();
    setStatus("accepted");
    // Track consent event
    posthog.capture("cookie_consent_given", { consent_type: "accepted" });
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    posthog.opt_out_capturing();
    setStatus("declined");
  };

  if (status === null || status !== "pending") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto max-w-md bg-page-surface border border-line rounded-xl p-5 shadow-lg z-50">
      <button
        onClick={() => setStatus("declined")}
        className="absolute top-3 right-3 text-content-muted hover:text-content transition-colors"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col gap-4 pr-6">
        <div>
          <h3 className="font-semibold text-content text-base">
            We value your privacy
          </h3>
          <p className="text-sm text-content-body mt-2 leading-relaxed">
            We use cookies to improve your experience and analyze site traffic.{" "}
            <Link
              href="/privacy"
              className="text-brand hover:text-brand-dark underline underline-offset-2"
            >
              Learn more
            </Link>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="text-sm h-9 px-4 text-content-secondary hover:text-content border-line hover:border-line-medium"
          >
            Decline all
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="text-sm h-9 px-4 bg-brand hover:bg-brand-dark text-white"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

export function resetCookieConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_KEY);
  posthog.opt_out_capturing();
  window.location.reload();
}
