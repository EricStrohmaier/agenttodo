import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);

  if (req.method === "GET") {
    const { data: project, error: dbErr } = await db
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.data.userId)
      .single();

    if (dbErr) return error("Project not found", 404);
    return success(project);
  }

  if (req.method === "PATCH") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body = await req.json();
    const update: Record<string, any> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) return error("name must be a non-empty string");
      update.name = body.name.trim();
    }
    if (body.description !== undefined) update.description = body.description;
    if (body.color !== undefined) update.color = body.color;

    if (Object.keys(update).length === 0) return error("No valid fields to update");

    const { data: project, error: dbErr } = await db
      .from("projects")
      .update(update)
      .eq("id", id)
      .eq("user_id", auth.data.userId)
      .select()
      .single();

    if (dbErr) {
      if (dbErr.code === "23505") return error("A project with this name already exists", 409);
      return error(dbErr.message, 500);
    }
    return success(project);
  }

  if (req.method === "DELETE") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    // Nullify project field on associated tasks
    await db
      .from("tasks")
      .update({ project: null })
      .eq("user_id", auth.data.userId)
      .eq("project", (
        await db.from("projects").select("name").eq("id", id).eq("user_id", auth.data.userId).single()
      ).data?.name || "");

    const { error: dbErr } = await db
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.data.userId);

    if (dbErr) return error(dbErr.message, 500);
    return success({ deleted: true });
  }

  return error("Method not allowed", 405);
}

export const GET = withCors(handler);
export const PATCH = withCors(handler);
export const DELETE = withCors(handler);
export const OPTIONS = withCors(handler);
