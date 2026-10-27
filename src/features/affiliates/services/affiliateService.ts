import { supabase } from '@/lib/supabase/client';
import {
  Affiliate,
  AffiliateCommission,
  AffiliatePayout,
  AffiliateStats,
  AffiliateStatus,
} from '@/types/affiliate';

export const FIXED_WITHDRAWAL_FEE_USDT = 2.00;
export const DEFAULT_COMMISSION_RATE = 0.30;
export const REFERRAL_COOKIE_DAYS = 30;
export const MIN_WITHDRAWAL_AMOUNT_USDT = 5.00; // Mínimo para que el neto sea positivo y tenga sentido financiero

/**
 * Calcula la comisión del 30% sobre el importe neto del plan (después de descuentos).
 */
export function calculateCommission(
  grossPrice: number,
  discountAmount = 0,
  rate = DEFAULT_COMMISSION_RATE
) {
  const netPrice = Math.max(0, grossPrice - discountAmount);
  const commissionAmount = Number((netPrice * rate).toFixed(2));
  return {
    netPrice,
    commissionAmount,
    rate,
  };
}

/**
 * Calcula el desglose de liquidación aplicando la tarifa fija de 2 USDT.
 */
export function calculatePayoutBreakdown(grossUsdt: number, fee = FIXED_WITHDRAWAL_FEE_USDT) {
  if (grossUsdt <= fee) {
    throw new Error(
      `El saldo a liquidar (${grossUsdt.toFixed(2)} USDT) debe ser mayor a la tarifa fija de retiro (${fee.toFixed(2)} USDT).`
    );
  }
  const netUsdt = Number((grossUsdt - fee).toFixed(2));
  return {
    grossUsdt: Number(grossUsdt.toFixed(2)),
    feeUsdt: fee,
    netUsdt,
  };
}

/**
 * Valida el formato de un código de referido.
 */
export function isValidReferralCode(code: string): boolean {
  return /^[A-Z0-9]{3,15}$/.test(code.trim().toUpperCase());
}

/**
 * Persistencia del código de referido en el cliente (atribución a 30 días, último clic).
 */
export function storeReferralCode(code: string): void {
  if (typeof window === 'undefined') return;
  const cleanCode = code.trim().toUpperCase();
  if (!isValidReferralCode(cleanCode)) return;

  const data = {
    code: cleanCode,
    expiresAt: Date.now() + REFERRAL_COOKIE_DAYS * 24 * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem('smartv_referral', JSON.stringify(data));
  } catch (err) {
    console.error('Error saving referral to localStorage:', err);
  }
}

/**
 * Recupera el código de referido activo si no ha expirado.
 */
export function getActiveReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('smartv_referral');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.code || !parsed?.expiresAt) return null;

    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem('smartv_referral');
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

/**
 * Obtiene el perfil de un afiliado por su User ID de Supabase.
 */
export async function getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Could not query affiliates table (may not exist yet):', error.message);
    return null;
  }
  return data as Affiliate | null;
}

/**
 * Busca un afiliado por su código de referido.
 */
export async function getAffiliateByCode(code: string): Promise<Affiliate | null> {
  const cleanCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .ilike('referral_code', cleanCode)
    .maybeSingle();

  if (error) {
    console.warn('Could not find affiliate by code:', error.message);
    return null;
  }
  return data as Affiliate | null;
}

/**
 * Registra una solicitud para convertirse en afiliado.
 */
export async function registerAffiliateRequest(params: {
  userId: string;
  email: string;
  name?: string;
  requestedCode: string;
  binanceUid?: string;
}): Promise<Affiliate> {
  const cleanCode = params.requestedCode.trim().toUpperCase();
  if (!isValidReferralCode(cleanCode)) {
    throw new Error('El código de referido debe tener entre 3 y 15 caracteres alfanuméricos en mayúsculas.');
  }

  const existing = await getAffiliateByCode(cleanCode);
  if (existing) {
    throw new Error(`El código "${cleanCode}" ya está en uso. Por favor elige otro.`);
  }

  const payload = {
    id: params.userId,
    user_email: params.email,
    user_name: params.name || null,
    referral_code: cleanCode,
    status: 'pending' as AffiliateStatus,
    commission_rate: DEFAULT_COMMISSION_RATE,
    binance_uid: params.binanceUid?.trim() || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('affiliates')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as Affiliate;
}

/**
 * Registra una comisión en estado 'estimated' cuando un cliente crea un ticket con un código de referido.
 */
export async function recordEstimatedCommission(params: {
  referralCode: string;
  ticketId?: string;
  ticketNumber?: number;
  serviceName: string;
  currency: 'COP' | 'USDT';
  grossSalePrice: number;
  discountAmount?: number;
}): Promise<AffiliateCommission | null> {
  const affiliate = await getAffiliateByCode(params.referralCode);
  if (!affiliate || affiliate.status !== 'active') {
    return null; // Solo afiliados activos acumulan comisiones
  }

  const { netPrice, commissionAmount, rate } = calculateCommission(
    params.grossSalePrice,
    params.discountAmount || 0,
    affiliate.commission_rate || DEFAULT_COMMISSION_RATE
  );

  const payload = {
    affiliate_id: affiliate.id,
    referral_code: affiliate.referral_code,
    ticket_id: params.ticketId || null,
    ticket_number: params.ticketNumber || null,
    service_name: params.serviceName,
    currency: params.currency,
    gross_sale_price: params.grossSalePrice,
    discount_amount: params.discountAmount || 0,
    net_sale_price: netPrice,
    commission_rate: rate,
    commission_amount: commissionAmount,
    status: 'estimated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('affiliate_commissions')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Failed to record affiliate commission:', error);
    return null;
  }
  return data as AffiliateCommission;
}

/**
 * Genera una solicitud de liquidación aplicando la tarifa fija de 2 USDT.
 */
export async function createPayoutRequest(params: {
  affiliateId: string;
  binanceUid: string;
  grossAmountUsdt: number;
  copTotalOriginal?: number;
  copToUsdtRate?: number;
  commissionIdsToInclude: string[];
  notes?: string;
}): Promise<AffiliatePayout> {
  const breakdown = calculatePayoutBreakdown(params.grossAmountUsdt, FIXED_WITHDRAWAL_FEE_USDT);

  const payoutPayload = {
    affiliate_id: params.affiliateId,
    binance_uid: params.binanceUid.trim(),
    gross_amount_usdt: breakdown.grossUsdt,
    withdrawal_fee_usdt: breakdown.feeUsdt,
    net_amount_usdt: breakdown.netUsdt,
    cop_total_original: params.copTotalOriginal || 0,
    cop_to_usdt_rate: params.copToUsdtRate || null,
    status: 'pending',
    notes: params.notes || null,
    created_at: new Date().toISOString(),
  };

  const { data: payout, error: payoutError } = await supabase
    .from('affiliate_payouts')
    .insert([payoutPayload])
    .select()
    .single();

  if (payoutError) throw payoutError;

  // Asociar comisiones al ID de la liquidación y moverlas a 'processing'
  if (params.commissionIdsToInclude.length > 0) {
    await supabase
      .from('affiliate_commissions')
      .update({
        payout_id: payout.id,
        updated_at: new Date().toISOString(),
      })
      .in('id', params.commissionIdsToInclude);
  }

  return payout as AffiliatePayout;
}
