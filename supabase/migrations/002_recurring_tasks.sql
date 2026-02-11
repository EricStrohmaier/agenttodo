-- AgentBoard: Recurring tasks support
-- Migration 002: Add recurrence to tasks

ALTER TABLE tasks ADD COLUMN recurrence jsonb;
-- recurrence format: { "type": "cron" | "interval", "expr": "0 9 * * 1" | "86400000", "next_run": "timestamp" }
-- null = one-time task

ALTER TABLE tasks ADD COLUMN recurrence_source_id uuid REFERENCES tasks(id) ON DELETE SET NULL;
-- Points to the original recurring task template when auto-spawned

COMMENT ON COLUMN tasks.recurrence IS 'Cron expression or interval for recurring tasks. Null = one-time.';
COMMENT ON COLUMN tasks.recurrence_source_id IS 'Source template task ID for auto-spawned recurring instances.';

CREATE INDEX idx_tasks_recurrence ON tasks(recurrence) WHERE recurrence IS NOT NULL;
