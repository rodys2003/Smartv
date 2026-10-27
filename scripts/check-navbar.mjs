import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import ts from 'typescript';

function harness(authenticated = true) {
  let failed = false;
  let signedOut = 0;
  const user = { id: 'other-account', email: 'other@example.test', user_metadata: {
    full_name: 'Prueba con un nombre de cuenta muy largo', avatar_url: 'https://example.test/missing-avatar.png',
  } };
  const mockReact = { ...React, useState: initial => [failed || initial, value => { failed = value; }] };
  const link = ({ children, ...props }) => React.createElement('a', props, children);
  const require = name => {
    if (name === 'react') return mockReact;
    if (name === 'next/link') return link;
    if (name === 'next/image') return function MockImage(props) { return React.createElement('img', props); };
    if (name.endsWith('/useAuth')) return { useAuth: () => ({ user, isAuthenticated: authenticated, loading: false, signOut: () => { signedOut++; } }) };
    if (name.endsWith('/UserMenu')) return load('src/features/auth/components/UserMenu.tsx');
    if (name.endsWith('/Button')) return { Button: ({ children, ...props }) => React.createElement('button', props, children) };
    return new Proxy({}, { get: () => () => null });
  };
  function load(path) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true,
    } });
    const exports = {};
    runInNewContext(outputText, { exports, require, React });
    return exports;
  }
  function expand(node) {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(expand);
    if (typeof node.type === 'function') return expand(node.type(node.props));
    return { ...node, props: { ...node.props, children: expand(node.props?.children) } };
  }
  function all(node, predicate) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(child => all(child, predicate));
    return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
  }
  const Navbar = load('src/components/layout/Navbar.tsx').Navbar;
  const UserMenu = load('src/features/auth/components/UserMenu.tsx').UserMenu;
  return { user, all, navbar: () => expand(React.createElement(Navbar, { isAuthenticated: authenticated, onOpenAuthModal() {} })),
    menu: () => expand(React.createElement(UserMenu)), signedOut: () => signedOut };
}

test('authenticated navbar keeps only the left dashboard link', () => {
  const app = harness();
  const tree = app.navbar();
  assert.equal(app.all(tree, node => node.props.href === '/dashboard').length, 1);
  const nav = app.all(tree, node => node.type === 'nav')[0];
  assert.equal(app.all(nav, node => node.props.href === '/dashboard').length, 1);
});

test('broken account photo has fixed dimensions and falls back to an initial', () => {
  const app = harness();
  const image = app.all(app.menu(), node => node.type === 'img')[0];
  assert.match(image.props.className, /h-6/);
  assert.match(image.props.className, /w-6/);
  assert.match(image.props.className, /shrink-0/);
  assert.equal(typeof image.props.onError, 'function');
  image.props.onError();
  const tree = app.menu();
  assert.equal(app.all(tree, node => node.type === 'img').length, 0);
  assert.ok(app.all(tree, node => node.props.children === 'P').length);
});

test('long names remain truncated and logout still works', () => {
  const app = harness();
  const tree = app.menu();
  const name = app.all(tree, node => node.props.children === app.user.user_metadata.full_name)[0];
  assert.match(name.props.className, /truncate/);
  app.all(tree, node => node.props['aria-label'] === 'Cerrar sesión')[0].props.onClick();
  assert.equal(app.signedOut(), 1);
});

test('signed-out navigation retains login without a dashboard link', () => {
  const app = harness(false);
  const tree = app.navbar();
  assert.equal(app.all(tree, node => node.props.href === '/dashboard').length, 0);
  assert.ok(app.all(tree, node => node.props.children === 'Ingresar con Google').length);
});
