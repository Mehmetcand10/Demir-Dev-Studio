-- KULLANICI SİLME HATASI (FOREIGN KEY) CASCADE ÇÖZÜM DOSYASI

-- 1. "Eğer bir toptancı silinirse, onun sisteme yüklediği tüm ürünleri de yetim bırakma; sil." kuralı ekleniyor.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_wholesaler_id_fkey;

ALTER TABLE public.products 
    ADD CONSTRAINT products_wholesaler_id_fkey 
    FOREIGN KEY (wholesaler_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. "Eğer Supabase Auth'tan (Yönetim Paneli Baştan) biri silinirse, onun Profil (İsim Soyisim) bilgilerini de otomatik olarak çöpe at." kuralı ekleniyor.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;
