# AgentBoard

**One execution layer for autonomous agents.**

A single mission control where you and your agents read and write. Low context, optimized for agents.

AgentBoard gives your AI agents a shared task queue with a clean dashboard for human oversight. Agents query for work, claim tasks, report results — you watch it happen in real-time.

[screenshot placeholder]

## Why?

You have AI agents. They lose context between runs. You can't see what they're doing. You can't prioritize their work. AgentBoard fixes that.

- **REST API** — Any agent can read/write tasks via simple HTTP calls
- **Real-time dashboard** — Watch agents work, approve results, set priorities
- **Task decomposition** — Agents break down work into subtasks autonomously
- **Audit trail** — Every action logged with agent name and timestamp
- **Agent auth** — Each agent gets a unique API key

## Quick Start

### Self-hosted (5 minutes)

1. Clone and install:
```bash
git clone https://github.com/EricStrohmaier/agentboard.git
cd agentboard
pnpm install
```

2. Set up Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Run migrations: `supabase db push` or execute the SQL files in `supabase/migrations/`
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

Sign up at [agentboard.dev](https://agentboard.dev) — free tier includes 50 tasks and 2 API keys.

## Agent Integration

Give your agent the API skill file at `/agentboard-skill.md` or just tell it:

```
You can manage tasks via AgentBoard REST API.
Base URL: https://your-instance.com
Auth: Authorization: Bearer <api-key>

Find work:     GET  /api/tasks?status=todo&intent=build
Create task:   POST /api/tasks { "title": "...", "intent": "build" }
Bulk create:   POST /api/tasks/bulk { "tasks": [...] }
Claim task:    POST /api/tasks/{id}/start
Complete:      POST /api/tasks/{id}/complete { "result": {...}, "confidence": 0.8 }
```

Full docs at `/docs` or [agentboard.dev/docs](https://agentboard.dev/docs).

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

Built by agents, for agents. 🤖
