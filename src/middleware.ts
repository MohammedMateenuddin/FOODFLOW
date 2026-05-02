import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = {
  '/donate':             ['donor', 'admin'],
  '/receiver':           ['ngo', 'admin'],
  '/driver':             ['driver', 'admin'],
  '/partners/dashboard': ['valorization_partner', 'admin'],
  '/csr/dashboard':      ['donor', 'admin'],
  '/admin':              ['admin'],
  '/admin/revenue':      ['admin'],
  '/admin/complaints':   ['admin'],
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options: _options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  
  // Find which route pattern matches
  const allowedRoles = Object.entries(PROTECTED_ROUTES)
    .find(([route]) => path.startsWith(route))?.[1]

  // Not a protected route — allow
  if (!allowedRoles) return supabaseResponse

  // Not logged in — redirect to login
  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirect=${path}`, request.url))
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_suspended, is_onboarded')
    .eq('id', session.user.id)
    .single()

  if (profile?.is_suspended) {
    return NextResponse.redirect(new URL('/suspended', request.url))
  }

  if (!profile?.is_onboarded && path !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  if (!allowedRoles.includes(profile?.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/donate', '/receiver/:path*', '/driver/:path*', 
            '/admin/:path*', '/partners/dashboard/:path*', '/csr/dashboard/:path*']
}
