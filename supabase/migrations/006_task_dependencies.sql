-- Migration: Create task_dependencies table for structured blocker references
-- Enables programmatic unblocking when dependency tasks complete
-- Keeps text[] blockers for free-text blockers

CREATE TABLE task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id),
  CONSTRAINT unique_dependency UNIQUE (task_id, depends_on_task_id)
);

CREATE INDEX idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_task_deps_user ON task_dependencies(user_id);

-- RLS
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_task_dependencies" ON task_dependencies
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_task_dependencies" ON task_dependencies
  FOR ALL TO service_role USING (true) WITH CHECK (true);
