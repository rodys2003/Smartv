import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const adminTicket = { id: 'ticket-1', ticket_number: 1, tv_brand: 'TCL', tv_model: 'P1', service_name: 'Optimización', service_tier: 'basic_20k', total_price: 20000, status: 'waiting', notes: '', created_at: '2026-10-01', user_name: 'Cliente' };
const payout = (status = 'pending', id = status) => ({ id, affiliate_id: 'affiliate-a', binance_uid: '987654321', gross_amount_usdt: 10, withdrawal_fee_usdt: 2, net_amount_usdt: 8, cop_total_original: 40000, cop_to_usdt_rate: 4000, status, created_at: '2026-10-01T12:00:00Z', binance_tx_reference: status === 'completed' ? 'tx-existing' : null, rejected_reason: status === 'rejected' ? 'Destino no confirmado' : null });
function harness(file, props, services = {}) {
  const hooks = [], effects = [], calls = [], clipboard = [];
  let index = 0, tree;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const mockReact = { ...React,
    useState(initial) { const i = index++; if (!(i in hooks)) hooks[i] = typeof initial === 'function' ? initial() : initial; return [hooks[i], value => { hooks[i] = typeof value === 'function' ? value(hooks[i]) : value; }]; },
    useCallback(fn, deps) { const i = index++; if (!same(hooks[i]?.deps, deps)) hooks[i] = { deps, fn }; return hooks[i].fn; },
    useEffect(fn, deps) { const i = index++; if (!same(hooks[i], deps)) { hooks[i] = deps; effects.push(fn); } },
  };
  const api = { getAllAffiliates: async () => [], getAllPayouts: async () => [], getAllCommissions: async () => [], setTicketPaymentStatus: async (...args) => { calls.push(['payment', ...args]); }, setTicketServiceStatus: async (...args) => { calls.push(['service', ...args]); }, getFinanceRate: async () => ({ cop_per_usdt: 4000, version: 1, updated_at: '2026-10-01' }), setFinanceRate: async rate => ({ cop_per_usdt: rate, version: 2, updated_at: '2026-10-02' }), getFinanceAudit: async () => [], markPayoutProcessing: async id => { calls.push(['processing', id]); }, completePayoutAdmin: async value => { calls.push(['complete', value]); return true; }, rejectPayoutAdmin: async (...value) => { calls.push(['reject', ...value]); return true; }, ...services };
  const require = name => {
    if (name === 'react') return mockReact;
    if (name === '@/features/auth/hooks/useAuth') return { useAuth: () => ({ user: services.authUser || { email: 'admin@example.test' }, isAuthenticated: true, loading: false }) };
    if (name === '@/lib/whatsapp/generateLink') return { generateWhatsAppLink: () => '#' };
    if (name === '@/lib/admin') return { isUserAdmin: () => services.emailAdmin !== false };
    if (name === '@/lib/utils') return { formatTicketNumber: String, parseTicketPaymentInfo: () => ({ formattedPrice: '20000 COP', isCrypto: false }), getTicketPaymentStatus: t => t.notes === 'paid' ? 'paid' : 'pending' };
    if (name.endsWith('/ticketService')) return { getTickets: async () => [adminTicket], updateTicketStatus: () => { throw new Error('Legacy status mutation must not run'); }, updateTicketPaymentStatus: () => { throw new Error('Legacy payment mutation must not run'); } };
    if (name.endsWith('/settingsService')) return { getQueueSettings: async () => ({ max_tickets: 100, tickets_enabled: true }), updateQueueSettings: async value => value };
    if (name.endsWith('/discountService')) return { getDiscountCoupons: async () => [] };
    if (name === 'next/link') return function Link() {};
    if (name === 'next/image') return function Image() {};
    if (name === 'lucide-react') return new Proxy({}, { get: () => () => null });
    if (name.endsWith('/affiliateFinanceService') || name.endsWith('/affiliateService')) return api;
    if (name.endsWith('/RequiredIndicator')) return { RequiredIndicator: () => React.createElement('span', { className: 'text-red-600' }, '*') };
    if (name.startsWith('@/components/') || name.startsWith('@/features/')) return new Proxy({}, { get: () => function MockComponent() {} });
    throw new Error(`Unmocked module ${name}`);
  };
  const source = readFileSync(new URL(`../${file === 'AdminPage' ? 'src/app/admin/page.tsx' : `src/features/affiliates/components/${file}.tsx`}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } });
  const exports = {};
  runInNewContext(outputText, { exports, require, console, Date, Math, Number, Error, React, setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, navigator: { clipboard: { writeText: async text => { clipboard.push(text); } } } });
  const Component = file === 'AdminPage' ? exports.default : exports[file];
  const all = (node, predicate) => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(child => all(child, predicate)) : [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
  const text = node => !node ? '' : Array.isArray(node) ? node.map(text).join('') : typeof node === 'object' ? text(node.props?.children) : String(node);
  return { calls, clipboard,
    async render() { for (let n = 0; n < 8; n++) { index = 0; tree = Component(props); for (const fn of effects.splice(0)) fn(); await Promise.resolve(); } },
    nodes: (predicate) => all(tree, predicate),
    text: () => text(tree),
    html: () => renderToStaticMarkup(tree),
    button(label) { return all(tree, n => (n.type === 'button' || n.props.onClick) && (n.props['aria-label'] === label || text(n) === label))[0]; },
    input(id) { return all(tree, n => n.props?.id === id)[0]; },
    async click(label) { const button = this.button(label); assert.ok(button, label); await button.props.onClick(); await this.render(); },
    async submit(id) { const form = all(tree, n => n.type === 'form' && n.props.id === id)[0]; assert.ok(form, id); await form.props.onSubmit({ preventDefault() {} }); await this.render(); },
  };
}

test('withdrawal queue distinguishes all states, copies UID, and preserves frozen conversion', async () => {
  const payouts = ['pending', 'processing', 'completed', 'rejected'].map(status => payout(status));
  const app = harness('AdminPayoutQueue', { payouts, affiliates: [], onChanged: async () => {} });
  await app.render();
  for (const label of ['Pendiente', 'En proceso', 'Pagado', 'Rechazado']) assert.ok(app.text().includes(label), label);
  await app.click('Revisar retiro pending');
  assert.ok(app.text().includes('4000'));
  assert.ok(app.text().includes('8.00 USDT'));
  assert.equal(app.nodes(n => n.type === 'input' && n.props.type === 'number').length, 0);
  await app.click('Copiar Binance UID');
  assert.deepEqual(app.clipboard, ['987654321']);
  assert.ok(!app.clipboard[0].includes('/r/'));
});

test('completion requires processing and reference; rejection requires a reason', async () => {
  const app = harness('AdminPayoutQueue', { payouts: [payout()], affiliates: [], onChanged: async () => {} });
  await app.render(); await app.click('Revisar retiro pending');
  assert.equal(app.button('Registrar transferencia').props.disabled, true);
  await app.submit('complete-withdrawal'); assert.equal(app.calls.length, 0);
  await app.submit('reject-withdrawal'); assert.equal(app.calls.length, 0);
  app.input('withdrawal-reason').props.onChange({ target: { value: 'UID incorrecto' } }); await app.render();
  await app.submit('reject-withdrawal'); assert.deepEqual(app.calls, [['reject', 'pending', 'UID incorrecto']]);
  const processing = harness('AdminPayoutQueue', { payouts: [payout('processing')], affiliates: [], onChanged: async () => {} });
  await processing.render(); await processing.click('Revisar retiro processing');
  assert.equal(processing.input('withdrawal-reference').props.required, true);
  processing.input('withdrawal-reference').props.onChange({ target: { value: ' TX-123 ' } }); await processing.render();
  await processing.submit('complete-withdrawal');
  assert.deepEqual(JSON.parse(JSON.stringify(processing.calls)), [['complete', { payoutId: 'processing', binanceTxReference: 'TX-123' }]]);
  assert.ok(processing.text().includes('Pagado'));
});

test('processing is explicit; backend rejection remains visible without success', async () => {
  const app = harness('AdminPayoutQueue', { payouts: [payout()], affiliates: [], onChanged: async () => {} }, { markPayoutProcessing: async () => { throw new Error('Requiere conciliación: transferencia registrada.'); } });
  await app.render(); await app.click('Revisar retiro pending'); await app.click('Marcar en proceso');
  assert.ok(app.text().includes('Requiere conciliación'));
  assert.ok(app.text().includes('Pendiente'));
  assert.ok(!app.text().includes('Retiro actualizado.'));
  const denied = harness('AdminPayoutQueue', { payouts: [payout('processing')], affiliates: [], onChanged: async () => {} }, { completePayoutAdmin: async () => false });
  await denied.render(); await denied.click('Revisar retiro processing');
  denied.input('withdrawal-reference').props.onChange({ target: { value: 'TX-DENIED' } }); await denied.render(); await denied.submit('complete-withdrawal');
  assert.ok(denied.text().includes('No se pudo registrar'));
  assert.ok(!denied.text().includes('Retiro actualizado.'));
});

test('positive current rate updates do not mutate historical payout amounts', async () => {
  const frozen = payout('completed');
  const app = harness('AdminFinanceOverview', { commissions: [], payouts: [frozen] });
  await app.render();
  app.input('finance-rate').props.onChange({ target: { value: '0' } }); await app.render(); await app.submit('finance-rate-form');
  assert.ok(app.text().includes('mayor que cero'));
  app.input('finance-rate').props.onChange({ target: { value: '4500' } }); await app.render(); await app.submit('finance-rate-form');
  assert.ok(app.text().includes('4500'));
  assert.equal(frozen.cop_to_usdt_rate, 4000); assert.equal(frozen.net_amount_usdt, 8);
});

test('audit is read-only and exposes actor, action, date and reference', async () => {
  const app = harness('AdminFinanceAudit', {}, { getFinanceAudit: async () => [{ id: 'audit-1', actor_id: 'admin-a', action: 'payout.completed', entity_id: 'withdrawal-1', details: { reference: 'TX-123' }, created_at: '2026-10-02' }] });
  await app.render();
  for (const value of ['admin-a', 'payout.completed', 'TX-123', 'withdrawal-1']) assert.ok(app.text().includes(value));
  assert.equal(app.nodes(n => n.type === 'form' || n.type === 'input').length, 0);
});


test('admin service and payment controls call atomic APIs independently; denied reversal is visible', async () => {
  const app = harness('AdminPage', {});
  await app.render();
  await app.click('Atender');
  assert.deepEqual(JSON.parse(JSON.stringify(app.calls)), [['service', 'ticket-1', 'in_progress']]);
  await app.click('Marcar Pago');
  assert.deepEqual(JSON.parse(JSON.stringify(app.calls)), [['service', 'ticket-1', 'in_progress'], ['payment', 'ticket-1', true]]);
  assert.ok(app.text().includes('Control de Capacidad'));
  assert.ok(app.text().includes('Cupones'));
  await app.click('Afiliados y pagos');
  for (const label of ['Resumen', 'Afiliados', 'Comisiones', 'Retiros', 'Historial']) assert.ok(app.text().includes(label));
  assert.ok(!app.text().includes('Control de Capacidad'));
  assert.ok(!app.text().includes('Cola de Clientes Oficial'));
  const denied = harness('AdminPage', {}, { setTicketPaymentStatus: async () => { throw new Error('El retiro está reservado: requiere conciliación.'); } });
  await denied.render(); await denied.click('Marcar Pago');
  assert.ok(denied.text().includes('requiere conciliación'));
});


test('admin page accepts trusted finance claim but never user-editable role metadata', async () => {
  const forged = harness('AdminPage', {}, { emailAdmin: false, authUser: { email: 'user@example.test', user_metadata: { finance_admin: true } } });
  await forged.render();
  assert.ok(!forged.button('Afiliados y pagos'));
  const trusted = harness('AdminPage', {}, { emailAdmin: false, authUser: { email: 'finance@example.test', app_metadata: { finance_admin: true } } });
  await trusted.render();
  assert.ok(trusted.button('Afiliados y pagos'));
});
