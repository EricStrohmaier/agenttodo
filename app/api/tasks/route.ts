import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";
import type { CreateTaskInput, TaskIntent, TaskStatus } from "@/types/tasks";

const VALID_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops"];
const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "review", "done"];

async function handler(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);

  const db = getSupabaseClient(auth.data);

  if (req.method === "GET") {
    const params = req.nextUrl.searchParams;
    let query = db.from("tasks").select("*").eq("user_id", auth.data.userId);

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

    const { data, error: dbErr } = await query;
    if (dbErr) return error(dbErr.message, 500);
    return success(data);
  }

  if (req.method === "POST") {
    if (!auth.data.permissions.write) return error("Write permission required", 403);

    const body: CreateTaskInput = await req.json();
    if (!body.title?.trim()) return error("title is required");

    if (body.intent && !VALID_INTENTS.includes(body.intent)) return error("Invalid intent");
    if (body.priority !== undefined && (body.priority < 1 || body.priority > 5)) return error("Priority must be 1-5");

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
      project_context: body.project_context || null,
      human_input_needed: body.human_input_needed ?? false,
      user_id: auth.data.userId,
    };

    const { data: task, error: dbErr } = await db.from("tasks").insert(insert).select().single();
    if (dbErr) return error(dbErr.message, 500);

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
