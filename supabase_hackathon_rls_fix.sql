-- ═══════════════════════════════════════════════════════════
-- HACKATHON FIX: Open up ALL insert/update policies
-- Run this in Supabase SQL Editor RIGHT NOW
-- ═══════════════════════════════════════════════════════════

-- DONORS: Allow all inserts and updates
DROP POLICY IF EXISTS "Authenticated insert donors" ON donors;
CREATE POLICY "Allow all insert donors" ON donors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update donors" ON donors;
CREATE POLICY "Allow all update donors" ON donors FOR UPDATE USING (true);

-- LISTINGS: Allow all inserts and updates
DROP POLICY IF EXISTS "Authenticated insert listings" ON listings;
CREATE POLICY "Allow all insert listings" ON listings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update listings" ON listings;
CREATE POLICY "Allow all update listings" ON listings FOR UPDATE USING (true);

-- PROFILES: Allow all inserts and updates (for onboarding)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Allow all insert profiles" ON profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Allow all update profiles" ON profiles FOR UPDATE USING (true);

-- COMPLAINTS: Already open, but make sure
DROP POLICY IF EXISTS "Anyone can insert complaint" ON complaints;
CREATE POLICY "Allow all insert complaints" ON complaints FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update complaint" ON complaints;
CREATE POLICY "Allow all update complaints" ON complaints FOR UPDATE USING (true);

-- DELIVERY_ASSIGNMENTS
DROP POLICY IF EXISTS "Authenticated insert assignments" ON delivery_assignments;
CREATE POLICY "Allow all insert assignments" ON delivery_assignments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update assignments" ON delivery_assignments;
CREATE POLICY "Allow all update assignments" ON delivery_assignments FOR UPDATE USING (true);

-- DRIVERS
DROP POLICY IF EXISTS "Authenticated insert drivers" ON drivers;
CREATE POLICY "Allow all insert drivers" ON drivers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update drivers" ON drivers;
CREATE POLICY "Allow all update drivers" ON drivers FOR UPDATE USING (true);

-- VALORIZATION_LOGS
DROP POLICY IF EXISTS "Authenticated insert vlogs" ON valorization_logs;
CREATE POLICY "Allow all insert vlogs" ON valorization_logs FOR INSERT WITH CHECK (true);

-- VALORIZATION_PARTNERS
DROP POLICY IF EXISTS "Authenticated update partners" ON valorization_partners;
CREATE POLICY "Allow all update partners" ON valorization_partners FOR UPDATE USING (true);

-- IMPACT_REPORTS
DROP POLICY IF EXISTS "Authenticated insert impact" ON impact_reports;
CREATE POLICY "Allow all insert impact" ON impact_reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update impact" ON impact_reports;
CREATE POLICY "Allow all update impact" ON impact_reports FOR UPDATE USING (true);

-- CSR_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Authenticated insert csr" ON csr_subscriptions;
CREATE POLICY "Allow all insert csr" ON csr_subscriptions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update csr" ON csr_subscriptions;
CREATE POLICY "Allow all update csr" ON csr_subscriptions FOR UPDATE USING (true);

-- VALORIZATION_INVOICES
DROP POLICY IF EXISTS "Authenticated insert invoices" ON valorization_invoices;
CREATE POLICY "Allow all insert invoices" ON valorization_invoices FOR INSERT WITH CHECK (true);

-- DONE! All tables now accept inserts/updates without auth check.
