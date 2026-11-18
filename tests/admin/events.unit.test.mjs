import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatEventDate } from '../../src/lib/dates.js';
import { slugify } from '../../src/lib/slugify.js';

describe('formatEventDate unit tests', () => {
  test('single date short format', () => {
    assert.equal(formatEventDate('2026-11-11', null, { mode: 'short' }), '11.11.26');
  });

  test('single date long format (default)', () => {
    assert.equal(formatEventDate('2026-03-22'), '22.03.2026');
  });

  test('date range within the same month (short)', () => {
    assert.equal(
      formatEventDate('2027-01-01', '2027-01-02', { mode: 'short' }),
      '01-02.01.27'
    );
  });

  test('date range within the same month (long)', () => {
    assert.equal(
      formatEventDate('2026-03-22', '2026-03-23', { mode: 'long' }),
      '22-23.03.2026'
    );
  });

  test('date range across different months', () => {
    assert.equal(
      formatEventDate('2026-03-30', '2026-04-02', { mode: 'short' }),
      '30.03-02.04.26'
    );
  });

  test('same start and end date returns single date', () => {
    assert.equal(
      formatEventDate('2026-03-22', '2026-03-22', { mode: 'short' }),
      '22.03.26'
    );
  });

  test('empty or invalid input returns empty string', () => {
    assert.equal(formatEventDate(null), '');
    assert.equal(formatEventDate('not-a-date'), '');
  });
});

describe('slugify unit tests', () => {
  test('transliterates Ukrainian letters correctly', () => {
    assert.equal(slugify('Всеукраїнські змагання'), 'vseukrayinski-zmahannya');
    assert.equal(slugify('Чемпіонат Львова з боулдерингу'), 'chempionat-lvova-z-boulderynhu');
  });

  test('handles apostrophes, symbols, and hyphens', () => {
    assert.equal(slugify("П'ять скель!"), 'pyat-skel');
    assert.equal(slugify('Подія #1 - 2026'), 'podiya-1-2026');
  });

  test('handles empty or non-string input', () => {
    assert.equal(slugify(''), '');
    assert.equal(slugify(null), '');
  });
});
