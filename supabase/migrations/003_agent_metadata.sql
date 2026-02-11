-- AgentBoard: Agent branding & metadata
-- Migration 003: Add metadata fields for viral distribution

-- Add a "managed by" watermark field to task results
ALTER TABLE tasks ADD COLUMN metadata jsonb DEFAULT '{}';
-- metadata can include: { "managed_by": "AgentBoard", "version": "1.0", "agent_version": "..." }

-- Add agent description/capabilities to api_keys
ALTER TABLE api_keys ADD COLUMN description text DEFAULT '';
ALTER TABLE api_keys ADD COLUMN capabilities text[] DEFAULT '{}';
-- capabilities: what intents this agent handles, e.g. ['research', 'build']

COMMENT ON COLUMN tasks.metadata IS 'Task metadata including attribution/watermark info.';
COMMENT ON COLUMN api_keys.description IS 'Agent description — what it does.';
COMMENT ON COLUMN api_keys.capabilities IS 'Agent capabilities — which task intents it can handle.';
