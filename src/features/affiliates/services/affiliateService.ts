import { financeRpc } from './affiliateFinanceService';
import { supabase } from '@/lib/supabase/client';
import {
  Affiliate,
  AffiliateCommission,
  AffiliatePayout,
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

/** Normalize legacy optional profile fields without mutating the ledger. */
function hydrateAffiliateExtraFields(aff: Affiliate | null): Affiliate | null {
  if (!aff) return null;
  try {
    const notes = JSON.parse(aff.notes || '{}');
    return { ...aff, phone: aff.phone || notes.phone, tiktok_account: aff.tiktok_account || notes.tiktok };
  } catch { return aff; }
}

async function readRows<T>(table: string, key?: string, value?: string): Promise<T[]> {
  let query = supabase.from(table).select('*');
  if (key && value) query = query.eq(key, value);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as T[];
}

export async function getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
  const { data, error } = await supabase.from('affiliates').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return hydrateAffiliateExtraFields(data as Affiliate | null);
}

/** Public lookup returns only referral identity, never payout/contact details. */
export async function getAffiliateByCode(code: string): Promise<Affiliate | null> {
  return financeRpc<Affiliate | null>('affiliate_lookup_code', { p_code: code.trim().toUpperCase() });
}

export async function generateUniqueReferralCode(seedNameOrEmail?: string): Promise<string> {
  let prefix = (seedNameOrEmail || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
  if (prefix.length < 3) prefix = 'SMART';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 25; attempt++) {
    let suffix = '';
    for (let i = 0; i < 4; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    const candidate = prefix + suffix;
    if (!await getAffiliateByCode(candidate)) return candidate;
  }
  throw new Error('No se pudo generar un código único. Intenta de nuevo.');
}

export async function registerAffiliateRequest(params: {
  userId: string; email: string; name?: string; phone: string; tiktokAccount: string;
}): Promise<Affiliate> {
  return financeRpc<Affiliate>('affiliate_register', {
    p_name: params.name?.trim() || null, p_phone: params.phone.trim(), p_tiktok: params.tiktokAccount.trim(),
  });
}

export async function recordEstimatedCommission(params: {
  referralCode: string; ticketId?: string; ticketNumber?: number; serviceName: string;
  currency: 'COP' | 'USDT'; grossSalePrice: number; discountAmount?: number;
}): Promise<AffiliateCommission | null> {
  if (!params.ticketId) throw new Error('Se requiere el ticket original.');
  return financeRpc<AffiliateCommission | null>('affiliate_capture_ticket', { p_ticket_id: params.ticketId });
}

/** Legacy callers cannot bypass quote confirmation or supply their own monetary values. */
export async function createPayoutRequest(params: {
  affiliateId: string; binanceUid: string; grossAmountUsdt: number; copTotalOriginal?: number;
  copToUsdtRate?: number; commissionIdsToInclude: string[]; notes?: string;
}): Promise<AffiliatePayout> {
  void params;
  throw new Error('Actualiza el panel y confirma una cotización antes de solicitar el retiro.');
}

export async function getAllAffiliates(): Promise<Affiliate[]> {
  return (await readRows<Affiliate>('affiliates')).map(a => hydrateAffiliateExtraFields(a)!);
}

export async function updateAffiliateStatus(affiliateId: string, status: AffiliateStatus): Promise<{ success: boolean; referralCode?: string | null }> {
  const result = await financeRpc<Affiliate>('affiliate_admin_update', { p_id: affiliateId, p_status: status });
  return { success: true, referralCode: result.referral_code };
}

export async function createOrActivateAffiliateAdmin(params: {
  userId?: string; email: string; name?: string; referralCode: string; binanceUid?: string;
  commissionRate?: number; status?: AffiliateStatus;
}): Promise<Affiliate> {
  return financeRpc<Affiliate>('affiliate_admin_upsert', {
    p_email: params.email.trim().toLowerCase(), p_name: params.name || null,
    p_code: params.referralCode.trim().toUpperCase(), p_binance_uid: params.binanceUid || null,
    p_status: params.status || 'active',
  });
}

export const getAllCommissions = () => financeRpc<AffiliateCommission[]>('affiliate_get_commissions');
export const getAllPayouts = () => readRows<AffiliatePayout>('affiliate_payouts');
export const getMyCommissions = (id: string) => financeRpc<AffiliateCommission[]>('affiliate_get_commissions', { p_affiliate_id: id });
export const getMyPayouts = (id: string) => readRows<AffiliatePayout>('affiliate_payouts', 'affiliate_id', id);

export async function markCommissionPaymentConfirmed(ticketNumber: number): Promise<void> {
  await financeRpc('affiliate_ticket_number_action', { p_ticket_number: ticketNumber, p_action: 'payment' });
}
export async function markCommissionServiceCompleted(ticketNumber: number, retentionDays = 7): Promise<void> {
  if (retentionDays !== 7) throw new Error('La validación mínima es de 7 días desde el pago.');
  await financeRpc('affiliate_ticket_number_action', { p_ticket_number: ticketNumber, p_action: 'completed' });
}
export async function releaseCommissionImmediately(commissionId: string): Promise<boolean> {
  void commissionId;
  throw new Error('No se permite adelantar la validación de 7 días.');
}
export async function markCommissionCancelled(ticketNumber: number): Promise<void> {
  await financeRpc('affiliate_ticket_number_action', { p_ticket_number: ticketNumber, p_action: 'cancelled' });
}
export async function completePayoutAdmin(params: {
  payoutId: string; binanceTxReference: string; copToUsdtRate?: number; notes?: string;
}): Promise<boolean> {
  await financeRpc('affiliate_transition_payout', {
    p_payout_id: params.payoutId, p_action: 'completed', p_reference: params.binanceTxReference.trim(), p_reason: params.notes || null,
  });
  return true;
}
export async function rejectPayoutAdmin(payoutId: string, reason?: string): Promise<boolean> {
  await financeRpc('affiliate_transition_payout', { p_payout_id: payoutId, p_action: 'rejected', p_reason: reason || null });
  return true;
}
export async function prepareAdminBatchPayout(params: {
  affiliateId: string; binanceUid: string; copToUsdtRate: number; binanceTxReference: string; notes?: string;
}): Promise<AffiliatePayout> {
  void params;
  throw new Error('El afiliado debe confirmar la cotización y solicitar el retiro antes del pago.');
}
export async function getAffiliateProfile(userId: string, email?: string): Promise<Affiliate | null> {
  void email;
  return getAffiliateByUserId(userId);
}
export async function updateAffiliateBinanceUid(affiliateId: string, binanceUid: string): Promise<boolean> {
  await financeRpc('affiliate_update_destination', { p_id: affiliateId, p_uid: binanceUid.trim() });
  return true;
}
