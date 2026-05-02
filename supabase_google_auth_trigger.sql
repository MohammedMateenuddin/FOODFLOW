-- ============================================================
-- FoodFlow: Sync Google avatar to profiles on every login
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Update existing profiles that are missing avatar_url
-- (pulls from auth.users metadata for Google OAuth users)
UPDATE public.profiles p
SET avatar_url = COALESCE(
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture'
)
FROM auth.users u
WHERE u.id = p.id
  AND p.avatar_url IS NULL
  AND (
    u.raw_user_meta_data->>'avatar_url' IS NOT NULL
    OR u.raw_user_meta_data->>'picture' IS NOT NULL
  );

-- 2. Update the trigger to also capture Google's "picture" field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  intended_role TEXT;
  user_avatar   TEXT;
BEGIN
  intended_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'intended_role',
    'donor'
  );

  -- Google uses "picture", email signup may use "avatar_url"
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  INSERT INTO public.profiles (
    id, full_name, email, role, is_onboarded, avatar_url, created_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    NEW.email,
    intended_role,
    FALSE,
    user_avatar,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET avatar_url = EXCLUDED.avatar_url
    WHERE profiles.avatar_url IS NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- ============================================================
-- Verify the fix worked — should show avatar_url for Google users
-- SELECT id, full_name, avatar_url FROM public.profiles LIMIT 10;
-- ============================================================
