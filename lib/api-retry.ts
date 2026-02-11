/**
 * Exponential Backoff Retry Logic for API Calls
 *
 * Provides automatic retry with exponential backoff for transient failures:
 * - Retries on: network errors, 429 (rate limit), 500-503 (server errors)
 * - Does NOT retry on: 400 (bad request), 401/403 (auth errors)
 * - Exponential backoff: 1s, 2s, 4s delays between retries
 * - Maximum 3 retry attempts
 */

// Configuration for retry behavior
const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1 second
const MAX_DELAY_MS = 4000; // 4 seconds (for 3rd retry)

// HTTP status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = [
  429, // Too Many Requests (rate limit)
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
];

// HTTP status codes that should NOT trigger a retry (permanent failures)
const NON_RETRYABLE_STATUS_CODES = [
  400, // Bad Request
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
];

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds (default: 1000) */
  baseDelayMs?: number;
  /** Context for logging (e.g., "analyze-photo", "generate-story") */
  context: string;
  /** Optional callback called before each retry with attempt number and delay */
  onRetry?: (attempt: number, delayMs: number, error: Error | Response) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  lastStatusCode?: number;
}

/**
 * Check if an error or response indicates a retryable failure
 */
export function isRetryable(errorOrResponse: Error | Response): boolean {
  // Check if it's a Response object
  if (errorOrResponse instanceof Response) {
    const status = errorOrResponse.status;

    // Don't retry on permanent failures
    if (NON_RETRYABLE_STATUS_CODES.includes(status)) {
      return false;
    }

    // Retry on transient failures
    if (RETRYABLE_STATUS_CODES.includes(status)) {
      return true;
    }

    return false;
  }

  // Check if it's an Error object (network errors)
  if (errorOrResponse instanceof Error) {
    const message = errorOrResponse.message.toLowerCase();

    // Network errors are retryable
    if (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("failed to fetch") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("etimedout") ||
      message.includes("socket")
    ) {
      return true;
    }

    // Timeout errors are retryable
    if (errorOrResponse.name === "AbortError" || message.includes("timeout")) {
      return true;
    }

    // Rate limit mentioned in error message
    if (
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("quota")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay for exponential backoff
 * Returns: 1s, 2s, 4s for attempts 0, 1, 2
 */
function calculateDelay(attempt: number, baseDelayMs: number): number {
  const delay = baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, MAX_DELAY_MS);
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log a retry attempt
 */
function logRetry(
  context: string,
  attempt: number,
  maxRetries: number,
  delayMs: number,
  error: Error | Response
): void {
  const errorDetails =
    error instanceof Response
      ? `HTTP ${error.status} ${error.statusText}`
      : error.message;

  console.log(
    `[${context}] Retry ${attempt + 1}/${maxRetries} after ${delayMs}ms delay. Error: ${errorDetails}`
  );
}

/**
 * Execute an async operation with exponential backoff retry
 *
 * @param operation - Async function that returns a Response or throws an Error
 * @param config - Retry configuration
 * @returns Promise with the successful Response or the last error
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
 *     method: "POST",
 *     body: JSON.stringify(payload),
 *   }),
 *   { context: "generate-story", maxRetries: 3 }
 * );
 *
 * if (!result.success) {
 *   throw result.error;
 * }
 *
 * const data = await result.data.json();
 * ```
 */
export async function withRetry(
  operation: () => Promise<Response>,
  config: RetryConfig
): Promise<RetryResult<Response>> {
  const { maxRetries = DEFAULT_MAX_RETRIES, baseDelayMs = BASE_DELAY_MS, context, onRetry } = config;

  let lastError: Error | undefined;
  let lastStatusCode: number | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await operation();
      lastStatusCode = response.status;

      // Check if response indicates success
      if (response.ok) {
        if (attempt > 0) {
          console.log(`[${context}] Succeeded on attempt ${attempt + 1}/${maxRetries}`);
        }
        return {
          success: true,
          data: response,
          attempts: attempt + 1,
          lastStatusCode,
        };
      }

      // Check if we should retry this response
      if (!isRetryable(response)) {
        console.log(
          `[${context}] Non-retryable HTTP status ${response.status} on attempt ${attempt + 1}`
        );
        return {
          success: false,
          data: response,
          attempts: attempt + 1,
          lastStatusCode,
          error: new Error(`HTTP ${response.status}: ${response.statusText}`),
        };
      }

      // Calculate delay and retry
      if (attempt < maxRetries - 1) {
        const delayMs = calculateDelay(attempt, baseDelayMs);
        logRetry(context, attempt, maxRetries, delayMs, response);
        onRetry?.(attempt, delayMs, response);
        await sleep(delayMs);
      } else {
        // Last attempt failed
        return {
          success: false,
          data: response,
          attempts: attempt + 1,
          lastStatusCode,
          error: new Error(`HTTP ${response.status}: ${response.statusText} after ${maxRetries} attempts`),
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (!isRetryable(lastError)) {
        console.log(`[${context}] Non-retryable error on attempt ${attempt + 1}: ${lastError.message}`);
        return {
          success: false,
          attempts: attempt + 1,
          lastStatusCode,
          error: lastError,
        };
      }

      // Calculate delay and retry
      if (attempt < maxRetries - 1) {
        const delayMs = calculateDelay(attempt, baseDelayMs);
        logRetry(context, attempt, maxRetries, delayMs, lastError);
        onRetry?.(attempt, delayMs, lastError);
        await sleep(delayMs);
      }
    }
  }

  // All retries exhausted
  console.log(`[${context}] All ${maxRetries} retry attempts exhausted`);
  return {
    success: false,
    attempts: maxRetries,
    lastStatusCode,
    error: lastError || new Error(`Operation failed after ${maxRetries} attempts`),
  };
}

/**
 * Execute a fetch operation with exponential backoff retry
 * Convenience wrapper around withRetry for common fetch patterns
 *
 * @param url - The URL to fetch
 * @param options - Fetch options (method, headers, body, etc.)
 * @param config - Retry configuration
 * @returns Promise with the successful Response or throws an error
 *
 * @example
 * ```ts
 * const response = await fetchWithRetry(
 *   `${GEMINI_API_URL}?key=${apiKey}`,
 *   {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(payload),
 *   },
 *   { context: "generate-story" }
 * );
 *
 * const data = await response.json();
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  config: RetryConfig
): Promise<Response> {
  const result = await withRetry(() => fetch(url, options), config);

  if (!result.success) {
    throw result.error || new Error("Fetch failed after retries");
  }

  return result.data!;
}

/**
 * Execute a Gemini API call with exponential backoff retry
 * Specialized for Gemini API patterns with automatic error detection
 *
 * @param apiUrl - The Gemini API endpoint URL (without API key)
 * @param apiKey - The Gemini API key
 * @param body - The request body (will be JSON stringified)
 * @param config - Retry configuration
 * @returns Promise with the parsed JSON response or throws an error
 *
 * @example
 * ```ts
 * const data = await geminiApiWithRetry(
 *   GEMINI_TEXT_API_URL,
 *   apiKey,
 *   {
 *     contents: [{ parts: [{ text: prompt }] }],
 *     generationConfig: { temperature: 0.7 },
 *   },
 *   { context: "generate-story" }
 * );
 *
 * const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
 * ```
 */
export async function geminiApiWithRetry<T = unknown>(
  apiUrl: string,
  apiKey: string,
  body: Record<string, unknown>,
  config: RetryConfig
): Promise<T> {
  const response = await fetchWithRetry(
    `${apiUrl}?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    config
  );

  return response.json() as Promise<T>;
}

/**
 * Attempt to repair common JSON issues from LLM output
 */
export function repairLlmJson(jsonString: string): string {
  let repaired = jsonString;

  // Remove any markdown code block markers
  repaired = repaired.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // Fix trailing commas before } or ]
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // Fix colon used instead of comma after property value
  // Pattern: "string value": followed by newline and whitespace and " (start of next property)
  // e.g., "type": "content": \n      "leftText" -> "type": "content", \n      "leftText"
  repaired = repaired.replace(/(":\s*"[^"]*"):\s*(\n\s*")/g, '$1,$2');

  // Also fix double colon pattern (value followed immediately by colon instead of comma)
  repaired = repaired.replace(/(":\s*"(?:content|title)")\s*:\s*\n/g, '$1,\n');

  return repaired;
}

/**
 * Extract and parse JSON from LLM response text with repair attempts
 */
export function parseLlmJsonResponse<T>(text: string): T {
  // First, extract the JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not find JSON object in response");
  }

  let jsonString = jsonMatch[0];

  // Attempt 1: Parse as-is
  try {
    return JSON.parse(jsonString) as T;
  } catch (e1) {
    console.log("[JSON Parse] First attempt failed, trying repairs...");
  }

  // Attempt 2: Basic repairs
  try {
    const repaired = repairLlmJson(jsonString);
    return JSON.parse(repaired) as T;
  } catch (e2) {
    console.log("[JSON Parse] Repair attempt failed, trying aggressive fix...");
  }

  // Attempt 3: More aggressive - try to find the closing brace properly
  try {
    let lastValidPos = 0;
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
      }

      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastValidPos = i + 1;
            break;
          }
        }
      }
    }

    if (lastValidPos > 0) {
      const truncated = repairLlmJson(jsonString.substring(0, lastValidPos));
      return JSON.parse(truncated) as T;
    }
  } catch (e3) {
    console.log("[JSON Parse] Aggressive repair failed");
  }

  throw new Error("Failed to parse JSON after multiple repair attempts");
}
