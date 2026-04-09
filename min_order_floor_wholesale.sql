-- Toptancı: tek siparişte minimum toplam adet (ör. 500 adetin altına satmıyorum)
-- Supabase SQL Editor'de bir kez çalıştırın.
-- Önkoşul: public.profiles tablosu mevcut.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS min_order_floor_units integer,
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.min_order_floor_units IS
  'Toptancı: tek siparişte minimum toplam adet; null ise yalnızca ürün MOQ geçerlidir.';

-- Butikler RLS nedeniyle başka toptancı satırını doğrudan okuyamaz; vitrin + sipariş kontrolü için:
CREATE OR REPLACE FUNCTION public.get_wholesaler_public_profile(p_wholesaler_id uuid)
RETURNS TABLE (
  id uuid,
  business_name text,
  full_name text,
  is_approved boolean,
  min_order_floor_units integer,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.id, p.business_name, p.full_name, p.is_approved, p.min_order_floor_units, p.avatar_url
  FROM public.profiles p
  WHERE p.id = p_wholesaler_id
    AND p.role = 'toptanci';
$$;

REVOKE ALL ON FUNCTION public.get_wholesaler_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_wholesaler_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_wholesaler_public_profile(uuid) TO service_role;
