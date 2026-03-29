-- MÜŞTERİ (BUTİK) OTOMATİK ONAY SİSTEMİ DEVREYE ALINIYOR

-- 1. Arka planda yeni kayıtları tutan kancanın mantığını "Eğer Butik ise beklemeden Onayla" şeklinde değiştiriyoruz.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, business_name, full_name, phone_number, is_approved)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'role',
    NEW.raw_user_meta_data ->> 'business_name',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone_number',
    CASE WHEN (NEW.raw_user_meta_data ->> 'role') = 'butik' THEN true ELSE false END
  );
  
  RETURN NEW;
END;
$$;

-- 2. "Şu ana kadar" sisteme giren ama onaysız (kilitli) kalan "Butikleri (Müşterileri)" tek seferde Özgür bırakıyoruz!
UPDATE public.profiles 
SET is_approved = true 
WHERE role = 'butik' AND is_approved = false;

-- (Not: Toptancılar hala sizin panelinizden manuel onay beklemek zorundadır, satıcı güvenliği için!)
