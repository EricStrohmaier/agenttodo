-- AgentTodo: Full schema (combined migration)
-- Combines: core, recurring tasks, agent metadata, plans & limits, user isolation

-- === Enums ===
CREATE TYPE task_intent AS ENUM ('research', 'build', 'write', 'think', 'admin', 'ops');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'review', 'done');
CREATE TYPE log_action AS ENUM ('created', 'claimed', 'updated', 'blocked', 'completed', 'added_subtask', 'request_review', 'unclaimed', 'message_sent');
CREATE TYPE plan_type AS ENUM ('free', 'pro');

-- === Tasks ===
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  intent task_intent NOT NULL DEFAULT 'build',
  status task_status NOT NULL DEFAULT 'todo',
  priority integer NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  context jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  assigned_agent text,
  created_by text NOT NULL DEFAULT 'human',
  result jsonb,
  artifacts text[] DEFAULT '{}',
  confidence float CHECK (confidence >= 0 AND confidence <= 1),
  requires_human_review boolean NOT NULL DEFAULT true,
  blockers text[] DEFAULT '{}',
  attachments jsonb DEFAULT '[]',
  project text DEFAULT NULL,
  project_context text DEFAULT NULL,
  human_input_needed boolean NOT NULL DEFAULT false,
  messages jsonb DEFAULT '[]',
  recurrence jsonb,
  recurrence_source_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN tasks.metadata IS 'Task metadata including attribution/watermark info.';
COMMENT ON COLUMN tasks.recurrence IS 'Cron expression or interval for recurring tasks. Null = one-time.';
COMMENT ON COLUMN tasks.recurrence_source_id IS 'Source template task ID for auto-spawned recurring instances.';

-- === Activity Log ===
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent text NOT NULL,
  action log_action NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- === API Keys ===
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  permissions jsonb DEFAULT '{"read": true, "write": true}',
  description text DEFAULT '',
  capabilities text[] DEFAULT '{}',
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN api_keys.description IS 'Agent description — what it does.';
COMMENT ON COLUMN api_keys.capabilities IS 'Agent capabilities — which task intents it can handle.';

-- === User Plans ===
CREATE TABLE user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan plan_type NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Plan limits (enforced in application code)
-- Free: 50 active tasks, 2 API keys
-- Pro ($4.99/mo): Unlimited tasks, unlimited API keys

-- === Indexes ===
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_intent ON tasks(intent);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_tasks_status_intent ON tasks(status, intent);
CREATE INDEX idx_tasks_project ON tasks(project) WHERE project IS NOT NULL;
CREATE INDEX idx_tasks_human_input ON tasks(human_input_needed) WHERE human_input_needed = true;
CREATE INDEX idx_tasks_recurrence ON tasks(recurrence) WHERE recurrence IS NOT NULL;
CREATE INDEX idx_activity_log_task ON activity_log(task_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_user_plans_user ON user_plans(user_id);
CREATE INDEX idx_user_plans_stripe ON user_plans(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- === Functions & Triggers ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_plans_updated_at BEFORE UPDATE ON user_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activity_log (task_id, agent, action, details, user_id)
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
      jsonb_build_object('from_status', OLD.status::text, 'to_status', NEW.status::text),
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_status_change AFTER UPDATE OF status ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_status_change();

-- === Row Level Security ===
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Authenticated users: scoped to own data via user_id
CREATE POLICY "user_tasks" ON tasks
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_activity_read" ON activity_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_activity_insert" ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_api_keys" ON api_keys
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own plan" ON user_plans
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role: full access (used by API server)
CREATE POLICY "service_tasks" ON tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_activity" ON activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_api_keys" ON api_keys FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON user_plans FOR ALL TO service_role USING (true) WITH CHECK (true);

-- === Realtime ===
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- === Storage: task attachments (private, user-scoped) ===
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', false);

-- User-scoped storage: top-level folder must match user ID
CREATE POLICY "Users can upload own attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'task-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Service role full access to task attachments"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'task-attachments')
  WITH CHECK (bucket_id = 'task-attachments');
