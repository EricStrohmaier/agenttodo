-- Migration: Extract attachments from tasks JSONB array into dedicated table
-- Fixes race condition with concurrent read-modify-write on attachments array
-- Enables per-file deletion and querying by attachment type

CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'application/octet-stream',
  size integer NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_user ON task_attachments(user_id);

-- RLS
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_task_attachments" ON task_attachments
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_task_attachments" ON task_attachments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Migrate existing attachments from tasks.attachments JSONB array
INSERT INTO task_attachments (user_id, task_id, name, type, size, storage_path, url, created_at)
SELECT
  t.user_id,
  t.id,
  att->>'name',
  COALESCE(att->>'type', 'application/octet-stream'),
  COALESCE((att->>'size')::integer, 0),
  att->>'storage_path',
  att->>'url',
  t.created_at
FROM tasks t,
  jsonb_array_elements(t.attachments) AS att
WHERE t.attachments IS NOT NULL AND jsonb_array_length(t.attachments) > 0;

-- Drop the old column
ALTER TABLE tasks DROP COLUMN attachments;
