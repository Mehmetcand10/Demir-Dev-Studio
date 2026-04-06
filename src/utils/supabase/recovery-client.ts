import { createClient } from "@supabase/supabase-js";

/**
 * E-postadaki şifre sıfırlama linki çoğu projede #access_token (implicit) ile gelir.
 * @supabase/ssr createBrowserClient ise flowType'ı pkce'ye zorlar; implicit URL ile çakışır.
 * Bu istemci yalnızca sıfırlama sayfasında hash oturumu için kullanılır.
 */
export function createImplicitRecoveryClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
      },
    }
  );
}
