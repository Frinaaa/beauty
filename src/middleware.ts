import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /seller routes
  if (request.nextUrl.pathname.startsWith('/seller') && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect logged in users away from login page
  if (request.nextUrl.pathname === '/' && user) {
    return NextResponse.redirect(new URL('/seller', request.url))
  }

  return response
}

export const config = { matcher: ['/seller/:path*', '/'] }
