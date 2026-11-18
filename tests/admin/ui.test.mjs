// Rendered HTML / HTTP headers of the admin pages (what the browser receives).
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { assertServerUp, get, signToken, getPrisma, disconnectPrisma } from './helpers.mjs';

let token;
before(async () => {
  await assertServerUp();
  token = await signToken();
});
after(disconnectPrisma);

const PAGES = [
  { path: '/admin/login', auth: false },
  { path: '/admin', auth: true },
  { path: '/admin/training', auth: true },
];

describe('Admin pages: HTTP headers', () => {
  for (const { path, auth } of PAGES) {
    test(`UI-01 ${path} is not cacheable by shared caches`, async () => {
      const r = await get(path, { token: auth ? token : undefined });
      assert.equal(r.status, 200);
      const cc = r.res.headers.get('cache-control') ?? '';
      assert.match(cc, /no-store|private|no-cache/, `cache-control: "${cc}"`);
    });

    test(`UI-02 [security] ${path} cannot be framed (clickjacking)`, async () => {
      const r = await get(path, { token: auth ? token : undefined });
      const xfo = r.res.headers.get('x-frame-options') ?? '';
      const csp = r.res.headers.get('content-security-policy') ?? '';
      assert.ok(
        /deny|sameorigin/i.test(xfo) || /frame-ancestors/i.test(csp),
        'neither X-Frame-Options nor CSP frame-ancestors is set'
      );
    });

    test(`UI-03 ${path} is excluded from search engines (noindex)`, async () => {
      const r = await get(path, { token: auth ? token : undefined });
      const header = r.res.headers.get('x-robots-tag') ?? '';
      const meta = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(r.body);
      assert.ok(meta || /noindex/i.test(header), 'no robots noindex meta/header');
    });
  }
});

describe('Login page markup', () => {
  let html;
  before(async () => {
    html = (await get('/admin/login')).body;
  });

  test('UI-10 password input is required and labelled', () => {
    const input = html.match(/<input[^>]*id="password"[^>]*>/)?.[0] ?? '';
    assert.match(input, /required/);
    assert.match(html, /<label[^>]*for="password"/);
  });

  test('UI-11 password input has autocomplete="current-password" (password managers)', () => {
    const input = html.match(/<input[^>]*id="password"[^>]*>/)?.[0] ?? '';
    assert.match(input, /autoComplete="current-password"|autocomplete="current-password"/i);
  });

  test('UI-12 page has exactly one <h1>', () => {
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  });

  test('UI-13 page has a specific <title>', () => {
    assert.match(html, /<title>[^<]*(Вхід|Адмін)[^<]*<\/title>/);
  });
});

describe('Prices page markup', () => {
  let html;
  before(async () => {
    html = (await get('/admin/training', { token })).body;
  });

  test('UI-20 every visible DB price has an input with the current value', async () => {
    const prisma = await getPrisma();
    const rows = await prisma.trainingPrice.findMany({
      where: { category: { in: ['package', 'section', 'subscription'] } },
    });
    assert.ok(rows.length > 0, 'no prices in DB');
    for (const row of rows) {
      const input = html.match(new RegExp(`<input[^>]*name="price_${row.id}"[^>]*>`))?.[0];
      assert.ok(input, `no input for ${row.id}`);
      assert.match(input, new RegExp(`value="${row.price}"`), `wrong value for ${row.id}`);
    }
  });

  test('UI-22 price inputs are numeric, required and non-negative', () => {
    const inputs = [...html.matchAll(/<input[^>]*name="price_[^"]+"[^>]*>/g)].map((m) => m[0]);
    for (const i of inputs) {
      assert.match(i, /type="number"/);
      assert.match(i, /required/);
      assert.match(i, /min="0"/);
    }
  });

  test('UI-23 [bug] any whole-UAH price can be entered (step must not be 10)', () => {
    // step="10" + min="0" makes the browser reject e.g. 355 or 1299 ("enter a valid value")
    // so the form cannot be submitted at all.
    const inputs = [...html.matchAll(/<input[^>]*name="price_[^"]+"[^>]*>/g)].map((m) => m[0]);
    const bad = inputs.filter((i) => /step="(?!1"|any")[^"]*"/.test(i));
    assert.equal(bad.length, 0, `${bad.length} inputs have a step that blocks non-multiples of 10`);
  });

  test('UI-24 prices form has a submit button and a back link', () => {
    assert.match(html, /<button[^>]*type="submit"[^>]*>[\s\S]*?Зберегти зміни/);
    assert.match(html, /href="\/admin"/);
  });

  test('UI-25 hidden QA / unknown categories are not rendered as inputs', () => {
    assert.doesNotMatch(html, /name="price_qa_/);
  });
});
