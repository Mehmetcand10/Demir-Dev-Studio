-- 1. Profiles (Üyeler) tablosuna 'Rol (Toptancı veya Butik)' seçeneğini ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'butik';

-- 2. Products (Ürünler) tablosuna, ürünü hangi toptancının yüklediğini gösterecek 'wholesaler_id' kimliğini ekle
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS wholesaler_id uuid REFERENCES public.profiles(id);

-- 3. Telefondan / Bilgisayardan resim yükleyebilmeniz için 'product-images' isimli fiziksel Depoyu (Kova) oluştur
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- 4. Sisteme giriş yapmış toptancıların o depoya fotoğraf yükleyebilmesine SQL izni ver (RLS Policies)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
