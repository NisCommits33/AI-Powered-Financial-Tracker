import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  let user = null
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-project-url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key'

  if (isSupabaseConfigured) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (err) {
      console.warn('Supabase session refresh failed, falling back to guest mode:', err)
    }
  }

  const url = request.nextUrl.clone()
  const isDemoMode = request.cookies.get('demo_mode')?.value === 'true'
  
  // Define route protections
  const isProtectedPath = 
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/accounts') || 
    url.pathname.startsWith('/transactions') || 
    url.pathname.startsWith('/categories') || 
    url.pathname.startsWith('/budgets')

  const isAuthPath = url.pathname.startsWith('/login') || url.pathname.startsWith('/register')

  if (isProtectedPath && !user && !isDemoMode) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthPath && (user || isDemoMode)) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
