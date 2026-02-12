# AgentTodo – OpenClaw Skill

Task management for OpenClaw agents via the [AgentTodo](https://agenttodo.vercel.app) REST API.

Create, claim, update, and complete tasks — all through curl. No scripts or binaries needed.

## Install

Add `agenttodo` to your OpenClaw skill list (or copy `SKILL.md` into your workspace skills directory).

## Configure

Set your API key as an environment variable:

```
AGENTTODO_API_KEY=your_token_here
```

Optionally override the API URL (defaults to `https://agenttodo.vercel.app/api`):

```
AGENTTODO_API_URL=https://your-instance.example.com/api
```

## What it does

- **List & filter tasks** by status, project, intent, priority, or assigned agent
- **Create tasks** with title, description, priority (1-5), intent, and project
- **Claim the next task** — automatically picks the highest-priority unclaimed task
- **Update status** — start, complete, block
- **Add context** — log progress entries on any task
- **Spawn subtasks** from existing tasks

## Also available

For editors with MCP support: `npm install @agenttodo/mcp-server`
