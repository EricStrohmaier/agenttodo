import { createHash } from "crypto";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export interface AgentAuth {
  agent: string;
  userId: string;
  permissions: { read: boolean; write: boolean };
  source: "api_key" | "session";
}

export async function authenticateRequest(
  req: Request
): Promise<{ data: AgentAuth | null; error: string | null; errorCode?: "no_auth" | "invalid_key" }> {
  const authHeader = req.headers.get("authorization");

  // Try Bearer token first (agent auth)
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const keyHash = createHash("sha256").update(token).digest("hex");
    const db = supabaseAdmin();

    const { data: apiKey, error } = await db
      .from("api_keys")
      .select("id, name, permissions, user_id")
      .eq("key_hash", keyHash)
      .single();

    if (error || !apiKey) {
      return { data: null, error: "Invalid API key", errorCode: "invalid_key" };
    }

    // Update last_used_at
    await db
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKey.id);

    return {
      data: {
        agent: apiKey.name,
        userId: apiKey.user_id,
        permissions: apiKey.permissions as { read: boolean; write: boolean },
        source: "api_key",
      },
      error: null,
    };
  }

  // Fall back to cookie-based session auth
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return {
        data: {
          agent: user.email || user.id,
          userId: user.id,
          permissions: { read: true, write: true },
          source: "session",
        },
        error: null,
      };
    }
  } catch {
    // cookie auth not available
  }

  return { data: null, error: "Unauthorized", errorCode: "no_auth" };
}

/** Get the supabase client to use based on auth source */
export function getSupabaseClient(auth: AgentAuth) {
  // Always use admin client for API operations to bypass RLS
  return supabaseAdmin();
}
