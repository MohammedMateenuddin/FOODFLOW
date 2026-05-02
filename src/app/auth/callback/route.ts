import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const intendedRole = searchParams.get('role') ?? 'donor'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin))
  }

  const supabaseResponse = NextResponse.redirect(new URL(next, origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie') ?? ''
          return cookieHeader.split('; ').filter(Boolean).map(c => {
            const [name, ...v] = c.split('=')
            return { name, value: v.join('=') }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
  }

  const user = data.user

  // Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_onboarded, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Profile not created by trigger yet — create it manually
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User'

    const { error: insertError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      role: intendedRole,
      is_onboarded: false,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Profile upsert error:', insertError)
    }

    // New user → go to onboarding to confirm role & fill details
    const onboardingUrl = new URL('/onboarding', origin)
    onboardingUrl.searchParams.set('role', intendedRole)
    const redirectResponse = NextResponse.redirect(onboardingUrl)
    supabaseResponse.cookies.getAll().forEach(c => {
      redirectResponse.cookies.set(c.name, c.value)
    })
    return redirectResponse
  }

  // Existing user — check onboarding status
  if (!profile.is_onboarded) {
    const onboardingUrl = new URL('/onboarding', origin)
    const redirectResponse = NextResponse.redirect(onboardingUrl)
    supabaseResponse.cookies.getAll().forEach(c => {
      redirectResponse.cookies.set(c.name, c.value)
    })
    return redirectResponse
  }

  // Fully onboarded — route to role dashboard
  const routes: Record<string, string> = {
    donor: '/donate',
    ngo: '/receiver',
    driver: '/driver/dashboard',
    valorization_partner: '/partners/dashboard/me',
    admin: '/admin',
  }

  const destination = routes[profile.role] ?? '/'
  const finalResponse = NextResponse.redirect(new URL(destination, origin))
  supabaseResponse.cookies.getAll().forEach(c => {
    finalResponse.cookies.set(c.name, c.value)
  })
  return finalResponse
}
