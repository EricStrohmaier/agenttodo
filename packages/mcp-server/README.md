# @agenttodo/mcp-server

MCP server for [AgentTodo](https://agenttodo.vercel.app) — task management for AI agents via the [Model Context Protocol](https://modelcontextprotocol.io).

## Quick Start

1. Get your API key at [agenttodo.vercel.app](https://agenttodo.vercel.app)
2. Add the MCP config to your editor (see below)
3. Done — your AI agent can now manage tasks

## Installation

### npx (recommended — zero install)

```bash
AGENTTODO_API_KEY=your-key npx @agenttodo/mcp-server
```

### Global install

```bash
npm i -g @agenttodo/mcp-server
AGENTTODO_API_KEY=your-key agenttodo-mcp
```

### From source

```bash
git clone https://github.com/EricStrohmaier/agenttodo.git
cd agenttodo/packages/mcp-server
npm install
npm run build
AGENTTODO_API_KEY=your-key node dist/index.js
```

## Editor Configuration

### Claude Desktop / Claude Code

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

### Cursor

In Cursor settings → MCP Servers, add:

```json
{
  "agenttodo": {
    "command": "npx",
    "args": ["-y", "@agenttodo/mcp-server"],
    "env": {
      "AGENTTODO_API_KEY": "your-api-key"
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP config:

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

### OpenClaw

Add to your OpenClaw skills or MCP config:

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

### Other Editors

Any editor supporting MCP can use the same pattern — run `npx -y @agenttodo/mcp-server` with `AGENTTODO_API_KEY` set in the environment.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AGENTTODO_API_KEY` | Yes | API bearer token from [agenttodo.vercel.app](https://agenttodo.vercel.app) |
| `AGENTTODO_API_URL` | No | Override base URL (default: `https://agenttodo.vercel.app/api`) |

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

## Development

```bash
AGENTTODO_API_KEY=your-key npm run dev
```

## License

MIT © [Eric Strohmaier](https://github.com/ericstrohmaier)
