import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";

async function handler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);

  const db = getSupabaseClient(auth.data);

  if (req.method === "GET") {
    const { data, error: dbErr } = await db
      .from("projects")
      .select("*")
      .eq("user_id", auth.data.userId)
      .order("name", { ascending: true });

    if (dbErr) return error(dbErr.message, 500);
    return success(data);
  }

  if (req.method === "POST") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body = await req.json();
    if (!body.name?.trim()) return error("name is required");

    const { data: project, error: dbErr } = await db
      .from("projects")
      .insert({
        user_id: auth.data.userId,
        name: body.name.trim(),
        description: body.description || "",
        color: body.color || null,
      })
      .select()
      .single();

    if (dbErr) {
      if (dbErr.code === "23505") return error("A project with this name already exists", 409);
      return error(dbErr.message, 500);
    }
    return success(project, 201);
  }

  return error("Method not allowed", 405);
}

export const GET = withCors(handler);
export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
