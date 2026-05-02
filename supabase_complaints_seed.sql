-- ═══════════════════════════════════════════════════
-- FOODFLOW: COMPLAINTS & TRUST SYSTEM
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  raised_by TEXT CHECK (raised_by IN ('ngo','volunteer','valorization_partner','admin')),
  issue_type TEXT CHECK (issue_type IN (
    'food_spoiled','wrong_quantity','wrong_food_type',
    'late_delivery','driver_no_show','wrong_valorization_category','other'
  )),
  severity TEXT CHECK (severity IN ('minor','serious','critical')),
  description TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','investigating','resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE donors ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 100;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS total_complaints INT DEFAULT 0;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Public insert complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update complaints" ON complaints FOR UPDATE USING (true);

-- SEED demo complaints (requires existing listings)
-- Run AFTER you have at least 1 listing
INSERT INTO complaints (listing_id, raised_by, issue_type, severity, description, status)
SELECT id, 'ngo', 'wrong_quantity', 'minor', 'Received 3kg instead of listed 5kg', 'resolved'
FROM listings LIMIT 1;

INSERT INTO complaints (listing_id, raised_by, issue_type, severity, description, status)
SELECT id, 'volunteer', 'food_spoiled', 'serious', 'Rice had sour smell on pickup', 'open'
FROM listings ORDER BY created_at DESC LIMIT 1;

INSERT INTO complaints (listing_id, raised_by, issue_type, severity, description, status)
SELECT id, 'ngo', 'late_delivery', 'minor', 'Delivery arrived 45 min late', 'investigating'
FROM listings ORDER BY created_at LIMIT 1;
