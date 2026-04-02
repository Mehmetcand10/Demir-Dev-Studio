-- Bildirimler Tablosu
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sipariş onaylandığında butiğe bildirim gitmesi için bir trigger örneği (Opsiyonel, kod tarafında da yapılabilir)
-- Şimdilik kod tarafında 'insert' yaparak ilerleyeceğiz daha esnek olması için.
