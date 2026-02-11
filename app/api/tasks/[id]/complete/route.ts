import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);
  const body = await req.json().catch(() => ({}));

  const { data: task, error: fetchErr } = await db.from("tasks").select("requires_human_review").eq("id", id).eq("user_id", auth.data.userId).single();
  if (fetchErr) return error("Task not found", 404);

  const update: Record<string, any> = {
    status: task.requires_human_review ? "review" : "done",
    completed_at: new Date().toISOString(),
  };

  if (body.result !== undefined) update.result = body.result;
  if (body.confidence !== undefined) update.confidence = body.confidence;
  if (body.artifacts !== undefined) update.artifacts = body.artifacts;

  const { data: updated, error: dbErr } = await db.from("tasks").update(update).eq("id", id).eq("user_id", auth.data.userId).select().single();
  if (dbErr) return error(dbErr.message, 500);
  return success(updated);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
