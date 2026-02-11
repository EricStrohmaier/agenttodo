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
    const { data: deps, error: dbErr } = await db
      .from("task_dependencies")
      .select("*, depends_on:depends_on_task_id(id, title, status)")
      .eq("task_id", id)
      .eq("user_id", auth.data.userId);

    if (dbErr) return error(dbErr.message, 500);
    return success(deps);
  }

  if (req.method === "POST") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body = await req.json();
    if (!body.depends_on_task_id) return error("depends_on_task_id is required");

    if (body.depends_on_task_id === id) return error("A task cannot depend on itself");

    // Verify the dependency task exists and belongs to user
    const { data: depTask, error: depErr } = await db
      .from("tasks")
      .select("id")
      .eq("id", body.depends_on_task_id)
      .eq("user_id", auth.data.userId)
      .single();
    if (depErr || !depTask) return error("Dependency task not found", 404);

    const { data: dep, error: dbErr } = await db
      .from("task_dependencies")
      .insert({
        user_id: auth.data.userId,
        task_id: id,
        depends_on_task_id: body.depends_on_task_id,
      })
      .select()
      .single();

    if (dbErr) {
      if (dbErr.code === "23505") return error("This dependency already exists", 409);
      return error(dbErr.message, 500);
    }
    return success(dep, 201);
  }

  if (req.method === "DELETE") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body = await req.json().catch(() => ({}));
    const depId = body.dependency_id || req.nextUrl.searchParams.get("dependency_id");

    if (!depId) return error("dependency_id is required");

    const { error: dbErr } = await db
      .from("task_dependencies")
      .delete()
      .eq("id", depId)
      .eq("task_id", id)
      .eq("user_id", auth.data.userId);

    if (dbErr) return error(dbErr.message, 500);
    return success({ deleted: true });
  }

  return error("Method not allowed", 405);
}

export const GET = withCors(handler);
export const POST = withCors(handler);
export const DELETE = withCors(handler);
export const OPTIONS = withCors(handler);
