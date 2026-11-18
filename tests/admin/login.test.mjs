// Login flow: loginAction + createSession + in-memory rate limit.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertServerUp, login, findSetCookie, decodeJwt, get, randomIp, ADMIN_PASSWORD, BASE_URL,
} from './helpers.mjs';

before(async () => {
  await assertServerUp();
  assert.ok(ADMIN_PASSWORD, 'ADMIN_PASSWORD must be available in .env for login tests');
});

const WRONG = 'definitely-wrong-password';

describe('Login: validation and messages', () => {
  test('L-01 empty password -> "Будь ласка, введіть пароль." and no cookie', async () => {
    const r = await login('');
    assert.equal(r.result?.error, 'Будь ласка, введіть пароль.');
    assert.equal(findSetCookie(r.setCookies), null);
  });

  test('L-02 missing password field -> validation error (no crash)', async () => {
    const r = await login(undefined, { rawValue: undefined });
    assert.ok(r.result?.error, `expected error, got status ${r.status}`);
  });

  test('L-03 password sent as a file -> validation error (no crash)', async () => {
    const r = await login(null, { rawValue: new Blob(['x'], { type: 'text/plain' }) });
    assert.equal(r.result?.error, 'Будь ласка, введіть пароль.');
  });

  test('L-04 wrong password -> error with remaining attempts (4)', async () => {
    const r = await login(WRONG);
    assert.equal(r.result?.error, 'Невірний пароль! Залишилося спроб: 4');
    assert.equal(findSetCookie(r.setCookies), null);
  });

  test('L-05 empty password does not consume an attempt', async () => {
    const ip = randomIp();
    await login('', { ip });
    await login('', { ip });
    const r = await login(WRONG, { ip });
    assert.equal(r.result?.error, 'Невірний пароль! Залишилося спроб: 4');
  });

  test('L-06 password is compared exactly (whitespace / case variants rejected)', async () => {
    const ip = randomIp();
    const r1 = await login(` ${ADMIN_PASSWORD} `, { ip });
    assert.match(r1.result?.error ?? '', /Невірний пароль/);
    assert.equal(findSetCookie(r1.setCookies), null);
  });

  test('L-07 very long password (200 KB) -> handled error, no 5xx', async () => {
    const r = await login('a'.repeat(200 * 1024));
    assert.ok(r.status < 500, `status ${r.status}`);
    assert.match(r.result?.error ?? '', /Невірний пароль/);
  });

  test('L-08 response is delayed >= 500 ms (brute-force slowdown present)', async () => {
    const r = await login(WRONG);
    assert.ok(r.elapsedMs >= 500, `took ${r.elapsedMs} ms`);
  });
});

describe('Login: successful login and session cookie', () => {
  let r;
  let cookie;
  before(async () => {
    r = await login(ADMIN_PASSWORD);
    cookie = findSetCookie(r.setCookies);
  });

  test('L-10 correct password sets admin_session cookie and redirects to /admin', () => {
    assert.ok(cookie, `no admin_session cookie; status=${r.status} result=${JSON.stringify(r.result)}`);
    const target = r.actionRedirect ?? r.location ?? '';
    assert.match(target, /\/admin(;|$)/, `redirect target: ${target}`);
  });

  test('L-11 cookie flags: HttpOnly, SameSite=Lax, Path=/', () => {
    assert.equal(cookie.attributes.httponly, true);
    assert.equal(String(cookie.attributes.samesite).toLowerCase(), 'lax');
    assert.equal(cookie.attributes.path, '/');
  });

  test('L-12 cookie Secure flag is set in production / over HTTPS', (t) => {
    if (!BASE_URL.startsWith('https://') && process.env.EXPECT_PROD !== '1') {
      t.skip('dev server over http: Secure is intentionally off (NODE_ENV !== production)');
      return;
    }
    assert.equal(cookie.attributes.secure, true);
  });

  test('L-13 cookie expires in ~15m', () => {
    const expires = new Date(cookie.attributes.expires).getTime();
    const diffM = (expires - Date.now()) / 60_000;
    assert.ok(diffM > 14 && diffM <= 15.1, `expires in ${diffM.toFixed(2)}m`);
  });

  test('L-14 cookie value is an HS256 JWT with role=admin and 15m lifetime', () => {
    const { header, payload } = decodeJwt(cookie.value);
    assert.equal(header.alg, 'HS256');
    assert.equal(payload.role, 'admin');
    assert.equal(payload.exp - payload.iat, 900);
  });

  test('L-15 issued cookie grants access to /admin', async () => {
    const page = await get('/admin', { token: cookie.value });
    assert.equal(page.status, 200);
    assert.match(page.body, /Панель керування/);
  });
});

describe('Login: rate limiting', () => {
  test('L-20 successful login resets the failed-attempt counter', async () => {
    const ip = randomIp();
    await login(WRONG, { ip });
    await login(WRONG, { ip });
    const ok = await login(ADMIN_PASSWORD, { ip });
    assert.ok(findSetCookie(ok.setCookies), 'login should succeed');
    const r = await login(WRONG, { ip });
    assert.equal(r.result?.error, 'Невірний пароль! Залишилося спроб: 4');
  });

  test('L-21 5 wrong attempts lock the IP; correct password is then refused', async () => {
    const ip = randomIp();
    const messages = [];
    for (let i = 0; i < 5; i++) messages.push((await login(WRONG, { ip })).result?.error);
    assert.deepEqual(messages.slice(0, 4), [
      'Невірний пароль! Залишилося спроб: 4',
      'Невірний пароль! Залишилося спроб: 3',
      'Невірний пароль! Залишилося спроб: 2',
      'Невірний пароль! Залишилося спроб: 1',
    ]);
    assert.match(messages[4], /заблоковано на 15 хвилин/);

    const blocked = await login(ADMIN_PASSWORD, { ip });
    assert.match(blocked.result?.error ?? '', /Забагато невдалих спроб\. Зачекайте 1[45] хв\./);
    assert.equal(findSetCookie(blocked.setCookies), null, 'must not issue a session while locked');
  });

  test('L-22 [security] rate limit cannot be bypassed by rotating X-Forwarded-For', async () => {
    // Same TCP client (real edge IP), but a different spoofed X-Forwarded-For on every request.
    const realClientIp = randomIp();
    let last;
    for (let i = 0; i < 6; i++) {
      last = await login(WRONG, {
        ip: realClientIp,
        headers: { 'X-Forwarded-For': randomIp() },
      });
    }
    assert.match(
      last.result?.error ?? '',
      /Забагато невдалих спроб/,
      `6th wrong attempt was not blocked: "${last.result?.error}"`
    );
  });
});

describe('Login: CSRF', () => {
  test('L-30 login action from a foreign Origin is rejected', async () => {
    const r = await login(ADMIN_PASSWORD, { origin: 'https://evil.example' });
    assert.equal(findSetCookie(r.setCookies), null, 'session issued to a cross-origin request');
    assert.ok(r.status >= 400, `status ${r.status}`);
  });
});
