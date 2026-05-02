-- ═══════════════════════════════════════════════════
-- FOODFLOW: 3-STEP VERIFICATION — DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

ALTER TABLE listings ADD COLUMN IF NOT EXISTS cooked_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS storage_type TEXT DEFAULT 'room_temp';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS verification_step INT DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS volunteer_checklist JSONB DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_expiry_flag BOOLEAN DEFAULT false;
