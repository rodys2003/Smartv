import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

function loadSource(path, require) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true,
  } });
  const exports = {};
  runInNewContext(outputText, { exports, require, console, Date, Math, Number, React, crypto: { randomUUID: () => 'request-uuid' } });
  return exports;
}

export function portalHarness(options = {}) {
  let user = { id: 'account-a', email: 'example@example.test', user_metadata: { full_name: 'Nombre de Google' } };
  const hooks = [];
  const effects = [];
  const requests = [];
  let index = 0;
  const same = (left, right) => left && right && left.length === right.length && left.every((value, i) => Object.is(value, right[i]));
  const mockReact = {
    ...React,
    useState(initial) {
      const i = index++;
      if (!(i in hooks)) hooks[i] = typeof initial === 'function' ? initial() : initial;
      return [hooks[i], value => { hooks[i] = typeof value === 'function' ? value(hooks[i]) : value; }];
    },
    useRef(initial) { const i = index++; if (!(i in hooks)) hooks[i] = { current: initial }; return hooks[i]; },
    useEffect(callback, dependencies) {
      const i = index++;
      if (!same(hooks[i], dependencies)) { hooks[i] = dependencies; effects.push(callback); }
    },
    useCallback(callback, dependencies) {
      const i = index++;
      if (!same(hooks[i]?.dependencies, dependencies)) hooks[i] = { dependencies, callback };
      return hooks[i].callback;
    },
  };
  const noop = () => null;
  const require = name => {
    if (name === 'react') return mockReact;
    if (name === 'next/link') return function MockLink({ children, ...props }) { return React.createElement('a', props, children); };
    if (name === 'next/image') return noop;
    if (name === 'lucide-react') return new Proxy({}, { get: () => noop });
    if (name.endsWith('/useAuth')) return { useAuth: () => ({ user, isAuthenticated: true, loading: false, signInWithGoogle: noop, signOut: noop }) };
    if (name.endsWith('/useApplicantName')) return loadSource('src/features/affiliates/hooks/useApplicantName.ts', require);
    if (name.endsWith('/affiliateService')) return {
      getAffiliateProfile: async () => options.affiliate || null,
      getMyCommissions: async () => options.commissions || [], getMyPayouts: async () => options.payouts || [],
      updateAffiliateBinanceUid: options.updateAffiliateBinanceUid || (async () => true),
      FIXED_WITHDRAWAL_FEE_USDT: 2, MIN_WITHDRAWAL_AMOUNT_USDT: 5,
      registerAffiliateRequest: async value => { requests.push(value); return { id: user.id, status: 'pending', commission_rate: 0.3 }; },
    };
    if (name.endsWith('/affiliateFinanceService')) return options.finance || {};
    if (name === '@/lib/utils') return { formatCOP: String, formatTicketNumber: String };
    return new Proxy({}, { get: () => noop });
  };
  const Page = loadSource('src/app/afiliados/page.tsx', require).default;
  let tree;
  const all = (node, predicate) => {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(child => all(child, predicate));
    return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
  };
  return {
    requests,
    setUser(value) { user = value; },
    async render() {
      for (let n = 0; n < 20; n++) {
        index = 0;
        tree = Page();
        const pending = effects.splice(0);
        for (const effect of pending) effect();
        await Promise.resolve();
      }
    },
    input(type) { return all(tree, node => node.type === 'input' && (type === 'name' ? node.props.placeholder === 'Ej. Ana Gómez' : type === 'tiktok' ? node.props.placeholder?.includes('@tu_usuario') : node.props.type === type))[0]; },
    form() { return all(tree, node => node.type === 'form')[0]; },
    labels() { return all(tree, node => node.type === 'label'); },
    elements() { return all(tree, () => true); },
  };
}

test('Google name can be cleared, replaced, and submitted without being restored', async () => {
  const app = portalHarness();
  await app.render();
  assert.equal(app.input('name').props.value, 'Nombre de Google');
  app.input('name').props.onChange({ target: { value: '' } });
  await app.render();
  assert.equal(app.input('name').props.value, '');
  app.input('name').props.onChange({ target: { value: 'Mi nombre elegido' } });
  app.input('tel').props.onChange({ target: { value: '+573001234567' } });
  const tiktok = app.labels().find(label => String(label.props.children).includes('TikTok'));
  assert.ok(tiktok);
  app.input('tiktok').props.onChange({ target: { value: '@mi_cuenta' } });
  app.setUser({ id: 'account-a', email: 'example@example.test', user_metadata: { full_name: 'Nombre actualizado en Google' } });
  await app.render();
  assert.equal(app.input('name').props.value, 'Mi nombre elegido');
  await app.form().props.onSubmit({ preventDefault() {} });
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].name, 'Mi nombre elegido');
  assert.equal(app.requests[0].phone, '+573001234567');
  assert.equal(app.requests[0].tiktokAccount, '@mi_cuenta');
});

test('refreshing the same account preserves an intentionally empty name', async () => {
  const app = portalHarness();
  await app.render();
  app.input('name').props.onChange({ target: { value: '' } });
  app.setUser({ id: 'account-a', email: 'example@example.test', user_metadata: { full_name: 'Otro nombre de Google' } });
  await app.render();
  assert.equal(app.input('name').props.value, '');
  app.setUser({ id: 'account-b', email: 'other@example.test', user_metadata: { full_name: 'Cuenta diferente' } });
  await app.render();
  assert.equal(app.input('name').props.value, 'Cuenta diferente');
});

test('registration inputs have accessible labels and editable name guidance', async () => {
  const app = portalHarness();
  await app.render();
  const input = app.input('name');
  assert.ok(input.props.id);
  assert.ok(app.labels().some(label => label.props.htmlFor === input.props.id));
  assert.equal(input.props.autoComplete, 'name');
  assert.ok(input.props['aria-describedby']);
  for (const type of ['name', 'tel', 'tiktok']) {
    const field = app.input(type);
    assert.ok(app.labels().some(label => label.props.htmlFor === field.props.id));
    assert.ok(field.props.className.includes('text-base'));
  }
  assert.equal(app.input('tel').props.required, true);
  assert.equal(app.input('tiktok').props.required, true);
});

function renderProgram() {
  const noop = () => null;
  const require = name => {
    if (name === 'react') return React;
    if (name === 'next/link') return function MockLink({ children, ...props }) { return React.createElement('a', props, children); };
    if (name === 'next/image') return function MockImage({ src, alt }) { return React.createElement('img', { src, alt }); };
    if (name === 'lucide-react') return new Proxy({}, { get: () => noop });
    if (name.endsWith('/constants/plans')) return loadSource('src/features/services-catalog/constants/plans.ts', require);
    if (name === '@/lib/r2') return { getR2Url: path => path };
    if (name === '@/lib/seo') return loadSource('src/lib/seo.ts', require);
    return new Proxy({}, { get: () => noop });
  };
  const page = loadSource('src/app/programa-afiliados/page.tsx', require);
  return { metadata: page.metadata, html: renderToStaticMarkup(React.createElement(page.default)) };
}

test('public program matches landing support and explains application and withdrawal rules', () => {
  const { html } = renderProgram();
  assert.doesNotMatch(html, /Fire TV|servicio líder|tasa COP\/USDT oficial|satisfacción total/);
  assert.match(html, /Google TV/);
  assert.match(html, /2 USDT/);
  assert.match(html, /5 USDT/);
  assert.match(html, /aprobación manual/i);
  assert.match(html, /href="\/afiliados"/);
  assert.match(html, /<details/);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
});


test('an optional name can stay empty in the application payload', async () => {
  const app = portalHarness();
  await app.render();
  app.input('name').props.onChange({ target: { value: '' } });
  app.input('tel').props.onChange({ target: { value: '+573001234567' } });
  app.input('tiktok').props.onChange({ target: { value: '@mi_cuenta' } });
  await app.render();
  await app.form().props.onSubmit({ preventDefault() {} });
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].name, undefined);
});

if (process.env.AFFILIATE_UX_TEST_URL) {
  test('actual public affiliate HTML has metadata, branded navigation and a responsive commission layout', async () => {
    const response = await fetch(`${process.env.AFFILIATE_UX_TEST_URL}/programa-afiliados`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Navegación de afiliados/);
    assert.match(html, /rel="canonical" href="https:\/\/smartvpro\.ordely\.online\/programa-afiliados"/);
    assert.match(html, /<details/);
    assert.doesNotMatch(html, /overflow-x-auto/);
    assert.match(html, /\/images\/itachi-theme-optimized\.webp/);
  });
}


test('signed-out navigation puts the home link before the card and separates program information', async () => {
  const app = portalHarness();
  app.setUser(null);
  await app.render();
  const elements = app.elements();
  const home = elements.find(node => node.props?.href === '/');
  const heading = elements.find(node => node.type === 'h1');
  const program = elements.find(node => node.props?.href === '/programa-afiliados');
  assert.ok(home && heading && program);
  assert.ok(elements.indexOf(home) < elements.indexOf(heading), 'Back navigation precedes the login card');
  assert.ok(home.props.className.includes('min-h-11'));
  assert.ok(program.props.className.includes('w-full'), 'Program link has its own full-width row');
});
