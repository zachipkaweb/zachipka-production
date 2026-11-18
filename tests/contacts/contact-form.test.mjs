import test, { describe, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '../..');
try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {}

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

async function assertServerUp() {
  try {
    await fetch(`${BASE_URL}/contacts`);
  } catch (err) {
    throw new Error(`Next.js server is not reachable at ${BASE_URL}: ${err.message}`);
  }
}

describe('Contact Form & Anti-Spam Security Suite', () => {
  before(async () => {
    await assertServerUp();
  });

  describe('Validation & Field Constraints', () => {
    test('CF-01: missing name is rejected with 400', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.1.1',
        },
        body: JSON.stringify({
          name: '',
          phone: '+380991234567',
          message: 'Тестове повідомлення',
          formLoadedAt: Date.now() - 5000,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /обов'язкові/i);
    });

    test('CF-02: missing phone is rejected with 400', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.1.2',
        },
        body: JSON.stringify({
          name: 'Тестер',
          phone: '',
          message: 'Тестове повідомлення',
          formLoadedAt: Date.now() - 5000,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /обов'язкові/i);
    });

    test('CF-02b: missing message is rejected with 400', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.1.25',
        },
        body: JSON.stringify({
          name: 'Тестер',
          phone: '+380991234567',
          message: '',
          formLoadedAt: Date.now() - 5000,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /обов'язкові/i);
    });

    test('CF-03: phone with too few digits (< 10) is rejected with 400', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.1.3',
        },
        body: JSON.stringify({
          name: 'Тестер',
          phone: '12345',
          message: 'Тестове повідомлення',
          formLoadedAt: Date.now() - 5000,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Введіть коректний номер телефону/i);
    });

    test('CF-04: phone with too many digits (> 15) is rejected with 400', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.1.4',
        },
        body: JSON.stringify({
          name: 'Тестер',
          phone: '+1234567890123456789',
          message: 'Тестове повідомлення',
          formLoadedAt: Date.now() - 5000,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Введіть коректний номер телефону/i);
    });
  });

  describe('Anti-Spam: Honeypot & Time-Trap', () => {
    test('CF-05: Honeypot trap: if company field is filled by bot, silently returns 200 without sending to Telegram', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.2.1',
        },
        body: JSON.stringify({
          name: 'Spam Bot',
          phone: '+380991234567',
          company: 'SEO & Casino Promotion Corp', // Bot populated hidden honeypot
          formLoadedAt: Date.now() - 5000,
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
    });

    test('CF-06: Time-trap: if submitted too quickly (< 2000ms), silently returns 200 without sending to Telegram', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.2.2',
        },
        body: JSON.stringify({
          name: 'Fast Script Bot',
          phone: '+380991234567',
          formLoadedAt: Date.now() - 300, // Submitted in 300ms
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
    });
  });

  describe('Anti-Spam: IP Rate Limiting', () => {
    test('CF-07: exceeding 5 requests within window triggers 429 Too Many Requests', async () => {
      // Dynamic IP to avoid collisions across multiple test runs
      const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;

      // First 5 requests should pass (either 200 honeypot or 400 validation, but not 429)
      for (let i = 0; i < 5; i++) {
        const res = await fetch(`${BASE_URL}/api/telegram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': testIp,
          },
          body: JSON.stringify({
            name: `User ${i}`,
            phone: '+380991234567',
            company: 'bot', // honeypot so we don't spam telegram
            formLoadedAt: Date.now() - 5000,
          }),
        });
        assert.equal(res.status, 200);
      }

      // The 6th request from the same IP must be rate-limited with 429
      const blockedRes = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({
          name: 'Spammer',
          phone: '+380991234567',
          formLoadedAt: Date.now() - 5000,
        }),
      });

      assert.equal(blockedRes.status, 429);
      const data = await blockedRes.json();
      assert.match(data.error, /Занадто багато спроб/i);
    });
  });

  describe('Real Delivery & Edge Cases', () => {
    test('CF-08: legitimate submission with Ukrainian phone and without email succeeds', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.3.1',
        },
        body: JSON.stringify({
          name: 'Олена Петренко',
          phone: '+380 (67) 123-45-67',
          email: '',
          message: 'Добрий день! Цікавить індивідуальне тренування.',
          formLoadedAt: Date.now() - 4000, // 4 seconds after page load
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
    });

    test('CF-09: message with special HTML characters (<, >, &) is delivered safely', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.3.2',
        },
        body: JSON.stringify({
          name: 'Іван & Партнер',
          phone: '0681234567',
          email: 'ivan@test.ua',
          message: 'Хочемо прийти удвох. Чи діє знижка < 50%?',
          formLoadedAt: Date.now() - 3500,
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
    });

    test('CF-10: malformed JSON returns 500 cleanly without process crash', async () => {
      const res = await fetch(`${BASE_URL}/api/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.3.3',
        },
        body: '{ malformed json: true, ',
      });

      assert.equal(res.status, 500);
      const data = await res.json();
      assert.match(data.error, /Не вдалося відправити/i);
    });
  });

  describe('Contacts Page HTML & Accessibility', () => {
    test('CF-11: /contacts page contains the contact-form, inputs, and honeypot field', async () => {
      const res = await fetch(`${BASE_URL}/contacts`);
      assert.equal(res.status, 200);
      const html = await res.text();

      // Form with contact-form class
      assert.match(html, /class="[^"]*contact-form/);
      // Input fields
      assert.match(html, /name="name"/);
      assert.match(html, /name="phone"/);
      assert.match(html, /name="email"/);
      assert.match(html, /name="company"/); // Honeypot
      assert.match(html, /maxLength="500"|maxlength="500"/); // Message length limit
    });
  });
});
