import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";
import type { LogAction } from "@/types/tasks";

const VALID_ACTIONS: LogAction[] = ["created", "claimed", "updated", "blocked", "completed", "added_subtask", "request_review", "unclaimed"];

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);
  const body = await req.json().catch(() => ({}));

  if (!body.action || !VALID_ACTIONS.includes(body.action)) return error("Valid action is required");

  // Verify task belongs to user
  const { error: taskErr } = await db.from("tasks").select("id").eq("id", id).eq("user_id", auth.data.userId).single();
  if (taskErr) return error("Task not found", 404);

  const { data: log, error: dbErr } = await db
    .from("activity_log")
    .insert({
      task_id: id,
      agent: auth.data.agent,
      action: body.action,
      details: body.details || {},
      user_id: auth.data.userId,
    })
    .select()
    .single();

  if (dbErr) return error(dbErr.message, 500);
  return success(log, 201);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
