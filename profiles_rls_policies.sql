-- =============================================================================
-- profiles: IBAN kaydı (UPDATE) + adminin toptancı IBAN görmesi (SELECT)
-- Supabase SQL Editor'de bir kez çalıştırın.
-- Önkoşul: profile_extensions.sql (iban kolonu) uygulanmış olmalı.
--
-- Not: profiles tablosunda RLS kapalıysa politikalar tanımlanır ama zorlanmaz;
-- RLS açıkken bu kurallar devreye girer. Mevcut politikalarınızla çakışan isimleri
-- DROP satırından sonra düzenleyebilirsiniz.
-- =============================================================================

-- Admin kontrolü: profiles üzerinde SELECT policy içinde doğrudan profiles
-- sorgulamak RLS özyinelemesine yol açabilir; SECURITY DEFINER ile güvenli okuma.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Kendi satırını okuma (çoğu projede zaten vardır; yoksa gerekli)
DROP POLICY IF EXISTS "profiles_select_own_row" ON public.profiles;
CREATE POLICY "profiles_select_own_row"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Kendi satırını güncelleme (toptancı IBAN kaydı)
DROP POLICY IF EXISTS "profiles_update_own_row" ON public.profiles;
CREATE POLICY "profiles_update_own_row"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin: tüm profilleri okuyabilir (sipariş embed / IBAN)
DROP POLICY IF EXISTS "admin_can_read_profiles_for_ops" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_profiles_for_embed" ON public.profiles;

CREATE POLICY "admin_read_profiles_for_embed"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- RLS zaten açıksa zararsız; kapalıysa yukarıdaki politikaları etkinleştirir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
