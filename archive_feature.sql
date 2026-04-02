-- ADMIN PANELİ GELİŞTİRME YAMASI (ARŞİVLEME ÖZELLİĞİ)
-- Lütfen bu kodu Supabase SQL Editor'de çalıştırın.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Not: Bu sayede kargolanmış siparişleri silmek yerine "Arşiv" sekmesine taşıyabileceksiniz.
-- Kazanç raporlarınızda herhangi bir veri kaybı yaşanmayacaktır.
