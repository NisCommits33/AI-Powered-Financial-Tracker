import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Define a minimal mock for server-side operations if needed
const createServerMockClient = async () => {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'
  
  return {
    auth: {
      getUser: async () => {
        if (isDemo) {
          return { data: { user: { id: 'demo-user', email: 'demo@finance.com' } }, error: null }
        }
        return { data: { user: null }, error: null }
      },
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({
            then: (resolve: any) => resolve({ data: [], error: null })
          }),
          then: (resolve: any) => resolve({ data: [], error: null })
        }),
        then: (resolve: any) => resolve({ data: [], error: null })
      })
    })
  }
}

export async function createClient() {
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-project-url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key'

  if (!isSupabaseConfigured) {
    return (await createServerMockClient()) as any
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie mutations in server components
            }
          },
        },
      }
    )
  } catch (e) {
    console.warn('Server Supabase client creation failed, using mock client:', e)
    return (await createServerMockClient()) as any
  }
}
