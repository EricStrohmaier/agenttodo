import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error, authError } from "@/lib/api-response";
import type { TaskIntent } from "@/types/tasks";

const VALID_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops", "monitor", "test", "review", "deploy"];

/** Build a query for the next unclaimed task matching optional filters. */
function buildNextTaskQuery(
  db: ReturnType<typeof getSupabaseClient>,
  userId: string,
  filters: { intents?: TaskIntent[] | null; project?: string | null; priorityMin?: number | null },
) {
  let query = db
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "todo")
    .is("assigned_agent", null)
    .is("deleted_at", null);

  if (filters.intents) query = query.in("intent", filters.intents);
  if (filters.project) query = query.eq("project", filters.project);
  if (filters.priorityMin) query = query.gte("priority", filters.priorityMin);

  return query
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1);
}

async function handler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);

  const db = getSupabaseClient(auth.data);

  // --- GET: peek at the next task without claiming it ---
  if (req.method === "GET") {
    const params = req.nextUrl.searchParams;

    // Parse optional filters from query string
    const intentsParam = params.get("intents");
    let intents: TaskIntent[] | null = null;
    if (intentsParam) {
      intents = intentsParam.split(",").map((s) => s.trim()) as TaskIntent[];
      for (const i of intents) {
        if (!VALID_INTENTS.includes(i)) {
          return error(`Invalid intent: ${i}. Valid: ${VALID_INTENTS.join(", ")}`);
        }
      }
    }

    const project = params.get("project") || null;

    const priorityMinRaw = params.get("priority_min");
    const priorityMin = priorityMinRaw ? parseInt(priorityMinRaw) : null;
    if (priorityMin !== null && (isNaN(priorityMin) || priorityMin < 1 || priorityMin > 5)) {
      return error("priority_min must be a number between 1 and 5");
    }

    const { data: tasks, error: fetchErr } = await buildNextTaskQuery(db, auth.data.userId, {
      intents,
      project,
      priorityMin,
    });
    if (fetchErr) return error(fetchErr.message, 500);

    return success(tasks && tasks.length > 0 ? tasks[0] : null);
  }

  // --- POST: claim the next task (atomic find + assign) ---
  if (req.method === "POST") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body = await req.json().catch(() => ({}));

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

    const project: string | null = body.project ?? null;

    const priorityMin: number | null = body.priority_min ?? null;
    if (priorityMin !== null && (typeof priorityMin !== "number" || priorityMin < 1 || priorityMin > 5)) {
      return error("priority_min must be a number between 1 and 5");
    }

    const { data: tasks, error: fetchErr } = await buildNextTaskQuery(db, auth.data.userId, {
      intents,
      project,
      priorityMin,
    });
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

export const GET = withCors(handler);
export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
