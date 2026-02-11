-- Run this on your live DB to add the new intent enum values
ALTER TYPE task_intent ADD VALUE IF NOT EXISTS 'monitor';
ALTER TYPE task_intent ADD VALUE IF NOT EXISTS 'test';
ALTER TYPE task_intent ADD VALUE IF NOT EXISTS 'review';
ALTER TYPE task_intent ADD VALUE IF NOT EXISTS 'deploy';
