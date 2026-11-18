import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getTrainingPrices,
  addTrainingPrice,
  updateTrainingPrices,
  deleteTrainingPrice,
} from '../../src/lib/prices.js';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // .env already loaded
}

const prisma = new PrismaClient();
const QA_PREFIX = `qa_ext_${crypto.randomBytes(3).toString('hex')}`;
const QA_PKG_1 = `${QA_PREFIX}_pkg1`;
const QA_SEC_1 = `${QA_PREFIX}_sec1`;
const QA_SUB_1 = `${QA_PREFIX}_sub1`;

before(async () => {
  // Clean up any stale QA records
  await prisma.trainingPrice.deleteMany({
    where: { id: { startsWith: 'qa_ext_' } },
  });
});

after(async () => {
  await prisma.trainingPrice.deleteMany({
    where: { id: { startsWith: 'qa_ext_' } },
  });
  await prisma.$disconnect();
});

describe('Training Prices: Comprehensive CRUD & Active/Inactive Feature', () => {
  test('T-01: addTrainingPrice creates items with isActive field', async () => {
    // 1. Create package with isActive = false (simulating new default)
    const res1 = await addTrainingPrice({
      id: QA_PKG_1,
      category: 'package',
      title: 'QA Пакет 1',
      description: 'Тестовий опис',
      price: 500,
      period: '/МІС',
      isActive: false,
      orderIndex: 901,
    });
    assert.equal(res1.count, 1);

    // 2. Create section with isActive = true
    const res2 = await addTrainingPrice({
      id: QA_SEC_1,
      category: 'section',
      title: 'QA Секція 1',
      description: 'Тестова секція',
      price: 1200,
      period: 'ГРН/МІС',
      color: '#ff991b',
      image: 'https://res.cloudinary.com/test/sections/s1.jpg',
      isActive: true,
      orderIndex: 902,
    });
    assert.equal(res2.count, 1);

    // 3. Create subscription with isActive = false
    const res3 = await addTrainingPrice({
      id: QA_SUB_1,
      category: 'subscription',
      title: 'QA Абонемент 1',
      price: 2000,
      period: 'ГРН',
      isActive: false,
      orderIndex: 903,
    });
    assert.equal(res3.count, 1);

    const foundPkg = await prisma.trainingPrice.findUnique({ where: { id: QA_PKG_1 } });
    assert.equal(foundPkg.isActive, false);

    const foundSec = await prisma.trainingPrice.findUnique({ where: { id: QA_SEC_1 } });
    assert.equal(foundSec.isActive, true);

    const foundSub = await prisma.trainingPrice.findUnique({ where: { id: QA_SUB_1 } });
    assert.equal(foundSub.isActive, false);
  });

  test('T-02: Public getTrainingPrices filters out inactive items', async () => {
    const publicPrices = await getTrainingPrices({ includeInactive: false });
    const pkgIds = publicPrices.all.map((p) => p.id);

    // Inactive QA_PKG_1 and QA_SUB_1 must NOT be visible on public site
    assert.equal(pkgIds.includes(QA_PKG_1), false, 'Inactive QA package should NOT be in public prices');
    assert.equal(pkgIds.includes(QA_SUB_1), false, 'Inactive QA subscription should NOT be in public prices');

    // Active QA_SEC_1 MUST be visible
    assert.equal(pkgIds.includes(QA_SEC_1), true, 'Active QA section MUST be in public prices');
  });

  test('T-03: Admin getTrainingPrices includes inactive items', async () => {
    const adminPrices = await getTrainingPrices({ includeInactive: true });
    const adminIds = adminPrices.all.map((p) => p.id);

    assert.equal(adminIds.includes(QA_PKG_1), true, 'Admin MUST see inactive package');
    assert.equal(adminIds.includes(QA_SEC_1), true, 'Admin MUST see active section');
    assert.equal(adminIds.includes(QA_SUB_1), true, 'Admin MUST see inactive subscription');
  });

  test('T-04: updateTrainingPrices activates an item and updates fields', async () => {
    await updateTrainingPrices([
      {
        id: QA_PKG_1,
        title: 'QA Пакет 1 Активований',
        price: 650,
        isActive: true,
      },
    ]);

    const updated = await prisma.trainingPrice.findUnique({ where: { id: QA_PKG_1 } });
    assert.equal(updated.title, 'QA Пакет 1 Активований');
    assert.equal(updated.price, 650);
    assert.equal(updated.isActive, true);

    // Now it should be visible in public getTrainingPrices()
    const publicPricesAfter = await getTrainingPrices({ includeInactive: false });
    assert.ok(publicPricesAfter.packages.some((p) => p.id === QA_PKG_1));
  });

  test('T-05: updateTrainingPrices deactivates an item', async () => {
    await updateTrainingPrices([
      {
        id: QA_SEC_1,
        isActive: false,
      },
    ]);

    const updated = await prisma.trainingPrice.findUnique({ where: { id: QA_SEC_1 } });
    assert.equal(updated.isActive, false);

    const publicPricesAfter = await getTrainingPrices({ includeInactive: false });
    assert.equal(publicPricesAfter.sections.some((s) => s.id === QA_SEC_1), false);
  });

  test('T-06: deleteTrainingPrice removes item completely from DB', async () => {
    const delRes = await deleteTrainingPrice(QA_SUB_1);
    assert.equal(delRes, true);

    const check = await prisma.trainingPrice.findUnique({ where: { id: QA_SUB_1 } });
    assert.equal(check, null);
  });

  test('T-07: deleteTrainingPrice on non-existing ID returns false without throwing', async () => {
    const delRes = await deleteTrainingPrice('ghost_id_12345');
    assert.equal(delRes, false);
  });
});
