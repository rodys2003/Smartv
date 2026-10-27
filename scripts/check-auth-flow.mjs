import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);

test('OAuth uses PKCE and persists the verifier in cookies readable by the callback', async () => {
  const jar = new Map();
  const source = readFileSync(new URL('../src/lib/supabase/client.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  const env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-publishable-key' };
  const localRequire = name => {
    if (name === '@supabase/ssr') return {
      createBrowserClient(url, key, options) {
        return require(name).createBrowserClient(url, key, {
          ...options, isSingleton: false,
          auth: { ...options?.auth, autoRefreshToken: false, detectSessionInUrl: false },
          cookies: {
            getAll: () => [...jar].map(([name, value]) => ({ name, value })),
            setAll: values => values.forEach(({ name, value }) => jar.set(name, value)),
          },
        });
      },
    };
    if (name === '@supabase/supabase-js') return {
      createClient: (url, key, options) => require(name).createClient(url, key, {
        ...options, auth: { ...options.auth, autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
      }),
    };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  runInNewContext(outputText, { exports, require: localRequire, process: { env } });
  const { data, error } = await exports.supabase.auth.signInWithOAuth({
    provider: 'google', options: { redirectTo: 'http://localhost:5173/auth/callback?next=/dashboard', skipBrowserRedirect: true },
  });
  assert.equal(error, null);
  const url = new URL(data.url);
  assert.equal(url.searchParams.get('code_challenge_method'), 's256');
  assert.ok(url.searchParams.get('code_challenge'));
  assert.ok([...jar].some(([name, value]) => name.includes('code-verifier') && value), 'PKCE verifier must reach the server in a cookie');
  assert.equal(typeof exports.supabase.from, 'function');
  await exports.supabase.auth.signOut({ scope: 'local' });
});
