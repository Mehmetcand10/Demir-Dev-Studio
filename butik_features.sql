-- Butik deneyimi: sipariş notu, dekont URL, alışveriş listesi, tedarikçi takibi, hedefli yeni ürün bildirimi.
-- Önkoşul: orders, products, profiles, notifications, notify_boutiques_new_product.sql (fonksiyon güncellenir).
-- Supabase SQL Editor'de çalıştırın.

-- 1) Sipariş ek alanları
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_note text,
  ADD COLUMN IF NOT EXISTS payment_receipt_url text;

COMMENT ON COLUMN public.orders.buyer_note IS 'Butiğin tedarikçi/operasyon için kısa notu';
COMMENT ON COLUMN public.orders.payment_receipt_url IS 'Ödeme dekontu dosyası (storage public URL)';

-- Butik: ödeme beklerken dekont URL güncelleyebilsin (durum aynı kalır)
DROP POLICY IF EXISTS "orders_butik_update_waiting_receipt" ON public.orders;
CREATE POLICY "orders_butik_update_waiting_receipt"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id AND status = 'waiting_payment')
  WITH CHECK (auth.uid() = buyer_id AND status = 'waiting_payment');

-- 2) Alışveriş listesi (taslak / sonra sipariş)
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_quantities jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS shopping_list_items_user_id_idx ON public.shopping_list_items (user_id);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shopping_list_select_own" ON public.shopping_list_items;
CREATE POLICY "shopping_list_select_own"
  ON public.shopping_list_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "shopping_list_insert_own" ON public.shopping_list_items;
CREATE POLICY "shopping_list_insert_own"
  ON public.shopping_list_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "shopping_list_update_own" ON public.shopping_list_items;
CREATE POLICY "shopping_list_update_own"
  ON public.shopping_list_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "shopping_list_delete_own" ON public.shopping_list_items;
CREATE POLICY "shopping_list_delete_own"
  ON public.shopping_list_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3) Tedarikçi takibi (yeni ürün bildirimi: takipçilere öncelik)
CREATE TABLE IF NOT EXISTS public.boutique_wholesaler_follows (
  boutique_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wholesaler_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (boutique_id, wholesaler_id)
);

CREATE INDEX IF NOT EXISTS boutique_wholesaler_follows_wholesaler_idx
  ON public.boutique_wholesaler_follows (wholesaler_id);

ALTER TABLE public.boutique_wholesaler_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boutique_follows_select_own" ON public.boutique_wholesaler_follows;
CREATE POLICY "boutique_follows_select_own"
  ON public.boutique_wholesaler_follows FOR SELECT TO authenticated
  USING (auth.uid() = boutique_id);

DROP POLICY IF EXISTS "boutique_follows_insert_butik" ON public.boutique_wholesaler_follows;
CREATE POLICY "boutique_follows_insert_butik"
  ON public.boutique_wholesaler_follows FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = boutique_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'butik')
  );

DROP POLICY IF EXISTS "boutique_follows_delete_own" ON public.boutique_wholesaler_follows;
CREATE POLICY "boutique_follows_delete_own"
  ON public.boutique_wholesaler_follows FOR DELETE TO authenticated
  USING (auth.uid() = boutique_id);

-- Toptancı: kendi vitrinini takip eden kayıtları görebilir (sayı / liste)
DROP POLICY IF EXISTS "boutique_follows_wholesaler_select" ON public.boutique_wholesaler_follows;
CREATE POLICY "boutique_follows_wholesaler_select"
  ON public.boutique_wholesaler_follows FOR SELECT TO authenticated
  USING (
    auth.uid() = wholesaler_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'toptanci')
  );

-- 4) Yeni ürün bildirimi: en az bir takipçi varsa yalnızca takipçi butiklere; yoksa tüm onaylı butiklere (mevcut davranış)
CREATE OR REPLACE FUNCTION public.notify_boutiques_new_catalog_product(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wholesaler uuid;
  v_name text;
  v_caller uuid := auth.uid();
  v_has_followers boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = v_caller AND pr.role = 'toptanci') THEN
    RAISE EXCEPTION 'only wholesaler can notify';
  END IF;

  SELECT p.wholesaler_id, p.name INTO v_wholesaler, v_name
  FROM public.products p
  WHERE p.id = p_product_id;

  IF v_wholesaler IS NULL THEN
    RAISE EXCEPTION 'product not found';
  END IF;

  IF v_wholesaler <> v_caller THEN
    RAISE EXCEPTION 'not product owner';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.boutique_wholesaler_follows f
    INNER JOIN public.profiles pr ON pr.id = f.boutique_id
    WHERE f.wholesaler_id = v_wholesaler
      AND pr.role = 'butik'
      AND pr.is_approved = true
  ) INTO v_has_followers;

  IF v_has_followers THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT
      pr.id,
      'Yeni ürün — takip ettiğiniz vitrin',
      format('Takip ettiğiniz tedarikçi vitrinine yeni ürün eklendi: %s. Katalogdan inceleyebilirsiniz.', v_name),
      'info'
    FROM public.profiles pr
    INNER JOIN public.boutique_wholesaler_follows f ON f.boutique_id = pr.id AND f.wholesaler_id = v_wholesaler
    WHERE pr.role = 'butik'
      AND pr.is_approved = true
      AND COALESCE(pr.notify_new_products, true) = true;
  ELSE
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT
      pr.id,
      'Yeni ürün vitrinde',
      format('Kataloga yeni ürün eklendi: %s. Katalogdan inceleyebilirsiniz.', v_name),
      'info'
    FROM public.profiles pr
    WHERE pr.role = 'butik'
      AND pr.is_approved = true
      AND COALESCE(pr.notify_new_products, true) = true;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_boutiques_new_catalog_product(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_boutiques_new_catalog_product(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_boutiques_new_catalog_product(uuid) TO service_role;
