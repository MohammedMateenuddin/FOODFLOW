-- ═══════════════════════════════════════════════════════════
-- FoodFlow Authentication & RLS Setup
-- ═══════════════════════════════════════════════════════════

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
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
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin reads all profiles" ON profiles;
CREATE POLICY "Admin reads all profiles" ON profiles 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS on listings (only donors can insert their own)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read listings" ON listings;
CREATE POLICY "Anyone can read listings" ON listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Donors insert own listings" ON listings;
CREATE POLICY "Donors insert own listings" ON listings FOR INSERT 
  WITH CHECK (auth.uid()::text = donor_id::text);

DROP POLICY IF EXISTS "Donors update own listings" ON listings;
CREATE POLICY "Donors update own listings" ON listings FOR UPDATE 
  USING (auth.uid()::text = donor_id::text);

DROP POLICY IF EXISTS "Admin full access listings" ON listings;
CREATE POLICY "Admin full access listings" ON listings FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS on complaints
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert complaint" ON complaints;
CREATE POLICY "Anyone can insert complaint" ON complaints FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin reads all complaints" ON complaints;
CREATE POLICY "Admin reads all complaints" ON complaints FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Reporter reads own" ON complaints;
CREATE POLICY "Reporter reads own" ON complaints FOR SELECT 
  USING (auth.uid()::text = raised_by::text);

-- RLS on csr_subscriptions
ALTER TABLE csr_subscriptions ADD COLUMN IF NOT EXISTS contact_user_id UUID;
ALTER TABLE csr_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company reads own" ON csr_subscriptions;
CREATE POLICY "Company reads own" ON csr_subscriptions FOR SELECT 
  USING (auth.uid()::text = contact_user_id::text);

DROP POLICY IF EXISTS "Admin full access csr" ON csr_subscriptions;
CREATE POLICY "Admin full access csr" ON csr_subscriptions FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed 1 admin account (using an upsert-style approach)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@foodflow.in') THEN
    INSERT INTO auth.users (id, email) 
      VALUES ('00000000-0000-0000-0000-000000000001', 'admin@foodflow.in');
  END IF;

  -- Profile trigger will auto-create, so update instead of insert to avoid conflict
  UPDATE profiles 
  SET full_name = 'FoodFlow Admin', role = 'admin', is_onboarded = true
  WHERE id = '00000000-0000-0000-0000-000000000001';
  
  IF NOT FOUND THEN
    INSERT INTO profiles (id, full_name, role, is_onboarded)
    VALUES ('00000000-0000-0000-0000-000000000001', 'FoodFlow Admin', 'admin', true);
  END IF;
END $$;
