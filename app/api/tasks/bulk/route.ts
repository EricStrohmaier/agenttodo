import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error, authError } from "@/lib/api-response";
import type { CreateTaskInput, TaskIntent, TaskStatus } from "@/types/tasks";

const VALID_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops", "monitor", "test", "review", "deploy"];
const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "review", "done"];

async function handler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const db = getSupabaseClient(auth.data);
  const body = await req.json();

  // --- POST: bulk create ---
  if (req.method === "POST") {
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
        project: t.project || null,
        human_input_needed: t.human_input_needed ?? false,
        metadata: t.metadata || {},
        recurrence: t.recurrence || null,
        recurrence_source_id: t.recurrence_source_id || null,
        user_id: auth.data!.userId,
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
          user_id: auth.data!.userId,
        }));
        await db.from("activity_log").insert(logs);
      }

      return success({ created: tasks?.length || 0, tasks }, 201);
    } catch (e: any) {
      return error(e.message || "Bulk create failed", 400);
    }
  }

  // --- PATCH: bulk update ---
  if (req.method === "PATCH") {
    const { task_ids, update } = body;

    if (!Array.isArray(task_ids) || task_ids.length === 0) {
      return error("task_ids array is required and must not be empty");
    }
    if (task_ids.length > 50) {
      return error("Maximum 50 tasks per bulk update");
    }
    if (!update || typeof update !== "object" || Object.keys(update).length === 0) {
      return error("update object is required with at least one field");
    }

    // Whitelist updatable fields
    const allowed: Record<string, (v: any) => boolean> = {
      status: (v) => VALID_STATUSES.includes(v),
      intent: (v) => VALID_INTENTS.includes(v),
      priority: (v) => typeof v === "number" && v >= 1 && v <= 5,
      assigned_agent: (v) => v === null || typeof v === "string",
      project: (v) => v === null || typeof v === "string",
      human_input_needed: (v) => typeof v === "boolean",
    };

    const patch: Record<string, any> = {};
    for (const [key, validate] of Object.entries(allowed)) {
      if (key in update) {
        if (!validate(update[key])) return error(`Invalid value for ${key}`);
        patch[key] = update[key];
      }
    }

    // Check for disallowed fields
    const unknownFields = Object.keys(update).filter((k) => !(k in allowed));
    if (unknownFields.length > 0) {
      return error(`Fields not allowed in bulk update: ${unknownFields.join(", ")}. Allowed: ${Object.keys(allowed).join(", ")}`);
    }

    if (Object.keys(patch).length === 0) {
      return error("No valid fields to update");
    }

    // Set timestamps based on status transitions
    if (patch.status === "in_progress" && !patch.assigned_agent) {
      patch.assigned_agent = auth.data.agent;
      patch.claimed_at = new Date().toISOString();
    }
    if (patch.status === "done") {
      patch.completed_at = new Date().toISOString();
    }

    const { data: tasks, error: dbErr } = await db
      .from("tasks")
      .update(patch)
      .in("id", task_ids)
      .eq("user_id", auth.data.userId)
      .select();

    if (dbErr) return error(dbErr.message, 500);

    // Log bulk updates
    if (tasks && tasks.length > 0) {
      const logs = tasks.map((task) => ({
        task_id: task.id,
        agent: auth.data!.agent,
        action: "updated" as const,
        details: { bulk: true, fields: Object.keys(patch) },
        user_id: auth.data!.userId,
      }));
      await db.from("activity_log").insert(logs);
    }

    return success({ updated: tasks?.length || 0, tasks });
  }

  return error("Method not allowed", 405);
}

export const POST = withCors(handler);
export const PATCH = withCors(handler);
export const OPTIONS = withCors(handler);
