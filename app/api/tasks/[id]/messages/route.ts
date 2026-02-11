import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error, authError } from "@/lib/api-response";

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);

  // Verify task exists and belongs to user
  const { data: task, error: taskErr } = await db
    .from("tasks")
    .select("id")
    .eq("id", id)
    .eq("user_id", auth.data.userId)
    .single();
  if (taskErr || !task) return error("Task not found", 404);

  if (req.method === "GET") {
    const { data: messages, error: dbErr } = await db
      .from("task_messages")
      .select("*")
      .eq("task_id", id)
      .eq("user_id", auth.data.userId)
      .order("created_at", { ascending: true });

    if (dbErr) return error(dbErr.message, 500);
    return success(messages);
  }

  if (req.method === "POST") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body = await req.json();
    if (!body.content?.trim()) return error("content is required");

    const fromAgent = body.from || auth.data.agent;

    const { data: message, error: dbErr } = await db
      .from("task_messages")
      .insert({
        user_id: auth.data.userId,
        task_id: id,
        from_agent: fromAgent,
        content: body.content.trim(),
      })
      .select()
      .single();

    if (dbErr) return error(dbErr.message, 500);

    // Auto-toggle human_input_needed based on who sent the message
    const isHuman = fromAgent === "human";
    await db
      .from("tasks")
      .update({ human_input_needed: !isHuman })
      .eq("id", id)
      .eq("user_id", auth.data.userId);

    return success(message, 201);
  }

  return error("Method not allowed", 405);
}

export const GET = withCors(handler);
export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
