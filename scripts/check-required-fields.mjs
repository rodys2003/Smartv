import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = new URL('../src/', import.meta.url);
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    return entry.isDirectory() ? files(path) : entry.name.endsWith('.tsx') ? [path] : [];
  });
}
function nodes(node, predicate) {
  const found = predicate(node) ? [node] : [];
  ts.forEachChild(node, child => { found.push(...nodes(child, predicate)); });
  return found;
}
const isTag = (node, name) => ts.isJsxElement(node) && node.openingElement.tagName.getText() === name;
const hasMark = node => nodes(node, child => ts.isJsxSelfClosingElement(child) && child.tagName.getText() === 'RequiredIndicator').length > 0;

test('all required form fields have the shared red-asterisk indicator', () => {
  let checked = 0;
  for (const path of files(root)) {
    const source = ts.createSourceFile(path.pathname, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const requiredFields = nodes(source, node => (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ['input', 'select', 'textarea'].includes(node.tagName.getText()) && node.attributes.properties.some(attr => ts.isJsxAttribute(attr) && attr.name.getText() === 'required'));
    for (const field of requiredFields) {
      let parent = field.parent;
      let labels = [];
      while (parent && !labels.length) {
        labels = nodes(parent, node => isTag(node, 'label'));
        parent = parent.parent;
      }
      assert.ok(labels.some(hasMark), `${path.pathname}: required field is missing a red indicator`);
      checked++;
    }
    for (const label of nodes(source, node => isTag(node, 'label') && /\(opcional\)/i.test(node.getText()))) {
      assert.equal(hasMark(label), false, `${path.pathname}: optional field must not have a required indicator`);
    }
  }
  assert.ok(checked >= 10, 'Ticket, affiliate and admin required fields were checked');
});

test('required indicator renders a red visual asterisk with accessible required text', () => {
  const source = readFileSync(new URL('../src/components/ui/RequiredIndicator.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } });
  const exports = {};
  runInNewContext(outputText, { exports, require: name => { assert.equal(name, 'react'); return React; } });
  const html = renderToStaticMarkup(React.createElement(exports.RequiredIndicator));
  assert.match(html, /text-red-600/);
  assert.match(html, /dark:text-red-400/);
  assert.match(html, />\*<\/span>/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /class="sr-only">[^<]*obligatorio/);
});
