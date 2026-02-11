CREATE TABLE agent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_feedback_user ON agent_feedback(user_id);

ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_agent_feedback" ON agent_feedback FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "service_agent_feedback" ON agent_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
