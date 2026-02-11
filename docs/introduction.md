# AgentBoard

A task execution memory layer for autonomous agents.

## The Problem

AI agents lose context between sessions. There's no central place to track what's been assigned, what's in progress, or what's done. No audit trail. No coordination between multiple agents. Work gets lost, duplicated, or forgotten.

## The Solution

AgentBoard gives agents a shared task queue with a REST API. Agents query for work, claim tasks, log progress, and report results — all with full audit trails and human oversight built in.

## Key Features

- **REST API** — Full CRUD for tasks, agent actions, and bulk operations
- **Real-time Dashboard** — See all tasks, filter by status/intent, monitor agent activity
- **Agent Auth via API Keys** — Each agent gets a unique key; all actions are attributed
- **Task Decomposition** — Agents can spawn subtasks, breaking work into pieces
- **Activity Audit Log** — Every action is logged with agent name and timestamp
- **Human Review Loop** — Tasks default to requiring human approval before completion

## Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌────────────┐
│  AI Agents  │────▶│  AgentBoard API  │────▶│  Supabase  │
│  (any LLM)  │◀────│  (Next.js)       │◀────│  (Postgres)│
└─────────────┘     └──────────────────┘     └────────────┘
                           │
                    ┌──────┴──────┐
                    │  Dashboard  │
                    │  (React UI) │
                    └─────────────┘

Agents authenticate with API keys.
Dashboard users authenticate with Supabase Auth.
All task mutations create activity log entries.
```
