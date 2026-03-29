-- FAZ 10 VERİTABANI YAMASI
-- Lütfen bu kodu komple kopyalayıp Supabase SQL Editor'de "RUN" diyerek çalıştırın.

ALTER TABLE public.products
ADD COLUMN gender VARCHAR(50) DEFAULT 'unisex',
ADD COLUMN sizes VARCHAR(255) DEFAULT 'Standart Seri';

-- Not: Bu işlem ürünler tablonuza "Cinsiyet" ve "Beden Asortisi" kapasitesini ekleyip kilidini kıracaktır.
