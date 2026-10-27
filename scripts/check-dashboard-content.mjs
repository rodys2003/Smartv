import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import ts from 'typescript';

function dashboardHarness(authenticated = true, ticket = null) {
  const state = [];
  let index = 0;
  const components = new Map();
  const mockReact = {
    ...React, useEffect() {}, useCallback: callback => callback,
    useState(initial) {
      const i = index++;
      if (!(i in state)) state[i] = i === 0 ? ticket : typeof initial === 'function' ? initial() : initial;
      return [state[i], value => { state[i] = value; }];
    },
  };
  const source = readFileSync(new URL('../src/app/dashboard/page.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } });
  const exports = {};
  runInNewContext(outputText, { exports, React, console, require: name => {
    if (name === 'react') return mockReact;
    if (name === 'next/navigation') return { useRouter: () => ({ push() {} }) };
    if (name.endsWith('/useAuth')) return { useAuth: () => ({ user: authenticated ? { id: 'test-account', email: 'test@example.test', user_metadata: { full_name: 'Cuenta de prueba' } } : null, isAuthenticated: authenticated, loading: false, signInWithGoogle() {} }) };
    if (name.endsWith('/useQueue')) return { useQueue: () => ({ canIssueTicket: true, waitingTickets: [], whatsappThreshold: 5, refreshQueue() {} }) };
    if (name === '@/lib/utils') return { parseTicketPaymentInfo: () => ({ isCrypto: false }) };
    return new Proxy({}, { get: (_, key) => {
      if (!components.has(key)) components.set(key, function MockComponent() { return null; });
      return components.get(key);
    } });
  } });
  function all(node, predicate) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(child => all(child, predicate));
    return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
  }
  let tree;
  return {
    render() { index = 0; tree = exports.default(); },
    all: predicate => all(tree, predicate),
    component: name => all(tree, node => node.type === components.get(name))[0],
    text() {
      const strings = node => typeof node === 'string' ? node : Array.isArray(node) ? node.map(strings).join(' ') : node && typeof node === 'object' ? strings(node.props?.children) : '';
      return strings(tree);
    },
  };
}

test('authenticated dashboard removes repeated identity and promotional explanations', () => {
  const app = dashboardHarness();
  app.render();
  assert.doesNotMatch(app.text(), /Sesión Activa|Usuario Verificado:|Bienvenido a tu panel personal|Gestión de Turnos & Tutoriales|Atención Prioritaria|Sin Spam ni Esperas|Soporte Multidispositivo|Respuesta promedio/);
  assert.equal(app.all(node => node.props.id === 'asesoria').length, 1);
  assert.match(app.text(), /Asesoría técnica/);
});

test('dashboard preserves all section links, ticket actions and account controls', () => {
  const app = dashboardHarness(true, { id: 'ticket-test' });
  app.render();
  for (const href of ['#cola', '#guia', '#pago', '#asesoria']) {
    assert.equal(app.all(node => node.props.href === href).length, 1);
  }
  for (const name of ['QueueTracker', 'StepByStepGuide', 'PaymentSection', 'UserMenu', 'ThemeToggle', 'EditPlanModal']) assert.ok(app.component(name), name);
  app.component('QueueTracker').props.onOpenTicketModal();
  app.render();
  assert.equal(app.component('TicketModal').props.isOpen, true);
  app.component('QueueTracker').props.onEditPlan();
  app.render();
  assert.equal(app.component('EditPlanModal').props.isOpen, true);
  assert.equal(app.component('PaymentSection').props.userTicket.id, 'ticket-test');
});

test('signed-out dashboard retains Google sign-in guidance', () => {
  const app = dashboardHarness(false);
  app.render();
  assert.match(app.text(), /Continuar con Google/);
  assert.match(app.text(), /Ingresa para Acceder/);
  assert.equal(app.all(node => node.props.id === 'asesoria').length, 0);
});
