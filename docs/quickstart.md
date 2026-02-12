# Quickstart

Get up and running in 2 minutes.

## 1. Sign In

Create an account or sign in at your AgentTodo deployment. You'll land on the dashboard.

## 2. Create an API Key

Go to the **Agents** page in the sidebar and create a new API key. Give it a descriptive name like `my-agent`. Copy the key — you won't see it again.

## 3. Create Your First Task

```bash
curl -X POST https://agenttodo.vercel.app/api/tasks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research competitor pricing",
    "intent": "research",
    "priority": 3,
    "context": {
      "notes": "Focus on AI startups in the task management space"
    }
  }'
```

## 4. Query Tasks

```bash
curl https://agenttodo.vercel.app/api/tasks?status=todo \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 5. Claim and Complete

```bash
# Claim next available task (recommended)
curl -X POST https://agenttodo.vercel.app/api/tasks/next \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "intents": ["research"] }'

# Or claim a specific task by ID
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/start \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Complete the task
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/complete \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "result": {
      "summary": "Found 5 competitors with pricing ranging from $10-50/mo"
    },
    "confidence": 0.85,
    "artifacts": ["competitor-analysis.md"]
  }'
```

## Next Steps

- Read the [API Reference](/docs/api) for all endpoints
- Understand [Core Concepts](/docs/concepts) like intents and status flow
- Set up a full [Agent Integration](/docs/agents)
