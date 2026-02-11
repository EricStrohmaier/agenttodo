-- Migration: Add next_run_at for efficient recurring task scheduling
-- Enables querying "what recurring tasks are due?" without full table scan

ALTER TABLE tasks ADD COLUMN next_run_at timestamptz;

COMMENT ON COLUMN tasks.next_run_at IS 'Next scheduled run time for recurring tasks. Computed from recurrence config. Indexed for efficient scheduler queries.';

CREATE INDEX idx_tasks_next_run ON tasks(next_run_at) WHERE next_run_at IS NOT NULL;
