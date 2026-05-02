-- ═══════════════════════════════════════════════════════════
-- FoodFlow — MASTER FIX SCRIPT
-- Run this ENTIRE script in Supabase SQL Editor
-- It fixes: RLS infinite recursion, auth trigger, all policies
-- ═══════════════════════════════════════════════════════════

-- ═══════════ STEP 1: Fix profiles table RLS ═══════════
-- The "Admin reads all profiles" policy causes infinite recursion
-- because it queries profiles FROM profiles. Fix: use auth.jwt() instead.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles (clean slate)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin reads all profiles" ON profiles;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Recreate with non-recursive policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (needed for upsert during onboarding)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin reads all profiles — use auth.jwt() to avoid recursion!
CREATE POLICY "Admin reads all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'service_role' 
    OR auth.uid() = id
  );

-- Service role / anon can read for public features (impact counters etc.)
CREATE POLICY "Public read basic profiles" ON profiles
  FOR SELECT USING (true);


-- ═══════════ STEP 2: Fix listings table RLS ═══════════

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read listings" ON listings;
DROP POLICY IF EXISTS "Donors insert own listings" ON listings;
DROP POLICY IF EXISTS "Donors update own listings" ON listings;
DROP POLICY IF EXISTS "Admin full access listings" ON listings;
DROP POLICY IF EXISTS "Public read listings" ON listings;

-- Everyone can read listings (needed for map, receiver, impact pages)
CREATE POLICY "Anyone can read listings" ON listings
  FOR SELECT USING (true);

-- Authenticated users can insert listings
CREATE POLICY "Authenticated insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update listings
CREATE POLICY "Authenticated update listings" ON listings
  FOR UPDATE USING (auth.uid() IS NOT NULL);


-- ═══════════ STEP 3: Fix complaints table RLS ═══════════

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert complaint" ON complaints;
DROP POLICY IF EXISTS "Admin reads all complaints" ON complaints;
DROP POLICY IF EXISTS "Reporter reads own" ON complaints;
DROP POLICY IF EXISTS "Public read complaints" ON complaints;

-- Anyone can read complaints
CREATE POLICY "Anyone can read complaints" ON complaints
  FOR SELECT USING (true);

-- Anyone can insert complaints  
CREATE POLICY "Anyone can insert complaint" ON complaints
  FOR INSERT WITH CHECK (true);

-- Anyone can update complaints (for admin resolution)
CREATE POLICY "Anyone can update complaint" ON complaints
  FOR UPDATE USING (true);


-- ═══════════ STEP 4: Fix csr_subscriptions table RLS ═══════════

ALTER TABLE csr_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company reads own" ON csr_subscriptions;
DROP POLICY IF EXISTS "Admin full access csr" ON csr_subscriptions;
DROP POLICY IF EXISTS "Public read csr" ON csr_subscriptions;

-- Public read (needed for CSR dashboard, revenue page)
CREATE POLICY "Anyone can read csr" ON csr_subscriptions
  FOR SELECT USING (true);

-- Authenticated can insert
CREATE POLICY "Authenticated insert csr" ON csr_subscriptions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated can update
CREATE POLICY "Authenticated update csr" ON csr_subscriptions
  FOR UPDATE USING (auth.uid() IS NOT NULL);


-- ═══════════ STEP 5: Fix other tables RLS ═══════════

-- drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read drivers" ON drivers;
CREATE POLICY "Public read drivers" ON drivers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated update drivers" ON drivers;
CREATE POLICY "Authenticated update drivers" ON drivers FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Authenticated insert drivers" ON drivers;
CREATE POLICY "Authenticated insert drivers" ON drivers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- delivery_assignments
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read assignments" ON delivery_assignments;
CREATE POLICY "Public read assignments" ON delivery_assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert assignments" ON delivery_assignments;
CREATE POLICY "Authenticated insert assignments" ON delivery_assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Authenticated update assignments" ON delivery_assignments;
CREATE POLICY "Authenticated update assignments" ON delivery_assignments FOR UPDATE USING (auth.uid() IS NOT NULL);

-- valorization_partners
ALTER TABLE valorization_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read partners" ON valorization_partners;
CREATE POLICY "Public read partners" ON valorization_partners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated update partners" ON valorization_partners;
CREATE POLICY "Authenticated update partners" ON valorization_partners FOR UPDATE USING (auth.uid() IS NOT NULL);

-- valorization_logs
ALTER TABLE valorization_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read vlogs" ON valorization_logs;
CREATE POLICY "Public read vlogs" ON valorization_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert vlogs" ON valorization_logs;
CREATE POLICY "Authenticated insert vlogs" ON valorization_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- impact_reports
ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read impact" ON impact_reports;
CREATE POLICY "Public read impact" ON impact_reports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert impact" ON impact_reports;
CREATE POLICY "Authenticated insert impact" ON impact_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Authenticated update impact" ON impact_reports;
CREATE POLICY "Authenticated update impact" ON impact_reports FOR UPDATE USING (auth.uid() IS NOT NULL);

-- valorization_invoices
ALTER TABLE valorization_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read invoices" ON valorization_invoices;
CREATE POLICY "Public read invoices" ON valorization_invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert invoices" ON valorization_invoices;
CREATE POLICY "Authenticated insert invoices" ON valorization_invoices FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- donors
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read donors" ON donors;
CREATE POLICY "Public read donors" ON donors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated update donors" ON donors;
CREATE POLICY "Authenticated update donors" ON donors FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Authenticated insert donors" ON donors;
CREATE POLICY "Authenticated insert donors" ON donors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- receivers
ALTER TABLE receivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read receivers" ON receivers;
CREATE POLICY "Public read receivers" ON receivers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated update receivers" ON receivers;
CREATE POLICY "Authenticated update receivers" ON receivers FOR UPDATE USING (auth.uid() IS NOT NULL);


-- ═══════════ STEP 6: Fix auth trigger ═══════════
-- Uses ON CONFLICT to prevent errors if profile already exists
-- Explicitly sets search_path to avoid schema confusion

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════ STEP 7: Enable realtime (skip if already enabled) ═══════════

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE listings; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drivers; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE delivery_assignments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE valorization_logs; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE complaints; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE impact_reports; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE csr_subscriptions; EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ═══════════ STEP 8: Add any missing columns ═══════════

ALTER TABLE listings ADD COLUMN IF NOT EXISTS food_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS storage_type TEXT DEFAULT 'room_temp';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cooked_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_expiry_flag BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS verification_step INT DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS matched_receiver_id UUID;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS match_score NUMERIC;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;


-- ═══════════ DONE ═══════════
-- You should see "Success. No rows returned" if everything worked.
-- Now go to Authentication → Providers → Email → Turn OFF "Confirm email"
