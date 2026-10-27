import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import ts from 'typescript';

function harness() {
  const state = [];
  let index = 0;
  let user = { id: 'test-user', email: 'prueba@example.test', user_metadata: { full_name: 'Prueba 1' } };
  const effects = [];
  const requests = [];
  const mockReact = { ...React, useEffect(callback, dependencies) {
    const i = index++;
    const previous = state[i];
    if (!previous || dependencies.some((value, position) => !Object.is(value, previous[position]))) {
      state[i] = dependencies;
      effects.push(callback);
    }
  }, useState(initial) {
    const i = index++;
    if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial;
    return [state[i], value => { state[i] = value; }];
  } };
  function load(path) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } });
    const exports = {};
    runInNewContext(outputText, { exports, require: name => {
      if (name === 'react') return mockReact;
      if (name.endsWith('/ticketService')) return { createTicket: async payload => { requests.push(payload); return { id: 'ticket-test', ticket_number: 1, ...payload }; } };
      if (name.endsWith('/affiliateService')) return { getActiveReferralCode: () => null };
      if (name.endsWith('/plans')) return load('src/features/services-catalog/constants/plans.ts');
      if (name.endsWith('/useAuth')) return { useAuth: () => ({ user, isAuthenticated: true }) };
      if (name.endsWith('/useQueue')) return { useQueue: () => ({ waitingTickets: [], whatsappThreshold: 1 }) };
      if (name.endsWith('/operatingHours')) return { getOperatingHoursInfo: () => ({ colombiaHours: '6:00 AM - 9:00 PM', isSameAsColombia: true, isOpen: true }) };
      if (name === '@/lib/utils') return { formatCOP: value => `$ ${value.toLocaleString('es-CO')}` };
      return new Proxy({}, { get: () => () => null });
    }, React, console });
    return exports;
  }
  const Component = load('src/features/tickets/components/TicketModal.tsx').TicketModal;
  function all(node, predicate) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(child => all(child, predicate));
    return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
  }
  let tree;
  return {
    render() {
      for (let pass = 0; pass < 4; pass++) {
        index = 0;
        tree = Component({ isOpen: true, onClose() {} });
        for (const effect of effects.splice(0)) effect();
      }
      return tree;
    },
    requests,
    setUser(value) { user = value; },
    all: predicate => all(tree, predicate),
    button(text) { return all(tree, node => node.type === 'button').find(node => JSON.stringify(node.props.children).includes(text)); },
  };
}

test('ticket form uses neutral information panels with one selection accent', () => {
  const app = harness();
  app.render();
  const classes = app.all(node => !!node.props.className).map(node => node.props.className).join(' ');
  assert.doesNotMatch(classes, /(?:text|bg|border|accent)-(?:amber|fuchsia|emerald)-/);
  assert.match(classes, /text-sm/);
  const payment = app.button('Binance (USDT)');
  assert.equal(payment.props['aria-pressed'], false);
  payment.props.onClick();
  app.render();
  assert.equal(app.button('Binance (USDT)').props['aria-pressed'], true);
  assert.match(app.button('Binance (USDT)').props.className, /border-cyan/);
});

test('ticket fields have associated labels, readable mobile sizing and accessible add-on', () => {
  const app = harness();
  app.render();
  for (const placeholder of ['Ej. Carlos Mendoza', 'Ej. +57 300 123 4567', 'Ej. TCL 55 / Xiaomi P1']) {
    const input = app.all(node => node.type === 'input' && node.props.placeholder === placeholder)[0];
    assert.ok(input.props.id);
    assert.ok(app.all(node => node.type === 'label' && node.props.htmlFor === input.props.id).length);
    assert.match(input.props.className, /text-base/);
    assert.match(input.props.className, /min-h-11/);
  }
  const checkbox = app.all(node => node.type === 'input' && node.props.type === 'checkbox')[0];
  assert.ok(app.all(node => node.type === 'label' && node.props.htmlFor === checkbox.props.id).length);
});

test('payment and plan changes retain catalog prices and optional add-on totals', () => {
  const app = harness();
  app.render();
  assert.ok(app.all(node => node.props.children === '$ 50.000').length);
  app.button('Binance (USDT)').props.onClick();
  app.render();
  assert.ok(app.all(node => node.props.children === '17 USDT').length);
  app.button('Optimización de TV').props.onClick();
  app.render();
  const checkbox = app.all(node => node.type === 'input' && node.props.type === 'checkbox')[0];
  checkbox.props.onChange({ target: { checked: true } });
  app.render();
  assert.ok(app.all(node => node.props.children === '14 USDT').length);
});


test('ticket name can be cleared and replaced without Google refresh overwriting it', async () => {
  const app = harness();
  const nameInput = () => app.all(node => node.props.id === 'ticket-client-name')[0];
  app.render();
  assert.equal(nameInput().props.value, 'Prueba 1');
  nameInput().props.onChange({ target: { value: '' } });
  app.render();
  assert.equal(nameInput().props.value, '');
  app.setUser({ id: 'test-user', email: 'prueba@example.test', user_metadata: { full_name: 'Nombre actualizado de Google' } });
  app.render();
  assert.equal(nameInput().props.value, '');
  assert.equal(app.all(node => node.type === 'button' && node.props.type === 'submit')[0].props.disabled, true);
  nameInput().props.onChange({ target: { value: 'Nombre elegido' } });
  app.setUser({ id: 'test-user', email: 'prueba@example.test', user_metadata: { full_name: 'Nombre actualizado de Google' } });
  app.render();
  assert.equal(nameInput().props.value, 'Nombre elegido');
  app.setUser({ id: 'second-user', user_metadata: { full_name: 'Otra cuenta' } });
  app.render();
  assert.equal(nameInput().props.value, 'Otra cuenta');
  app.setUser({ id: 'test-user', email: 'prueba@example.test', user_metadata: { full_name: 'Prueba 1' } });
  const phoneInput = () => app.all(node => node.props.id === 'ticket-client-whatsapp')[0];
  phoneInput().props.onChange({ target: { value: '+57 300 123 4567' } });
  app.render();
  await app.all(node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].user_name, 'Nombre elegido');
  assert.equal(app.requests[0].user_id, 'test-user');
  assert.equal(app.requests[0].client_whatsapp, '+57 300 123 4567');
});

test('device incompatibility is a separate emphasized notice', () => {
  const app = harness();
  app.render();
  const notice = app.all(node => node.props.role === 'note')[0];
  assert.ok(notice);
  assert.match(notice.props.className, /border-l-4/);
  assert.ok(app.all(node => node.type === 'strong' && node.props.children === 'No compatible con Samsung Tizen ni LG webOS.').length);
});
