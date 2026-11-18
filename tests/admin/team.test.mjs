import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTeam, addTeam, updateTeam, deleteTeam } from '../../src/lib/team.js';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // .env already loaded
}

const prisma = new PrismaClient();
const QA_ID_1 = `qa_test_team_${crypto.randomBytes(4).toString('hex')}`;
const QA_ID_2 = `qa_test_team_${crypto.randomBytes(4).toString('hex')}`;

let initialSnapshot = [];

before(async () => {
  // Snapshot existing team data
  initialSnapshot = await prisma.team.findMany({ orderBy: { id: 'asc' } });
});

after(async () => {
  // Clean up any QA records created during tests
  await prisma.team.deleteMany({
    where: {
      OR: [
        { id: { in: [QA_ID_1, QA_ID_2] } },
        { name: { startsWith: 'QA ' } },
      ],
    },
  });
  await prisma.$disconnect();
});

describe('Team DB Library (src/lib/team.js) Full Tests', () => {
  test('T-01: addTeam adds a single member with custom ID & orderIndex', async () => {
    const res = await addTeam({
      id: QA_ID_1,
      name: 'QA Тестовий Тренер 1',
      position: 'головний тренер',
      firstImage: 'https://res.cloudinary.com/test/image1.jpg',
      lastImage: 'https://res.cloudinary.com/test/image1_hover.jpg',
      orderIndex: 10,
    });

    assert.equal(res.count, 1, 'addTeam should return count: 1');

    const created = await prisma.team.findUnique({ where: { id: QA_ID_1 } });
    assert.ok(created, 'Record should exist in database');
    assert.equal(created.name, 'QA Тестовий Тренер 1');
    assert.equal(created.position, 'головний тренер');
    assert.equal(created.firstImage, 'https://res.cloudinary.com/test/image1.jpg');
    assert.equal(created.lastImage, 'https://res.cloudinary.com/test/image1_hover.jpg');
    assert.equal(created.orderIndex, 10);
  });

  test('T-02: addTeam supports array of members and skipDuplicates', async () => {
    const res = await addTeam([
      {
        id: QA_ID_2,
        name: 'QA Тестовий Тренер 2',
        position: 'інструктор',
        firstImage: 'https://res.cloudinary.com/test/image2.jpg',
        lastImage: 'https://res.cloudinary.com/test/image2_hover.jpg',
        orderIndex: 5,
      },
      {
        // Duplicate QA_ID_1 -> skipDuplicates must prevent unique constraint crash
        id: QA_ID_1,
        name: 'Duplicate QA',
        position: 'інструктор',
        firstImage: 'https://res.cloudinary.com/test/dup.jpg',
        lastImage: 'https://res.cloudinary.com/test/dup.jpg',
        orderIndex: 99,
      },
    ]);

    assert.equal(res.count, 1, 'Only 1 new member inserted due to skipDuplicates');
  });

  test('T-03: getTeam returns all members ordered by orderIndex asc', async () => {
    const all = await getTeam();
    assert.ok(Array.isArray(all), 'getTeam should return an array');
    assert.ok(all.length >= 2, 'Should contain at least the 2 QA members');

    const idx2 = all.findIndex((m) => m.id === QA_ID_2);
    const idx1 = all.findIndex((m) => m.id === QA_ID_1);

    assert.ok(idx2 !== -1 && idx1 !== -1, 'Both QA members should be present');
    assert.ok(idx2 < idx1, `QA_ID_2 (orderIndex 5) must come before QA_ID_1 (orderIndex 10)`);
  });

  test('T-04: updateTeam updates multiple fields atomically via transaction', async () => {
    const updateRes = await updateTeam([
      {
        id: QA_ID_1,
        name: 'QA Тренер Оновлений',
        position: 'старший тренер',
        orderIndex: 2,
      },
    ]);

    assert.ok(Array.isArray(updateRes), 'updateTeam should return updated records');
    const updated = await prisma.team.findUnique({ where: { id: QA_ID_1 } });
    assert.equal(updated.name, 'QA Тренер Оновлений');
    assert.equal(updated.position, 'старший тренер');
    assert.equal(updated.orderIndex, 2);
    assert.equal(updated.firstImage, 'https://res.cloudinary.com/test/image1.jpg');
  });

  test('T-05: updateTeam supports single object and handles empty inputs safely', async () => {
    const singleRes = await updateTeam({
      id: QA_ID_1,
      name: 'QA Тренер Single',
    });
    assert.ok(Array.isArray(singleRes), 'Should handle single object update');
    const check = await prisma.team.findUnique({ where: { id: QA_ID_1 } });
    assert.equal(check.name, 'QA Тренер Single');

    const emptyRes = await updateTeam([]);
    assert.deepEqual(emptyRes, [], 'Empty array should return []');
  });

  test('T-06: deleteTeam safely deletes by id and handles null/empty gracefully', async () => {
    assert.equal(await deleteTeam(null), false, 'deleteTeam(null) -> false');
    assert.equal(await deleteTeam(''), false, 'deleteTeam("") -> false');

    const deleted = await deleteTeam(QA_ID_2);
    assert.equal(deleted, true, 'deleteTeam(QA_ID_2) -> true');

    const check = await prisma.team.findUnique({ where: { id: QA_ID_2 } });
    assert.equal(check, null, 'Deleted member must not exist in DB');
  });

  test('T-07: deleteTeam deletes the second member', async () => {
    const deleted = await deleteTeam(QA_ID_1);
    assert.equal(deleted, true, 'deleteTeam(QA_ID_1) -> true');

    const check = await prisma.team.findUnique({ where: { id: QA_ID_1 } });
    assert.equal(check, null, 'Deleted member must not exist in DB');
  });

  test('T-08: supports Ukrainian letters (ї, є, і, ґ) and apostrophes without encoding corruption', async () => {
    const QA_SPECIAL_ID = `qa_special_${crypto.randomBytes(4).toString('hex')}`;
    const specialName = "Мар'ян-Ґеоргій Євгенович Їжак";
    const specialPos = "тренер-інструктор вищої категорії";

    await addTeam({
      id: QA_SPECIAL_ID,
      name: specialName,
      position: specialPos,
      firstImage: 'https://res.cloudinary.com/test/first.jpg',
      lastImage: 'https://res.cloudinary.com/test/last.jpg',
      orderIndex: 999,
    });

    const record = await prisma.team.findUnique({ where: { id: QA_SPECIAL_ID } });
    assert.ok(record, 'Record with Ukrainian characters must exist');
    assert.equal(record.name, specialName);
    assert.equal(record.position, specialPos);

    // Clean up
    await deleteTeam(QA_SPECIAL_ID);
  });

  test('T-09: Database Integrity - original team members remain untouched and intact', async () => {
    const current = await prisma.team.findMany({ orderBy: { id: 'asc' } });
    assert.deepEqual(
      current.map((c) => ({ id: c.id, name: c.name })),
      initialSnapshot.map((s) => ({ id: s.id, name: s.name })),
      'Database should only have original records after test suite'
    );
  });
});
