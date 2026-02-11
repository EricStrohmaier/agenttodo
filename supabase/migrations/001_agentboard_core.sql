-- AgentTodo: Core schema
CREATE TYPE task_intent AS ENUM ('research', 'build', 'write', 'think', 'admin', 'ops');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'review', 'done');
CREATE TYPE log_action AS ENUM ('created', 'claimed', 'updated', 'blocked', 'completed', 'added_subtask', 'request_review', 'unclaimed');

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  intent task_intent NOT NULL DEFAULT 'build',
  status task_status NOT NULL DEFAULT 'todo',
  priority integer NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  context jsonb DEFAULT '{}',
  parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  assigned_agent text,
  created_by text NOT NULL DEFAULT 'human',
  result jsonb,
  artifacts text[] DEFAULT '{}',
  confidence float CHECK (confidence >= 0 AND confidence <= 1),
  requires_human_review boolean NOT NULL DEFAULT true,
  blockers text[] DEFAULT '{}',
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent text NOT NULL,
  action log_action NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  permissions jsonb DEFAULT '{"read": true, "write": true}',
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_intent ON tasks(intent);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_tasks_status_intent ON tasks(status, intent);
CREATE INDEX idx_activity_log_task ON activity_log(task_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activity_log (task_id, agent, action, details)
    VALUES (
      NEW.id,
      COALESCE(NEW.assigned_agent, NEW.created_by, 'system'),
      CASE NEW.status
        WHEN 'in_progress' THEN 'claimed'::log_action
        WHEN 'blocked' THEN 'blocked'::log_action
        WHEN 'done' THEN 'completed'::log_action
        WHEN 'review' THEN 'request_review'::log_action
        ELSE 'updated'::log_action
      END,
      jsonb_build_object('from_status', OLD.status::text, 'to_status', NEW.status::text)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_status_change AFTER UPDATE OF status ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_status_change();

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_tasks" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_activity_read" ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_activity_insert" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_api_keys" ON api_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_tasks" ON tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_activity" ON activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_api_keys" ON api_keys FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
