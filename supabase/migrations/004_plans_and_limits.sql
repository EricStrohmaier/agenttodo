-- Plans and usage limits
CREATE TYPE plan_type AS ENUM ('free', 'pro');

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

CREATE INDEX idx_user_plans_user ON user_plans(user_id);
CREATE INDEX idx_user_plans_stripe ON user_plans(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own plan" ON user_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON user_plans FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER user_plans_updated_at BEFORE UPDATE ON user_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
