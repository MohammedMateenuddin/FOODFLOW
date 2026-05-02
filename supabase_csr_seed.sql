-- ═══════════════════════════════════════════════════
-- FOODFLOW: CSR IMPACT REPORT SYSTEM
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS csr_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  plan TEXT CHECK (plan IN ('basic','professional','enterprise')),
  price_monthly NUMERIC,
  linked_donor_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impact_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES csr_subscriptions(id),
  report_month INT,
  report_year INT,
  total_kg_rescued NUMERIC DEFAULT 0,
  total_meals_served INT DEFAULT 0,
  total_co2_avoided NUMERIC DEFAULT 0,
  total_deliveries INT DEFAULT 0,
  total_families_fed INT DEFAULT 0,
  report_data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE csr_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read csr" ON csr_subscriptions FOR SELECT USING (true);
CREATE POLICY "Public insert csr" ON csr_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read reports" ON impact_reports FOR SELECT USING (true);
CREATE POLICY "Public insert reports" ON impact_reports FOR INSERT WITH CHECK (true);

INSERT INTO csr_subscriptions (company_name, contact_email, plan, price_monthly) VALUES
('Tata Consultancy Services', 'csr@tcs.com', 'enterprise', 4999),
('Reliance Industries', 'csr@ril.com', 'professional', 999),
('HDFC Bank Foundation', 'csr@hdfc.com', 'professional', 999),
('Infosys Foundation', 'csr@infosys.com', 'basic', 299);

SELECT company_name, plan, price_monthly FROM csr_subscriptions;
