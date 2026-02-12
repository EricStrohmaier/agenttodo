# Plan: API & Data Model Improvements

Based on real usage testing of every endpoint. These changes improve data integrity, query performance, and reduce payload bloat.

---

## 1. Extract `messages` into a `task_messages` table

**Problem:** Messages are stored as a JSON array on the task row. Adding a message requires read-modify-write of the entire array. Two concurrent writers (e.g. agent + human) will clobber each other.

**Solution:**
- Create `task_messages` table: `id`, `user_id`, `task_id`, `from_agent` (string), `content` (text), `created_at`
- Add foreign key to `tasks(id)` with `ON DELETE CASCADE`
- RLS policy: `user_id = auth.uid()`
- New API endpoints:
  - `POST /api/tasks/[id]/messages` — add a message (atomic insert, no race)
  - `GET /api/tasks/[id]/messages` — list messages for a task
- Update `GET /api/tasks/[id]` to join `task_messages` instead of reading JSON column
- Migration: move existing `tasks.messages` JSON array rows into the new table, then drop the column
- Update `hooks/use-tasks.ts` realtime to optionally subscribe to `task_messages` changes
- Update `task-detail.tsx` and `tasks/[id]/page.tsx` to use the new endpoints

**Files:**
- `supabase/migrations/003_extract_messages.sql` (create)
- `app/api/tasks/[id]/messages/route.ts` (create)
- `app/api/tasks/[id]/route.ts` (modify — join messages, remove from PATCH allowed)
- `components/dashboard/task-detail.tsx` (modify)
- `app/(main)/dashboard/tasks/[id]/page.tsx` (modify)
- `hooks/use-tasks.ts` (modify)
- `types/tasks.ts` (modify — add `TaskMessage` with `id`, remove `messages` from `Task`)

---

## 2. Extract `attachments` into a `task_attachments` table

**Problem:** Same read-modify-write race condition as messages. Also can't efficiently query "all tasks with PDF attachments" or enforce per-file deletion.

**Solution:**
- Create `task_attachments` table: `id`, `user_id`, `task_id`, `name`, `type`, `size`, `storage_path`, `url`, `created_at`
- Foreign key to `tasks(id)` with `ON DELETE CASCADE`
- RLS policy: `user_id = auth.uid()`
- `POST /api/tasks/[id]/upload` already exists — update it to insert a row instead of patching the JSON array
- `DELETE /api/tasks/[id]/attachments/[attachmentId]` — new endpoint for removing a single attachment
- Update `GET /api/tasks/[id]` to join `task_attachments`
- Migration: move existing JSON array data into the new table, drop column

**Files:**
- `supabase/migrations/004_extract_attachments.sql` (create)
- `app/api/tasks/[id]/upload/route.ts` (modify)
- `app/api/tasks/[id]/attachments/[attachmentId]/route.ts` (create — DELETE)
- `app/api/tasks/[id]/route.ts` (modify — join attachments, remove from PATCH)
- `components/dashboard/task-detail.tsx` (modify)
- `app/(main)/dashboard/tasks/[id]/page.tsx` (modify)
- `types/tasks.ts` (modify)

---

## 3. Consolidate `context` and `metadata` JSON fields

**Problem:** Three JSON blob fields (`context`, `metadata`, `result`) with unclear boundaries. "Where does this data go?" is ambiguous for both humans and agents.

**Solution:**
- Define clear semantics:
  - `context` — **input** data the agent needs to do its work (tags, references, scope, etc.)
  - `metadata` — **system/tracking** info (source, watermark, attribution, version). Agents should read but not typically write.
  - `result` — **output** from agent execution. Only written on completion.
- Merge `metadata` into `context` under a reserved `_meta` key, OR keep them separate but add validation:
  - `metadata` keys must be flat string/number values (no nested objects)
  - `context` allows arbitrary nesting
- Add comments/documentation in the migration and types file
- Update API validation to enforce these rules

**Files:**
- `app/api/tasks/[id]/route.ts` (modify — add metadata validation)
- `app/api/tasks/route.ts` (modify — same)
- `types/tasks.ts` (modify — add JSDoc comments)
- `supabase/migrations/001_full_schema.sql` (modify — update column comments)

---

## 4. Create a `projects` table

**Problem:** `project` is a loose string field. "frontend", "Frontend", and "front-end" are three different projects. No way to list all projects, enforce consistency, or add project-level settings.

**Solution:**
- Create `projects` table: `id` (uuid), `user_id`, `name`, `description`, `color` (for UI badges), `created_at`
- Unique constraint on `(user_id, name)`
- RLS policy: `user_id = auth.uid()`
- Change `tasks.project` from `text` to `uuid REFERENCES projects(id)` (or keep text but add auto-creation)
- Simpler approach: keep `project` as text on tasks, but add the `projects` table and an API. On task create/update, auto-create the project if it doesn't exist. Use the projects table for listing/filtering in the UI sidebar.
- New endpoints:
  - `GET /api/projects` — list user's projects
  - `POST /api/projects` — create project
  - `PATCH /api/projects/[id]` — update name/color
  - `DELETE /api/projects/[id]` — delete (nullify tasks.project or cascade)
- Drop `project_context` column — move it to `projects.description`

**Files:**
- `supabase/migrations/005_projects_table.sql` (create)
- `app/api/projects/route.ts` (create)
- `app/api/projects/[id]/route.ts` (create)
- `app/api/tasks/route.ts` (modify — auto-create project on task create)
- `types/tasks.ts` (modify — add Project interface)
- `components/dashboard/sidebar.tsx` (modify — list projects from API)
- `components/dashboard/task-filters.tsx` (modify — project filter from projects table)

---

## 5. Make `blockers` reference actual task IDs

**Problem:** Blockers are text strings. An agent can't programmatically unblock a task when a dependency completes.

**Solution:**
- Create `task_dependencies` table: `id`, `user_id`, `task_id` (the blocked task), `depends_on_task_id` (the blocker), `created_at`
- Foreign keys to `tasks(id)` with `ON DELETE CASCADE`
- When a task completes, check if it unblocks any other tasks (remove the dependency row, and if no more dependencies remain, optionally move the blocked task to `todo`)
- Keep `blockers` text array for free-text blockers that aren't task references (e.g. "Waiting for client approval")
- New endpoints:
  - `POST /api/tasks/[id]/dependencies` — add a task dependency
  - `DELETE /api/tasks/[id]/dependencies/[depId]` — remove
  - Update `POST /api/tasks/[id]/complete` — auto-resolve downstream dependencies
- UI: Show both text blockers and linked task blockers in the detail view

**Files:**
- `supabase/migrations/006_task_dependencies.sql` (create)
- `app/api/tasks/[id]/dependencies/route.ts` (create)
- `app/api/tasks/[id]/complete/route.ts` (modify — resolve deps)
- `app/api/tasks/[id]/route.ts` (modify — include deps in GET)
- `types/tasks.ts` (modify — add TaskDependency interface)
- `components/dashboard/task-detail.tsx` (modify — show linked blockers)
- `app/(main)/dashboard/tasks/[id]/page.tsx` (modify — same)

---

## 6. Unify human-in-the-loop fields

**Problem:** Human interaction is fragmented across `human_input_needed` (bool flag), `requires_human_review` (bool flag), and `messages` (the actual conversation). An agent sets a flag AND writes a message separately.

**Solution:**
- Keep `requires_human_review` as a task-level config (should this task be reviewed before closing?)
- Remove `human_input_needed` as a separate field. Instead derive it:
  - A task "needs input" when the last message in the thread is `from !== "human"` AND the message has `needs_response: true`
  - Or: add a `pending_input` boolean that gets auto-set when an agent sends a message requesting input, and auto-cleared when a human responds
- Alternatively (simpler): keep the flag but auto-set it via the message endpoint. When an agent posts a message, `human_input_needed` is set to `true`. When a human posts, it's set to `false`. Remove the manual toggle.

**Files:**
- `app/api/tasks/[id]/messages/route.ts` (modify — auto-toggle flag)
- `app/api/tasks/[id]/route.ts` (modify — remove manual toggle from PATCH, or keep as override)
- `types/tasks.ts` (modify)
- `components/dashboard/task-detail.tsx` (modify — remove manual toggle)
- `app/(main)/dashboard/tasks/[id]/page.tsx` (modify — same)

---

## 7. Add `next_run_at` for recurring tasks

**Problem:** `recurrence` is a JSON blob on the task. No way to efficiently query "what recurring tasks are due?" without full table scan.

**Solution:**
- Add `next_run_at timestamptz` column to `tasks` table
- When a task with `recurrence` is created or completed, compute `next_run_at` from the cron expression
- Add index: `CREATE INDEX idx_tasks_next_run ON tasks(next_run_at) WHERE next_run_at IS NOT NULL`
- A scheduler (cron job or edge function) can now efficiently query: `SELECT * FROM tasks WHERE next_run_at <= now() AND recurrence IS NOT NULL`
- When a recurring instance is spawned, update `next_run_at` on the source task to the next occurrence

**Files:**
- `supabase/migrations/007_next_run_at.sql` (create)
- `app/api/tasks/route.ts` (modify — compute next_run_at on create)
- `app/api/tasks/[id]/complete/route.ts` (modify — compute next_run_at after completion)
- `types/tasks.ts` (modify — add next_run_at)
- `lib/recurrence.ts` (create — cron parser utility)

---

## 8. Add lightweight list endpoint / sparse field selection

**Problem:** The GET list endpoint returns every field for every task, including empty `context: {}`, `metadata: {}`, `messages: []`, `attachments: []`, `result: null`, etc. For a dashboard listing 50+ tasks, this is unnecessary payload.

**Solution:**
- Add `fields` query parameter to `GET /api/tasks`:
  - Default (list mode): `id,title,status,intent,priority,project,assigned_agent,human_input_needed,parent_task_id,updated_at`
  - `?fields=full` returns everything (current behavior)
- Or: add a separate `GET /api/tasks/summary` endpoint that returns only the light fields
- The detail endpoint (`GET /api/tasks/[id]`) continues returning everything + subtasks + logs

**Files:**
- `app/api/tasks/route.ts` (modify — add select field filtering)

---

## Recommended order of implementation

1. **Extract messages** (highest impact — fixes race condition, most used feature)
2. **Extract attachments** (same pattern, fixes same class of bug)
3. **Projects table** (improves data consistency, enables better UI filtering)
4. **Lightweight list endpoint** (quick win, reduces payload)
5. **Task dependencies / blockers** (enables automation workflows)
6. **Unify human-in-the-loop** (reduces confusion, cleaner API)
7. **Consolidate context/metadata** (documentation + validation)
8. **next_run_at for recurrence** (enables scheduling)
