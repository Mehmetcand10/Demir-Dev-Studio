-- Bildirimler için Realtime (NotificationBell postgres_changes)
-- Supabase Dashboard > Database > Publications veya SQL:
-- Tablo zaten yayında ise "already member" benzeri hata alırsanız yok sayın.

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
