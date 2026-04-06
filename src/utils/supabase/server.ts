import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Sunucu bileşenleri ve Route Handler'lar için.
 * getAll/setAll — signOut sırasında parçalı sb-* çerezlerinin tam silinmesi için gerekli.
 */
export function createClient() {
  const cookieStore = cookies()

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
            // Server Component içinde set çağrısı — yoksay
          }
        },
      },
    }
  )
}
