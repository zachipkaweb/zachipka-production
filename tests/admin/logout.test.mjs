// Logout flow: logoutAction + deleteSession.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { assertServerUp, callAction, ACTIONS, signToken, findSetCookie } from './helpers.mjs';

before(assertServerUp);

function logout(token, opts = {}) {
  return callAction({ page: '/admin', actionId: ACTIONS.logout, args: [], token, ...opts });
}

describe('Logout', () => {
  test('LO-01 logout clears the cookie and redirects to /admin/login', async () => {
    const r = await logout(await signToken());
    const cookie = findSetCookie(r.setCookies);
    assert.ok(cookie, `no Set-Cookie for admin_session (status ${r.status})`);
    assert.equal(cookie.value, '');
    const expired =
      cookie.attributes['max-age'] === '0' || new Date(cookie.attributes.expires).getTime() < Date.now();
    assert.ok(expired, `cookie not expired: ${cookie.raw}`);
    assert.match(r.actionRedirect ?? r.location ?? '', /\/admin\/login/);
  });

  test('LO-02 deleted cookie keeps Path=/ so the browser really removes it', async () => {
    const r = await logout(await signToken());
    const cookie = findSetCookie(r.setCookies);
    assert.equal(cookie?.attributes.path, '/');
  });

  test('LO-04 logout from a foreign Origin is rejected (CSRF)', async () => {
    const r = await logout(await signToken(), { origin: 'https://evil.example' });
    assert.equal(findSetCookie(r.setCookies), null);
    assert.ok(r.status >= 400, `status ${r.status}`);
  });

  test('LO-05 logout without a session is harmless (redirect to login, no 5xx)', async () => {
    const r = await logout(undefined);
    assert.ok(r.status < 500, `status ${r.status}`);
  });
});
