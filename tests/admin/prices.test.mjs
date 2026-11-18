// updateTrainingPricesAction: authorization, validation, atomicity.
//
// All writes go to a temporary QA row (category "qa_test") that is invisible on the
// public site (the site only renders package/section/subscription) and is deleted
// afterwards. Real prices are snapshotted and verified to be untouched.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  assertServerUp, callAction, ACTIONS, signToken, getPrisma, disconnectPrisma, QA_CATEGORY,
} from './helpers.mjs';

const QA_ID = `qa_${crypto.randomBytes(4).toString('hex')}`;
const QA_ID_2 = `${QA_ID}_b`;
const START_PRICE = 100;

let prisma;
let token;
let realSnapshot;

before(async () => {
  await assertServerUp();
  prisma = await getPrisma();
  token = await signToken();
  realSnapshot = await prisma.trainingPrice.findMany({
    where: { NOT: { category: QA_CATEGORY } },
    select: { id: true, price: true },
    orderBy: { id: 'asc' },
  });
  for (const id of [QA_ID, QA_ID_2]) {
    await prisma.trainingPrice.create({
      data: { id, category: QA_CATEGORY, title: 'QA test row (auto-deleted)', price: START_PRICE, orderIndex: 999 },
    });
  }
});

after(async () => {
  await prisma?.trainingPrice.deleteMany({ where: { id: { in: [QA_ID, QA_ID_2] } } });
  await disconnectPrisma();
});

async function resetQa() {
  await prisma.trainingPrice.updateMany({ where: { id: { in: [QA_ID, QA_ID_2] } }, data: { price: START_PRICE } });
}

async function qaPrice(id = QA_ID) {
  return (await prisma.trainingPrice.findUnique({ where: { id } })).price;
}

function save(fields, { page = '/admin/training', tok = token, origin } = {}) {
  return callAction({
    page,
    actionId: ACTIONS.updatePrices,
    args: [{ formData: Object.entries(fields) }],
    token: tok,
    origin,
  });
}

describe('Prices action: authorization', () => {
  test('P-01 no session (via /admin/training) -> nothing saved', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '555' }, { tok: null });
    assert.notEqual(r.result?.success, true);
    assert.equal(await qaPrice(), START_PRICE);
  });

  test('P-02 no session, action posted to a public page "/" (proxy not involved) -> rejected by the action itself', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '556' }, { tok: null, page: '/' });
    assert.notEqual(r.result?.success, true);
    assert.equal(await qaPrice(), START_PRICE);
  });

  test('P-03 forged token (wrong secret) via public page -> rejected', async () => {
    await resetQa();
    const forged = await signToken({ secret: 'wrong-secret-wrong-secret-wrong-123' });
    const r = await save({ [`price_${QA_ID}`]: '557' }, { tok: forged, page: '/' });
    assert.match(r.result?.error ?? '', /Неавторизований/);
    assert.equal(await qaPrice(), START_PRICE);
  });

  test('P-04 [UX] expired session while editing -> readable error instead of a redirect to an HTML page', async () => {
    // In the browser the action is POSTed to /admin/training. With an expired cookie proxy.js
    // answers 307 -> /admin/login (HTML), so the client never receives { error } and the
    // form throws "An unexpected response was received from the server".
    await resetQa();
    const now = Math.floor(Date.now() / 1000);
    const expired = await signToken({ iat: now - 90000, exp: now - 10 });
    const r = await save({ [`price_${QA_ID}`]: '558' }, { tok: expired });
    assert.equal(await qaPrice(), START_PRICE);
    assert.ok(
      r.result?.error,
      `action returned no readable error (HTTP ${r.status}${r.location ? ' -> ' + r.location : ''})`
    );
  });

  test('P-05 foreign Origin (CSRF) -> rejected, nothing saved', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '559' }, { origin: 'https://evil.example' });
    assert.ok(r.status >= 400, `status ${r.status}`);
    assert.equal(await qaPrice(), START_PRICE);
  });
});

describe('Prices action: happy path', () => {
  test('P-10 valid integer price is saved', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '250' });
    assert.deepEqual(r.result, { success: true });
    assert.equal(await qaPrice(), 250);
  });

  test('P-11 several prices saved in one request', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '300', [`price_${QA_ID_2}`]: '400' });
    assert.deepEqual(r.result, { success: true });
    assert.equal(await qaPrice(QA_ID), 300);
    assert.equal(await qaPrice(QA_ID_2), 400);
  });

  test('P-12 non price_* fields are ignored', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '310', title_x: 'hack', category: 'x' });
    assert.deepEqual(r.result, { success: true });
    assert.equal(await qaPrice(), 310);
  });

  test('P-13 updatedAt changes after save', async () => {
    const before = (await prisma.trainingPrice.findUnique({ where: { id: QA_ID } })).updatedAt;
    await new Promise((r) => setTimeout(r, 20));
    await save({ [`price_${QA_ID}`]: '320' });
    const afterTs = (await prisma.trainingPrice.findUnique({ where: { id: QA_ID } })).updatedAt;
    assert.ok(afterTs > before);
  });
});

describe('Prices action: validation', () => {
  const rejected = {
    'P-20 negative number': '-10',
    'P-21 empty string': '',
    'P-22 letters': 'abc',
    'P-23 whitespace only': '   ',
  };
  for (const [name, value] of Object.entries(rejected)) {
    test(`${name} (${JSON.stringify(value)}) -> error, nothing saved`, async () => {
      await resetQa();
      const r = await save({ [`price_${QA_ID}`]: value });
      assert.match(r.result?.error ?? '', /Некоректна ціна/);
      assert.equal(await qaPrice(), START_PRICE);
    });
  }

  test('P-24 [bug] "12abc" must be rejected (parseInt silently saves 12)', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '12abc' });
    assert.equal(await qaPrice(), START_PRICE, `saved ${await qaPrice()} for "12abc"`);
    assert.ok(r.result?.error);
  });

  test('P-25 [bug] "1e3" (valid for <input type=number>) must be 1000 or rejected, not 1', async () => {
    await resetQa();
    await save({ [`price_${QA_ID}`]: '1e3' });
    const saved = await qaPrice();
    assert.ok(saved === 1000 || saved === START_PRICE, `saved ${saved} UAH for "1e3"`);
  });

  test('P-26 [bug] fractional "99.9" must be rejected, not truncated to 99', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '99.9' });
    assert.equal(await qaPrice(), START_PRICE, `saved ${await qaPrice()} for "99.9"`);
    assert.ok(r.result?.error);
  });

  test('P-27 value above INT4 range -> error, nothing saved', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '3000000000' });
    assert.ok(r.result?.error);
    assert.equal(await qaPrice(), START_PRICE);
  });

  test('P-28 [validation] error for out-of-range value names the field (not a generic DB failure)', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '3000000000' });
    assert.match(r.result?.error ?? '', /Некоректна ціна/, `got: "${r.result?.error}"`);
  });

  test('P-29 no price_* fields -> "Дані для оновлення не знайдено."', async () => {
    const r = await save({ foo: 'bar' });
    assert.equal(r.result?.error, 'Дані для оновлення не знайдено.');
  });

  test('P-30 unknown id -> error, no rows created', async () => {
    const ghost = `${QA_ID}_ghost`;
    const r = await save({ [`price_${ghost}`]: '100' });
    assert.ok(r.result?.error);
    assert.equal(await prisma.trainingPrice.findUnique({ where: { id: ghost } }), null);
  });

  test('P-31 atomicity: one bad id rolls back the whole batch', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '777', [`price_${QA_ID}_ghost`]: '100' });
    assert.ok(r.result?.error);
    assert.equal(await qaPrice(), START_PRICE, 'partial update was committed');
  });

  test('P-32 atomicity: one invalid value rejects the batch before any write', async () => {
    await resetQa();
    const r = await save({ [`price_${QA_ID}`]: '777', [`price_${QA_ID_2}`]: '-1' });
    assert.ok(r.result?.error);
    assert.equal(await qaPrice(QA_ID), START_PRICE);
  });

  test('P-33 SQL-ish id is handled safely', async () => {
    const r = await save({ ["price_x' OR '1'='1"]: '1' });
    assert.ok(r.result?.error);
    assert.equal(await qaPrice(), START_PRICE);
  });

  test('P-34 [validation] item id in the error message is reflected as plain data', async () => {
    const r = await save({ ['price_<img src=x onerror=alert(1)>']: 'abc' });
    // React escapes it when rendering; here we only check the server does not crash.
    assert.match(r.result?.error ?? '', /Некоректна ціна/);
  });
});

describe('Prices action: side effects', () => {
  test('P-40 real prices were not modified by this suite', async () => {
    const now = await prisma.trainingPrice.findMany({
      where: { NOT: { category: QA_CATEGORY } },
      select: { id: true, price: true },
      orderBy: { id: 'asc' },
    });
    assert.deepEqual(now, realSnapshot);
  });
});
