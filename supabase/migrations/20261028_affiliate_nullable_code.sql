-- Permitir que el código de referido sea NULL mientras la solicitud de afiliación esté pendiente de aprobación
ALTER TABLE public.affiliates ALTER COLUMN referral_code DROP NOT NULL;

-- Limpiar códigos de referidos en solicitudes pendientes existentes
UPDATE public.affiliates SET referral_code = NULL WHERE status = 'pending';
