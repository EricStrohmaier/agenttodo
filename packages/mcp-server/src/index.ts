#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.AGENTTODO_API_URL || "https://agenttodo.vercel.app/api";
const API_KEY = process.env.AGENTTODO_API_KEY || "";

if (!API_KEY) {
  console.error("AGENTTODO_API_KEY environment variable is required");
  process.exit(1);
}

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
});

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`API ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

const server = new McpServer({
  name: "agenttodo",
  version: "0.1.0",
});

// list_tasks
server.tool(
  "list_tasks",
  "List tasks with optional filters",
  {
    status: z.enum(["todo", "in_progress", "blocked", "review", "done"]).optional().describe("Filter by status"),
    project: z.string().optional().describe("Filter by project"),
    intent: z.enum(["build", "research", "deploy", "review", "test", "monitor"]).optional().describe("Filter by intent"),
    priority: z.number().min(1).max(5).optional().describe("Filter by priority (1-5)"),
    limit: z.number().optional().describe("Max results to return"),
  },
  async (params) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.project) query.set("project", params.project);
    if (params.intent) query.set("intent", params.intent);
    if (params.priority) query.set("priority", String(params.priority));
    if (params.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    const data = await api(`/tasks${qs ? `?${qs}` : ""}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// create_task
server.tool(
  "create_task",
  "Create a new task",
  {
    title: z.string().describe("Task title (required)"),
    description: z.string().optional().describe("Task description"),
    priority: z.number().min(1).max(5).optional().describe("Priority 1-5"),
    intent: z.enum(["build", "research", "deploy", "review", "test", "monitor"]).optional(),
    project: z.string().optional().describe("Project name for grouping"),
    parent_id: z.string().optional().describe("Parent task ID"),
  },
  async (params) => {
    const data = await api("/tasks", "POST", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// update_task
server.tool(
  "update_task",
  "Update an existing task",
  {
    id: z.string().describe("Task ID"),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.number().min(1).max(5).optional(),
    status: z.enum(["todo", "in_progress", "blocked", "review", "done"]).optional(),
    intent: z.enum(["build", "research", "deploy", "review", "test", "monitor"]).optional(),
    project: z.string().optional(),
  },
  async (params) => {
    const { id, ...body } = params;
    const data = await api(`/tasks/${id}`, "PATCH", body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// start_task
server.tool(
  "start_task",
  "Mark a task as in_progress",
  { id: z.string().describe("Task ID") },
  async ({ id }) => {
    const data = await api(`/tasks/${id}/start`, "POST");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// complete_task
server.tool(
  "complete_task",
  "Mark a task as done",
  {
    id: z.string().describe("Task ID"),
    summary: z.string().optional().describe("Completion summary"),
  },
  async ({ id, summary }) => {
    const data = await api(`/tasks/${id}/complete`, "POST", summary ? { summary } : undefined);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// block_task
server.tool(
  "block_task",
  "Mark a task as blocked",
  {
    id: z.string().describe("Task ID"),
    reason: z.string().optional().describe("Reason for blocking"),
  },
  async ({ id, reason }) => {
    const data = await api(`/tasks/${id}/block`, "POST", reason ? { reason } : undefined);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// spawn_subtask
server.tool(
  "spawn_subtask",
  "Create a subtask under an existing task",
  {
    id: z.string().describe("Parent task ID"),
    title: z.string().describe("Subtask title"),
    description: z.string().optional(),
    priority: z.number().min(1).max(5).optional(),
    intent: z.enum(["build", "research", "deploy", "review", "test", "monitor"]).optional(),
  },
  async ({ id, ...body }) => {
    const data = await api(`/tasks/${id}/spawn`, "POST", body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// log_to_task
server.tool(
  "log_to_task",
  "Add a log entry to a task",
  {
    id: z.string().describe("Task ID"),
    message: z.string().describe("Log message"),
  },
  async ({ id, message }) => {
    const data = await api(`/tasks/${id}/log`, "POST", { message });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// claim_next_task
server.tool(
  "claim_next_task",
  "Claim the next available task (highest priority todo)",
  {
    project: z.string().optional().describe("Limit to a specific project"),
    intent: z.enum(["build", "research", "deploy", "review", "test", "monitor"]).optional(),
  },
  async (params) => {
    const data = await api("/tasks/next", "POST", Object.keys(params).length ? params : undefined);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
