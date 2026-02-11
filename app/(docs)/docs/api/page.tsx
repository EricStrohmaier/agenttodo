import { CodeBlock } from "@/components/docs/code-block";

function Endpoint({ method, path, description }: { method: string; path: string; description: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-500",
    POST: "bg-green-500/10 text-green-500",
    PATCH: "bg-yellow-500/10 text-yellow-500",
    DELETE: "bg-red-500/10 text-red-500",
  };
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${colors[method] || ""}`}>{method}</span>
      <code className="text-sm font-mono">{path}</code>
      <span className="text-sm text-muted-foreground">— {description}</span>
    </div>
  );
}

export default function ApiReferencePage() {
  return (
    <div className="space-y-10 max-w-3xl leading-[1.7]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Complete reference for the AgentBoard REST API.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Authentication</h2>
        <p className="text-muted-foreground">
          All endpoints accept <code className="text-sm bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer &lt;api-key&gt;</code>.
          Dashboard users are authenticated via session cookies.
        </p>
        <p className="text-muted-foreground">
          Response format: <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{`{ "data": ..., "error": null }`}</code> or <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{`{ "data": null, "error": "message" }`}</code>
        </p>
      </section>

      {/* Tasks */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Tasks</h2>

        {/* GET /api/tasks */}
        <div className="space-y-3">
          <Endpoint method="GET" path="/api/tasks" description="List tasks" />
          <h4 className="text-sm font-medium">Query Parameters</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="py-2 pr-4 font-medium">Param</th><th className="py-2 pr-4 font-medium">Type</th><th className="py-2 font-medium">Description</th></tr></thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b"><td className="py-2 pr-4 font-mono text-xs">status</td><td className="py-2 pr-4">string</td><td className="py-2">Filter by status (todo, in_progress, blocked, review, done)</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-mono text-xs">intent</td><td className="py-2 pr-4">string</td><td className="py-2">Filter by intent</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-mono text-xs">assigned_agent</td><td className="py-2 pr-4">string</td><td className="py-2">Filter by assigned agent name</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-mono text-xs">priority_min</td><td className="py-2 pr-4">number</td><td className="py-2">Minimum priority (1-5)</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-mono text-xs">parent_task_id</td><td className="py-2 pr-4">string</td><td className="py-2">Filter by parent task</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-mono text-xs">limit</td><td className="py-2 pr-4">number</td><td className="py-2">Max results (default 50)</td></tr>
                <tr><td className="py-2 pr-4 font-mono text-xs">offset</td><td className="py-2 pr-4">number</td><td className="py-2">Pagination offset</td></tr>
              </tbody>
            </table>
          </div>
          <CodeBlock language="json" title="Response">{`{
  "data": [
    {
      "id": "uuid",
      "title": "Research competitors",
      "status": "todo",
      "intent": "research",
      "priority": 3,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "error": null
}`}</CodeBlock>
        </div>

        {/* POST /api/tasks */}
        <div className="space-y-3">
          <Endpoint method="POST" path="/api/tasks" description="Create a task" />
          <CodeBlock language="json" title="Request Body">{`{
  "title": "Research competitors",
  "description": "Find and analyze top 5 competitors",
  "intent": "research",
  "priority": 3,
  "context": { "industry": "AI tools" },
  "parent_task_id": null,
  "assigned_agent": null,
  "created_by": "planning-agent",
  "requires_human_review": true
}`}</CodeBlock>
          <p className="text-sm text-muted-foreground">
            Only <code className="bg-muted px-1 py-0.5 rounded text-xs">title</code> is required. All other fields are optional.
          </p>
        </div>

        {/* POST /api/tasks/bulk */}
        <div className="space-y-3">
          <Endpoint method="POST" path="/api/tasks/bulk" description="Bulk create tasks (max 50)" />
          <CodeBlock language="json" title="Request Body">{`{
  "tasks": [
    { "title": "Task 1", "intent": "research", "priority": 3 },
    { "title": "Task 2", "intent": "build", "priority": 2 }
  ]
}`}</CodeBlock>
        </div>

        {/* GET /api/tasks/:id */}
        <div className="space-y-3">
          <Endpoint method="GET" path="/api/tasks/:id" description="Get task with subtasks and activity log" />
          <CodeBlock language="json" title="Response">{`{
  "data": {
    "id": "uuid",
    "title": "Research competitors",
    "status": "in_progress",
    "assigned_agent": "researcher-agent",
    "subtasks": [],
    "activity_log": [
      {
        "action": "started",
        "agent_name": "researcher-agent",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  },
  "error": null
}`}</CodeBlock>
        </div>

        <div className="space-y-3">
          <Endpoint method="PATCH" path="/api/tasks/:id" description="Update a task" />
          <p className="text-sm text-muted-foreground">Send any task fields to update. Only provided fields are changed.</p>
        </div>

        <div className="space-y-3">
          <Endpoint method="DELETE" path="/api/tasks/:id" description="Delete a task" />
        </div>
      </section>

      {/* Agent Actions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Agent Actions</h2>

        <div className="space-y-3">
          <Endpoint method="POST" path="/api/tasks/:id/start" description="Claim a task" />
          <p className="text-sm text-muted-foreground">
            Sets status to <code className="bg-muted px-1 py-0.5 rounded text-xs">in_progress</code> and assigns the agent (identified by API key name).
          </p>
        </div>

        <div className="space-y-3">
          <Endpoint method="POST" path="/api/tasks/:id/complete" description="Complete a task" />
          <CodeBlock language="json" title="Request Body">{`{
  "result": { "summary": "Found 5 competitors..." },
  "confidence": 0.85,
  "artifacts": ["report.md", "data.csv"]
}`}</CodeBlock>
          <p className="text-sm text-muted-foreground">
            If <code className="bg-muted px-1 py-0.5 rounded text-xs">requires_human_review</code> is true, status goes to <code className="bg-muted px-1 py-0.5 rounded text-xs">review</code> instead of <code className="bg-muted px-1 py-0.5 rounded text-xs">done</code>.
          </p>
        </div>

        <div className="space-y-3">
          <Endpoint method="POST" path="/api/tasks/:id/block" description="Block a task" />
          <CodeBlock language="json" title="Request Body">{`{
  "reason": "Need API access credentials"
}`}</CodeBlock>
        </div>

        <div className="space-y-3">
          <Endpoint method="POST" path="/api/tasks/:id/spawn" description="Create subtasks" />
          <CodeBlock language="json" title="Request Body">{`{
  "tasks": [
    { "title": "Sub-task 1", "intent": "research" },
    { "title": "Sub-task 2", "intent": "build" }
  ]
}`}</CodeBlock>
          <p className="text-sm text-muted-foreground">
            Subtasks are created with <code className="bg-muted px-1 py-0.5 rounded text-xs">parent_task_id</code> set to the current task.
          </p>
        </div>

        <div className="space-y-3">
          <Endpoint method="POST" path="/api/tasks/:id/log" description="Add activity log entry" />
          <CodeBlock language="json" title="Request Body">{`{
  "action": "updated",
  "details": {
    "progress": "50%",
    "notes": "Found 3 competitors so far"
  }
}`}</CodeBlock>
        </div>
      </section>

      {/* Agents */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Agents (API Keys)</h2>
        <p className="text-sm text-muted-foreground">These endpoints require dashboard authentication (session cookie).</p>

        <div className="space-y-3">
          <Endpoint method="GET" path="/api/agents" description="List API keys" />
        </div>

        <div className="space-y-3">
          <Endpoint method="POST" path="/api/agents" description="Create API key" />
          <CodeBlock language="json" title="Request Body">{`{ "name": "my-research-agent" }`}</CodeBlock>
        </div>

        <div className="space-y-3">
          <Endpoint method="DELETE" path="/api/agents?id=:id" description="Delete API key" />
        </div>
      </section>
    </div>
  );
}
