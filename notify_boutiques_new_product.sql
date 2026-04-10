-- Yeni ürün eklendiğinde onaylı butiklere uygulama içi bildirim (notifications tablosu).
-- Önkoşul: notifications.sql ve profiles tablosu.
-- Supabase SQL Editor'de bir kez çalıştırın.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_new_products boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.notify_new_products IS
  'Butik: vitrine yeni ürün eklendiğinde panel bildirimi alsın (varsayılan açık).';

-- Toptancı yalnızca kendi ürünü için çağırabilir; bildirim satırları SECURITY DEFINER ile eklenir.
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
END;
$$;

REVOKE ALL ON FUNCTION public.notify_boutiques_new_catalog_product(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_boutiques_new_catalog_product(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_boutiques_new_catalog_product(uuid) TO service_role;
