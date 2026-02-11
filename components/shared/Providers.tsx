"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import posthog from "posthog-js";
import { hasAnalyticsConsent } from "./CookieConsent";

/**
 * PostHog Pageview Tracker
 *
 * Automatically captures pageview events when the route changes.
 * Only captures if user has given cookie consent.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only capture if user has consented
    if (pathname && hasAnalyticsConsent()) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Wrapped pageview tracker with Suspense boundary
 *
 * This prevents useSearchParams from de-opting the entire app into client-side rendering.
 * See: https://nextjs.org/docs/messages/deopted-into-client-rendering
 */
export function PostHogPageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
