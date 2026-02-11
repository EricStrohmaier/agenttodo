import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockSupabase,
  mockSessionAuth,
  mockReadOnlyAuth,
  mockAuthFailure,
  parseResponse,
} from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

let mockAuth = mockSessionAuth;
let mockDb: ReturnType<typeof createMockSupabase> & { storage?: any };

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

function createMockDbWithStorage(taskData: any, uploadError: any = null) {
  const db = createMockSupabase({
    tasks: { data: taskData, error: taskData ? null : { message: "Not found" } },
  }) as any;

  db.storage = {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ error: uploadError })),
      createSignedUrl: vi.fn((path: string) =>
        Promise.resolve({
          data: { signedUrl: `https://test.supabase.co/storage/v1/object/sign/task-attachments/${path}?token=mock` },
          error: null,
        })
      ),
    })),
  };

  return db;
}

function createUploadRequest(taskId: string, file?: { name: string; content: string; type: string }) {
  const formData = new FormData();
  if (file) {
    const blob = new Blob([file.content], { type: file.type });
    formData.append("file", blob, file.name);
  }

  return new Request(`http://localhost:3000/api/tasks/${taskId}/upload`, {
    method: "POST",
    body: formData,
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("POST /api/tasks/[id]/upload", () => {
  beforeEach(() => {
    mockAuth = mockSessionAuth;
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth = mockAuthFailure as any;
    mockDb = createMockDbWithStorage(null);

    const { POST } = await import("@/app/api/tasks/[id]/upload/route");
    const req = createUploadRequest(TASK_UUID, { name: "test.txt", content: "hello", type: "text/plain" });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 403 for read-only users", async () => {
    mockAuth = mockReadOnlyAuth as any;
    mockDb = createMockDbWithStorage(null);

    const { POST } = await import("@/app/api/tasks/[id]/upload/route");
    const req = createUploadRequest(TASK_UUID, { name: "test.txt", content: "hello", type: "text/plain" });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.error).toBe("Write permission required");
  });

  it("returns 400 when no file provided", async () => {
    const taskData = { id: TASK_UUID, attachments: [] };
    mockDb = createMockDbWithStorage(taskData);

    const { POST } = await import("@/app/api/tasks/[id]/upload/route");
    const req = createUploadRequest(TASK_UUID);
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe("file is required");
  });

  it("returns 404 when task not found", async () => {
    mockDb = createMockDbWithStorage(null);

    const { POST } = await import("@/app/api/tasks/[id]/upload/route");
    const req = createUploadRequest(TASK_UUID, { name: "test.txt", content: "hello", type: "text/plain" });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
    expect(body.error).toBe("Task not found");
  });

  it("uploads file successfully and returns attachment data", async () => {
    const taskData = { id: TASK_UUID, attachments: [] };
    mockDb = createMockDbWithStorage(taskData);

    const { POST } = await import("@/app/api/tasks/[id]/upload/route");
    const req = createUploadRequest(TASK_UUID, { name: "doc.pdf", content: "pdf-content", type: "application/pdf" });
    const context = { params: Promise.resolve({ id: TASK_UUID }) };
    const res = await POST(req, context);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.data.attachment).toBeDefined();
    expect(body.data.attachment.name).toBe("doc.pdf");
    expect(body.data.attachment.type).toBe("application/pdf");
    expect(body.data.attachment.url).toContain("task-attachments");
  });
});
