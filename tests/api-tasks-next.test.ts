import { describe, it, expect, vi, beforeEach } from "vitest";
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

function sampleTask(overrides: Record<string, any> = {}) {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Test task",
    description: "",
    intent: "build",
    status: "todo",
    priority: 3,
    context: {},
    metadata: {},
    parent_task_id: null,
    assigned_agent: null,
    created_by: "bot",
    result: null,
    artifacts: [],
    confidence: null,
    requires_human_review: true,
    blockers: [],
    claimed_at: null,
    completed_at: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

// ─── POST /api/tasks/next ────────────────────────────────────────────────────

describe("POST /api/tasks/next", () => {
  beforeEach(() => {
    mockAuth = mockAgentAuth;
    vi.clearAllMocks();
  });

  it("claims the next available task", async () => {
    const task = sampleTask();
    const claimed = sampleTask({ status: "in_progress", assigned_agent: "bot" });
    mockDb = createMockSupabase({
      tasks: { data: [task], error: null },
      activity_log: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data).toBeDefined();
  });

  it("claims a task filtered by intents", async () => {
    const task = sampleTask({ intent: "research" });
    mockDb = createMockSupabase({
      tasks: { data: [task], error: null },
      activity_log: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intents: ["research"] }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.error).toBeNull();

    // Verify .in() was called with intent filter
    const inCalls = mockDb._calls.filter(
      (c: any) => c.method === "in" && c.args[0] === "intent"
    );
    expect(inCalls.length).toBeGreaterThan(0);
    expect(inCalls[0].args[1]).toEqual(["research"]);
  });

  it("claims a task filtered by project", async () => {
    const task = sampleTask({ project: "frontend" });
    mockDb = createMockSupabase({
      tasks: { data: [task], error: null },
      activity_log: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "frontend" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);

    // Verify .eq("project", ...) was called
    const eqCalls = mockDb._calls.filter(
      (c: any) => c.method === "eq" && c.args[0] === "project"
    );
    expect(eqCalls.length).toBeGreaterThan(0);
    expect(eqCalls[0].args[1]).toBe("frontend");
  });

  it("claims a task filtered by priority_min", async () => {
    const task = sampleTask({ priority: 4 });
    mockDb = createMockSupabase({
      tasks: { data: [task], error: null },
      activity_log: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority_min: 4 }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);

    // Verify .gte("priority", 4) was called
    const gteCalls = mockDb._calls.filter(
      (c: any) => c.method === "gte" && c.args[0] === "priority"
    );
    expect(gteCalls.length).toBeGreaterThan(0);
    expect(gteCalls[0].args[1]).toBe(4);
  });

  it("returns null when no tasks are available", async () => {
    mockDb = createMockSupabase({
      tasks: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data).toBeNull();
    expect(body.error).toBeNull();
  });

  it("returns 400 for invalid intent", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intents: ["invalid"] }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toContain("Invalid intent: invalid");
  });

  it("returns 400 for empty intents array", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intents: [] }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("intents must be a non-empty array");
  });

  it("returns 400 for non-array intents", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intents: "research" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("intents must be a non-empty array");
  });

  it("returns 400 for invalid priority_min", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority_min: 10 }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("priority_min must be a number between 1 and 5");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth = mockAuthFailure as any;
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 403 for read-only users", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.error).toBe("Write permission required");
  });

  it("returns 500 on database query error", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "DB connection failed" } },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.error).toBe("DB connection failed");
  });

  it("accepts multiple intents filter", async () => {
    const task = sampleTask({ intent: "research" });
    mockDb = createMockSupabase({
      tasks: { data: [task], error: null },
      activity_log: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intents: ["research", "build", "write"] }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);

    const inCalls = mockDb._calls.filter(
      (c: any) => c.method === "in" && c.args[0] === "intent"
    );
    expect(inCalls[0].args[1]).toEqual(["research", "build", "write"]);
  });

  it("handles malformed JSON body gracefully", async () => {
    mockDb = createMockSupabase({
      tasks: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/next/route");
    const req = new Request("http://localhost:3000/api/tasks/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    // Empty body parses to {} via catch, which means no filters — should work
    expect(status).toBe(200);
  });
});
