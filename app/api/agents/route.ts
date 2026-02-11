import { NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";

async function handler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);

  // Agents route requires dashboard (session) auth only
  if (auth.data.source !== "session") return error("Dashboard auth required", 403);

  const db = getSupabaseClient(auth.data);

  if (req.method === "GET") {
    const { data, error: dbErr } = await db
      .from("api_keys")
      .select("id, name, last_used_at, created_at")
      .eq("user_id", auth.data.userId)
      .order("created_at", { ascending: false });

    if (dbErr) return error(dbErr.message, 500);
    return success(data);
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    if (!body.name?.trim()) return error("name is required");

    const plainKey = `ab_${randomBytes(32).toString("hex")}`;
    const keyHash = createHash("sha256").update(plainKey).digest("hex");

    const { data: apiKey, error: dbErr } = await db
      .from("api_keys")
      .insert({
        name: body.name.trim(),
        key_hash: keyHash,
        permissions: body.permissions || { read: true, write: true },
        user_id: auth.data.userId,
      })
      .select("id, name, created_at")
      .single();

    if (dbErr) return error(dbErr.message, 500);
    return success({ ...apiKey, key: plainKey }, 201);
  }

  return error("Method not allowed", 405);
}

export const GET = withCors(handler);
export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
