-- =============================================================================
-- KRİTİK RLS / GÜVENLİK YAMALARI (Supabase SQL Editor'de bir kez çalıştırın)
-- Önkoşul: notifications tablosu, orders, profiles mevcut olmalı.
-- Idempotent: tekrar çalıştırılabilir (policy isimleri sabit).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Admin kullanıcı ID'leri — butik/toptancı profiles tablosunu tarayamazken
--    bildirim gönderebilsin diye SECURITY DEFINER RPC (sadece id listesi).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_profile_ids()
RETURNS TABLE (id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.id FROM public.profiles p WHERE p.role = 'admin';
$$;

REVOKE ALL ON FUNCTION public.get_admin_profile_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_profile_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_profile_ids() TO service_role;

COMMENT ON FUNCTION public.get_admin_profile_ids() IS
  'Uygulama adminlere bildirim atarken kullanır; tam profiles satırını açmaz.';

-- -----------------------------------------------------------------------------
-- 2) Bildirimler — RLS + sahibi okur/yazar; insert: giriş yapmış herkes
--    (notify() başka kullanıcıya satır ekler). SELECT ile başkasının bildirimini
--    okuyamaz. İleride Edge Function + service_role ile sıkılaştırılabilir.
-- -----------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Uygulama notify(hedef_id, ...) ile çapraz insert yapar; hedef başka kullanıcı olabilir.
CREATE POLICY "notifications_insert_authenticated"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id IS NOT NULL);

-- uuid-ossp zorunluluğunu kaldır (Supabase varsayılanı)
ALTER TABLE public.notifications
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- -----------------------------------------------------------------------------
-- 3) Butik — sadece ödeme bekleyen siparişi iptal edebilir (status → cancelled)
--    İstemci yalnızca { status } güncellemeli; başka alanları değiştirmeyin.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "orders_butik_cancel_waiting_payment" ON public.orders;

CREATE POLICY "orders_butik_cancel_waiting_payment"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id AND status = 'waiting_payment')
  WITH CHECK (auth.uid() = buyer_id AND status = 'cancelled');
