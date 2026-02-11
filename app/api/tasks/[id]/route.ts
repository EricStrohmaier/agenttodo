import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";
import type { TaskIntent, TaskStatus } from "@/types/tasks";

const VALID_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops"];
const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "review", "done"];

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);

  if (req.method === "GET") {
    const { data: task, error: taskErr } = await db.from("tasks").select("*").eq("id", id).single();
    if (taskErr) return error("Task not found", 404);

    const [subtasks, logs] = await Promise.all([
      db.from("tasks").select("*").eq("parent_task_id", id).order("priority", { ascending: false }),
      db.from("activity_log").select("*").eq("task_id", id).order("created_at", { ascending: false }).limit(20),
    ]);

    return success({ ...task, subtasks: subtasks.data || [], activity_log: logs.data || [] });
  }

  if (req.method === "PATCH") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body = await req.json();
    const allowed: Record<string, (v: any) => boolean> = {
      title: (v) => typeof v === "string" && v.trim().length > 0,
      description: (v) => typeof v === "string",
      intent: (v) => VALID_INTENTS.includes(v),
      status: (v) => VALID_STATUSES.includes(v),
      priority: (v) => typeof v === "number" && v >= 1 && v <= 5,
      context: (v) => typeof v === "object",
      assigned_agent: (v) => v === null || typeof v === "string",
      requires_human_review: (v) => typeof v === "boolean",
      result: (v) => v === null || typeof v === "object",
      artifacts: (v) => Array.isArray(v),
      confidence: (v) => v === null || (typeof v === "number" && v >= 0 && v <= 1),
      blockers: (v) => Array.isArray(v),
    };

    const update: Record<string, any> = {};
    for (const [key, validate] of Object.entries(allowed)) {
      if (key in body) {
        if (!validate(body[key])) return error(`Invalid value for ${key}`);
        update[key] = body[key];
      }
    }

    if (Object.keys(update).length === 0) return error("No valid fields to update");

    const { data: task, error: dbErr } = await db.from("tasks").update(update).eq("id", id).select().single();
    if (dbErr) return error(dbErr.message, 500);
    return success(task);
  }

  if (req.method === "DELETE") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const { error: dbErr } = await db.from("tasks").delete().eq("id", id);
    if (dbErr) return error(dbErr.message, 500);
    return success({ deleted: true });
  }

  return error("Method not allowed", 405);
}

export const GET = withCors(handler);
export const PATCH = withCors(handler);
export const DELETE = withCors(handler);
export const OPTIONS = withCors(handler);
