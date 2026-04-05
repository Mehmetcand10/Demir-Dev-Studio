-- Sipariş iade/uyuşmazlık kayıt tablosu
CREATE TABLE IF NOT EXISTS public.order_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wholesaler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open → reviewing (incelemede) → resolved | rejected
    admin_note TEXT, -- çözüm / ret gerekçesi; admin panelden girilir, butik+toptancıya bildirimle gider
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

ALTER TABLE public.order_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Butik kendi uyusmazligini gorebilir"
ON public.order_disputes
FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Butik uyusmazlik kaydi acabilir"
ON public.order_disputes
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Toptanci kendine ait uyusmazliklari gorebilir"
ON public.order_disputes
FOR SELECT
USING (auth.uid() = wholesaler_id);

CREATE POLICY "Admin tum uyusmazliklari yonetir"
ON public.order_disputes
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
