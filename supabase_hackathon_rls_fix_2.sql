-- ═══════════════════════════════════════════════════════════
-- HACKATHON FIX: Open up ALL insert/update policies for the rest of tables
-- ═══════════════════════════════════════════════════════════

-- RECEIVERS
DROP POLICY IF EXISTS "Authenticated insert receivers" ON receivers;
DROP POLICY IF EXISTS "Allow all insert receivers" ON receivers;
CREATE POLICY "Allow all insert receivers" ON receivers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update receivers" ON receivers;
DROP POLICY IF EXISTS "Allow all update receivers" ON receivers;
CREATE POLICY "Allow all update receivers" ON receivers FOR UPDATE USING (true);

-- ADD MISSING COLUMNS
ALTER TABLE donors ADD COLUMN IF NOT EXISTS badge_tier TEXT;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS badge_active BOOLEAN DEFAULT false;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS badge_since TIMESTAMPTZ;
