import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";
import type { TaskIntent } from "@/types/tasks";

const VALID_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops"];

async function handler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const db = getSupabaseClient(auth.data);

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));

    // Validate intents filter if provided
    const intents: TaskIntent[] | null = body.intents ?? null;
    if (intents !== null) {
      if (!Array.isArray(intents) || intents.length === 0) {
        return error("intents must be a non-empty array");
      }
      for (const i of intents) {
        if (!VALID_INTENTS.includes(i)) {
          return error(`Invalid intent: ${i}. Valid: ${VALID_INTENTS.join(", ")}`);
        }
      }
    }

    // Validate optional project filter
    const project: string | null = body.project ?? null;

    // Validate optional priority_min filter
    const priorityMin: number | null = body.priority_min ?? null;
    if (priorityMin !== null && (typeof priorityMin !== "number" || priorityMin < 1 || priorityMin > 5)) {
      return error("priority_min must be a number between 1 and 5");
    }

    // Find the highest-priority unclaimed task matching filters
    let query = db
      .from("tasks")
      .select("*")
      .eq("user_id", auth.data.userId)
      .eq("status", "todo")
      .is("assigned_agent", null);

    if (intents) query = query.in("intent", intents);
    if (project) query = query.eq("project", project);
    if (priorityMin) query = query.gte("priority", priorityMin);

    query = query
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1);

    const { data: tasks, error: fetchErr } = await query;
    if (fetchErr) return error(fetchErr.message, 500);

    if (!tasks || tasks.length === 0) {
      return success(null, 200);
    }

    const task = tasks[0];

    // Atomically claim the task — only if it's still todo and unclaimed
    const { data: claimed, error: claimErr } = await db
      .from("tasks")
      .update({
        status: "in_progress",
        assigned_agent: auth.data.agent,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .eq("user_id", auth.data.userId)
      .eq("status", "todo")
      .is("assigned_agent", null)
      .select()
      .single();

    if (claimErr) {
      // Another agent likely claimed it between our select and update — retry once
      return error("Task was claimed by another agent. Retry to get the next one.", 409);
    }

    // Log the claim
    await db.from("activity_log").insert({
      task_id: claimed.id,
      agent: auth.data.agent,
      action: "claimed",
      details: { source: "task_queue" },
      user_id: auth.data.userId,
    });

    return success(claimed);
  }

  return error("Method not allowed", 405);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
