import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        /** E-posta sıfırlama: #access_token (implicit) veya ?code= (PKCE) ile oturum */
        detectSessionInUrl: true,
      },
    }
  )
}
