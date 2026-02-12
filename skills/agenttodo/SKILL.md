---
name: agenttodo
description: Manage tasks via the AgentTodo REST API — a shared execution layer for humans and AI agents. Use when the user asks to create, list, update, or manage tasks and todos.
---

# AgentTodo Skill

A shared task board for humans and AI agents. Manage todos, track progress, and coordinate work through a REST API.

## Setup

1. Sign up at [agenttodo.vercel.app](https://agenttodo.vercel.app/signin) and create an API key from the dashboard
2. Store it in your tools config as `AGENTTODO_API_KEY`

## API Reference

**Base URL:** `https://agenttodo.vercel.app/api`

**Auth:** Include `Authorization: Bearer <API_KEY>` header on all requests.

### Endpoints

#### Create a Task

```
POST /tasks
Content-Type: application/json

{
  "title": "Deploy new feature",
  "description": "Ship the auth module to production",
  "intent": "deploy",
  "priority": 4,
  "project": "backend",
  "assigned_agent": "claude"
}
```

Only `title` is required. All other fields are optional.

#### List Tasks

```
GET /tasks
GET /tasks?status=todo&limit=50
GET /tasks?project=backend&intent=build
```

Query parameters: `status`, `intent`, `project`, `assigned_agent`, `limit`, `offset`.

#### Update a Task

```
PATCH /tasks/:id
Content-Type: application/json

{
  "status": "in_progress",
  "description": "Updated description"
}
```

#### Task Actions

```
POST /tasks/:id/start      # Mark as in_progress
POST /tasks/:id/complete   # Mark as done
POST /tasks/:id/block      # Mark as blocked
POST /tasks/:id/log        # Add a log entry (body: { "message": "..." })
```

### Task Fields

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `title` | string | ✅ | Free text |
| `description` | string | | Free text |
| `intent` | string | | `build`, `research`, `deploy`, `review`, `test`, `monitor` |
| `status` | string | | `todo`, `in_progress`, `blocked`, `review`, `done` |
| `priority` | number | | `1` (lowest) to `5` (highest) |
| `project` | string | | Free text, used for grouping |
| `assigned_agent` | string | | Free text (e.g. `claude`, `cursor`) |

## Examples

**Create a task:**
```bash
curl -X POST https://agenttodo.vercel.app/api/tasks \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Review PR #42", "intent": "review", "priority": 3}'
```

**List open tasks:**
```bash
curl "https://agenttodo.vercel.app/api/tasks?status=todo&limit=10" \
  -H "Authorization: Bearer $API_KEY"
```

**Complete a task:**
```bash
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/complete \
  -H "Authorization: Bearer $API_KEY"
```

**Add a log entry:**
```bash
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/log \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Started implementation, 50% done"}'
```

## Usage Guidelines

- When a user says "add a todo" or "create a task", use `POST /tasks`
- When asked "what's on my plate?" or "show tasks", use `GET /tasks?status=todo`
- After completing work, mark tasks done with `/complete`
- Use `/log` to track progress on long-running tasks
- Use `project` to group related tasks together
- Set `assigned_agent` to your agent name when claiming work
