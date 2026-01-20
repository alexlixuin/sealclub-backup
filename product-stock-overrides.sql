CREATE TABLE IF NOT EXISTS public.product_stock_overrides (
  product_id TEXT PRIMARY KEY,
  hide_stock BOOLEAN DEFAULT FALSE,
  domestic_all BOOLEAN,
  international_all BOOLEAN,
  size_overrides JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_stock_overrides ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Allow service role full access to product_stock_overrides'
  ) THEN
    CREATE POLICY "Allow service role full access to product_stock_overrides"
    ON public.product_stock_overrides
    FOR ALL
    TO service_role
    USING (true);
  END IF;
END $$;
