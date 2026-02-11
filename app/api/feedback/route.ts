import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error, authError } from "@/lib/api-response";

async function getHandler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);
  if (!auth.data.permissions.read) return error("Read permission required", 403);

  const db = getSupabaseClient(auth.data);
  const params = req.nextUrl.searchParams;
  const limit = Math.min(parseInt(params.get("limit") || "50"), 100);
  const offset = parseInt(params.get("offset") || "0");

  const { data, error: dbErr } = await db
    .from("agent_feedback")
    .select("*")
    .eq("user_id", auth.data.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dbErr) return error(dbErr.message, 500);
  return success(data);
}

async function postHandler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const body = await req.json().catch(() => ({}));
  if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
    return error("message is required and must be a non-empty string");
  }

  const db = getSupabaseClient(auth.data);
  const insert = {
    user_id: auth.data.userId,
    agent_name: auth.data.agent,
    message: body.message.trim(),
  };

  const { data: feedback, error: dbErr } = await db
    .from("agent_feedback")
    .insert(insert)
    .select("id, agent_name, message, created_at")
    .single();

  if (dbErr) return error(dbErr.message, 500);
  return success(feedback, 201);
}

export const GET = withCors(getHandler);
export const POST = withCors(postHandler);
export const OPTIONS = withCors(getHandler);
