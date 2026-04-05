-- Profil alanları: vergi no (kayıt metadata) + toptancı ödeme IBAN (admin hakedişte görüntülenir)
-- Sıra: 1) Bu dosya 2) auth_trigger.sql içindeki handle_new_user (tax_id kolonu INSERT'te kullanılır)
-- Supabase SQL Editor'de bir kez çalıştırın.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS iban text;

COMMENT ON COLUMN public.profiles.tax_id IS 'Kayıt sırasında raw_user_meta_data.tax_id';
COMMENT ON COLUMN public.profiles.iban IS 'Toptancı ödemesi için IBAN; admin panelde gösterilir';

-- Sonra: profiles_rls_policies.sql — kendi profilini SELECT/UPDATE + adminin tüm profilleri SELECT (IBAN embed).
