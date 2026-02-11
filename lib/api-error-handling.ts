/**
 * API Error Handling Utilities for KidsAIBooks
 *
 * Provides consistent error handling across the application:
 * - Error type detection (network, rate limit, API errors)
 * - User-friendly error messages for AI generation errors
 * - Logging helpers for debugging
 */

// Error types that can occur during API calls
export type ApiErrorType =
  | "network"
  | "rate_limit"
  | "content_filter"
  | "server_error"
  | "client_error"
  | "timeout"
  | "unknown";

// API error with additional context
export interface ApiError {
  type: ApiErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable: boolean;
}

// User-friendly error messages for different error types
const USER_FRIENDLY_MESSAGES: Record<ApiErrorType, string> = {
  network:
    "Oops! It looks like we lost our connection. Please check your internet and try again!",
  rate_limit:
    "The magic is working a bit too hard right now! Let's wait a moment and try again.",
  content_filter:
    "Let me try a different approach to create something even more magical!",
  server_error:
    "Oops! The magic got a bit tangled. Let's try that again!",
  client_error:
    "Something doesn't look quite right. Let's try a different approach!",
  timeout:
    "This is taking longer than expected. Let's give it another try!",
  unknown:
    "Oops! Something unexpected happened. Let's try that again!",
};

// Retry advice for different error types
const RETRY_MESSAGES: Record<ApiErrorType, string> = {
  network: "Check your connection and click 'Try Again'",
  rate_limit: "Wait a moment, then click 'Try Again'",
  content_filter: "Click 'Try Again' for a new creation",
  server_error: "Click 'Try Again' to retry",
  client_error: "Click 'Try Again' with different options",
  timeout: "Click 'Try Again' to retry",
  unknown: "Click 'Try Again' to retry",
};

/**
 * Detect the type of error from a fetch response or Error object
 */
export function detectErrorType(
  error: unknown,
  response?: Response
): ApiErrorType {
  // Check for network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "network";
  }

  if (
    error instanceof Error &&
    (error.message.includes("NetworkError") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch"))
  ) {
    return "network";
  }

  // Check for timeout errors
  if (error instanceof Error && error.name === "AbortError") {
    return "timeout";
  }

  // Check response status codes
  if (response) {
    if (response.status === 429) {
      return "rate_limit";
    }
    if (response.status >= 400 && response.status < 500) {
      return "client_error";
    }
    if (response.status >= 500) {
      return "server_error";
    }
  }

  // Check for rate limit indicators in error message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("rate limit") ||
      message.includes("quota") ||
      message.includes("too many requests")
    ) {
      return "rate_limit";
    }
    if (
      message.includes("content filter") ||
      message.includes("safety") ||
      message.includes("blocked")
    ) {
      return "content_filter";
    }
    if (message.includes("timeout") || message.includes("timed out")) {
      return "timeout";
    }
  }

  return "unknown";
}

/**
 * Create a structured API error from an error and optional response
 */
export function createApiError(
  error: unknown,
  response?: Response
): ApiError {
  const type = detectErrorType(error, response);
  const statusCode = response?.status;

  // Determine if this error is retryable
  const retryable = ["network", "rate_limit", "server_error", "timeout", "unknown"].includes(
    type
  );

  return {
    type,
    message: error instanceof Error ? error.message : String(error),
    originalError: error instanceof Error ? error : undefined,
    statusCode,
    retryable,
  };
}

/**
 * Get a user-friendly error message for display in the chat
 */
export function getUserFriendlyMessage(errorType: ApiErrorType): string {
  return USER_FRIENDLY_MESSAGES[errorType] || USER_FRIENDLY_MESSAGES.unknown;
}

/**
 * Get retry advice for a specific error type
 */
export function getRetryAdvice(errorType: ApiErrorType): string {
  return RETRY_MESSAGES[errorType] || RETRY_MESSAGES.unknown;
}

/**
 * Format an error for display in the AI chat
 * Returns a friendly message appropriate for children's app
 */
export function formatErrorForChat(
  error: unknown,
  response?: Response
): string {
  const apiError = createApiError(error, response);
  return getUserFriendlyMessage(apiError.type);
}

/**
 * Log an API error with context for debugging
 */
export function logApiError(
  context: string,
  error: unknown,
  response?: Response,
  additionalInfo?: Record<string, unknown>
): void {
  const apiError = createApiError(error, response);

  console.error(`[API Error] ${context}:`, {
    type: apiError.type,
    message: apiError.message,
    statusCode: apiError.statusCode,
    retryable: apiError.retryable,
    ...additionalInfo,
  });

  // Log the full error for debugging
  if (apiError.originalError) {
    console.error(`[API Error] Original error:`, apiError.originalError);
  }
}

/**
 * Check if an error indicates a rate limit was hit
 */
export function isRateLimitError(error: unknown, response?: Response): boolean {
  return detectErrorType(error, response) === "rate_limit";
}

/**
 * Check if an error indicates a network problem
 */
export function isNetworkError(error: unknown): boolean {
  return detectErrorType(error) === "network";
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown, response?: Response): boolean {
  const apiError = createApiError(error, response);
  return apiError.retryable;
}

/**
 * Wrapper for async operations with error handling
 * Returns a tuple of [result, error] to avoid try/catch boilerplate
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: string
): Promise<[T | null, ApiError | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    logApiError(context, error);
    return [null, createApiError(error)];
  }
}

/**
 * Fetch wrapper with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 60000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
