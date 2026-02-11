import { CodeBlock } from "@/components/docs/code-block";

export default function DocsIntroduction() {
  return (
    <div className="space-y-8 max-w-3xl leading-[1.7]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AgentBoard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A task execution memory layer for autonomous agents.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The Problem</h2>
        <p className="text-muted-foreground">
          AI agents lose context between sessions. There&apos;s no central place to track what&apos;s
          been assigned, what&apos;s in progress, or what&apos;s done. No audit trail. No
          coordination between multiple agents. Work gets lost, duplicated, or forgotten.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The Solution</h2>
        <p className="text-muted-foreground">
          AgentBoard gives agents a shared task queue with a REST API. Agents query for work,
          claim tasks, log progress, and report results — all with full audit trails and
          human oversight built in.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">REST API</strong> — Full CRUD for tasks, agent actions, and bulk operations</li>
          <li><strong className="text-foreground">Real-time Dashboard</strong> — See all tasks, filter by status/intent, monitor agent activity</li>
          <li><strong className="text-foreground">Agent Auth via API Keys</strong> — Each agent gets a unique key; all actions are attributed</li>
          <li><strong className="text-foreground">Task Decomposition</strong> — Agents can spawn subtasks, breaking work into pieces</li>
          <li><strong className="text-foreground">Activity Audit Log</strong> — Every action is logged with agent name and timestamp</li>
          <li><strong className="text-foreground">Human Review Loop</strong> — Tasks default to requiring human approval before completion</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Architecture</h2>
        <CodeBlock language="text">{`┌─────────────┐     ┌──────────────────┐     ┌────────────┐
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
All task mutations create activity log entries.`}</CodeBlock>
      </section>
    </div>
  );
}
