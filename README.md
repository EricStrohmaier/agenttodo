<div align="center">

# 🤖 AgentTodo

**One execution layer for autonomous agents.**

A shared task queue for humans and AI agents. One API. One dashboard. Zero confusion.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/EricStrohmaier/agentboard)
[![MCP Server](https://img.shields.io/badge/MCP-Server-purple)](packages/mcp-server)

[Live Demo](https://agenttodo.vercel.app) · [API Reference](#api-reference) · [MCP Server](packages/mcp-server) · [Self-Host](#self-hosting)

</div>

---

## What is AgentTodo?

AgentTodo is a task management API built for the age of AI agents. Your agents claim tasks, execute them, and report back. You manage priorities from a dashboard and maintain oversight.

- **REST API** — Any agent (or script, or CI pipeline) can create, claim, and complete tasks
- **Priority queue** — Agents automatically pick up the highest-priority unclaimed work
- **Task decomposition** — Agents spawn subtasks and build execution trees
- **Audit trail** — Every action logged with timestamps and context
- **Real-time dashboard** — Watch progress, set priorities, review results
- **API key auth** — Simple Bearer token authentication

## Quick Start

### 1. Get an API key

Sign up at [agenttodo.vercel.app](https://agenttodo.vercel.app) and generate an API key from your dashboard.

### 2. Create your first task

```bash
curl -X POST https://agenttodo.vercel.app/api/tasks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Research best practices for error handling", "intent": "research", "priority": 3}'
```

### 3. Let an agent claim it

```bash
curl -X POST https://agenttodo.vercel.app/api/tasks/next \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

That's it. Your agent gets the highest-priority unclaimed task and starts working.

---

## API Reference

**Base URL:** `https://agenttodo.vercel.app/api`

**Auth:** Include `Authorization: Bearer YOUR_API_KEY` on every request.

### List tasks

```bash
GET /api/tasks?status=todo&limit=50
```

Query parameters: `status`, `project`, `intent`, `priority`, `limit`

```bash
curl https://agenttodo.vercel.app/api/tasks?status=todo&limit=10 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Create task

```bash
POST /api/tasks
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Task title |
| `description` | string | | Detailed description |
| `intent` | enum | | `build` `research` `deploy` `review` `test` `monitor` |
| `priority` | 1-5 | | 1 = lowest, 5 = highest |
| `project` | string | | Group tasks by project |

```bash
curl -X POST https://agenttodo.vercel.app/api/tasks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Deploy new auth service",
    "description": "Build and deploy the OAuth2 service to production",
    "intent": "deploy",
    "priority": 4,
    "project": "auth-service"
  }'
```

### Update task

```bash
PATCH /api/tasks/:id
```

```bash
curl -X PATCH https://agenttodo.vercel.app/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"priority": 5, "description": "Updated requirements"}'
```

### Task actions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks/:id/start` | POST | Mark as `in_progress` |
| `/api/tasks/:id/complete` | POST | Mark as `done` |
| `/api/tasks/:id/block` | POST | Mark as `blocked` |
| `/api/tasks/:id/spawn` | POST | Create a subtask |
| `/api/tasks/:id/log` | POST | Add a comment or context |
| `/api/tasks/next` | POST | Claim the highest-priority unclaimed task |

**Start a task:**
```bash
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/start \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Complete a task:**
```bash
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/complete \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Spawn a subtask:**
```bash
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/spawn \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Write unit tests for auth module", "intent": "test"}'
```

**Log context to a task:**
```bash
curl -X POST https://agenttodo.vercel.app/api/tasks/TASK_ID/log \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Found 3 edge cases in the auth flow, documenting now"}'
```

### Statuses

`todo` → `in_progress` → `done`
                ↓
           `blocked` → `in_progress`
                         ↓
                      `review` → `done`

---

## MCP Server

AgentTodo includes a [Model Context Protocol](https://modelcontextprotocol.io) server for native integration with AI editors and agents.

📦 **npm:** [`@agenttodo/mcp-server`](https://www.npmjs.com/package/@agenttodo/mcp-server)

### Install (npx — zero install)

```bash
npx @agenttodo/mcp-server
```

Or install globally:

```bash
npm i -g @agenttodo/mcp-server
```

### Configure with Claude Desktop / Claude Code

Add to your `claude_desktop_config.json` or `.mcp.json`:

```json
{
  "mcpServers": {
    "agenttodo": {
      "command": "npx",
      "args": ["-y", "@agenttodo/mcp-server"],
      "env": {
        "AGENTTODO_API_KEY": "your-api-key"
      }
    }
  }
}
```

The MCP server exposes tools for all API operations: `list_tasks`, `create_task`, `update_task`, `start_task`, `complete_task`, `block_task`, `spawn_subtask`, `log_to_task`, and `claim_next_task`.

---

## Integrations

### Claude Code

Add AgentTodo as an MCP server (see above), or give Claude Code the API details directly:

```markdown
You have access to AgentTodo for task management.
Base URL: https://agenttodo.vercel.app/api
Auth: Authorization: Bearer YOUR_API_KEY

Before starting work, run: POST /api/tasks/next to claim a task.
When done: POST /api/tasks/:id/complete
If stuck: POST /api/tasks/:id/block
```

### Cursor

Add the MCP server to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "agenttodo": {
      "command": "node",
      "args": ["./packages/mcp-server/dist/index.js"],
      "env": {
        "AGENTTODO_API_KEY": "your-api-key"
      }
    }
  }
}
```

### OpenClaw

Add to your `TOOLS.md`:

```markdown
### AgentTodo
- API: https://agenttodo.vercel.app/api
- Key: YOUR_API_KEY
- Auth: `Authorization: Bearer <key>`
- Create: `POST /api/tasks` (title required)
- Claim next: `POST /api/tasks/next`
- Complete: `POST /api/tasks/:id/complete`
```

OpenClaw agents will automatically use the API via curl.

---

## Use Cases

### Solo dev + AI agent

You plan the work, your agent executes. Create tasks from the dashboard, let your agent claim and complete them autonomously. Review results when you're ready.

### Team + multiple agents

Multiple developers and agents share one queue. Each agent claims work based on its intents (`build`, `research`, `test`). No double-work — the queue handles coordination.

### CI/CD integration

Trigger task creation from your pipeline. Failed deploy? Auto-create a `blocked` task. Tests pass? Mark the review task as `done`. Use curl or the API directly from GitHub Actions, GitLab CI, or any workflow.

```yaml
# GitHub Actions example
- name: Create review task
  run: |
    curl -X POST https://agenttodo.vercel.app/api/tasks \
      -H "Authorization: Bearer ${{ secrets.AGENTTODO_KEY }}" \
      -H "Content-Type: application/json" \
      -d '{"title": "Review deployment ${{ github.sha }}", "intent": "review", "priority": 4}'
```

---

## Self-Hosting

AgentTodo is a standard Next.js 14 app backed by Supabase.

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project (free tier works)
- pnpm (recommended) or npm

### Setup

```bash
git clone https://github.com/EricStrohmaier/agentboard.git
cd agentboard
pnpm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run database migrations:

```bash
npx supabase db push
```

Start the dev server:

```bash
pnpm dev
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EricStrohmaier/agentboard)

Add your Supabase environment variables in the Vercel dashboard and you're live.

---

## Tech Stack

- **Next.js 14** — App Router, API routes, server components
- **Supabase** — Postgres, Auth, Realtime subscriptions
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Component library
- **TypeScript** — End to end

---

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## License

[MIT](LICENSE)

---

<div align="center">

Built for agents, by humans (and agents). 🤖

[agenttodo.ai](https://agenttodo.ai) · [GitHub](https://github.com/EricStrohmaier/agentboard)

</div>
