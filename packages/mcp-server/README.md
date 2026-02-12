# @agenttodo/mcp-server

MCP (Model Context Protocol) server for the AgentTodo task management API.

## Tools

| Tool | Description |
|------|-------------|
| `list_tasks` | List/filter tasks by status, project, intent, priority |
| `create_task` | Create a new task |
| `update_task` | Update task fields |
| `start_task` | Mark task as in_progress |
| `complete_task` | Mark task as done |
| `block_task` | Mark task as blocked |
| `spawn_subtask` | Create a subtask under a parent |
| `log_to_task` | Add a log entry to a task |
| `claim_next_task` | Claim the highest-priority available task |

## Setup

```bash
cd packages/mcp-server
npm install
npm run build
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `AGENTTODO_API_KEY` | Yes | API bearer token |
| `AGENTTODO_API_URL` | No | Override base URL (default: `https://agenttodo.vercel.app/api`) |

## Usage with Claude Code

Add to your `claude_desktop_config.json` or `.mcp.json`:

```json
{
  "mcpServers": {
    "agenttodo": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "AGENTTODO_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Usage with Cursor

In Cursor settings → MCP Servers, add:

```json
{
  "agenttodo": {
    "command": "node",
    "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
    "env": {
      "AGENTTODO_API_KEY": "your-api-key"
    }
  }
}
```

## Dev

```bash
AGENTTODO_API_KEY=your-key npm run dev
```
