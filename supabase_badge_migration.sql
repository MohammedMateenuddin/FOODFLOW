-- ═══════════════════════════════════════════════════════════
-- FoodFlow Verified Partner Badge System - Database Migration
-- ═══════════════════════════════════════════════════════════

-- Add badge columns to donors table
ALTER TABLE donors ADD COLUMN IF NOT EXISTS badge_tier TEXT DEFAULT NULL
  CHECK (badge_tier IN ('verified','premium','flagship'));
ALTER TABLE donors ADD COLUMN IF NOT EXISTS badge_active BOOLEAN DEFAULT false;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS badge_since TIMESTAMPTZ;

-- Seed 3 badged restaurants for demo
UPDATE donors SET badge_tier = 'flagship', badge_active = true, badge_since = NOW()
  WHERE id = (SELECT id FROM donors LIMIT 1 OFFSET 0);
UPDATE donors SET badge_tier = 'premium', badge_active = true, badge_since = NOW()
  WHERE id = (SELECT id FROM donors LIMIT 1 OFFSET 1);
UPDATE donors SET badge_tier = 'verified', badge_active = true, badge_since = NOW()
  WHERE id = (SELECT id FROM donors LIMIT 1 OFFSET 2);
