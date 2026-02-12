-- Migration: UUID → nanoid (shorter IDs for less AI context burn)
-- Converts all app-table id columns from uuid to text with nanoid defaults.
-- user_id columns remain uuid (references auth.users).

-- Step 1: Create nanoid generation function in Postgres
CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 12)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  alphabet char[] := ARRAY['0','1','2','3','4','5','6','7','8','9',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
    'q','r','s','t','u','v','w','x','y','z',
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X','Y','Z'];
  alphabet_len int := 62;
BEGIN
  WHILE i < size LOOP
    id := id || alphabet[1 + floor(random() * alphabet_len)::int];
    i := i + 1;
  END LOOP;
  RETURN id;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 2: Drop all foreign key constraints that reference uuid columns we're changing
ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_task_id_fkey;
ALTER TABLE task_messages DROP CONSTRAINT IF EXISTS task_messages_task_id_fkey;
ALTER TABLE task_attachments DROP CONSTRAINT IF EXISTS task_attachments_task_id_fkey;
ALTER TABLE task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_task_id_fkey;
ALTER TABLE task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_depends_on_task_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_parent_task_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_recurrence_source_id_fkey;

-- Step 3: Convert id columns from uuid to text (existing UUIDs become text strings)
-- Tasks
ALTER TABLE tasks ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT nanoid(12);
ALTER TABLE tasks ALTER COLUMN parent_task_id SET DATA TYPE text USING parent_task_id::text;
ALTER TABLE tasks ALTER COLUMN recurrence_source_id SET DATA TYPE text USING recurrence_source_id::text;

-- Activity log
ALTER TABLE activity_log ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE activity_log ALTER COLUMN id SET DEFAULT nanoid(12);
ALTER TABLE activity_log ALTER COLUMN task_id SET DATA TYPE text USING task_id::text;

-- API keys
ALTER TABLE api_keys ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE api_keys ALTER COLUMN id SET DEFAULT nanoid(12);

-- User plans
ALTER TABLE user_plans ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE user_plans ALTER COLUMN id SET DEFAULT nanoid(12);

-- Agent feedback
ALTER TABLE agent_feedback ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE agent_feedback ALTER COLUMN id SET DEFAULT nanoid(12);

-- Task messages
ALTER TABLE task_messages ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE task_messages ALTER COLUMN id SET DEFAULT nanoid(12);
ALTER TABLE task_messages ALTER COLUMN task_id SET DATA TYPE text USING task_id::text;

-- Task attachments
ALTER TABLE task_attachments ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE task_attachments ALTER COLUMN id SET DEFAULT nanoid(12);
ALTER TABLE task_attachments ALTER COLUMN task_id SET DATA TYPE text USING task_id::text;

-- Projects
ALTER TABLE projects_ ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE projects_ ALTER COLUMN id SET DEFAULT nanoid(12);

-- Task dependencies
ALTER TABLE task_dependencies ALTER COLUMN id SET DATA TYPE text USING id::text;
ALTER TABLE task_dependencies ALTER COLUMN id SET DEFAULT nanoid(12);
ALTER TABLE task_dependencies ALTER COLUMN task_id SET DATA TYPE text USING task_id::text;
ALTER TABLE task_dependencies ALTER COLUMN depends_on_task_id SET DATA TYPE text USING depends_on_task_id::text;

-- Step 4: Re-add foreign key constraints (now text → text)
ALTER TABLE tasks ADD CONSTRAINT tasks_parent_task_id_fkey
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD CONSTRAINT tasks_recurrence_source_id_fkey
  FOREIGN KEY (recurrence_source_id) REFERENCES tasks(id) ON DELETE SET NULL;

ALTER TABLE activity_log ADD CONSTRAINT activity_log_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE task_messages ADD CONSTRAINT task_messages_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE task_attachments ADD CONSTRAINT task_attachments_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE task_dependencies ADD CONSTRAINT task_dependencies_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE task_dependencies ADD CONSTRAINT task_dependencies_depends_on_task_id_fkey
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE;
