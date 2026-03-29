-- PROFİL TABLOSU EKSİK KOLONLARI YÜKLEME 
-- (500 Database Error Saving New User - Çözümü)

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- Not: Eğer daha önce eklendiyse sistem bunu geçer (IF NOT EXISTS), yoksa anında çekmeceleri yaratır.
