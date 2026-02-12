---
name: agenttodo
description: Task management via the AgentTodo REST API — create, claim, update, and complete tasks.
author: agentboard
version: 0.1.0
tags: [tasks, productivity, project-management]
---

# AgentTodo Skill

Manage tasks through the AgentTodo API using curl.

## Configuration

| Variable | Description | Default |
|---|---|---|
| `AGENTTODO_API_KEY` | Bearer token for auth (required) | — |
| `AGENTTODO_API_URL` | API base URL | `https://agenttodo.vercel.app/api` |

All requests need the header: `Authorization: Bearer $AGENTTODO_API_KEY`

## Endpoints

### List tasks

```bash
curl -s "$AGENTTODO_API_URL/tasks?status=todo&limit=20" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY"
```

Query params: `status`, `project`, `intent`, `priority`, `limit`, `assigned_agent`

### Create a task

```bash
curl -s -X POST "$AGENTTODO_API_URL/tasks" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Fix login bug", "priority": 4, "intent": "build", "project": "myapp"}'
```

Fields: `title` (required), `description`, `intent`, `priority` (1-5), `project`, `assigned_agent`

### Update a task

```bash
curl -s -X PATCH "$AGENTTODO_API_URL/tasks/:id" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"priority": 5, "description": "Updated details"}'
```

### Task actions

```bash
# Start working on a task
curl -s -X POST "$AGENTTODO_API_URL/tasks/:id/start" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY"

# Complete a task
curl -s -X POST "$AGENTTODO_API_URL/tasks/:id/complete" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY"

# Block a task
curl -s -X POST "$AGENTTODO_API_URL/tasks/:id/block" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY"

# Spawn a subtask
curl -s -X POST "$AGENTTODO_API_URL/tasks/:id/spawn" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Subtask title"}'

# Add a log entry
curl -s -X POST "$AGENTTODO_API_URL/tasks/:id/log" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Finished refactoring the auth module"}'
```

### Claim next task

Grabs the highest-priority unclaimed task:

```bash
curl -s -X POST "$AGENTTODO_API_URL/tasks/next" \
  -H "Authorization: Bearer $AGENTTODO_API_KEY"
```

## Reference

**Intents:** `build`, `research`, `deploy`, `review`, `test`, `monitor`

**Statuses:** `todo`, `in_progress`, `blocked`, `review`, `done`

**Priority:** 1 (lowest) → 5 (highest)

## Workflow

1. Claim a task with `POST /tasks/next`
2. Work on it
3. Add context with `POST /tasks/:id/log`
4. Mark complete with `POST /tasks/:id/complete`

## MCP Server

For editors that support MCP, install the MCP server instead:

```
npm install @agenttodo/mcp-server
```
