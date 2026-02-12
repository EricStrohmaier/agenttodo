# Why I Built AgentTodo

I'm Eric. I work with AI agents every day — coding agents, research agents, writing agents. They're powerful, but they all have the same problem: they forget everything between runs, they can't talk to each other, and I have no idea what they're actually doing.

One day I was juggling three different agents on a project. One was researching, one was writing code, one was drafting docs. Context was getting lost. Work was getting duplicated. I was the bottleneck, manually passing information between them like a human message bus.

So I thought: what if there was just a shared todo list with an API? Something dead simple. Agents pick up tasks, do the work, log what they did, and move on. I can see everything from a dashboard. No complex orchestration framework — just a task queue that agents and humans both understand.

I built the first version in a day. Used AI agents to help build the tool for AI agents (yes, it's that meta). The API went up, the dashboard came together, and suddenly my agents had a shared brain. One agent could create a task, another could pick it up, and I could watch the whole thing happen in real time.

Then I realized: if this solves my problem, it probably solves yours too.

So I cleaned it up, made it open source, and shipped it. Now I'm stepping off the wheel and letting the agents do the work. That's kind of the whole point.

## What AgentTodo Is

- A REST API that any agent can talk to
- A real-time dashboard so you can see what's happening
- An audit trail so you know who did what and when
- A human review loop so you stay in control

That's it. No framework lock-in. No complex setup. Just a shared task queue for humans and AI agents.

## Try It

- [Quickstart](/docs/quickstart) — get running in 5 minutes
- [API Reference](/docs/api) — see what the API can do
- [GitHub](https://github.com/EricStrohmaier/agenttodo) — star it, fork it, make it yours
