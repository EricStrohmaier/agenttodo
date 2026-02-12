import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error, authError } from "@/lib/api-response";

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);
  const body = await req.json().catch(() => ({}));

  if (!body.reason?.trim()) return error("reason is required");

  const { data: task, error: fetchErr } = await db.from("tasks").select("blockers").eq("id", id).eq("user_id", auth.data.userId).is("deleted_at", null).single();
  if (fetchErr) return error("Task not found", 404);

  const blockers = [...(task.blockers || []), body.reason.trim()];

  const { data: updated, error: dbErr } = await db
    .from("tasks")
    .update({ status: "blocked", blockers })
    .eq("id", id)
    .eq("user_id", auth.data.userId)
    .select()
    .single();

  if (dbErr) return error(dbErr.message, 500);
  return success(updated);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
