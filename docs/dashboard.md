# Dashboard Guide

The AgentTodo dashboard is where you monitor and manage tasks. It supports two views, inline editing, keyboard shortcuts, and a detailed task page — all updating in real time.

## Views

### List View

The default view. Tasks are displayed as rows with all key fields visible at a glance: checkbox, title, project, intent, priority, status, agent, and timestamp. Every element has a tooltip — hover to see what it represents.

### Board View

A Kanban-style view with columns for each status (`todo`, `in_progress`, `blocked`, `review`, `done`). Drag and drop cards between columns to change status. Cards are sortable within columns as well.

Toggle between views using the **List / Board** switcher in the header. Your preference is saved automatically.

## Quick Add

The input at the top of the dashboard lets you create tasks instantly. Type a title and press Enter. The task is created with default values (`todo` status, `build` intent, priority 3) — you can change these after.

## Filters

Below the quick add input, filter tasks by:

- **Status** — Show only tasks with a specific status
- **Intent** — Filter by task intent (research, build, write, etc.)
- **Agent** — Show tasks assigned to a specific agent
- **Project** — Filter by project name

Filters are combined — selecting both a status and an agent shows only tasks matching both.

## Inline Editing

You can change **intent**, **status**, and **priority** directly from the list and board views without opening the task.

### In List View

- Click the **intent badge** to open a dropdown and select a new intent
- Click the **status badge** to change the task's status
- Click the **priority dots** to set a new priority level (1–5)
- Click the **checkbox** to toggle between `todo` and `done`

### In Board View

- **Drag and drop** a card between columns to change status
- Click the **intent badge** on a card to change intent
- Click the **priority dots** on a card to change priority

All changes are saved immediately and update in real time across all connected clients.

## Quick Delete

Hold **Shift** on your keyboard to enter quick-delete mode. A red trash icon appears on every task row and board card. Click it to delete the task immediately — no confirmation dialog.

Release Shift to hide the trash icons. This is designed for fast bulk cleanup.

## Task Detail Page

Click a task title (in either view) to open its full detail page at `/dashboard/tasks/{id}`. This is a Notion-style page with:

- **Editable title** — Click to edit, auto-resizing textarea
- **Properties table** — Intent, status, priority, project, agent, human input toggle — all editable inline
- **Description** — Rich text field for detailed task information
- **Blockers** — Track what's blocking a task
- **Context** — JSON field for structured data (links, constraints, notes)
- **Result** — Where agents report their output
- **Attachments** — Upload and view files attached to the task
- **Messages** — Comment thread for human–agent communication
- **Subtasks** — Create and manage child tasks
- **Activity Log** — Full audit trail of every action taken on the task
- **Delete** — Permanently remove the task (with confirmation)

Changes are saved on blur (only when values actually changed) and the page subscribes to real-time updates, so you see changes from agents as they happen.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Shift** (hold) | Show delete icons on all tasks |

## Real-Time Updates

The dashboard uses Supabase Realtime subscriptions. When an agent updates a task via the API, you see the change immediately in both the list and board views — no refresh needed. The task detail page also subscribes to updates for the specific task you're viewing.
