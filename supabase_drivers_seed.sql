-- ═══════════════════════════════════════════════════
-- FOODFLOW: DRIVER/VOLUNTEER SYSTEM — DATABASE
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS drivers (
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
  badge_level TEXT DEFAULT 'newcomer' 
    CHECK (badge_level IN ('newcomer','helper','hero','legend')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  driver_id UUID REFERENCES drivers(id),
  status TEXT DEFAULT 'searching' 
    CHECK (status IN ('searching','assigned','picked_up','delivered','failed')),
  current_radius_km INT DEFAULT 3,
  bonus_multiplier NUMERIC DEFAULT 1.0,
  base_pay NUMERIC DEFAULT 40,
  total_pay NUMERIC,
  karma_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read drivers" ON drivers FOR SELECT USING (true);
CREATE POLICY "Public insert drivers" ON drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update drivers" ON drivers FOR UPDATE USING (true);
CREATE POLICY "Public read assignments" ON delivery_assignments FOR SELECT USING (true);
CREATE POLICY "Public insert assignments" ON delivery_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update assignments" ON delivery_assignments FOR UPDATE USING (true);

-- SEED 10 demo drivers across Mumbai
INSERT INTO drivers (name, driver_type, lat, lng, karma_points, total_deliveries, badge_level) VALUES
('Rahul S.', 'paid', 19.0760, 72.8777, 450, 45, 'hero'),
('Priya V.', 'volunteer', 19.0596, 72.8295, 280, 28, 'helper'),
('Amit K.', 'paid', 19.1136, 72.8697, 890, 89, 'legend'),
('Sneha M.', 'volunteer', 18.9388, 72.8354, 120, 12, 'newcomer'),
('Rajan P.', 'paid', 19.0330, 72.8642, 560, 56, 'hero'),
('Kavya R.', 'volunteer', 19.1663, 72.9321, 340, 34, 'helper'),
('Dev T.', 'paid', 18.9975, 72.8368, 720, 72, 'legend'),
('Meera J.', 'volunteer', 19.0728, 72.8826, 190, 19, 'helper'),
('Arjun N.', 'paid', 19.1437, 72.8526, 430, 43, 'hero'),
('Nisha B.', 'volunteer', 18.9220, 72.8347, 85, 8, 'newcomer');

SELECT name, driver_type, badge_level, karma_points FROM drivers ORDER BY karma_points DESC;
