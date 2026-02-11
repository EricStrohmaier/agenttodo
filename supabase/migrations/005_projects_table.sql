-- Migration: Create projects table for consistent project management
-- Replaces loose text field with proper entity
-- Auto-create projects on task create/update for backward compatibility

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique project name per user
CREATE UNIQUE INDEX idx_projects_user_name ON projects(user_id, name);
CREATE INDEX idx_projects_user ON projects(user_id);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_projects" ON projects
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_projects" ON projects
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Migrate existing project names from tasks into the projects table
INSERT INTO projects (user_id, name)
SELECT DISTINCT user_id, project
FROM tasks
WHERE project IS NOT NULL AND project != ''
ON CONFLICT (user_id, name) DO NOTHING;

-- Migrate project_context into projects.description where available
UPDATE projects p
SET description = t.project_context
FROM (
  SELECT DISTINCT ON (user_id, project) user_id, project, project_context
  FROM tasks
  WHERE project IS NOT NULL AND project_context IS NOT NULL AND project_context != ''
  ORDER BY user_id, project, updated_at DESC
) t
WHERE p.user_id = t.user_id AND p.name = t.project;

-- Drop project_context column from tasks (moved to projects.description)
ALTER TABLE tasks DROP COLUMN project_context;
