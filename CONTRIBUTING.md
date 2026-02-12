# Contributing to AgentTodo

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Set up Supabase (see README)
4. Copy `.env.example` to `.env.local` and fill in your keys
5. Run `pnpm dev`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test locally
4. Submit a PR with a clear description of what changed and why

## Code Style

- **TypeScript** — strict mode, no `any` unless unavoidable
- **Tailwind CSS** — utility-first, use existing design tokens
- **shadcn/ui** — use existing components before creating new ones
- **File naming** — kebab-case for files, PascalCase for components
- **Imports** — use `@/` path aliases

## Reporting Issues

Open an issue on GitHub. Include:

- What you expected vs what happened
- Steps to reproduce
- Browser/environment info if relevant

## Questions?

Open a discussion or issue — we're happy to help.
