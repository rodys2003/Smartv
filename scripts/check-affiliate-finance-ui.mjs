import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { portalHarness } from './check-affiliate-ux.mjs';
function load(path, dependencies = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } });
  const exports = {};
  runInNewContext(outputText, { exports, React, require: name => name === 'react' ? React : dependencies[name] || {}, console });
  return exports;
}
const quote = { commission_ids: ['cop', 'usdt'], cop_amount: 30000, usdt_amount: 2, cop_per_usdt: 5000, gross_usdt: 8, fee_usdt: 2, net_usdt: 6, eligible: true, binance_uid: '123456', rate_version: 4 };
test('quote shows canonical amounts, fixed fee, frozen rate and Binance destination before confirmation', () => {
  const { WithdrawalQuoteCard } = load('src/features/affiliates/components/WithdrawalQuoteCard.tsx');
  const html = renderToStaticMarkup(React.createElement(WithdrawalQuoteCard, { quote }));
  for (const text of ['30.000', '5.000', '8.00', '2.00', '6.00', '123456', 'congelados']) assert.ok(html.includes(text), text);
});
test('finance navigation exposes four mobile-sized controls and selected panel relationship', () => {
  const { AffiliateFinanceTabs } = load('src/features/affiliates/components/AffiliateFinanceTabs.tsx');
  const html = renderToStaticMarkup(React.createElement(AffiliateFinanceTabs, { value: 'withdrawals', onChange() {} }));
  for (const label of ['Resumen', 'Mis ventas', 'Retiros', 'Cuenta de cobro']) assert.ok(html.includes(label));
  assert.match(html, /aria-current="page"/);
  assert.match(html, /min-h-11/);
});
test('portal consumes server quotes without legacy exchange fallback or client monetary submissions', () => {
  const page = readFileSync(new URL('../src/app/afiliados/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /4000|createPayoutRequest|estimatedCopToUsdt/);
  assert.match(page, /requestQuotedWithdrawal\(quote, requestId\)/);
  assert.match(page, /!c\.payout_id/);
  assert.match(page, /getWithdrawalQuote/);
  assert.match(page, /Vuelve a revisar/);
  assert.match(page, /No se pudo guardar/);
});

const affiliate = { id: 'account-a', status: 'active', referral_code: 'TEST', binance_uid: '123456' };
function findButton(app, label) {
  const result = app.elements().find(node => node.props?.children === label);
  assert.ok(result, label);
  return result;
}
async function selectTab(app, value) {
  app.elements().find(node => node.props?.value && node.props?.onChange && typeof node.type !== 'string').props.onChange(value);
  await app.render();
}
test('withdrawal only sends displayed server quote and blocks simultaneous duplicate clicks', async () => {
  const sent = [];
  let finish;
  const app = portalHarness({ affiliate, finance: {
    getWithdrawalQuote: async () => quote,
    requestQuotedWithdrawal: async (...args) => { sent.push(args); await new Promise(resolve => { finish = resolve; }); },
  } });
  await app.render(); await selectTab(app, 'withdrawals');
  await findButton(app, 'Consultar desglose de retiro').props.onClick(); await app.render();
  assert.equal(app.elements().find(node => node.props?.quote)?.props.quote, quote);
  findButton(app, 'Revisar y confirmar retiro').props.onClick(); await app.render();
  const confirm = findButton(app, 'Confirmar retiro');
  const first = confirm.props.onClick();
  await confirm.props.onClick();
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0], quote);
  assert.equal(sent[0][1], 'request-uuid');
  finish(); await first; await app.render();
});
test('stale or uncertain requests discard quote and require explicit new review, never automatic resubmission', async () => {
  let requests = 0;
  const app = portalHarness({ affiliate, finance: {
    getWithdrawalQuote: async () => quote,
    requestQuotedWithdrawal: async () => { requests++; throw new Error('Tasa actualizada'); },
  } });
  await app.render(); await selectTab(app, 'withdrawals');
  await findButton(app, 'Consultar desglose de retiro').props.onClick(); await app.render();
  findButton(app, 'Revisar y confirmar retiro').props.onClick(); await app.render();
  await findButton(app, 'Confirmar retiro').props.onClick(); await app.render();
  assert.equal(requests, 1);
  assert.ok(!app.elements().some(node => node.props?.quote));
  assert.ok(app.elements().some(node => node.props?.role === 'alert' && String(node.props.children).includes('Vuelve a revisar')));
});
test('false account update is a visible failure and never a success', async () => {
  const app = portalHarness({ affiliate, updateAffiliateBinanceUid: async () => false });
  await app.render(); await selectTab(app, 'account');
  findButton(app, 'Editar Binance UID').props.onClick(); await app.render();
  await app.form().props.onSubmit({ preventDefault() {} }); await app.render();
  assert.ok(app.elements().some(node => node.props?.role === 'alert' && String(node.props.children).includes('No se pudo guardar')));
  assert.ok(!app.elements().some(node => node.props?.role === 'status'));
});
test('public conditions start seven days at paid sale and explain fixed fee and frozen conversion', () => {
  const source = readFileSync(new URL('../src/app/programa-afiliados/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Tras el pago confirmado y la finalización/);
  assert.match(source, /7 días después de que el administrador confirme el pago/);
  assert.match(source, /para cualquier monto/);
  assert.match(source, /No es una tarifa de red/);
  assert.match(source, /quedan congelados/);
});

test('missing conversion rate never fabricates a COP quote or an approximate net', () => {
  const { WithdrawalQuoteCard } = load('src/features/affiliates/components/WithdrawalQuoteCard.tsx');
  const html = renderToStaticMarkup(React.createElement(WithdrawalQuoteCard, { quote: { ...quote, cop_amount: 0, cop_per_usdt: null, gross_usdt: 2, net_usdt: 0, eligible: false } }));
  assert.match(html, /Sin tasa configurada; COP no incluidos/);
  assert.match(html, /0.00 USDT/);
  assert.doesNotMatch(html, /4.000|aproximad/);
});
const textContent = node => {
  if (Array.isArray(node)) return node.map(textContent).join(' ');
  if (!node || typeof node === 'boolean') return '';
  return typeof node === 'object' ? textContent(node.props?.children) : String(node);
};
test('reserved and immature legacy commissions never inflate available balance', async () => {
  const old = new Date(Date.now() - 9 * 86400000).toISOString();
  const now = new Date().toISOString();
  const commission = { status: 'available', currency: 'USDT', commission_amount: 10, ticket_paid_at: old, available_at: old };
  const app = portalHarness({ affiliate, commissions: [
    { ...commission, id: 'free' },
    { ...commission, id: 'reserved', payout_id: 'payout', commission_amount: 40 },
    { ...commission, id: 'legacy-early', ticket_paid_at: now, commission_amount: 90 },
  ] });
  await app.render();
  const balances = app.elements().filter(node => node.type === 'dl').map(textContent).join(' ');
  assert.match(balances, /Disponible en moneda original.*10.00 USDT/);
  assert.match(balances, /En espera de pago o validación.*90.00 USDT/);
  assert.doesNotMatch(balances, /140.00 USDT|50.00 USDT/);
});
test('mature legacy commissions requiring reconciliation are not withdrawable', async () => {
  const old = new Date(Date.now() - 9 * 86400000).toISOString();
  const app = portalHarness({ affiliate, commissions: [{
    id: 'legacy-unverified', status: 'available', currency: 'USDT',
    commission_amount: 90, ticket_paid_at: old, available_at: old,
    requires_reconciliation: true,
  }] });
  await app.render();
  const balances = app.elements().filter(node => node.type === 'dl').map(textContent).join(' ');
  assert.match(balances, /Disponible en moneda original.*0.00 USDT/);
  assert.match(balances, /En espera de pago o validación.*90.00 USDT/);
  await selectTab(app, 'sales');
  assert.match(app.elements().map(textContent).join(' '), /Requiere conciliación/);
});
test('withdrawal history preserves processing and rejected states with immutable details', async () => {
  const base = { created_at: '2026-10-01T12:00:00Z', gross_amount_usdt: 8, withdrawal_fee_usdt: 2, net_amount_usdt: 6, cop_total_original: 30000, cop_to_usdt_rate: 5000, binance_uid: 'original-destination' };
  const app = portalHarness({ affiliate, payouts: [ { ...base, id: 'p1', status: 'processing' }, { ...base, id: 'p2', status: 'rejected', rejected_reason: 'Destino inválido' }, { ...base, id: 'p3', status: 'completed', binance_tx_reference: 'TX123' } ] });
  await app.render(); await selectTab(app, 'withdrawals');
  const content = app.elements().filter(node => node.type === 'article').map(textContent).join(' ');
  for (const expected of ['En proceso de transferencia', 'Rechazado', 'Destino inválido', 'Pagado', 'original-destination', 'TX123', '5.000 COP']) assert.ok(content.includes(expected), expected);
});
