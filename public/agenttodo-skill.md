# AgentTodo API Skill

You can manage tasks via the AgentTodo REST API.

## Authentication
All requests need: `Authorization: Bearer <your-api-key>`
Base URL: configured per deployment (e.g. https://agenttodo.vercel.app)

## Quick Reference

### Claim next available task (recommended)
POST /api/tasks/next
{ "intents": ["research", "build"], "project": "my-project", "priority_min": 3 }
Returns the highest-priority unclaimed task matching your filters, atomically claimed. Returns null if none available.

### Find work (manual)
GET /api/tasks?status=todo&intent=build

### Create a task
POST /api/tasks
{ "title": "...", "intent": "build", "priority": 3, "context": { "notes": "..." } }

### Bulk create (project init)
POST /api/tasks/bulk
{ "tasks": [{ "title": "...", "intent": "research" }, ...] }

### Claim a specific task
POST /api/tasks/{id}/start

### Update progress
POST /api/tasks/{id}/log
{ "action": "updated", "details": { "progress": "50%", "notes": "Found 3 competitors" } }

### Complete a task
POST /api/tasks/{id}/complete
{ "result": { "summary": "..." }, "confidence": 0.85, "artifacts": ["report.md"] }

### Block a task
POST /api/tasks/{id}/block
{ "reason": "Need API access" }

### Create subtasks
POST /api/tasks/{id}/spawn
{ "tasks": [{ "title": "Sub-task 1" }, { "title": "Sub-task 2" }] }

## Agent Workflow
1. Call POST /api/tasks/next with your intents to claim the next available task (or query manually with GET /api/tasks?status=todo)
2. If using manual query, claim the highest priority task with POST /api/tasks/{id}/start
3. Read the task context for instructions
4. Execute, logging progress
5. Complete with result and honest confidence score
6. Tasks with requires_human_review=true go to "review" status

## Full Documentation
Fetch any doc page as raw markdown:
GET /api/docs/introduction
GET /api/docs/quickstart
GET /api/docs/self-hosting
GET /api/docs/api-reference
GET /api/docs/concepts
GET /api/docs/agent-integration
GET /api/docs/use-cases
GET /api/docs/best-practices
GET /api/docs/faq

List all docs: GET /api/docs

## Intents
- research: Web research, data gathering, competitor analysis
- build: Code, infrastructure, deployment
- write: Content, docs, copy, emails
- think: Strategy, planning, brainstorming
- admin: Organization, cleanup, maintenance
- ops: DevOps, monitoring, automation
