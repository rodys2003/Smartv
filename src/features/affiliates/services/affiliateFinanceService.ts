import { supabase } from '@/lib/supabase/client';
import type { AffiliatePayout } from '@/types/affiliate';

export interface FinanceRate {
  cop_per_usdt: number | null;
  version: number;
  updated_at: string | null;
}

export interface WithdrawalQuote {
  affiliate_id: string;
  commission_ids: string[];
  cop_amount: number;
  usdt_amount: number;
  cop_per_usdt: number | null;
  rate_version: number;
  gross_usdt: number;
  fee_usdt: number;
  net_usdt: number;
  eligible: boolean;
  binance_uid: string;
  quoted_at: string;
}

export interface FinanceAudit {
  id: string;
  actor_id: string | null;
  action: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

/** No monetary value is trusted until the database revalidates the entire quote. */
export async function financeRpc<T>(name: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw new Error(error.message || 'No se pudo completar la operación financiera.');
  return data as T;
}

export const getFinanceRate = () => financeRpc<FinanceRate>('affiliate_get_rate');
export async function setFinanceRate(rate: number, reason?: string): Promise<FinanceRate> {
  if (!Number.isFinite(rate) || rate <= 0 || rate >= 1_000_000_000) {
    throw new Error('La tasa debe ser positiva y finita.');
  }
  return financeRpc<FinanceRate>('affiliate_set_rate', { p_rate: rate, p_reason: reason || null });
}
export const getWithdrawalQuote = (affiliateId?: string) =>
  financeRpc<WithdrawalQuote>('affiliate_quote', { p_affiliate_id: affiliateId || null });
export const requestQuotedWithdrawal = (quote: WithdrawalQuote, requestId: string) =>
  financeRpc<AffiliatePayout>('affiliate_request_withdrawal', { p_quote: quote, p_request_id: requestId });
export const markPayoutProcessing = (payoutId: string) =>
  financeRpc<void>('affiliate_transition_payout', { p_payout_id: payoutId, p_action: 'processing' });
export const getFinanceAudit = () => financeRpc<FinanceAudit[]>('affiliate_get_audit');
export const setTicketPaymentStatus = (ticketId: string, paid: boolean) =>
  financeRpc<void>('affiliate_set_ticket_payment', { p_ticket_id: ticketId, p_paid: paid });
export const setTicketServiceStatus = (ticketId: string, status: 'waiting' | 'in_progress' | 'completed' | 'cancelled') =>
  financeRpc<void>('affiliate_set_ticket_service', { p_ticket_id: ticketId, p_status: status });
