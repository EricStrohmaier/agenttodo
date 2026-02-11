import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  createMockSupabase,
  mockAgentAuth,
  mockReadOnlyAuth,
  mockAuthFailure,
  parseResponse,
} from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

let mockAuth = mockAgentAuth;
let mockDb: ReturnType<typeof createMockSupabase>;

vi.mock("@/lib/agent-auth", () => ({
  authenticateRequest: vi.fn(() => Promise.resolve(mockAuth)),
  getSupabaseClient: vi.fn(() => mockDb),
}));

vi.mock("@/utils/supabase/admin", () => ({
  supabaseAdmin: vi.fn(() => mockDb),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sampleFeedback(overrides: Record<string, any> = {}) {
  return {
    id: "00000000-0000-0000-0000-000000000010",
    user_id: "00000000-0000-0000-0000-000000000099",
    agent_name: "bot",
    message: "Great task management!",
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

// ─── POST /api/feedback ──────────────────────────────────────────────────────

describe("POST /api/feedback", () => {
  beforeEach(() => {
    mockAuth = mockAgentAuth;
    vi.clearAllMocks();
  });

  it("creates feedback and returns 201", async () => {
    const created = sampleFeedback();
    mockDb = createMockSupabase({
      agent_feedback: { data: created, error: null },
    });

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Great task management!" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.data.agent_name).toBe("bot");
    expect(body.data.message).toBe("Great task management!");
    expect(body.error).toBeNull();
  });

  it("returns 400 when message is missing", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("message is required and must be a non-empty string");
  });

  it("returns 400 when message is empty string", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("message is required and must be a non-empty string");
  });

  it("returns 400 when message is not a string", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: 123 }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("message is required and must be a non-empty string");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth = mockAuthFailure as any;
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 403 for read-only users", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.error).toBe("Write permission required");
  });

  it("returns 500 on database insert error", async () => {
    mockDb = createMockSupabase({
      agent_feedback: { data: null, error: { message: "Insert failed" } },
    });

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.error).toBe("Insert failed");
  });

  it("handles malformed JSON body gracefully", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("message is required and must be a non-empty string");
  });
});

// ─── GET /api/feedback ───────────────────────────────────────────────────────

describe("GET /api/feedback", () => {
  beforeEach(() => {
    mockAuth = mockAgentAuth;
    vi.clearAllMocks();
  });

  it("returns feedback list on success", async () => {
    const feedback = [sampleFeedback(), sampleFeedback({ id: "fb-2", message: "Second" })];
    mockDb = createMockSupabase({
      agent_feedback: { data: feedback, error: null },
    });

    const { GET } = await import("@/app/api/feedback/route");
    const req = new NextRequest("http://localhost:3000/api/feedback");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.error).toBeNull();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth = mockAuthFailure as any;
    mockDb = createMockSupabase({});

    const { GET } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 403 for users without read permission", async () => {
    mockAuth = {
      data: {
        agent: "write-only",
        userId: "00000000-0000-0000-0000-000000000099",
        permissions: { read: false, write: true },
        source: "api_key" as const,
      },
      error: null,
    } as any;
    mockDb = createMockSupabase({});

    const { GET } = await import("@/app/api/feedback/route");
    const req = new Request("http://localhost:3000/api/feedback");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.error).toBe("Read permission required");
  });

  it("returns 500 on database error", async () => {
    mockDb = createMockSupabase({
      agent_feedback: { data: null, error: { message: "DB error" } },
    });

    const { GET } = await import("@/app/api/feedback/route");
    const req = new NextRequest("http://localhost:3000/api/feedback");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.error).toBe("DB error");
  });
});
