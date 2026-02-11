import { PostHog } from "posthog-node";
import { cookies } from "next/headers";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}

/**
 * Get the PostHog distinct_id from cookies (set by client-side PostHog)
 * Returns null if user hasn't consented or no ID exists
 */
export async function getPostHogDistinctId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();

    // PostHog stores the distinct_id in a cookie with this pattern
    const phCookie = cookieStore.get(`ph_${process.env.NEXT_PUBLIC_POSTHOG_KEY}_posthog`);

    if (phCookie?.value) {
      const parsed = JSON.parse(decodeURIComponent(phCookie.value));
      return parsed.distinct_id || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Track server-side event connected to the current user session
 *
 * This automatically reads the PostHog distinct_id from cookies,
 * so events will be linked to the same user as client-side events.
 *
 * Only tracks if user has a PostHog session (i.e., has consented)
 */
export async function trackServerEvent(
  eventName: string,
  properties?: Record<string, unknown>
): Promise<boolean> {
  const distinctId = await getPostHogDistinctId();

  if (!distinctId) {
    // User hasn't consented or no session - don't track
    return false;
  }

  const client = getPostHogClient();
  client.capture({
    distinctId,
    event: eventName,
    properties: {
      $lib: "posthog-node",
      source: "server",
      ...properties,
    },
  });

  return true;
}

/**
 * Track anonymous server-side events (no consent required)
 *
 * Use for aggregate metrics that don't need user connection:
 * - Error rates, performance metrics
 * - Feature usage counts
 * - System health monitoring
 *
 * These events are NOT linked to individual users.
 */
export function trackAnonymousEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  const client = getPostHogClient();

  client.capture({
    distinctId: "anonymous-server",
    event: eventName,
    properties: {
      $process_person_profile: false,
      anonymous: true,
      ...properties,
    },
  });
}

/**
 * Track event for a specific user ID (when you know the user)
 * Use this in webhooks or background jobs where you have the user ID
 */
export function trackUserEvent(
  userId: string,
  eventName: string,
  properties?: Record<string, unknown>
): void {
  const client = getPostHogClient();

  client.capture({
    distinctId: userId,
    event: eventName,
    properties,
  });
}
