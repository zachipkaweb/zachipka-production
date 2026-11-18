import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  assertServerUp,
  callAction,
  ACTIONS,
  signToken,
  get,
  getPrisma,
  disconnectPrisma,
} from './helpers.mjs';

const QA_UP_ID = `qa_up_${crypto.randomBytes(4).toString('hex')}`;
const QA_PAST_ID = `qa_past_${crypto.randomBytes(4).toString('hex')}`;
const QA_PAST_SLUG = `qa-slug-${crypto.randomBytes(4).toString('hex')}`;

let prisma;
let token;
let snapshotUpcoming;
let snapshotPast;

before(async () => {
  await assertServerUp();
  prisma = await getPrisma();
  token = await signToken();

  snapshotUpcoming = await prisma.uncomingEvents.findMany({ orderBy: { id: 'asc' } });
  snapshotPast = await prisma.pastEvents.findMany({ orderBy: { id: 'asc' } });

  await prisma.uncomingEvents.create({
    data: {
      id: QA_UP_ID,
      title: 'QA Upcoming Event',
      shortDescription: 'QA desc',
      eventDate: new Date('2026-05-10T00:00:00.000Z'),
      isInCrm: false,
      crmUrl: '',
      isActive: false,
    },
  });

  await prisma.pastEvents.create({
    data: {
      id: QA_PAST_ID,
      slug: QA_PAST_SLUG,
      title: 'QA Past Event',
      eventDate: new Date('2026-01-10T00:00:00.000Z'),
      coverImage: '/images/events/events-hero.webp',
      shortDescription: 'QA past short',
      content: 'QA past content',
      gallery: ['/images/events/events-hero.webp'],
      isFeatured: false,
    },
  });
});

after(async () => {
  if (prisma && snapshotUpcoming && snapshotPast) {
    const keepUpIds = snapshotUpcoming.map((e) => e.id);
    const keepPastIds = snapshotPast.map((e) => e.id);
    await prisma.uncomingEvents.deleteMany({ where: { id: { notIn: keepUpIds } } });
    await prisma.pastEvents.deleteMany({ where: { id: { notIn: keepPastIds } } });
  }
  await disconnectPrisma();
});

function updateEvents(type, fields, { page = '/admin/events', tok = token, origin } = {}) {
  return callAction({
    page,
    actionId: ACTIONS.updateEvents,
    args: [type, { formData: Object.entries(fields) }],
    token: tok,
    origin,
  });
}

function addEvent(type, { page = '/admin/events', tok = token, origin } = {}) {
  return callAction({
    page,
    actionId: ACTIONS.addEvent,
    args: [type],
    token: tok,
    origin,
  });
}

function deleteEvent(type, id, { page = '/admin/events', tok = token, origin } = {}) {
  return callAction({
    page,
    actionId: ACTIONS.deleteEvent,
    args: [type, id],
    token: tok,
    origin,
  });
}

describe('Events actions: authorization', () => {
  test('E-01 updateEventsAction without session -> rejected', async () => {
    const r = await updateEvents('upcoming', { [`title_${QA_UP_ID}`]: 'Hacked' }, { tok: null });
    assert.notEqual(r.result?.success, true);
    const row = await prisma.uncomingEvents.findUnique({ where: { id: QA_UP_ID } });
    assert.equal(row.title, 'QA Upcoming Event');
  });

  test('E-02 addEventAction without session -> rejected', async () => {
    const beforeCount = await prisma.uncomingEvents.count();
    const r = await addEvent('upcoming', { tok: null });
    assert.notEqual(r.result?.success, true);
    assert.equal(await prisma.uncomingEvents.count(), beforeCount);
  });

  test('E-03 deleteEventAction without session -> rejected', async () => {
    const r = await deleteEvent('upcoming', QA_UP_ID, { tok: null });
    assert.notEqual(r.result?.success, true);
    assert.ok(await prisma.uncomingEvents.findUnique({ where: { id: QA_UP_ID } }));
  });

  test('E-04 unknown type is rejected by all 3 actions', async () => {
    const r1 = await updateEvents('invalid', { [`title_${QA_UP_ID}`]: 'X' });
    const r2 = await addEvent('invalid');
    const r3 = await deleteEvent('invalid', QA_UP_ID);
    assert.match(r1.result?.error ?? '', /Невідомий тип/);
    assert.match(r2.result?.error ?? '', /Невідомий тип/);
    assert.match(r3.result?.error ?? '', /Невідомий тип/);
  });
});

describe('Events actions: add & delete', () => {
  test('E-10 addEventAction("upcoming") creates a new upcoming event and deleteEventAction removes it', async () => {
    const beforeIds = new Set((await prisma.uncomingEvents.findMany({ select: { id: true } })).map((x) => x.id));
    const addRes = await addEvent('upcoming');
    assert.deepEqual(addRes.result, { success: true });

    const afterRows = await prisma.uncomingEvents.findMany();
    const created = afterRows.find((x) => !beforeIds.has(x.id));
    assert.ok(created, 'newly added upcoming event was not found in DB');
    assert.equal(created.title, 'Нова подія');
    assert.equal(created.isActive, false);

    const delRes = await deleteEvent('upcoming', created.id);
    assert.deepEqual(delRes.result, { success: true });
    assert.equal(await prisma.uncomingEvents.findUnique({ where: { id: created.id } }), null);
  });

  test('E-11 addEventAction("past") creates a new past event and deleteEventAction removes it', async () => {
    const beforeIds = new Set((await prisma.pastEvents.findMany({ select: { id: true } })).map((x) => x.id));
    const addRes = await addEvent('past');
    assert.deepEqual(addRes.result, { success: true });

    const afterRows = await prisma.pastEvents.findMany();
    const created = afterRows.find((x) => !beforeIds.has(x.id));
    assert.ok(created, 'newly added past event was not found in DB');
    assert.equal(created.title, 'Нова минула подія');
    assert.equal(created.isFeatured, false);

    // Check if public /events page still renders 200 and inactive draft past event has no public URL (404)
    const pubEvents = await get('/events');
    assert.equal(pubEvents.status, 200, '/events crashed after adding a draft past event');

    const slugPage = await get(`/events/${created.slug}`);
    assert.equal(
      slugPage.status,
      404,
      `Inactive past event /events/${created.slug} should return 404 (got ${slugPage.status})`
    );

    const delRes = await deleteEvent('past', created.id);
    assert.deepEqual(delRes.result, { success: true });
    assert.equal(await prisma.pastEvents.findUnique({ where: { id: created.id } }), null);
  });

  test('E-12 deleteEventAction with empty id or unknown id returns error', async () => {
    const rEmpty = await deleteEvent('upcoming', '');
    assert.match(rEmpty.result?.error ?? '', /ID події не вказано/);

    const rGhost = await deleteEvent('upcoming', 'non_existent_id_12345');
    assert.ok(rGhost.result?.error);
  });
});

describe('Events actions: update & validation', () => {
  test('E-20 update upcoming event saves all fields and boolean flags', async () => {
    const r = await updateEvents('upcoming', {
      [`title_${QA_UP_ID}`]: 'Updated Upcoming Title',
      [`eventDate_${QA_UP_ID}`]: '2027-06-20',
      [`shortDescription_${QA_UP_ID}`]: 'New short desc',
      [`crmUrl_${QA_UP_ID}`]: 'https://crm.example/1',
      [`isInCrm_${QA_UP_ID}`]: 'on',
      [`isActive_${QA_UP_ID}`]: 'on',
    });
    assert.deepEqual(r.result, { success: true });

    const row = await prisma.uncomingEvents.findUnique({ where: { id: QA_UP_ID } });
    assert.equal(row.title, 'Updated Upcoming Title');
    assert.equal(row.shortDescription, 'New short desc');
    assert.equal(row.crmUrl, 'https://crm.example/1');
    assert.equal(row.isInCrm, true);
    assert.equal(row.isActive, true);
  });

  test('E-21 omitting checkbox fields sets isInCrm=false, isActive=false', async () => {
    const r = await updateEvents('upcoming', {
      [`title_${QA_UP_ID}`]: 'Updated Upcoming Title',
      [`eventDate_${QA_UP_ID}`]: '2026-06-20',
    });
    assert.deepEqual(r.result, { success: true });
    const row = await prisma.uncomingEvents.findUnique({ where: { id: QA_UP_ID } });
    assert.equal(row.isInCrm, false);
    assert.equal(row.isActive, false);
  });

  test('E-22 update past event saves all fields, generates slug with date, and splits gallery URLs', async () => {
    const r = await updateEvents('past', {
      [`title_${QA_PAST_ID}`]: 'Updated Past Title',
      [`eventDate_${QA_PAST_ID}`]: '2026-01-15',
      [`coverImage_${QA_PAST_ID}`]: '/images/events/events-hero.webp',
      [`shortDescription_${QA_PAST_ID}`]: 'Past short',
      [`content_${QA_PAST_ID}`]: 'Full report text',
      [`gallery_${QA_PAST_ID}`]: '/images/events/events-hero.webp\n/images/events/events-hero.webp',
      [`isFeatured_${QA_PAST_ID}`]: 'on',
    });
    assert.deepEqual(r.result, { success: true });

    const row = await prisma.pastEvents.findUnique({ where: { id: QA_PAST_ID } });
    assert.equal(row.title, 'Updated Past Title');
    assert.equal(row.slug, 'updated-past-title-2026-01-15');
    assert.equal(row.gallery.length, 2);
    assert.equal(row.isFeatured, true);
  });

  test('E-22b activating a past event without coverImage is rejected', async () => {
    const r = await updateEvents('past', {
      [`title_${QA_PAST_ID}`]: 'No Cover Past Event',
      [`eventDate_${QA_PAST_ID}`]: '2026-01-15',
      [`coverImage_${QA_PAST_ID}`]: '',
      [`isFeatured_${QA_PAST_ID}`]: 'on',
    });
    assert.match(r.result?.error ?? '', /без обкладинки/);
  });

  test('E-23 empty required fields are rejected', async () => {
    const r1 = await updateEvents('upcoming', {
      [`title_${QA_UP_ID}`]: '   ',
      [`eventDate_${QA_UP_ID}`]: '2026-05-10',
    });
    assert.match(r1.result?.error ?? '', /Назва/);

    const r3 = await updateEvents('upcoming', {
      [`title_${QA_UP_ID}`]: 'Valid',
      [`eventDate_${QA_UP_ID}`]: 'not-a-date',
    });
    assert.match(r3.result?.error ?? '', /Некоректна дата/);
  });

  test('E-24 [UX] after addEventAction, saving the form without editing the newly added card should not fail validation', async () => {
    const beforeIds = new Set((await prisma.uncomingEvents.findMany({ select: { id: true } })).map((x) => x.id));
    await addEvent('upcoming');
    const created = (await prisma.uncomingEvents.findMany()).find((x) => !beforeIds.has(x.id));
    assert.ok(created);

    try {
      const saveRes = await updateEvents('upcoming', {
        [`title_${created.id}`]: created.title,
        [`eventDate_${created.id}`]: created.eventDate.toISOString().split('T')[0],
        [`shortDescription_${created.id}`]: created.shortDescription,
        [`crmUrl_${created.id}`]: created.crmUrl,
      });
      assert.deepEqual(
        saveRes.result,
        { success: true },
        `Newly created upcoming event has invalid default fields that fail on save: ${saveRes.result?.error}`
      );
    } finally {
      await prisma.uncomingEvents.delete({ where: { id: created.id } }).catch(() => {});
    }
  });
});

describe('Admin events page markup', () => {
  test('E-30 /admin/events renders 200 and has no stray trailing dot outside the form', async () => {
    const r = await get('/admin/events', { token });
    assert.equal(r.status, 200);
    assert.match(r.body, /Редагування подій/);
    assert.doesNotMatch(r.body, /<\/form><\/div>\.<\/div>/, 'Stray dot "." after <EventsForm /> in src/app/admin/events/page.js');
  });
});
