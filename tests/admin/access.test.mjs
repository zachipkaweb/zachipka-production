// Access control: proxy.js + JWT validation as seen from the outside.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { assertServerUp, get, signToken, unsignedToken } from './helpers.mjs';

before(assertServerUp);

const PROTECTED = ['/admin', '/admin/training', '/admin/does-not-exist'];

function assertRedirectsToLogin(r, msg) {
  assert.ok([307, 308].includes(r.status), `${msg}: expected redirect, got ${r.status}`);
  assert.match(r.location ?? '', /\/admin\/login$/, `${msg}: wrong location ${r.location}`);
}

describe('Access control without a session', () => {
  for (const p of PROTECTED) {
    test(`A-01 GET ${p} without cookie -> redirect to /admin/login`, async () => {
      assertRedirectsToLogin(await get(p), p);
    });
  }

  test('A-02 GET /admin/ (trailing slash) does not expose the dashboard', async () => {
    const r = await get('/admin/');
    assert.ok([307, 308].includes(r.status), `got ${r.status}`);
    assert.doesNotMatch(r.body, /Панель керування/);
  });

  test('A-03 RSC/flight request to /admin/training without cookie leaks nothing', async () => {
    const r = await get('/admin/training', { headers: { RSC: '1' } });
    assertRedirectsToLogin(r, 'RSC');
    assert.doesNotMatch(r.body, /price_/);
  });

  test('A-04 prefetch request to /admin without cookie leaks nothing', async () => {
    const r = await get('/admin', { headers: { RSC: '1', 'Next-Router-Prefetch': '1' } });
    assertRedirectsToLogin(r, 'prefetch');
  });

  test('A-05 GET /admin/login without cookie -> 200 with password form', async () => {
    const r = await get('/admin/login');
    assert.equal(r.status, 200);
    assert.match(r.body, /<input[^>]*type="password"[^>]*>/);
    assert.match(r.body, /name="password"/);
  });

  test('A-06 /ADMIN (upper case) is not an alternative entry point', async () => {
    const r = await get('/ADMIN');
    assert.ok([404, 307, 308].includes(r.status), `got ${r.status}`);
    assert.doesNotMatch(r.body, /Панель керування/);
  });
});

describe('Access control with forged / invalid tokens', () => {
  const cases = {
    'A-10 garbage cookie': async () => 'garbage',
    'A-11 empty cookie': async () => '',
    'A-12 token signed with a different secret': async () =>
      signToken({ secret: 'definitely-not-the-real-secret-123456' }),
    'A-13 expired token': async () => {
      const now = Math.floor(Date.now() / 1000);
      return signToken({ iat: now - 90000, exp: now - 3600 });
    },
    'A-14 alg=none token': async () => unsignedToken(),
    'A-15 HS512 token signed with the real secret': async () => signToken({ alg: 'HS512' }),
    'A-16 valid token with tampered payload': async () => {
      const t = await signToken();
      const [h, , s] = t.split('.');
      const p = Buffer.from(JSON.stringify({ role: 'admin', exp: 9999999999 })).toString('base64url');
      return `${h}.${p}.${s}`;
    },
  };

  for (const [name, makeToken] of Object.entries(cases)) {
    test(`${name} -> /admin and /admin/training redirect to login`, async () => {
      const token = await makeToken();
      assertRedirectsToLogin(await get('/admin', { token }), '/admin');
      assertRedirectsToLogin(await get('/admin/training', { token }), '/admin/training');
    });
  }
});

describe('Access control with a valid session', () => {
  test('A-20 valid token -> /admin renders the dashboard with logout button', async () => {
    const token = await signToken();
    const r = await get('/admin', { token });
    assert.equal(r.status, 200);
    assert.match(r.body, /Панель керування/);
    assert.match(r.body, /Вийти/);
  });

  test('A-21 valid token -> /admin/training renders the prices form', async () => {
    const token = await signToken();
    const r = await get('/admin/training', { token });
    assert.equal(r.status, 200);
    assert.match(r.body, /Редагування цін на тренування/);
    assert.match(r.body, /name="price_/);
  });

  test('A-22 valid token -> /admin/login redirects to /admin', async () => {
    const token = await signToken();
    const r = await get('/admin/login', { token });
    assert.ok([307, 308].includes(r.status), `got ${r.status}`);
    assert.match(r.location ?? '', /\/admin$/);
  });

  test('A-23 valid token -> unknown admin route returns 404 (not 500)', async () => {
    const token = await signToken();
    const r = await get('/admin/does-not-exist', { token });
    assert.equal(r.status, 404);
  });

  test('A-24 login page without session does not show the logout button', async () => {
    const r = await get('/admin/login');
    assert.doesNotMatch(r.body, />Вийти</);
  });
});
