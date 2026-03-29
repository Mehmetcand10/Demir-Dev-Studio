-- FAZ 4: DROP-SHIPPING / B2B SİPARİŞ VE FİNANS KURULUM KODU

-- EĞER ÖNCEDEN KALMA VEYA KISMEN OLUŞMUŞ BİR TABLO VARSA SİSTEMİ SIFIRLA:
DROP TABLE IF EXISTS public.orders CASCADE;

-- 1. Orders (Siparişler Tablosu)
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    wholesaler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    quantity NUMERIC NOT NULL,              -- Kaç adet (Toplam Toplu Alım) sipariş edildi?
    total_price NUMERIC NOT NULL,           -- Butiğin ödeyeceği toplam Ana Tutar
    commission_earned NUMERIC NOT NULL,     -- Adet başı Kârınız (Demir Dev Studio Komisyonu Toplamı)
    wholesaler_earning NUMERIC NOT NULL,    -- Toptancıya ürün kargolandıktan sonra ödenecek Net Para
    
    shipping_address TEXT NOT NULL,         -- Müşterinin gireceği "İl - İlçe - Açık Adres"
    buyer_phone TEXT,                       -- Butiğin kayıtlı İletişim Numarası (Lojistik İçin)
    buyer_name TEXT,                        -- Butiğin İsmi
    product_name TEXT,                      -- Sipariş Anındaki Ürün Adı Logu
    
    status TEXT DEFAULT 'waiting_payment',  -- waiting_payment (Dekont Bekleniyor), approved (Toptancıya Düştü), shipped (Kargolandı)
    tracking_number TEXT,                   -- Toptancının gireceği Yurtiçi / Aras vb. Kargo Takip Numarası
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Tablo Güvenlik Zırhı)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Güvenlik ve Görüntüleme Politiakları (Rules)
CREATE POLICY "Butikler (Alıcı) Kendi Siparişini Basabilir" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admin Demir Dev Her Şeyi Görür ve Onaylar" 
ON public.orders FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Butikler Sadece Kendi Verdiği Siparişleri Görür" 
ON public.orders FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Toptancılar Sadece Kendisine Gelen (Onaylanmış) Siparişleri Görür" 
ON public.orders FOR SELECT 
USING (auth.uid() = wholesaler_id AND status != 'waiting_payment'); -- Toptancı parası ödenmemiş siparişi hiç göremez.

CREATE POLICY "Toptancılar Sadece Kendi Siparişine Kargo Kodu Girebilir" 
ON public.orders FOR UPDATE 
USING (auth.uid() = wholesaler_id);
