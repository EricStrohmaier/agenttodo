import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";
import type { CreateTaskInput, TaskIntent, TaskStatus } from "@/types/tasks";
import { computeNextRun } from "@/lib/recurrence";

const VALID_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops"];
const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "review", "done"];

async function handler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);

  const db = getSupabaseClient(auth.data);

  if (req.method === "GET") {
    const params = req.nextUrl.searchParams;

    // Sparse field selection: default returns lightweight fields, ?fields=full returns everything
    const fieldsParam = params.get("fields");
    const SUMMARY_FIELDS = "id,title,status,intent,priority,project,assigned_agent,human_input_needed,parent_task_id,created_by,updated_at,created_at";
    const selectFields = fieldsParam === "full" ? "*" : SUMMARY_FIELDS;

    let query = db.from("tasks").select(selectFields, { count: "exact" }).eq("user_id", auth.data.userId);

    const status = params.get("status");
    if (status && VALID_STATUSES.includes(status as TaskStatus)) query = query.eq("status", status);

    const intent = params.get("intent");
    if (intent && VALID_INTENTS.includes(intent as TaskIntent)) query = query.eq("intent", intent);

    const agent = params.get("assigned_agent");
    if (agent) query = query.eq("assigned_agent", agent);

    const priorityMin = params.get("priority_min");
    if (priorityMin) query = query.gte("priority", parseInt(priorityMin));

    const parentId = params.get("parent_task_id");
    if (parentId) query = query.eq("parent_task_id", parentId);

    const project = params.get("project");
    if (project) query = query.eq("project", project);

    const humanInput = params.get("human_input_needed");
    if (humanInput === "true") query = query.eq("human_input_needed", true);
    else if (humanInput === "false") query = query.eq("human_input_needed", false);

    const limit = Math.min(parseInt(params.get("limit") || "50"), 100);
    const offset = parseInt(params.get("offset") || "0");

    query = query.order("priority", { ascending: false }).order("created_at", { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error: dbErr, count } = await query;
    if (dbErr) return error(dbErr.message, 500);
    return NextResponse.json({ data, total: count ?? 0, error: null });
  }

  if (req.method === "POST") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body: CreateTaskInput = await req.json();
    if (!body.title?.trim()) return error("title is required");

    if (body.intent && !VALID_INTENTS.includes(body.intent)) return error("Invalid intent");
    if (body.priority !== undefined && (body.priority < 1 || body.priority > 5)) return error("Priority must be 1-5");

    // Validate metadata is flat key-value (no nested objects/arrays)
    if (body.metadata) {
      const vals = Object.values(body.metadata);
      if (vals.some((v: any) => v !== null && typeof v === "object")) {
        return error("metadata values must be flat (string, number, boolean, or null). Use context for nested data.");
      }
    }

    const insert = {
      title: body.title.trim(),
      description: body.description || "",
      intent: body.intent || "build",
      priority: body.priority ?? 3,
      context: body.context || {},
      parent_task_id: body.parent_task_id || null,
      assigned_agent: body.assigned_agent || null,
      created_by: body.created_by || auth.data.agent,
      requires_human_review: body.requires_human_review ?? true,
      project: body.project || null,
      human_input_needed: body.human_input_needed ?? false,
      metadata: body.metadata || {},
      recurrence: body.recurrence || null,
      recurrence_source_id: body.recurrence_source_id || null,
      next_run_at: body.recurrence ? computeNextRun(body.recurrence)?.toISOString() || null : null,
      user_id: auth.data.userId,
    };

    const { data: task, error: dbErr } = await db.from("tasks").insert(insert).select().single();
    if (dbErr) return error(dbErr.message, 500);

    // Auto-create project if it doesn't exist
    if (insert.project) {
      await db.from("projects").upsert(
        { user_id: auth.data.userId, name: insert.project },
        { onConflict: "user_id,name", ignoreDuplicates: true }
      );
    }

    // Log creation
    await db.from("activity_log").insert({
      task_id: task.id,
      agent: insert.created_by,
      action: "created",
      details: { title: task.title, intent: task.intent },
      user_id: auth.data.userId,
    });

    return success(task, 201);
  }

  return error("Method not allowed", 405);
}

export const GET = withCors(handler);
export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
