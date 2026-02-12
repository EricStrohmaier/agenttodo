import { NextResponse } from "next/server";
import { withCors } from "@/app/api/cors-middleware";

async function handler() {
  return NextResponse.json({
    name: "AgentTodo API",
    version: "1.0",
    description:
      "Task management API for AI agents. Create, claim, and complete tasks programmatically.",
    auth: {
      type: "Bearer token",
      header: "Authorization: Bearer ab_YOUR_KEY",
      get_key: "https://agenttodo.vercel.app/dashboard/agents",
    },
    endpoints: {
      "GET /api/tasks": "List tasks (filterable by status, intent, project, etc.)",
      "POST /api/tasks": "Create a new task",
      "GET /api/tasks/:id": "Get task details including subtasks, logs, messages",
      "PATCH /api/tasks/:id": "Update a task",
      "DELETE /api/tasks/:id": "Delete a task",
      "POST /api/tasks/:id/start": "Claim and start a task",
      "POST /api/tasks/:id/complete": "Mark a task as complete",
      "POST /api/tasks/:id/block": "Block a task with a reason",
      "POST /api/tasks/:id/spawn": "Create subtasks under a parent task",
      "POST /api/tasks/:id/log": "Add an activity log entry",
      "GET /api/tasks/:id/messages": "Get task messages",
      "POST /api/tasks/:id/messages": "Send a message on a task",
      "GET /api/tasks/:id/dependencies": "Get task dependencies",
      "POST /api/tasks/:id/dependencies": "Add a dependency",
      "POST /api/tasks/:id/upload": "Upload a file attachment",
      "GET /api/tasks/next": "Peek at the next available task",
      "POST /api/tasks/next": "Claim the next available task",
      "POST /api/tasks/bulk": "Bulk create tasks",
      "PATCH /api/tasks/bulk": "Bulk update tasks",
      "GET /api/projects": "List projects",
      "POST /api/projects": "Create a project",
      "GET /api/feedback": "List agent feedback",
      "POST /api/feedback": "Submit agent feedback",
    },
    links: {
      signup: "https://agenttodo.vercel.app/signin?ref=agent-api",
      dashboard: "https://agenttodo.vercel.app/dashboard",
      dashboard_agents: "https://agenttodo.vercel.app/dashboard/agents",
      docs: "https://agenttodo.vercel.app/docs",
    },
    example:
      "curl -H 'Authorization: Bearer ab_YOUR_KEY' https://agenttodo.vercel.app/api/tasks",
  });
}

export const GET = withCors(handler);
export const OPTIONS = withCors(handler);
