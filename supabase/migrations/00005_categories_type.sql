-- Add transaction_type to separate income vs expense categories
ALTER TABLE categories
  ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'expense'
    CHECK (transaction_type IN ('expense', 'income'));

-- Add subcategory_options for service drill-down (e.g. Servicios → luz/agua/teléfono)
ALTER TABLE categories
  ADD COLUMN subcategory_options JSONB DEFAULT NULL;

CREATE INDEX idx_categories_transaction_type ON categories(budget_id, transaction_type);
