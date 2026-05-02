-- ═══════════════════════════════════════════════════════════
-- FoodFlow Revenue & Valorization Portal - Database Migration
-- ═══════════════════════════════════════════════════════════

-- Add subscription and fee columns to valorization_partners
ALTER TABLE valorization_partners ADD COLUMN IF NOT EXISTS 
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free','basic','premium'));
ALTER TABLE valorization_partners ADD COLUMN IF NOT EXISTS 
  tipping_fee_per_kg NUMERIC DEFAULT 2.5;
ALTER TABLE valorization_partners ADD COLUMN IF NOT EXISTS 
  monthly_fee NUMERIC DEFAULT 0;

-- Create invoices table
CREATE TABLE IF NOT EXISTS valorization_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES valorization_partners(id),
  month INT,
  year INT,
  total_kg_received NUMERIC DEFAULT 0,
  tipping_fee_total NUMERIC DEFAULT 0,
  subscription_fee NUMERIC DEFAULT 0,
  total_due NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE valorization_invoices ENABLE ROW LEVEL SECURITY;

-- Note: Policies need to be handled according to your existing structure. Assuming public read for demo.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'valorization_invoices' AND policyname = 'Public read invoices'
    ) THEN
        CREATE POLICY "Public read invoices" ON valorization_invoices FOR SELECT USING (true);
    END IF;
END $$;


-- Seed partners with subscription tiers for the demo
UPDATE valorization_partners SET subscription_plan='premium', 
  tipping_fee_per_kg=1.0, monthly_fee=15000 
  WHERE id IN (SELECT id FROM valorization_partners WHERE name LIKE '%Biogas%' LIMIT 2);

UPDATE valorization_partners SET subscription_plan='basic',   
  tipping_fee_per_kg=1.5, monthly_fee=5000  
  WHERE id IN (SELECT id FROM valorization_partners WHERE name LIKE '%Cattle%' LIMIT 2);
