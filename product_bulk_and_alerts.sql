-- Toptancı: CSV ile toplu ürün + düşük stok eşiği
-- Supabase SQL Editor'da bir kez çalıştırın.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;

COMMENT ON COLUMN public.products.low_stock_threshold IS 'Toplam stok bu değerin altına düşünce uyarı (varsayılan 5).';
