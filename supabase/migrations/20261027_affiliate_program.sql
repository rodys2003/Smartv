-- ==============================================================================
-- PROGRAMA DE AFILIADOS SMARTVPRO - MIGRACIÓN DDL
-- ==============================================================================

-- 1. TABLA: affiliates
-- Almacena los afiliados registrados y validados por el administrador.
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    commission_rate NUMERIC(4, 2) NOT NULL DEFAULT 0.30 CHECK (commission_rate > 0 AND commission_rate <= 1.00),
    binance_uid VARCHAR(50),
    phone TEXT,
    tiktok_account TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Índice para búsquedas rápidas por código de referido (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliates_referral_code_lower ON public.affiliates (LOWER(referral_code));
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON public.affiliates (status);

-- 2. TABLA: affiliate_payouts
-- Registra las liquidaciones de comisiones transferidas por Binance en USDT.
-- Incluye la tarifa fija de retiro de 2.00 USDT.
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
    binance_uid VARCHAR(50) NOT NULL,
    gross_amount_usdt NUMERIC(12, 2) NOT NULL CHECK (gross_amount_usdt > 2.00),
    withdrawal_fee_usdt NUMERIC(6, 2) NOT NULL DEFAULT 2.00 CHECK (withdrawal_fee_usdt = 2.00),
    net_amount_usdt NUMERIC(12, 2) NOT NULL CHECK (net_amount_usdt = gross_amount_usdt - withdrawal_fee_usdt),
    cop_total_original NUMERIC(14, 2) DEFAULT 0,
    cop_to_usdt_rate NUMERIC(10, 4),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    binance_tx_reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payouts_affiliate ON public.affiliate_payouts (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.affiliate_payouts (status);

-- 3. TABLA: affiliate_commissions
-- Ledger contable individual de cada venta referida.
-- Ciclo de vida: estimated -> validating -> available -> paid (o cancelled).
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
    referral_code VARCHAR(20) NOT NULL,
    ticket_id UUID,
    ticket_number INTEGER,
    service_name TEXT NOT NULL,
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('COP', 'USDT')),
    gross_sale_price NUMERIC(14, 2) NOT NULL CHECK (gross_sale_price >= 0),
    discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    net_sale_price NUMERIC(14, 2) NOT NULL CHECK (net_sale_price >= 0),
    commission_rate NUMERIC(4, 2) NOT NULL DEFAULT 0.30 CHECK (commission_rate > 0 AND commission_rate <= 1.00),
    commission_amount NUMERIC(14, 2) NOT NULL CHECK (commission_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'estimated' CHECK (status IN ('estimated', 'validating', 'available', 'paid', 'cancelled')),
    ticket_paid_at TIMESTAMP WITH TIME ZONE,
    service_completed_at TIMESTAMP WITH TIME ZONE,
    available_at TIMESTAMP WITH TIME ZONE,
    payout_id UUID REFERENCES public.affiliate_payouts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON public.affiliate_commissions (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_ticket ON public.affiliate_commissions (ticket_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.affiliate_commissions (status);
CREATE INDEX IF NOT EXISTS idx_commissions_payout ON public.affiliate_commissions (payout_id);

-- 4. SEGURIDAD (Row Level Security - RLS)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Políticas para 'affiliates'
CREATE POLICY "Afiliados pueden ver su propio registro"
    ON public.affiliates FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Afiliados pueden actualizar su binance_uid"
    ON public.affiliates FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Políticas para 'affiliate_commissions'
CREATE POLICY "Afiliados pueden ver sus propias comisiones"
    ON public.affiliates FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Afiliados pueden ver comisiones de su cuenta"
    ON public.affiliate_commissions FOR SELECT
    USING (auth.uid() = affiliate_id);

-- Políticas para 'affiliate_payouts'
CREATE POLICY "Afiliados pueden ver sus propias liquidaciones"
    ON public.affiliate_payouts FOR SELECT
    USING (auth.uid() = affiliate_id);

-- Acceso total para administradores (vía service_role o correos admin)
-- Nota: En Supabase, el service_role bypassea RLS por defecto.
