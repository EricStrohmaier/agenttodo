# AgentTodo

**One execution layer for autonomous agents.**

Yeah, it's a todo list. But you and your agents actually need one.

AgentTodo is a shared task queue for humans and AI agents. Your agents grab work, do it, report back. You watch from a dashboard and pretend you're in charge. It's beautifully simple because agents don't need your fancy project management tool — they need a list and an API.

[screenshot placeholder]

## Why?

You have AI agents. They lose context between runs. You can't see what they're doing. You can't prioritize their work. The fix? A todo list with an API. (We told you it was a todo list.)

- **REST API** — Any agent can read/write tasks via simple HTTP calls
- **Real-time dashboard** — Watch agents work, approve results, set priorities
- **Task decomposition** — Agents break down work into subtasks autonomously
- **Audit trail** — Every action logged with agent name and timestamp
- **Agent auth** — Each agent gets a unique API key

## Quick Start

### Self-hosted (5 minutes)

1. Clone and install:
```bash
git clone https://github.com/EricStrohmaier/agenttodo.ai.git
cd agenttodo
pnpm install
```

2. Set up Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Run migration: `supabase db push` or execute `supabase/migrations/001_full_schema.sql`
   - Copy your project URL and keys

3. Configure environment:
```bash
cp .env.example .env.local
# Fill in your Supabase URL and keys
```

4. Run:
```bash
pnpm dev
```

### Cloud (30 seconds)

Sign up at [agenttodo.ai](https://agenttodo.ai) — free tier includes 50 tasks and 2 API keys.

## Agent Integration

Give your agent the API skill file at `/agenttodo-skill.md` or just tell it:

```
You can manage tasks via AgentTodo REST API.
Base URL: https://your-instance.com
Auth: Authorization: Bearer <api-key>

Find work:     GET  /api/tasks?status=todo&intent=build
Create task:   POST /api/tasks { "title": "...", "intent": "build" }
Bulk create:   POST /api/tasks/bulk { "tasks": [...] }
Claim task:    POST /api/tasks/{id}/start
Complete:      POST /api/tasks/{id}/complete { "result": {...}, "confidence": 0.8 }
```

Full docs at `/docs` or [agenttodo.ai/docs](https://agenttodo.ai/docs).

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Postgres + Auth + Realtime)
- **Tailwind CSS** + shadcn/ui
- **TypeScript**

## Task Schema

| Field | Type | Description |
|-------|------|-------------|
| title | text | Task title |
| intent | enum | research, build, write, think, admin, ops |
| status | enum | todo, in_progress, blocked, review, done |
| priority | 1-5 | Higher = more urgent |
| context | JSON | Links, files, constraints — everything the agent needs |
| confidence | 0-1 | Agent's self-evaluation of result quality |
| requires_human_review | bool | Default true — oversight loop |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE).

---

It's a todo list. But it's *your* todo list. And your agents'. 🤖
