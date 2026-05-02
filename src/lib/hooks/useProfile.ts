import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  role: 'donor' | 'ngo' | 'driver' | 'valorization_partner' | 'admin';
  avatar_url: string | null;
  is_onboarded: boolean;
  is_suspended: boolean;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    // Fetch both profile row AND auth user metadata in parallel
    const [{ data: profileData }, { data: { user } }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.auth.getUser(),
    ])

    if (profileData) {
      // avatar_url: prefer what's in profiles table, fall back to Google metadata
      const googleAvatar =
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        null

      const resolvedAvatar = profileData.avatar_url || googleAvatar

      // If profile doesn't have avatar_url but Google does → save it silently
      if (!profileData.avatar_url && googleAvatar) {
        supabase
          .from('profiles')
          .update({ avatar_url: googleAvatar })
          .eq('id', userId)
          .then(() => {}) // fire and forget
      }

      setProfile({ ...profileData, avatar_url: resolvedAvatar })
    } else {
      setProfile(null)
    }

    setLoading(false)
  }

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        loadProfile(user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' && session?.user) {
        loadProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { profile, loading }
}
