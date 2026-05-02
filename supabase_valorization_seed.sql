-- ═══════════════════════════════════════════════════
-- FOODFLOW: VALORIZATION ENGINE — DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Create valorization_partners table
CREATE TABLE IF NOT EXISTS valorization_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 2. Create valorization_logs table
CREATE TABLE IF NOT EXISTS valorization_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  partner_id UUID REFERENCES valorization_partners(id),
  partner_type TEXT NOT NULL,
  quantity_kg DOUBLE PRECISION NOT NULL,
  output_generated TEXT NOT NULL,
  co2_avoided DOUBLE PRECISION NOT NULL DEFAULT 0,
  routed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE valorization_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE valorization_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (allow public read/write for demo)
CREATE POLICY "Allow public read on valorization_partners"
  ON valorization_partners FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on valorization_partners"
  ON valorization_partners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on valorization_partners"
  ON valorization_partners FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read on valorization_logs"
  ON valorization_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on valorization_logs"
  ON valorization_logs FOR INSERT
  WITH CHECK (true);

-- 5. Add 'valorized' to listings status (if using enum/check constraint)
-- If your listings table has no CHECK constraint on status, skip this.
-- Otherwise run:
-- ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
-- ALTER TABLE listings ADD CONSTRAINT listings_status_check 
--   CHECK (status IN ('available', 'matched', 'picked_up', 'delivered', 'expired', 'valorized'));

-- ═══════════════════════════════════════════════════
-- SEED DATA: Valorization Partners across India
-- ═══════════════════════════════════════════════════

INSERT INTO valorization_partners (name, type, address, lat, lng, capacity_kg_per_day, current_intake, accepts_food_types, contact_phone) VALUES

-- BIOGAS PLANTS
('GreenGas Energy Pvt Ltd', 'biogas', 'Sector 62, Noida, UP', 28.6270, 77.3650, 1000, 120, '{"cooked","raw","bakery","packaged"}', '+91-9876543210'),
('BioFuel India', 'biogas', 'Whitefield, Bangalore', 12.9698, 77.7500, 800, 200, '{"cooked","raw","bakery"}', '+91-9876543211'),
('CleanPower Biogas', 'biogas', 'Hinjewadi, Pune', 18.5912, 73.7388, 600, 50, '{"cooked","raw","packaged"}', '+91-9876543212'),

-- CATTLE FEED CENTERS
('Gau Seva Kendra', 'cattle_feed', 'Mathura, UP', 27.4924, 77.6737, 500, 80, '{"raw","bakery","cooked"}', '+91-9876543213'),
('Dairy Federation Feed Unit', 'cattle_feed', 'Anand, Gujarat', 22.5645, 72.9289, 700, 150, '{"raw","bakery"}', '+91-9876543214'),
('Sri Krishna Goshala', 'cattle_feed', 'Jaipur, Rajasthan', 26.9124, 75.7873, 400, 60, '{"raw","bakery","cooked"}', '+91-9876543215'),

-- FARMERS (Compost/Manure)
('Organic Farms Collective', 'farmer', 'Nashik, Maharashtra', 20.0112, 73.7898, 300, 40, '{"cooked","raw","packaged"}', '+91-9876543216'),
('Green Earth Agro', 'farmer', 'Coimbatore, Tamil Nadu', 11.0168, 76.9558, 450, 100, '{"cooked","raw","bakery","packaged"}', '+91-9876543217'),
('Krishi Vikas Sangathan', 'farmer', 'Lucknow, UP', 26.8467, 80.9462, 350, 70, '{"cooked","raw"}', '+91-9876543218'),

-- COMPOST UNITS
('Urban Compost Co.', 'compost', 'HSR Layout, Bangalore', 12.9121, 77.6446, 500, 90, '{"cooked","raw","bakery","packaged"}', '+91-9876543219'),
('EcoRecycle Solutions', 'compost', 'Andheri East, Mumbai', 19.1136, 72.8697, 600, 110, '{"cooked","raw","packaged"}', '+91-9876543220'),
('Zero Waste Compost Hub', 'compost', 'Gurgaon, Haryana', 28.4595, 77.0266, 400, 50, '{"cooked","raw","bakery","packaged"}', '+91-9876543221');

-- Verify
SELECT name, type, capacity_kg_per_day FROM valorization_partners ORDER BY type;
