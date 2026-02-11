import { vi } from "vitest";

/**
 * Creates a mock Supabase query builder that chains fluently.
 * Configure `results` to control what each .from(table) call returns.
 *
 * Usage:
 *   const mock = createMockSupabase({
 *     tasks: { data: [...], error: null },
 *     activity_log: { data: [...], error: null },
 *   });
 */
export function createMockSupabase(
  results: Record<string, { data: any; error: any }>
) {
  // Track calls for assertions
  const calls: { table: string; method: string; args: any[] }[] = [];

  function makeChain(table: string) {
    const chain: any = {};
    const methods = [
      "select",
      "insert",
      "update",
      "delete",
      "eq",
      "gte",
      "lte",
      "gt",
      "lt",
      "order",
      "limit",
      "range",
      "single",
    ];

    for (const method of methods) {
      chain[method] = vi.fn((...args: any[]) => {
        calls.push({ table, method, args });
        // .single() resolves the query
        if (method === "single") {
          const result = results[table] || { data: null, error: null };
          return Promise.resolve(result);
        }
        return chain;
      });
    }

    // If no .single() is called, the chain itself acts as a thenable
    chain.then = (resolve: any) => {
      const result = results[table] || { data: null, error: null };
      return resolve(result);
    };

    return chain;
  }

  const db = {
    from: vi.fn((table: string) => {
      calls.push({ table, method: "from", args: [table] });
      return makeChain(table);
    }),
    _calls: calls,
  };

  return db;
}

/**
 * Creates a NextRequest for testing API routes.
 */
export function createRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const { method = "GET", body, headers = {} } = options;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  // Use the global Request and cast — in vitest with node env this works
  const req = new Request(`http://localhost:3000${url}`, init);
  return req as any; // NextRequest is a superset; the routes only use standard Request methods + nextUrl
}

/**
 * Parses the JSON response from a route handler.
 */
export async function parseResponse(response: Response) {
  const status = response.status;
  const body = await response.json();
  return { status, body };
}

/**
 * A mock auth object for authenticated session users.
 */
export const mockSessionAuth = {
  data: {
    agent: "test@example.com",
    userId: "00000000-0000-0000-0000-000000000099",
    permissions: { read: true, write: true },
    source: "session" as const,
  },
  error: null,
};

/**
 * A mock auth object for read-only API keys.
 */
export const mockReadOnlyAuth = {
  data: {
    agent: "readonly-agent",
    userId: "00000000-0000-0000-0000-000000000099",
    permissions: { read: true, write: false },
    source: "api_key" as const,
  },
  error: null,
};

/**
 * A mock auth failure.
 */
export const mockAuthFailure = {
  data: null,
  error: "Unauthorized",
};
