-- FAZ 5: E-Posta Güvenlik Onayı Profil Tetikleyicisi (Trigger)
-- Gereksinim: public.profiles.tax_id kolonu (profile_extensions.sql ile ekleyin).

-- 1. Önce varsa eski triggerları temizleyelim ki çakışma olmasın
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Yeni Kayıt (Sign-up) olduğunda arka planda Profil Oluşturma Motoru 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Yeni üyenin rolleri ve şirket adı gibi bilgileri (metadata) alınıp Profiles tablomuza çakılıyor.
  INSERT INTO public.profiles (id, role, business_name, full_name, phone_number, tax_id, is_approved)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'role',
    NEW.raw_user_meta_data ->> 'business_name',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone_number',
    NEW.raw_user_meta_data ->> 'tax_id',
    false -- Herkes Onaysız doğar, Demir Dev Yönetimi açar!
  );
  
  RETURN NEW;
END;
$$;

-- 3. Tetikleyici Silajı (Authentication'da yeni bir ID açıldığında Fırlat!)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SONUÇ: Artık Müşteri "Kayıt Ol"a basıp Mail onayı beklerken bile
-- Profil tablosunda "İsmi, Numarası, Rolü" otomatik olarak yerini alacak!
