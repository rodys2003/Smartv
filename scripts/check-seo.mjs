import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const base = process.env.SEO_TEST_URL || 'http://localhost:5173';
const origin = 'https://smartvpro.ordely.online';
const paths = ['/', '/servicios/optimizar-android-tv', '/servicios/personalizar-google-tv', '/servicios/instalar-apps-android-tv', '/compatibilidad', '/guias/smart-tv-lento', '/guias/cambiar-launcher-google-tv', '/privacidad'];

test('SEO catalog copy preserves booking prices and identifiers', () => {
  const source = readFileSync(new URL('../src/features/services-catalog/constants/plans.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  runInNewContext(outputText, { exports, require: name => {
    assert.equal(name, '@/lib/r2');
    return { getR2Url: path => path };
  } });
  const catalog = JSON.parse(JSON.stringify(exports));
  assert.deepEqual(catalog.SERVICE_PLANS.map(({ id, price }) => ({ id, price })), [
    { id: 'basic_20k', price: 20000 }, { id: 'ultra_light_50k', price: 50000 }, { id: 'custom_pro_70k', price: 70000 },
  ]);
  assert.deepEqual(catalog.PLAN_USDT_PRICES, { basic_20k: 7, ultra_light_50k: 17, custom_pro_70k: 23 });
  assert.equal(catalog.MAGIC_APPS_PRICE_COP, 20000);
  assert.equal(catalog.MAGIC_APPS_PRICE_USDT, 7);
});

async function html(path) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  return response.text();
}

test('public pages have unique metadata, self canonicals and one visible H1', async () => {
  const titles = new Set();
  for (const path of paths) {
    const body = await html(path);
    const title = body.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title, path);
    assert.ok(!titles.has(title), `Duplicate title: ${title}`);
    titles.add(title);
    assert.equal((body.match(/<h1[\s>]/g) || []).length, 1, path);
    assert.ok(body.includes(`rel="canonical" href="${origin}${path === '/' ? '' : path}"`), path);
    assert.match(body, /name="description" content="[^"]+"/);
    assert.doesNotMatch(body, /name="robots" content="[^"]*noindex/);
  }
});

test('crawl resources include only public pages and keep image fallback crawlable', async () => {
  const sitemap = await html('/sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g) || []).length, paths.length);
  for (const path of paths) assert.ok(sitemap.includes(`<loc>${origin}${path === '/' ? '' : path}</loc>`));
  assert.doesNotMatch(sitemap, /\/admin|\/dashboard|\/auth|\/api/);
  const robots = await html('/robots.txt');
  assert.match(robots, /Allow: \/api\/media\//);
  assert.match(robots, /Disallow: \/api\//);
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
});

test('homepage has structured services, public discovery and realistic compatibility', async () => {
  const body = await html('/');
  const scripts = [...body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  assert.ok(scripts.length);
  const nodes = scripts.flatMap(([, json]) => JSON.parse(json)['@graph'] || []);
  for (const type of ['Organization', 'WebSite', 'Service']) assert.ok(nodes.some(node => node['@type'] === type));
  assert.equal(nodes.filter(node => node['@type'] === 'Service').length, 3);
  assert.doesNotMatch(JSON.stringify(nodes), /AggregateRating/);
  assert.deepEqual(nodes.filter(node => node['@type'] === 'Service').map(node => node.offers.price), [20000, 50000, 70000]);
  for (const path of paths.slice(1)) assert.ok(body.includes(`href="${path}"`), path);
  assert.doesNotMatch(body, /href="\/admin"|Todas marcas|500 TVs|5\.0 \/ 5\.0|Garantía de fluidez/);
  assert.match(body, /Samsung Tizen/);
  assert.match(body, /LG webOS/);
});

test('private page layouts are noindex without changing their public status', async () => {
  for (const path of ['/admin', '/dashboard']) {
    assert.match(await html(path), /name="robots" content="noindex, nofollow"/);
  }
});

test('unknown articles return 404 instead of indexable empty content', async () => {
  for (const path of ['/servicios/no-existe', '/guias/no-existe']) {
    assert.equal((await fetch(`${base}${path}`)).status, 404);
  }
});

test('optimized public images are served directly as compact WebP assets', async () => {
  for (const image of ['itachi-theme', 'minimal-theme', 'logo', 'client-deadpool', 'client-gojo-purple', 'client-gojo-ambient']) {
    const response = await fetch(`${base}/images/${image}-optimized.webp`);
    assert.equal(response.status, 200, image);
    assert.match(response.headers.get('content-type'), /image\/webp/);
    assert.ok((await response.arrayBuffer()).byteLength < 100000, image);
  }
});

test('Google Search Console verification is publicly served unchanged', async () => {
  const response = await fetch(`${base}/google93ae7228805f935a.html`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'google-site-verification: google93ae7228805f935a.html');
});

test('international notice uses an opaque surface and readable text', async () => {
  const body = await html('/');
  const notice = body.match(/<div class="max-w-2xl mx-auto mb-8[^]*?<\/p>/)?.[0];
  assert.ok(notice, 'International payment notice is rendered');
  assert.match(notice, /bg-amber-50 dark:bg-slate-900/);
  assert.doesNotMatch(notice, /bg-gradient|from-amber|via-slate|to-amber/);
  assert.match(notice, /text-sm text-slate-800 dark:text-slate-100 leading-7/);
  assert.match(notice, /Binance en USDT \(Red Tron TRC20\)/);
  assert.match(notice, /Llave Bre-B \(COP\)/);
});

test('plan labels have opaque dark backgrounds above card borders', async () => {
  const body = await html('/');
  for (const [label, color] of [['MÁS POPULAR', 'cyan'], ['NIVEL PRO', 'fuchsia']]) {
    const tag = body.match(new RegExp(`<span class="([^"]*)">${label}</span>`));
    assert.ok(tag, label);
    assert.ok(tag[1].includes(`dark:bg-${color}-950`), label);
    assert.ok(tag[1].includes(`dark:text-${color}-100`), label);
    assert.ok(tag[1].includes('whitespace-nowrap'), label);
  }
  assert.match(body, /z-10 -translate-x-1\/2 -translate-y-1\/2/);
});

test('privacy information and contact are public and distinguish encryption scope', async () => {
  const home = await html('/');
  assert.match(home, /href="\/privacidad"/);
  const privacy = await html('/privacidad');
  assert.match(privacy, /mailto:aethelsoft@gmail\.com/);
  assert.match(privacy, /HTTPS/);
  assert.match(privacy, /AES-256/);
  assert.match(privacy, /https:\/\/supabase\.com\/security/);
  for (const id of ['datos', 'proteccion', 'derechos', 'contacto']) assert.ok(privacy.includes(`id="${id}"`));
  assert.doesNotMatch(privacy, /100% segur|seguridad absoluta garantizada|cumplimos todas las leyes/i);
  assert.doesNotMatch(privacy, /name="robots" content="[^"]*noindex/);
});
