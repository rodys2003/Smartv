import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/features/affiliates/services/affiliateService.ts', import.meta.url), 'utf8');
const financePath = new URL('../src/features/affiliates/services/affiliateFinanceService.ts', import.meta.url);

test('financial facade never directly writes a ledger or promotes records on reads', () => {
  assert.doesNotMatch(source, /\.insert\(|\.upsert\(|\.update\(/);
});

test('quote requests submit snapshots to a protected RPC and propagate failure', async () => {
  const finance = readFileSync(financePath, 'utf8');
  const calls = [];
  let failure = null;
  const exports = {};
  runInNewContext(ts.transpileModule(finance, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: () => ({ supabase: { rpc: async (name, params) => {
      calls.push({ name, params });
      return { data: { id: 'payout' }, error: failure };
    } } }), Error,
  });
  const quote = { affiliate_id: 'owner', gross_usdt: 5, fee_usdt: 2, net_usdt: 3 };
  await exports.requestQuotedWithdrawal(quote, 'request');
  assert.equal(calls[0].name, 'affiliate_request_withdrawal');
  assert.equal(calls[0].params.p_quote, quote);
  assert.equal(calls[0].params.p_request_id, 'request');
  failure = { message: 'quote changed' };
  await assert.rejects(exports.requestQuotedWithdrawal(quote, 'request2'), /quote changed/);
});

test('rate boundary rejects non-finite client input before RPC', async () => {
  const calls = [];
  const exports = {};
  runInNewContext(ts.transpileModule(readFileSync(financePath,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: () => ({ supabase: { rpc: async (...args) => { calls.push(args); return { data: {}, error: null }; } } }), Error, Number,
  });
  for(const rate of [NaN,Infinity,-Infinity,0,-1]) await assert.rejects(exports.setFinanceRate(rate), /positiva/);
  assert.equal(calls.length,0);
});
