-- 1. FAVORİLER TABLOSU
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- RLS Ayarları (Row Level Security)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi favorilerini görebilir" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar favori ekleyebilir" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar favori silebilir" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 2. DUYURU (ANNOUNCEMENTS) TABLOSU
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_role TEXT DEFAULT 'all', -- 'all', 'butik', 'toptanci'
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ -- Duyurunun ne zaman kalkacağını belirlemek için (opsiyonel)
);

-- RLS Ayarları (Row Level Security)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes duyuruları okuyabilir" ON public.announcements
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sadece Admin duyuru ekleyebilir" ON public.announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Sadece Admin duyuru silebilir ve güncelleyebilir" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
