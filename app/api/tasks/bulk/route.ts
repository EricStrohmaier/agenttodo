import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";
import type { CreateTaskInput, TaskIntent } from "@/types/tasks";

const VALID_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops"];

async function handler(req: NextRequest) {
  if (req.method !== "POST") return error("Method not allowed", 405);

  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const db = getSupabaseClient(auth.data);
  const body = await req.json();

  if (!Array.isArray(body.tasks) || body.tasks.length === 0) {
    return error("tasks array is required and must not be empty");
  }

  if (body.tasks.length > 50) {
    return error("Maximum 50 tasks per bulk create");
  }

  const inserts = body.tasks.map((t: CreateTaskInput) => {
    if (!t.title?.trim()) throw new Error("Each task must have a title");
    if (t.intent && !VALID_INTENTS.includes(t.intent)) throw new Error(`Invalid intent: ${t.intent}`);
    if (t.priority !== undefined && (t.priority < 1 || t.priority > 5)) throw new Error("Priority must be 1-5");

    return {
      title: t.title.trim(),
      description: t.description || "",
      intent: t.intent || "build",
      priority: t.priority ?? 3,
      context: t.context || {},
      parent_task_id: t.parent_task_id || null,
      assigned_agent: t.assigned_agent || null,
      created_by: t.created_by || auth.data!.agent,
      requires_human_review: t.requires_human_review ?? true,
    };
  });

  try {
    const { data: tasks, error: dbErr } = await db.from("tasks").insert(inserts).select();
    if (dbErr) return error(dbErr.message, 500);

    // Log all creations
    if (tasks && tasks.length > 0) {
      const logs = tasks.map((task) => ({
        task_id: task.id,
        agent: task.created_by,
        action: "created" as const,
        details: { title: task.title, intent: task.intent, bulk: true },
      }));
      await db.from("activity_log").insert(logs);
    }

    return success({ created: tasks?.length || 0, tasks }, 201);
  } catch (e: any) {
    return error(e.message || "Bulk create failed", 400);
  }
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
