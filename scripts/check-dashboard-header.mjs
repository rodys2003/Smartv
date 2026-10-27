import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/app/dashboard/page.tsx', import.meta.url), 'utf8');

test('dashboard hides the quick ticket action on mobile screens', () => {
  const quickAction = source.match(/\/\* Quick action button \*\/[\s\S]*?<\/Button>/)?.[0];
  assert.ok(quickAction, 'Quick ticket action is rendered');
  assert.match(quickAction, /max-md:!hidden md:inline-flex/);
});
