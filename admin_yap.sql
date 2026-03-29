-- KENDİNİZİ ADMİN (MERKEZ KONTROLCÜ) YAPMA KODU

-- Lütfen 'sizin_emailiniz@gmail.com' yazan yeri (Tırnak işaretlerini silmeden) kendi kayıt olduğunuz E-Posta ile değiştirin ve Supabase SQL menüsünden RUN ile çalıştırın.

UPDATE public.profiles
SET role = 'admin', is_approved = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'sizin_emailiniz@gmail.com');
