CREATE TABLE scheduled_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT CHECK (char_length(description) <= 500),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Budget members can read scheduled transactions"
  ON scheduled_transactions FOR SELECT
  USING (budget_id IN (SELECT get_user_budget_ids()));

CREATE POLICY "Budget members can insert scheduled transactions"
  ON scheduled_transactions FOR INSERT
  WITH CHECK (
    budget_id IN (SELECT get_user_budget_ids())
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own scheduled transactions"
  ON scheduled_transactions FOR UPDATE
  USING (user_id = auth.uid() AND budget_id IN (SELECT get_user_budget_ids()));

CREATE POLICY "Users can delete own scheduled transactions"
  ON scheduled_transactions FOR DELETE
  USING (user_id = auth.uid() AND budget_id IN (SELECT get_user_budget_ids()));

CREATE TRIGGER handle_updated_at_scheduled
  BEFORE UPDATE ON scheduled_transactions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_scheduled_budget ON scheduled_transactions(budget_id);
CREATE INDEX idx_scheduled_user ON scheduled_transactions(user_id);
CREATE INDEX idx_scheduled_next_due ON scheduled_transactions(next_due_date) WHERE is_active = TRUE;
