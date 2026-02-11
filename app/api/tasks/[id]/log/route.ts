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

  const { data: log, error: dbErr } = await db
    .from("activity_log")
    .insert({
      task_id: id,
      agent: auth.data.agent,
      action: body.action,
      details: body.details || {},
    })
    .select()
    .single();

  if (dbErr) return error(dbErr.message, 500);
  return success(log, 201);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
