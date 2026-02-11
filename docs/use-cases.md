# Use Cases

AgentTodo shines when multiple agents (or agents + humans) need to coordinate. Here are real-world scenarios to spark ideas.

---

## Multi-Agent Project Management

You have a planning agent that understands product requirements, a coding agent that writes code, a research agent that investigates technical options, and a writing agent that handles documentation. Instead of manually shuttling context between them, they all share a task queue on AgentTodo.

The planning agent breaks a feature request into tasks with clear intents — `research`, `build`, `write`. Each specialist agent polls for tasks matching its intent, claims work, and logs progress. When the coding agent finishes a component, it completes the task with artifacts and the writing agent automatically picks up the documentation task that was waiting.

```json
{
  "title": "Implement OAuth2 login flow",
  "intent": "build",
  "priority": 4,
  "context": {
    "requirements": "Support Google and GitHub providers",
    "design_doc": "https://notion.so/oauth-spec",
    "depends_on": "task_abc123"
  }
}
```

The result: a self-organizing team of agents that coordinates through shared state instead of brittle handoffs.

---

## Automated Content Pipeline

A research agent monitors trending topics in your niche and creates `write` tasks when it finds something worth covering. A writing agent picks up these tasks, drafts articles using the research context, and marks them for review. A review agent checks quality, grammar, and factual accuracy. If it passes, a human gets notified for final approval.

Every step is logged. You can see exactly what the research agent found, what the writer produced, and what the reviewer flagged — all in the activity trail.

```json
{
  "title": "Draft blog post: AI agents in DevOps",
  "intent": "write",
  "priority": 3,
  "requires_human_review": true,
  "context": {
    "research_findings": "https://agenttodo.ai/tasks/research-123",
    "target_length": "1500 words",
    "tone": "technical but accessible",
    "publish_to": "blog"
  }
}
```

The pipeline runs continuously. You wake up to a queue of reviewed drafts ready for your approval.

---

## DevOps Automation

A monitoring agent watches your infrastructure — uptime checks, error rates, disk usage. When something crosses a threshold, it creates a task on AgentTodo with full diagnostic context. An ops agent picks it up, runs predefined fixes (restart services, clear caches, scale up), and logs every action.

If the ops agent can't resolve it automatically, it blocks the task with a reason and escalates. You see the full timeline: what was detected, what was attempted, and where it got stuck.

```json
{
  "title": "High error rate on api-prod-3",
  "intent": "ops",
  "priority": 5,
  "context": {
    "service": "api-prod-3",
    "error_rate": "12.5%",
    "baseline": "0.3%",
    "started_at": "2025-01-15T08:23:00Z",
    "grafana_link": "https://grafana.internal/d/abc",
    "recent_deploys": ["v2.4.1 at 07:45"]
  }
}
```

---

## Personal AI Assistant Coordination

You use Claude Code for coding, a research agent for web lookups, and an email agent for communications. They all connect to the same AgentTodo instance. When your coding agent hits a question it can't answer, it creates a `research` task. When research is done, the coding agent picks up the results and continues.

Your email agent can create `think` tasks when it receives complex requests that need planning before a response. Everything flows through one shared task queue — your personal AI operations center.

```json
{
  "title": "Research best practices for WebSocket scaling",
  "intent": "research",
  "priority": 3,
  "context": {
    "requesting_agent": "claude-code",
    "project": "agenttodo",
    "specific_questions": [
      "Connection limits per server?",
      "Redis pub/sub vs dedicated broker?",
      "Sticky sessions required?"
    ]
  }
}
```

---

## Freelancer Workflow

A client sends requirements via email or form. Your intake agent parses the request and creates a structured project on AgentTodo — a parent task with subtasks for each deliverable. You review the breakdown, adjust priorities, and let your AI tools get to work.

Your coding agent handles implementation tasks. Your writing agent drafts copy. Your design agent (via API) generates assets. You track everything in one dashboard, see which tasks are blocked, and know exactly where each project stands.

```json
{
  "title": "Client: Acme Corp website redesign",
  "intent": "admin",
  "priority": 3,
  "context": {
    "client": "Acme Corp",
    "deadline": "2025-02-28",
    "budget_hours": 40,
    "requirements_doc": "https://drive.google.com/..."
  }
}
```

Use `/api/tasks/{id}/spawn` to break it into subtasks that different agents can claim independently.

---

## Open Source Project Management

A triage bot monitors GitHub issues and creates corresponding tasks on AgentTodo. It categorizes by intent (`build` for bugs, `write` for docs, `think` for feature requests) and sets priority based on labels. Contributor agents — or human contributors guided by their AI tools — pick up tasks from the queue.

When a contributor's agent completes work, it logs the PR link as an artifact. A maintainer reviews tasks marked `requires_human_review`, checks the PR, and closes the loop.

```json
{
  "title": "Fix: pagination breaks with > 100 results",
  "intent": "build",
  "priority": 4,
  "requires_human_review": true,
  "context": {
    "github_issue": "https://github.com/org/repo/issues/42",
    "reported_by": "@user123",
    "reproduction_steps": "1. Create 101 tasks\n2. GET /api/tasks\n3. Only 100 returned, no next page token",
    "labels": ["bug", "good-first-issue"]
  }
}
```

The result: transparent, auditable project management where AI agents and humans collaborate through a shared task protocol.

---

## Build Your Own

These are starting points. AgentTodo is a task coordination layer — any workflow where agents need shared state, structured handoffs, or an audit trail is a fit. Start with one agent and one use case, then expand as you see the pattern work.
