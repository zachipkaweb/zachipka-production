// Unit tests for src/lib/auth.js (JWT encrypt/decrypt). No server required.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { signToken, unsignedToken, decodeJwt, SESSION_SECRET } from './helpers.mjs';

// `next` has no "exports" map, so plain Node ESM can't resolve "next/headers" without
// the extension (Next's bundler can). Map it so auth.js can be imported as-is.
registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === 'next/headers' ? 'next/headers.js' : specifier, context);
  },
});

const { encrypt, decrypt } = await import('../../src/lib/auth.js');

describe('lib/auth: encrypt / decrypt', () => {
  test('U-01 round-trip keeps payload and sets iat + 15m exp', async () => {
    const token = await encrypt({ role: 'admin' });
    const payload = await decrypt(token);
    assert.equal(payload.role, 'admin');
    assert.equal(payload.exp - payload.iat, 15 * 60);
    assert.equal(decodeJwt(token).header.alg, 'HS256');
  });

  test('U-02 garbage token -> null', async () => {
    assert.equal(await decrypt('not-a-jwt'), null);
    assert.equal(await decrypt(''), null);
    assert.equal(await decrypt(undefined), null);
  });

  test('U-03 token signed with another secret -> null', async () => {
    const token = await signToken({ secret: 'some-other-secret-value-1234567890' });
    assert.equal(await decrypt(token), null);
  });

  test('U-04 expired token -> null', async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = await signToken({ iat: now - 7200, exp: now - 3600 });
    assert.equal(await decrypt(token), null);
  });

  test('U-05 alg=none token -> null', async () => {
    assert.equal(await decrypt(unsignedToken()), null);
  });

  test('U-06 HS512 token with the right secret -> null (algorithm pinned to HS256)', async () => {
    const token = await signToken({ alg: 'HS512' });
    assert.equal(await decrypt(token), null);
  });

  test('U-07 tampered payload (signature kept) -> null', async () => {
    const token = await encrypt({ role: 'admin' });
    const [h, , s] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ role: 'admin', exp: 9999999999 })).toString('base64url');
    assert.equal(await decrypt(`${h}.${forged}.${s}`), null);
  });

  test('U-08 [hardening] token WITHOUT exp claim must be rejected', async () => {
    // jose's jwtVerify accepts tokens without `exp` unless `requiredClaims: ['exp']` is set.
    // Such a token (e.g. minted with a leaked secret) would never expire.
    const token = await signToken({ exp: null });
    assert.equal(await decrypt(token), null, 'token without exp is accepted forever');
  });

  test('U-09 missing SESSION_SECRET -> encrypt throws a clear error', async () => {
    const saved = process.env.SESSION_SECRET;
    delete process.env.SESSION_SECRET;
    try {
      await assert.rejects(() => encrypt({ role: 'admin' }), /SESSION_SECRET is not defined/);
    } finally {
      process.env.SESSION_SECRET = saved;
    }
  });

  test('U-10 SESSION_SECRET is at least 32 characters', () => {
    assert.ok(SESSION_SECRET && SESSION_SECRET.length >= 32, 'HS256 secret should be >= 32 chars');
  });

  test('U-11 ADMIN_PASSWORD is strong (>= 12 chars, not digits only)', () => {
    const pwd = process.env.ADMIN_PASSWORD ?? '';
    assert.ok(pwd.length >= 12, `ADMIN_PASSWORD is only ${pwd.length} chars long`);
    assert.ok(!/^\d+$/.test(pwd), 'ADMIN_PASSWORD consists of digits only');
  });
});
