-- Admin panelinde sipariş satırında wholesaler IBAN embed boş dönüyorsa:
-- profiles tablosunda RLS, adminin diğer profilleri okumasını engelliyor olabilir.
-- Mevcut politikalarınızla çakışmıyorsa bir kez deneyin (çift SELECT politikası genelde OR ile birleşir).

DROP POLICY IF EXISTS "admin_can_read_profiles_for_ops" ON public.profiles;

CREATE POLICY "admin_can_read_profiles_for_ops"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
