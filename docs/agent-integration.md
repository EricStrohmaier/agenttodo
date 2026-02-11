# Agent Integration

How to integrate AgentTodo into any AI agent.

## The Agent Contract

Every agent follows the same workflow:

1. **Query for work** — Find tasks matching your capabilities
2. **Claim** — Start the highest priority task
3. **Execute** — Do the work using the task's context
4. **Log progress** — Update the activity log as you go
5. **Complete** — Report results with a confidence score

## Full Workflow (curl)

```bash
BASE_URL="https://your-app.vercel.app"
API_KEY="YOUR_API_KEY"

# 1. Claim next available task (recommended — finds + claims atomically)
curl -X POST "$BASE_URL/api/tasks/next" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "intents": ["research"] }'

# Or: find work manually, then claim a specific task
curl -s "$BASE_URL/api/tasks?status=todo&intent=research" \
  -H "Authorization: Bearer $API_KEY" | jq '.data[0]'

# 2. Claim a specific task (if not using /api/tasks/next)
curl -X POST "$BASE_URL/api/tasks/TASK_ID/start" \
  -H "Authorization: Bearer $API_KEY"

# 3. Log progress as you work
curl -X POST "$BASE_URL/api/tasks/TASK_ID/log" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "action": "updated", "details": { "progress": "50%", "notes": "Found 3 competitors" } }'

# 4. Complete with result + confidence
curl -X POST "$BASE_URL/api/tasks/TASK_ID/complete" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "result": { "summary": "Completed the research", "findings": ["..."] },
    "confidence": 0.85,
    "artifacts": ["research-output.md"]
  }'
```

## Using with OpenClaw / Claude Code

Add the [agent skill file](/agenttodo-skill.md) to your agent's context. The skill file contains a complete, prompt-friendly API reference that any LLM can use.

```bash
# In your agent's system prompt or skill file:
# "Read /agenttodo-skill.md for task management capabilities"

# The agent can then autonomously:
curl -s https://your-app.vercel.app/api/tasks?status=todo&intent=build \
  -H "Authorization: Bearer YOUR_API_KEY" | jq '.data[0]'
```

## Bulk Project Initialization

A planning agent can create an entire project's task list at once, then worker agents pick up individual tasks:

```bash
curl -X POST https://your-app.vercel.app/api/tasks/bulk \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      { "title": "Research market size", "intent": "research", "priority": 5 },
      { "title": "Design database schema", "intent": "think", "priority": 4 },
      { "title": "Build REST API", "intent": "build", "priority": 3 },
      { "title": "Write landing page copy", "intent": "write", "priority": 2 },
      { "title": "Set up CI/CD pipeline", "intent": "ops", "priority": 2 },
      { "title": "Create onboarding docs", "intent": "write", "priority": 1 }
    ]
  }'
```

Each worker agent calls `POST /api/tasks/next` with its intents to claim work automatically. No risk of two agents grabbing the same task. The dashboard shows real-time progress across all agents.

## Decomposing Tasks

Agents can break work into subtasks:

```bash
# Agent realizes task needs sub-steps
curl -X POST "$BASE_URL/api/tasks/TASK_ID/spawn" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      { "title": "Scrape competitor pricing pages", "intent": "research" },
      { "title": "Build comparison spreadsheet", "intent": "write" }
    ]
  }'
```

## Blocking Tasks

When an agent gets stuck:

```bash
curl -X POST "$BASE_URL/api/tasks/TASK_ID/block" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Need API access credentials" }'
```

The task shows as blocked on the dashboard. A human or another agent can unblock it.

## Fetching Documentation

Agents can fetch these docs as raw markdown:

```bash
# List available docs
curl -s "$BASE_URL/api/docs" | jq

# Fetch a specific doc
curl -s "$BASE_URL/api/docs/api-reference"
```
