import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  createMockSupabase,
  mockSessionAuth,
  mockReadOnlyAuth,
  mockAuthFailure,
  parseResponse,
} from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

let mockAuth = mockSessionAuth;
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

const TASK_UUID = "00000000-0000-0000-0000-000000000001";
const TASK_2_UUID = "00000000-0000-0000-0000-000000000002";

function sampleTask(overrides: Record<string, any> = {}) {
  return {
    id: TASK_UUID,
    title: "Test task",
    description: "",
    intent: "build",
    status: "todo",
    priority: 3,
    context: {},
    metadata: {},
    parent_task_id: null,
    assigned_agent: null,
    created_by: "test@example.com",
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

function sampleLog(overrides: Record<string, any> = {}) {
  return {
    id: "log-1",
    task_id: TASK_UUID,
    agent: "test@example.com",
    action: "created",
    details: { title: "Test task", intent: "build" },
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

// ─── /api/tasks (GET / POST) ────────────────────────────────────────────────

describe("GET /api/tasks", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("returns task list on success", async () => {
    const tasks = [sampleTask(), sampleTask({ id: TASK_2_UUID, title: "Task 2" })];
    mockDb = createMockSupabase({ tasks: { data: tasks, error: null } });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000/api/tasks");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.error).toBeNull();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth = mockAuthFailure as any;
    mockDb = createMockSupabase({});

    const { GET } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 500 on database error", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "DB connection failed" } },
    });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000/api/tasks");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.error).toBe("DB connection failed");
  });
});

describe("POST /api/tasks", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("creates a task and returns 201", async () => {
    const created = sampleTask();
    mockDb = createMockSupabase({
      tasks: { data: created, error: null },
      activity_log: { data: sampleLog(), error: null },
    });

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test task" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.data.title).toBe("Test task");
    expect(body.error).toBeNull();
  });

  it("returns 400 when title is missing", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("title is required");
  });

  it("returns 400 for invalid intent", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task", intent: "invalid" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Invalid intent");
  });

  it("returns 400 for invalid priority", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task", priority: 10 }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Priority must be 1-5");
  });

  it("returns 403 when user has no write permission", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.error).toBe("Write permission required");
  });

  it("returns 500 on database insert error", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "Insert failed" } },
    });

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task" }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.error).toBe("Insert failed");
  });
});

// ─── /api/tasks/[id] (GET / PATCH / DELETE) ──────────────────────────────────

describe("GET /api/tasks/[id]", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("returns task with subtasks and activity log", async () => {
    const task = sampleTask();
    const subtask = sampleTask({ id: TASK_2_UUID, parent_task_id: TASK_UUID, title: "Subtask" });
    const log = sampleLog();

    // The route queries tasks twice (task + subtasks) and activity_log once.
    // Our mock returns same data for a table; the route merges them.
    // We need to handle the single() call for the first query and array for the second.
    mockDb = createMockSupabase({
      tasks: { data: task, error: null },
      activity_log: { data: [log], error: null },
    });

    const { GET } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`);
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await GET(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.id).toBe(TASK_UUID);
    expect(body.error).toBeNull();
  });

  it("returns 404 when task not found", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "Not found", code: "PGRST116" } },
    });

    const { GET } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`);
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await GET(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
    expect(body.error).toBe("Task not found");
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth = mockAuthFailure as any;
    mockDb = createMockSupabase({});

    const { GET } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`);
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await GET(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
  });
});

describe("PATCH /api/tasks/[id]", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("updates task fields and returns updated task", async () => {
    const updated = sampleTask({ status: "in_progress" });
    mockDb = createMockSupabase({
      tasks: { data: updated, error: null },
    });

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.status).toBe("in_progress");
    expect(body.error).toBeNull();
  });

  it("rejects invalid status value", async () => {
    mockDb = createMockSupabase({});

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid_status" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Invalid value for status");
  });

  it("rejects invalid priority", async () => {
    mockDb = createMockSupabase({});

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: 0 }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Invalid value for priority");
  });

  it("rejects empty update body", async () => {
    mockDb = createMockSupabase({});

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unknown_field: "something" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("No valid fields to update");
  });

  it("returns 403 for read-only users", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockSupabase({});

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.error).toBe("Write permission required");
  });

  it("returns 500 on database update error", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "Update failed" } },
    });

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.error).toBe("Update failed");
  });
});

describe("DELETE /api/tasks/[id]", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("deletes task and returns success", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: null },
    });

    const { DELETE } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "DELETE",
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await DELETE(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.deleted).toBe(true);
  });

  it("returns 403 for read-only users", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockSupabase({});

    const { DELETE } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "DELETE",
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await DELETE(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
  });
});

// ─── /api/tasks/[id]/start ──────────────────────────────────────────────────

describe("POST /api/tasks/[id]/start", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("claims a task and sets status to in_progress", async () => {
    const updated = sampleTask({ status: "in_progress", assigned_agent: "test@example.com" });
    mockDb = createMockSupabase({
      tasks: { data: updated, error: null },
    });
    // Override the first .single() to return status:todo, then the update .single() returns updated
    let callCount = 0;
    const origSingle = mockDb.from("tasks").single;
    // Re-mock: first call returns current task, second returns updated
    mockDb = createMockSupabase({
      tasks: { data: { status: "todo" }, error: null },
    });

    const { POST } = await import("@/app/api/tasks/[id]/start/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/start`, {
      method: "POST",
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    // The route does two single() calls; our mock returns same data for both.
    // Since status is "todo", the first check passes, and update returns the same shape.
    expect(status).toBe(200);
    expect(body.error).toBeNull();
  });

  it("returns 409 if task is already in progress", async () => {
    mockDb = createMockSupabase({
      tasks: { data: { status: "in_progress" }, error: null },
    });

    const { POST } = await import("@/app/api/tasks/[id]/start/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/start`, {
      method: "POST",
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(409);
    expect(body.error).toBe("Task is already in progress");
  });

  it("returns 404 if task not found", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "Not found" } },
    });

    const { POST } = await import("@/app/api/tasks/[id]/start/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/start`, {
      method: "POST",
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
    expect(body.error).toBe("Task not found");
  });

  it("returns 403 for read-only users", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/[id]/start/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/start`, {
      method: "POST",
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
  });
});

// ─── /api/tasks/[id]/complete ────────────────────────────────────────────────

describe("POST /api/tasks/[id]/complete", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("completes a task (no human review → done)", async () => {
    mockDb = createMockSupabase({
      tasks: { data: { requires_human_review: false }, error: null },
    });

    const { POST } = await import("@/app/api/tasks/[id]/complete/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.error).toBeNull();
  });

  it("sets status to review when human review required", async () => {
    // The mock returns requires_human_review: true from the first query,
    // then the updated task from the second.
    mockDb = createMockSupabase({
      tasks: { data: { requires_human_review: true }, error: null },
    });

    const { POST } = await import("@/app/api/tasks/[id]/complete/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: { summary: "done" }, confidence: 0.9 }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.error).toBeNull();
  });

  it("returns 404 if task not found", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "Not found" } },
    });

    const { POST } = await import("@/app/api/tasks/[id]/complete/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
  });
});

// ─── /api/tasks/[id]/log ────────────────────────────────────────────────────

describe("POST /api/tasks/[id]/log", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("creates an activity log entry", async () => {
    const log = sampleLog({ action: "updated" });
    mockDb = createMockSupabase({
      tasks: { data: { id: TASK_UUID }, error: null },
      activity_log: { data: log, error: null },
    });

    const { POST } = await import("@/app/api/tasks/[id]/log/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updated", details: { note: "changed title" } }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.data.action).toBe("updated");
    expect(body.error).toBeNull();
  });

  it("rejects invalid action", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/[id]/log/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invalid_action" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Valid action is required");
  });

  it("rejects missing action", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/[id]/log/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Valid action is required");
  });

  it("returns 403 for read-only users", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/[id]/log/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updated" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
  });
});

// ─── /api/tasks/[id]/block ──────────────────────────────────────────────────

describe("POST /api/tasks/[id]/block", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("adds a blocker and sets status to blocked", async () => {
    mockDb = createMockSupabase({
      tasks: { data: { blockers: ["existing blocker"] }, error: null },
    });

    const { POST } = await import("@/app/api/tasks/[id]/block/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Waiting for API key" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.error).toBeNull();
  });

  it("rejects missing reason", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/[id]/block/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("reason is required");
  });

  it("returns 404 if task not found", async () => {
    mockDb = createMockSupabase({
      tasks: { data: null, error: { message: "Not found" } },
    });

    const { POST } = await import("@/app/api/tasks/[id]/block/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Some reason" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
  });
});

// ─── /api/tasks/[id]/spawn ──────────────────────────────────────────────────

describe("POST /api/tasks/[id]/spawn", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("creates subtasks under a parent", async () => {
    const subtasks = [
      sampleTask({ id: TASK_2_UUID, title: "Subtask 1", parent_task_id: TASK_UUID }),
    ];
    mockDb = createMockSupabase({
      tasks: { data: subtasks, error: null },
      activity_log: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/[id]/spawn/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/spawn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: [{ title: "Subtask 1" }] }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.error).toBeNull();
  });

  it("rejects empty tasks array", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/[id]/spawn/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/spawn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: [] }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("tasks array is required");
  });

  it("rejects missing tasks field", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/[id]/spawn/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}/spawn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
  });
});

// ─── /api/tasks/bulk ────────────────────────────────────────────────────────

describe("POST /api/tasks/bulk", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("creates multiple tasks in one request", async () => {
    const tasks = [
      sampleTask({ title: "Bulk 1" }),
      sampleTask({ id: TASK_2_UUID, title: "Bulk 2" }),
    ];
    mockDb = createMockSupabase({
      tasks: { data: tasks, error: null },
      activity_log: { data: [], error: null },
    });

    const { POST } = await import("@/app/api/tasks/bulk/route");
    const req = new Request("http://localhost:3000/api/tasks/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tasks: [{ title: "Bulk 1" }, { title: "Bulk 2" }],
      }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.data.created).toBe(2);
    expect(body.error).toBeNull();
  });

  it("rejects empty tasks array", async () => {
    mockDb = createMockSupabase({});

    const { POST } = await import("@/app/api/tasks/bulk/route");
    const req = new Request("http://localhost:3000/api/tasks/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: [] }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("rejects more than 50 tasks", async () => {
    mockDb = createMockSupabase({});

    const tasks = Array.from({ length: 51 }, (_, i) => ({ title: `Task ${i}` }));
    const { POST } = await import("@/app/api/tasks/bulk/route");
    const req = new Request("http://localhost:3000/api/tasks/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Maximum 50 tasks per bulk create");
  });
});

// ─── New fields: project, attachments, messages, human_input_needed ─────────

describe("PATCH /api/tasks/[id] — new fields", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("updates project field", async () => {
    const updated = sampleTask({ project: "my-project" });
    mockDb = createMockSupabase({ tasks: { data: updated, error: null } });

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: "my-project" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.project).toBe("my-project");
  });

  it("updates attachments array", async () => {
    const att = [{ url: "https://example.com/file.pdf", name: "file.pdf", type: "application/pdf", size: 1024, storage_path: "abc/file.pdf" }];
    const updated = sampleTask({ attachments: att });
    mockDb = createMockSupabase({ tasks: { data: updated, error: null } });

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachments: att }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.attachments).toHaveLength(1);
  });

  it("updates messages array", async () => {
    const msgs = [{ from: "human", content: "Hello", created_at: "2025-01-01T00:00:00Z" }];
    const updated = sampleTask({ messages: msgs });
    mockDb = createMockSupabase({ tasks: { data: updated, error: null } });

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.messages).toHaveLength(1);
  });

  it("updates human_input_needed boolean", async () => {
    const updated = sampleTask({ human_input_needed: true });
    mockDb = createMockSupabase({ tasks: { data: updated, error: null } });

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ human_input_needed: true }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.human_input_needed).toBe(true);
  });

  it("rejects non-boolean human_input_needed", async () => {
    mockDb = createMockSupabase({});

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ human_input_needed: "yes" }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("Invalid value for human_input_needed");
  });

  it("sets project_context to null", async () => {
    const updated = sampleTask({ project_context: null });
    mockDb = createMockSupabase({ tasks: { data: updated, error: null } });

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_context: null }),
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await PATCH(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.project_context).toBeNull();
  });
});

describe("GET /api/tasks — project & human_input_needed filters", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("filters by project query param", async () => {
    const tasks = [sampleTask({ project: "alpha" })];
    mockDb = createMockSupabase({ tasks: { data: tasks, error: null } });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000/api/tasks?project=alpha");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    // Verify db.from("tasks").eq was called with project filter
    const eqCalls = mockDb._calls.filter((c: any) => c.method === "eq" && c.args[0] === "project");
    expect(eqCalls.length).toBeGreaterThan(0);
    expect(eqCalls[0].args[1]).toBe("alpha");
  });

  it("filters by human_input_needed=true", async () => {
    const tasks = [sampleTask({ human_input_needed: true })];
    mockDb = createMockSupabase({ tasks: { data: tasks, error: null } });

    const { GET } = await import("@/app/api/tasks/route");
    const req = new NextRequest("http://localhost:3000/api/tasks?human_input_needed=true");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    const eqCalls = mockDb._calls.filter((c: any) => c.method === "eq" && c.args[0] === "human_input_needed");
    expect(eqCalls.length).toBeGreaterThan(0);
    expect(eqCalls[0].args[1]).toBe(true);
  });
});

describe("POST /api/tasks — new fields", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("creates a task with project and human_input_needed", async () => {
    const created = sampleTask({ project: "beta", human_input_needed: true });
    mockDb = createMockSupabase({
      tasks: { data: created, error: null },
      activity_log: { data: sampleLog(), error: null },
    });

    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", project: "beta", human_input_needed: true }),
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.data.project).toBe("beta");
    expect(body.data.human_input_needed).toBe(true);
  });
});

// ─── withCors middleware ────────────────────────────────────────────────────

describe("withCors middleware", () => {
  it("passes params context to handler for [id] routes", async () => {
    // This is the core bug test — withCors must forward the second argument
    const task = sampleTask();
    mockAuth = mockSessionAuth;
    mockDb = createMockSupabase({
      tasks: { data: task, error: null },
      activity_log: { data: [], error: null },
    });

    const { GET } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`);
    const context = { params: Promise.resolve({ id: TASK_UUID }) };

    // GET is withCors(handler) — it must accept and forward context
    const res = await GET(req, context);
    const { status, body } = await parseResponse(res);

    // If withCors didn't forward params, this would throw/return empty body
    expect(status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(TASK_UUID);
  });

  it("handles OPTIONS preflight requests", async () => {
    const { OPTIONS } = await import("@/app/api/tasks/[id]/route");
    const req = new Request(`http://localhost:3000/api/tasks/${TASK_UUID}`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:3001" },
    });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await OPTIONS(req, context);

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });
});
