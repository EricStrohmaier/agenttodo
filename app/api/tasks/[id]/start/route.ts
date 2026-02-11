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

  // Check current status
  const { data: task, error: fetchErr } = await db.from("tasks").select("status").eq("id", id).single();
  if (fetchErr) return error("Task not found", 404);
  if (task.status === "in_progress") return error("Task is already in progress", 409);

  const { data: updated, error: dbErr } = await db
    .from("tasks")
    .update({
      status: "in_progress",
      assigned_agent: auth.data.agent,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (dbErr) return error(dbErr.message, 500);
  return success(updated);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
