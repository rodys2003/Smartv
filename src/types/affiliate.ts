export type AffiliateStatus = 'pending' | 'active' | 'suspended';

export type CommissionStatus =
  | 'estimated'   // Ticket creado, pago aún no confirmado por el admin
  | 'validating'  // Pago confirmado por el admin, servicio en curso o recién finalizado
  | 'available'   // Servicio finalizado y cumplido el plazo de garantía (7 días)
  | 'paid'        // Liquidado y transferido al Binance UID del afiliado
  | 'cancelled';  // Ticket cancelado o compra reembolsada

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface Affiliate {
  id: string; // references auth.users(id)
  user_email: string;
  user_name?: string | null;
  referral_code: string; // e.g. "ANA8X2" (alphanumeric uppercase, 4-10 chars)
  status: AffiliateStatus;
  commission_rate: number; // default 0.30 (30%)
  binance_uid?: string | null; // Binance User ID for USDT transfers
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  referral_code: string;
  ticket_id?: string | null;
  ticket_number?: number | null;
  service_name: string;
  currency: 'COP' | 'USDT';
  gross_sale_price: number;
  discount_amount: number;
  net_sale_price: number; // gross_sale_price - discount_amount
  commission_rate: number; // 0.30
  commission_amount: number; // net_sale_price * commission_rate
  status: CommissionStatus;
  ticket_paid_at?: string | null;
  service_completed_at?: string | null;
  available_at?: string | null; // service_completed_at + 7 days
  payout_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  binance_uid: string;
  gross_amount_usdt: number; // Total sum of commissions in USDT
  withdrawal_fee_usdt: number; // Fixed 2.00 USDT fee
  net_amount_usdt: number; // gross_amount_usdt - 2.00
  cop_total_original?: number | null; // If commissions originated in COP
  cop_to_usdt_rate?: number | null; // Documented exchange rate used
  status: PayoutStatus;
  binance_tx_reference?: string | null; // Hash or transaction ID from Binance
  notes?: string | null;
  created_at: string;
  paid_at?: string | null;
}

export interface AffiliateStats {
  referral_code: string;
  status: AffiliateStatus;
  total_referrals: number;
  total_sales_count: number;
  estimated_commission_cop: number;
  estimated_commission_usdt: number;
  validating_commission_cop: number;
  validating_commission_usdt: number;
  available_commission_cop: number;
  available_commission_usdt: number;
  paid_commission_usdt: number;
  total_withdrawn_usdt: number;
  total_fees_paid_usdt: number;
}
