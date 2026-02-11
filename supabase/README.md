# Supabase Database Guide

## Quick Start

### Applying Migration
Go to Supabase Dashboard > SQL Editor > paste `001_full_schema.sql` > Run

Or with Supabase CLI:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

## Schema Overview

Everything is in a single migration: `001_full_schema.sql`

| Table | Purpose |
|-------|---------|
| `tasks` | Core task queue — shared between humans and agents |
| `activity_log` | Audit trail of every action |
| `api_keys` | Agent authentication with capabilities |
| `user_plans` | Free/Pro plan tracking with Stripe |

## Key Tables

```
tasks
├── intent (enum: research, build, write, think, admin, ops)
├── status (enum: todo, in_progress, blocked, review, done)
├── priority (1-5, higher = more urgent)
├── context (JSONB) → links, files, constraints
├── metadata (JSONB) → attribution/watermark info
├── recurrence (JSONB) → cron/interval for recurring tasks
├── confidence (0-1) → agent self-evaluation
└── requires_human_review (bool, default true)

api_keys
├── key_hash (unique)
├── permissions (JSONB: read/write)
├── description → what the agent does
└── capabilities (text[]) → which intents it handles

user_plans
├── plan (enum: free, pro)
├── stripe_customer_id
└── stripe_subscription_id
```

## Plan Limits (enforced in application code)

- **Free**: 50 active tasks, 2 API keys
- **Pro** ($4.99/mo): Unlimited tasks, unlimited API keys

## Enums

- `task_intent`: research, build, write, think, admin, ops
- `task_status`: todo, in_progress, blocked, review, done
- `log_action`: created, claimed, updated, blocked, completed, added_subtask, request_review, unclaimed
- `plan_type`: free, pro

## Auto-Triggers

- `tasks_updated_at` — auto-updates `updated_at` on task changes
- `tasks_status_change` — auto-logs status transitions to `activity_log`
- `user_plans_updated_at` — auto-updates `updated_at` on plan changes

## RLS Policies

- Authenticated users: full CRUD on tasks/api_keys, read+insert on activity_log, read own plan
- Service role: full access to everything

## Realtime

Tasks and activity_log are published via Supabase Realtime.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```
