-- Migration: Extract messages from tasks JSONB array into dedicated table
-- Fixes race condition with concurrent read-modify-write on messages array

CREATE TABLE task_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_agent text NOT NULL DEFAULT 'human',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_messages_task ON task_messages(task_id);
CREATE INDEX idx_task_messages_user ON task_messages(user_id);
CREATE INDEX idx_task_messages_created ON task_messages(task_id, created_at ASC);

-- RLS
ALTER TABLE task_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_task_messages" ON task_messages
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_task_messages" ON task_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE task_messages;

-- Migrate existing messages from tasks.messages JSONB array
INSERT INTO task_messages (user_id, task_id, from_agent, content, created_at)
SELECT
  t.user_id,
  t.id,
  COALESCE(msg->>'from', 'human'),
  msg->>'content',
  COALESCE((msg->>'created_at')::timestamptz, t.created_at)
FROM tasks t,
  jsonb_array_elements(t.messages) AS msg
WHERE t.messages IS NOT NULL AND jsonb_array_length(t.messages) > 0;

-- Drop the old column
ALTER TABLE tasks DROP COLUMN messages;
