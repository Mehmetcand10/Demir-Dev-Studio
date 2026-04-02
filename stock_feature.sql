-- Products tablosuna JSONB formatında bedenli stok kolonu ekleme
ALTER TABLE products ADD COLUMN IF NOT EXISTS stocks JSONB DEFAULT '{}'::jsonb;

-- Örnek ürünler için mevcut 'sizes' stringini parçalayarak varsayılan stok atama (Opsiyonel)
-- Not: Bu işlem manuel veya kod tarafında daha sağlıklı yapılabilir. 
-- Şimdilik boş olanlara varsayılan bir yapı kuruyoruz.
UPDATE products SET stocks = '{"Standart": 100}'::jsonb WHERE stocks = '{}'::jsonb;

-- Siparişlerin hangi bedenden verildiğini takip etmek için orders tablosuna size kolonu eklenmiş mi kontrolü (zaten var olabilir, emin olalım)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS selected_size TEXT;
