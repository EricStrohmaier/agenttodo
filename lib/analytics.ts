/**
 * Analytics Service for Generation Tracking
 *
 * Persists generation events to the database via the
 * log_generation_event RPC function (SECURITY DEFINER, bypasses RLS).
 */

import { createClient } from "@/utils/supabase/server";

// Event types matching the DB CHECK constraint
export type GenerationEventType =
  | "photo_analysis"
  | "style_preview"
  | "story_concepts"
  | "story_cover"
  | "story_text"
  | "page_spread"
  | "pdf_export";

// Input for tracking a generation event
export interface TrackGenerationInput {
  userId?: string;
  eventType: GenerationEventType;
  success: boolean;
  durationMs?: number;
  // Context
  bookId?: string;
  bookSpreadId?: string;
  spreadIndex?: number;
  artStyle?: string;
  modelUsed?: string;
  // Request/response for debugging
  requestData?: Record<string, unknown>;
  responseData?: Record<string, unknown>;
  // Error info
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Persist a generation event to the database.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function trackGeneration(input: TrackGenerationInput): Promise<void> {
  try {
    const supabase = await createClient();

    // Use the SECURITY DEFINER RPC to bypass RLS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      p_event_type: input.eventType,
      p_success: input.success,
    };
    if (input.userId) params.p_user_id = input.userId;
    if (input.durationMs != null) params.p_duration_ms = input.durationMs;
    if (input.bookId) params.p_book_id = input.bookId;
    if (input.bookSpreadId) params.p_book_spread_id = input.bookSpreadId;
    if (input.spreadIndex != null) params.p_spread_index = input.spreadIndex;
    if (input.artStyle) params.p_art_style = input.artStyle;
    if (input.modelUsed) params.p_model_used = input.modelUsed;
    if (input.requestData) params.p_request_data = JSON.stringify(input.requestData);
    if (input.responseData) params.p_response_data = JSON.stringify(input.responseData);
    if (input.errorCode) params.p_error_code = input.errorCode;
    if (input.errorMessage) params.p_error_message = input.errorMessage;

    const { error } = await supabase.rpc("log_generation_event", params);

    if (error) {
      console.error("[Analytics] Failed to log generation event:", error.message);
    }
  } catch (err) {
    // Never throw from analytics — it's optional telemetry
    console.error("[Analytics] Error in trackGeneration:", err);
  }
}

/**
 * Helper to create a timer for tracking generation duration
 */
export function createGenerationTimer(): { stop: () => number } {
  const startTime = Date.now();
  return {
    stop: () => Date.now() - startTime,
  };
}
