-- AgentTodo: Full schema (single combined migration)
-- All tables, indexes, RLS policies, functions, triggers, storage, and realtime

-- === Enums ===
CREATE TYPE task_intent AS ENUM ('research', 'build', 'write', 'think', 'admin', 'ops', 'monitor', 'test', 'review', 'deploy');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'review', 'done');
CREATE TYPE log_action AS ENUM ('created', 'claimed', 'updated', 'blocked', 'completed', 'added_subtask', 'request_review', 'unclaimed', 'message_sent', 'deleted');
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
  project text DEFAULT NULL,
  human_input_needed boolean NOT NULL DEFAULT false,
  recurrence jsonb,
  recurrence_source_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  next_run_at timestamptz,
  claimed_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN tasks.metadata IS 'Task metadata including attribution/watermark info.';
COMMENT ON COLUMN tasks.recurrence IS 'Cron expression or interval for recurring tasks. Null = one-time.';
COMMENT ON COLUMN tasks.recurrence_source_id IS 'Source template task ID for auto-spawned recurring instances.';
COMMENT ON COLUMN tasks.next_run_at IS 'Next scheduled run time for recurring tasks. Computed from recurrence config. Indexed for efficient scheduler queries.';

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

-- === Agent Feedback ===
CREATE TABLE agent_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  agent_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- === Task Messages ===
CREATE TABLE task_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_agent text NOT NULL DEFAULT 'human',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- === Task Attachments ===
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

-- === Projects ===
CREATE TABLE projects_ (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- === Task Dependencies ===
CREATE TABLE task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id),
  CONSTRAINT unique_dependency UNIQUE (task_id, depends_on_task_id)
);

-- === Indexes ===
-- Tasks
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
CREATE INDEX idx_tasks_next_run ON tasks(next_run_at) WHERE next_run_at IS NOT NULL;
CREATE INDEX idx_tasks_not_deleted ON tasks(user_id, deleted_at) WHERE deleted_at IS NULL;

-- Activity log
CREATE INDEX idx_activity_log_task ON activity_log(task_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);

-- API keys
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- User plans
CREATE INDEX idx_user_plans_user ON user_plans(user_id);
CREATE INDEX idx_user_plans_stripe ON user_plans(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Agent feedback
CREATE INDEX idx_agent_feedback_user ON agent_feedback(user_id);

-- Task messages
CREATE INDEX idx_task_messages_task ON task_messages(task_id);
CREATE INDEX idx_task_messages_user ON task_messages(user_id);
CREATE INDEX idx_task_messages_created ON task_messages(task_id, created_at ASC);

-- Task attachments
CREATE INDEX idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_user ON task_attachments(user_id);

-- Projects
CREATE UNIQUE INDEX idx_projects_user_name ON projects_(user_id, name);
CREATE INDEX idx_projects_user ON projects_(user_id);

-- Task dependencies
CREATE INDEX idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_task_deps_user ON task_dependencies(user_id);

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
ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_ ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "user_agent_feedback" ON agent_feedback
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_task_messages" ON task_messages
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_task_attachments" ON task_attachments
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_projects" ON projects_
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_task_dependencies" ON task_dependencies
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role: full access (used by API server)
CREATE POLICY "service_tasks" ON tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_activity" ON activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_api_keys" ON api_keys FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON user_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_agent_feedback" ON agent_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_task_messages" ON task_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_task_attachments" ON task_attachments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_projects" ON projects_ FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_task_dependencies" ON task_dependencies FOR ALL TO service_role USING (true) WITH CHECK (true);

-- === Realtime ===
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE task_messages;

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
