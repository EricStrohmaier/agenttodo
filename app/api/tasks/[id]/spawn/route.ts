import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error, authError } from "@/lib/api-response";
import type { CreateTaskInput } from "@/types/tasks";

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);
  const body = await req.json().catch(() => ({}));

  if (!Array.isArray(body.tasks) || body.tasks.length === 0) return error("tasks array is required");

  // Verify parent exists and belongs to user
  const { error: fetchErr } = await db.from("tasks").select("id").eq("id", id).eq("user_id", auth.data.userId).is("deleted_at", null).single();
  if (fetchErr) return error("Parent task not found", 404);

  const inserts = body.tasks.map((t: CreateTaskInput) => ({
    title: t.title,
    description: t.description || "",
    intent: t.intent || "build",
    priority: t.priority ?? 3,
    context: t.context || {},
    parent_task_id: id,
    assigned_agent: t.assigned_agent || null,
    created_by: t.created_by || auth.data!.agent,
    requires_human_review: t.requires_human_review ?? true,
    user_id: auth.data!.userId,
  }));

  const { data: tasks, error: dbErr } = await db.from("tasks").insert(inserts).select();
  if (dbErr) return error(dbErr.message, 500);

  // Log subtask creation
  const logs = (tasks || []).map((t: any) => ({
    task_id: id,
    agent: auth.data!.agent,
    action: "added_subtask" as const,
    details: { subtask_id: t.id, title: t.title },
    user_id: auth.data!.userId,
  }));
  if (logs.length) await db.from("activity_log").insert(logs);

  return success(tasks, 201);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
