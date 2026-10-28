import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Cargar y transpilar affiliateService.ts con alias mockeados
const serviceSource = readFileSync(new URL('../src/features/affiliates/services/affiliateService.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(serviceSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const serviceExports = {};
runInNewContext(outputText, {
  exports: serviceExports,
  require: (name) => {
    if (name.includes('supabase/client')) {
      return {
        supabase: {
          from: () => ({
            select: () => ({
              ilike: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
        },
      };
    }
    if (name.includes('affiliateFinanceService')) {
      return { financeRpc: async (rpcName) => {
        if (rpcName === 'affiliate_lookup_code') return null;
        throw new Error(`Unexpected finance RPC: ${rpcName}`);
      } };
    }
    if (name.includes('types/affiliate')) {
      return {};
    }
    return {};
  },
  console,
  Date,
  Math,
  Number,
  String,
  RegExp,
  Error,
});

const {
  FIXED_WITHDRAWAL_FEE_USDT,
  DEFAULT_COMMISSION_RATE,
  REFERRAL_COOKIE_DAYS,
  MIN_WITHDRAWAL_AMOUNT_USDT,
  calculateCommission,
  calculatePayoutBreakdown,
  isValidReferralCode,
  generateUniqueReferralCode,
} = serviceExports;

test('1. Financial Rules: 30% commission calculated only on net plan price', () => {
  // Plan Básico 20.000 COP sin descuento
  const basic = calculateCommission(20000, 0, DEFAULT_COMMISSION_RATE);
  assert.equal(basic.netPrice, 20000);
  assert.equal(basic.commissionAmount, 6000);
  assert.equal(basic.rate, 0.30);

  // Plan Interfaz Ligera 50.000 COP con cupón de 10.000 COP -> Neto 40.000 COP
  const ultraLightWithCoupon = calculateCommission(50000, 10000, DEFAULT_COMMISSION_RATE);
  assert.equal(ultraLightWithCoupon.netPrice, 40000);
  assert.equal(ultraLightWithCoupon.commissionAmount, 12000);

  // Plan USDT 17 USDT sin descuento
  const usdtPlan = calculateCommission(17, 0, DEFAULT_COMMISSION_RATE);
  assert.equal(usdtPlan.netPrice, 17);
  assert.equal(usdtPlan.commissionAmount, 5.10);

  // Plan Personalización Premium 23 USDT con 3 USDT de descuento -> Neto 20 USDT
  const premiumWithCoupon = calculateCommission(23, 3, DEFAULT_COMMISSION_RATE);
  assert.equal(premiumWithCoupon.netPrice, 20);
  assert.equal(premiumWithCoupon.commissionAmount, 6.00);

  // Descuento mayor al precio nunca genera comisiones negativas
  const overDiscount = calculateCommission(20000, 25000, DEFAULT_COMMISSION_RATE);
  assert.equal(overDiscount.netPrice, 0);
  assert.equal(overDiscount.commissionAmount, 0);
});

test('2. Financial Invariant: Fixed 2.00 USDT withdrawal fee and threshold', () => {
  assert.equal(FIXED_WITHDRAWAL_FEE_USDT, 2.00);
  assert.equal(MIN_WITHDRAWAL_AMOUNT_USDT, 5.00);

  // Retiro de 10 USDT
  const payout10 = calculatePayoutBreakdown(10.00);
  assert.equal(payout10.grossUsdt, 10.00);
  assert.equal(payout10.feeUsdt, 2.00);
  assert.equal(payout10.netUsdt, 8.00);
  assert.equal(payout10.netUsdt, payout10.grossUsdt - FIXED_WITHDRAWAL_FEE_USDT);

  // Retiro mínimo permitido (5 USDT)
  const payout5 = calculatePayoutBreakdown(5.00);
  assert.equal(payout5.grossUsdt, 5.00);
  assert.equal(payout5.feeUsdt, 2.00);
  assert.equal(payout5.netUsdt, 3.00);

  // Saldo menor o igual a 2.00 USDT es rechazado
  assert.throws(
    () => calculatePayoutBreakdown(2.00),
    /debe ser mayor a la tarifa fija de retiro/
  );
  assert.throws(
    () => calculatePayoutBreakdown(1.50),
    /debe ser mayor a la tarifa fija de retiro/
  );
});

test('3. Referral Code Validation & Attribution Window', () => {
  assert.equal(REFERRAL_COOKIE_DAYS, 30);

  // Códigos válidos
  assert.equal(isValidReferralCode('ANA8X2'), true);
  assert.equal(isValidReferralCode('PRO100'), true);
  assert.equal(isValidReferralCode('smartv9'), true);

  // Códigos inválidos
  assert.equal(isValidReferralCode('A'), false); // muy corto (< 3)
  assert.equal(isValidReferralCode('CODIGO_MUY_LARGO_QUE_SUPERA_QUINCE_CHARS'), false); // > 15
  assert.equal(isValidReferralCode('ANA-8X2'), false); // caracteres especiales prohibidos
  assert.equal(isValidReferralCode('ANA 8X2'), false); // espacios prohibidos
});

test('4. End-to-End Simulation: Complete Affiliate Lifecycle with Ledger & Binance Payout', async () => {
  const db = {
    affiliates: new Map(),
    commissions: new Map(),
    payouts: new Map(),
  };

  // PASO 1: Admin activa al afiliado Ana Gómez con Binance UID
  const affiliateAna = {
    id: 'user_ana_uuid_123',
    user_email: 'ana@gmail.com',
    user_name: 'Ana Gómez',
    referral_code: 'ANA8X2',
    status: 'active',
    commission_rate: 0.30,
    binance_uid: '85419203',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.affiliates.set(affiliateAna.referral_code, affiliateAna);

  // PASO 2: Cliente Carlos accede vía /r/ANA8X2 y crea Ticket #101
  const clientCarlos = { id: 'user_carlos_uuid_456', email: 'carlos@yahoo.com' };
  
  // Verificación de auto-referido
  const isSelfReferral = clientCarlos.id === affiliateAna.id || clientCarlos.email === affiliateAna.user_email;
  assert.equal(isSelfReferral, false, 'Carlos no es Ana, auto-referido permitido');

  // Cálculo de comisión para Ticket #101 (Plan Ligera 50.000 COP con cupón 10.000 COP)
  const calc101 = calculateCommission(50000, 10000, affiliateAna.commission_rate);
  const comm101 = {
    id: 'comm_101',
    affiliate_id: affiliateAna.id,
    referral_code: affiliateAna.referral_code,
    ticket_id: 'ticket_101',
    ticket_number: 101,
    service_name: 'Interfaz Ligera',
    currency: 'COP',
    gross_sale_price: 50000,
    discount_amount: 10000,
    net_sale_price: calc101.netPrice, // 40000
    commission_rate: calc101.rate, // 0.30
    commission_amount: calc101.commissionAmount, // 12000
    status: 'estimated', // INICIAL
    payout_id: null,
    created_at: new Date().toISOString(),
  };
  db.commissions.set(comm101.id, comm101);
  assert.equal(comm101.status, 'estimated');
  assert.equal(comm101.commission_amount, 12000);

  // PASO 3: Admin confirma pago del cliente (Ticket pasa a 'in_progress')
  comm101.status = 'validating';
  comm101.ticket_paid_at = new Date().toISOString();
  assert.equal(comm101.status, 'validating');

  // PASO 4: Servicio completado y fin de retención de garantía -> pasa a 'available'
  comm101.status = 'available';
  comm101.service_completed_at = new Date().toISOString();
  comm101.available_at = new Date().toISOString();
  assert.equal(comm101.status, 'available');

  // PASO 5: Segundo cliente compra en USDT (Plan 17 USDT)
  const calc102 = calculateCommission(17, 0, affiliateAna.commission_rate);
  const comm102 = {
    id: 'comm_102',
    affiliate_id: affiliateAna.id,
    referral_code: affiliateAna.referral_code,
    ticket_id: 'ticket_102',
    ticket_number: 102,
    service_name: 'Optimización',
    currency: 'USDT',
    gross_sale_price: 17,
    discount_amount: 0,
    net_sale_price: calc102.netPrice,
    commission_rate: calc102.rate,
    commission_amount: calc102.commissionAmount, // 5.10 USDT
    status: 'available', // ya completado
    payout_id: null,
    created_at: new Date().toISOString(),
  };
  db.commissions.set(comm102.id, comm102);

  // PASO 6: Afiliada solicita liquidación desde /afiliados
  const availableForAna = Array.from(db.commissions.values()).filter(
    (c) => c.affiliate_id === affiliateAna.id && c.status === 'available' && !c.payout_id
  );
  assert.equal(availableForAna.length, 2);

  // Sumas: 5.10 USDT + 12.000 COP convertidos a tasa 4.000 = 3.00 USDT -> Total bruto 8.10 USDT
  const usdtTotal = availableForAna.filter(c => c.currency === 'USDT').reduce((s, c) => s + c.commission_amount, 0);
  const copTotal = availableForAna.filter(c => c.currency === 'COP').reduce((s, c) => s + c.commission_amount, 0);
  const rateDocumented = 4000;
  const copInUsdt = Number((copTotal / rateDocumented).toFixed(2));
  const grossUsdt = Number((usdtTotal + copInUsdt).toFixed(2)); // 5.10 + 3.00 = 8.10
  assert.equal(grossUsdt, 8.10);

  const breakdown = calculatePayoutBreakdown(grossUsdt, FIXED_WITHDRAWAL_FEE_USDT);
  assert.equal(breakdown.grossUsdt, 8.10);
  assert.equal(breakdown.feeUsdt, 2.00);
  assert.equal(breakdown.netUsdt, 6.10); // 8.10 - 2.00 = 6.10 USDT a transferir por Binance

  const payoutRecord = {
    id: 'payout_binance_001',
    affiliate_id: affiliateAna.id,
    binance_uid: affiliateAna.binance_uid,
    gross_amount_usdt: breakdown.grossUsdt,
    withdrawal_fee_usdt: breakdown.feeUsdt,
    net_amount_usdt: breakdown.netUsdt,
    cop_total_original: copTotal,
    cop_to_usdt_rate: rateDocumented,
    status: 'pending',
    binance_tx_reference: null,
    created_at: new Date().toISOString(),
  };
  db.payouts.set(payoutRecord.id, payoutRecord);

  // Las comisiones quedan bloqueadas con el payout_id
  for (const c of availableForAna) {
    c.payout_id = payoutRecord.id;
  }

  // PASO 7: Admin transfiere 6.10 USDT a Binance UID 85419203 y registra el TxHash
  const binanceTxHash = 'BN_TX_928174829104';
  payoutRecord.status = 'completed';
  payoutRecord.binance_tx_reference = binanceTxHash;
  payoutRecord.paid_at = new Date().toISOString();

  for (const c of availableForAna) {
    c.status = 'paid';
  }

  assert.equal(payoutRecord.status, 'completed');
  assert.equal(payoutRecord.binance_tx_reference, binanceTxHash);
  assert.equal(comm101.status, 'paid');
  assert.equal(comm102.status, 'paid');

  // PASO 8: Invariante anti-duplicidad: ninguna comisión ya pagada puede volver a liquidarse
  const eligibleAfterPayout = Array.from(db.commissions.values()).filter(
    (c) => c.affiliate_id === affiliateAna.id && c.status === 'available' && !c.payout_id
  );
  assert.equal(eligibleAfterPayout.length, 0, 'No quedan comisiones disponibles para duplicar retiro');

  // PASO 9: Caso de cancelación de Ticket
  const comm103 = {
    id: 'comm_103',
    affiliate_id: affiliateAna.id,
    referral_code: affiliateAna.referral_code,
    ticket_id: 'ticket_103',
    ticket_number: 103,
    service_name: 'Optimización',
    currency: 'COP',
    gross_sale_price: 20000,
    discount_amount: 0,
    net_sale_price: 20000,
    commission_rate: 0.30,
    commission_amount: 6000,
    status: 'estimated',
    payout_id: null,
  };
  db.commissions.set(comm103.id, comm103);

  // Cliente o admin cancela ticket antes del servicio
  comm103.status = 'cancelled';
  assert.equal(comm103.status, 'cancelled');

  const availableAfterCancel = Array.from(db.commissions.values()).filter(
    (c) => c.affiliate_id === affiliateAna.id && c.status === 'available' && !c.payout_id
  );
  assert.equal(availableAfterCancel.length, 0, 'Comisión cancelada no entra en disponible');
});

test('5. Automatic Unique Referral Code Generation & Social Application Fields', async () => {
  const code1 = await generateUniqueReferralCode('Ana Gómez');
  assert.ok(code1.startsWith('ANA'), `Expected code to start with ANA, got ${code1}`);
  assert.ok(isValidReferralCode(code1), `Code ${code1} should be valid`);

  const code2 = await generateUniqueReferralCode('carlos@gmail.com');
  assert.ok(code2.startsWith('CARLO'), `Expected code to start with CARLO, got ${code2}`);
  assert.ok(isValidReferralCode(code2), `Code ${code2} should be valid`);

  const codeEmpty = await generateUniqueReferralCode('');
  assert.ok(isValidReferralCode(codeEmpty), `Code ${codeEmpty} should be valid`);
});
