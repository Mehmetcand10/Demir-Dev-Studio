-- =============================================================================
-- DEMO / TEST VERİSİNİ SIFIRLAMA (Supabase SQL Editor — dikkatli kullanın)
-- =============================================================================
-- Bu betik: siparişler, uyuşmazlıklar, favoriler, ürünler, bildirimler, duyuruları
-- temizler. KULLANICI HESAPLARI (auth.users / profiles) SİLİNMEZ.
--
-- Önce yedek alın. Üretimde yanlışlıkla çalıştırmayın.
-- =============================================================================

-- 1) Siparişler (order_disputes siparişe bağlı; önce sipariş silinirse CASCADE ile gider —
--    çoğu kurulumda uyuşmazlıkları ayrı silmek daha güvenli)
DELETE FROM public.order_disputes;

-- 2) Siparişler (kargo takip, tutarlar, “kasa” mantığı burada)
DELETE FROM public.orders;

-- 3) Favoriler (ürüne bağlı)
DELETE FROM public.favorites;

-- 4) Ürünler
DELETE FROM public.products;

-- 5) Bildirimler (panel zili)
DELETE FROM public.notifications;

-- 6) Duyurular (isteğe bağlı — yorum satırını kaldırarak çalıştırın)
-- DELETE FROM public.announcements;

-- 7) Toptancı profilinde sadece demo alanlarını sıfırlamak isterseniz (isteğe bağlı):
-- UPDATE public.profiles SET min_order_floor_units = NULL WHERE role = 'toptanci';

-- =============================================================================
-- ÜRÜN GÖRSELLERİ (Storage)
-- SQL tablolarını sildiğinizde bucket’taki dosyalar kalır.
-- Supabase Dashboard → Storage → product-images → klasörleri seçip silin
-- veya SQL ile storage API kullanın.
-- =============================================================================
