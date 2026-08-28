-- ═══════════════════════════════════════════════════════════
-- FULL FOODFLOW SCHEMA INITIALIZATION
-- Run this in your Supabase SQL Editor if you deleted your project
-- ═══════════════════════════════════════════════════════════

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('donor','ngo','driver','valorization_partner','admin')),
  avatar_url TEXT,
  is_onboarded BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- 2. DONORS
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  badge_tier TEXT,
  badge_active BOOLEAN DEFAULT true,
  badge_since TIMESTAMPTZ,
  trust_score INT DEFAULT 100,
  total_complaints INT DEFAULT 0,
  is_suspended BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RECEIVERS
CREATE TABLE IF NOT EXISTS public.receivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity INT NOT NULL,
  current_demand INT NOT NULL,
  beneficiary_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LISTINGS
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.donors(id),
  food_name TEXT NOT NULL,
  food_type TEXT,
  quantity_kg NUMERIC NOT NULL,
  meals INT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'available',
  matched_receiver_id UUID REFERENCES public.receivers(id),
  match_score NUMERIC,
  storage_type TEXT DEFAULT 'room_temp',
  cooked_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending',
  ai_expiry_flag BOOLEAN DEFAULT false,
  verification_step INT DEFAULT 1,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VALORIZATION PARTNERS & LOGS
CREATE TABLE IF NOT EXISTS public.valorization_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('biogas', 'cattle_feed', 'farmer', 'compost')),
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity_kg_per_day INTEGER NOT NULL DEFAULT 500,
  current_intake INTEGER NOT NULL DEFAULT 0,
  accepts_food_types TEXT[] NOT NULL DEFAULT '{"cooked","raw","bakery","packaged"}',
  contact_phone TEXT,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.valorization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id),
  partner_id UUID REFERENCES public.valorization_partners(id),
  partner_type TEXT NOT NULL,
  quantity_kg DOUBLE PRECISION NOT NULL,
  output_generated TEXT NOT NULL,
  co2_avoided DOUBLE PRECISION NOT NULL DEFAULT 0,
  routed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IMPACT REPORTS & CSR
CREATE TABLE IF NOT EXISTS public.impact_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id),
  meals_saved INT DEFAULT 0,
  kg_rescued NUMERIC DEFAULT 0,
  co2_avoided NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.csr_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_user_id UUID,
  plan TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMPLAINTS
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id),
  raised_by TEXT CHECK (raised_by IN ('ngo','volunteer','valorization_partner','admin')),
  issue_type TEXT,
  severity TEXT CHECK (severity IN ('minor','serious','critical')),
  description TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','investigating','resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DRIVERS & ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  driver_type TEXT DEFAULT 'paid' CHECK (driver_type IN ('paid','volunteer')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_available BOOLEAN DEFAULT true,
  karma_points INT DEFAULT 0,
  total_deliveries INT DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  badge_level TEXT DEFAULT 'newcomer' CHECK (badge_level IN ('newcomer','helper','hero','legend')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id),
  driver_id UUID REFERENCES public.drivers(id),
  status TEXT DEFAULT 'searching' CHECK (status IN ('searching','assigned','picked_up','delivered','failed')),
  current_radius_km INT DEFAULT 3,
  bonus_multiplier NUMERIC DEFAULT 1.0,
  base_pay NUMERIC DEFAULT 40,
  total_pay NUMERIC,
  karma_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS (Simplified for development to avoid issues)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE valorization_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE valorization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE csr_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;

-- Creating permissive policies to get you started on localhost easily
DO $$ DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public read all" ON %I;', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Public write all" ON %I;', r.tablename);
        
        EXECUTE format('CREATE POLICY "Public read all" ON %I FOR SELECT USING (true);', r.tablename);
        EXECUTE format('CREATE POLICY "Public write all" ON %I FOR ALL USING (true) WITH CHECK (true);', r.tablename);
    END LOOP;
END $$;
