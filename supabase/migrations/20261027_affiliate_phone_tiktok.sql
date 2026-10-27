-- Migración para añadir teléfono y cuenta de TikTok a la tabla affiliates
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS tiktok_account TEXT;
