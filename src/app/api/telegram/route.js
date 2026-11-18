/**
 * Telegram Notification API Route
 * Processes contact form submissions and delivers alerts directly to a configured Telegram chat.
 * Implements defensive measures against abuse:
 * - In-memory IP rate limiting (max 5 requests per 15 minutes)
 * - Honeypot field trap for automated crawlers
 * - Time-trap check to detect sub-human submission speeds (< 2s)
 * - Input length constraints and HTML entity escaping to prevent injection
 */

import { NextResponse } from 'next/server';

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// In-memory IP rate limiter: max 5 requests per 15 minutes per IP
const ipRequests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 5;

  if (ipRequests.size > 1000) {
    for (const [key, value] of ipRequests.entries()) {
      if (now > value.resetAt) {
        ipRequests.delete(key);
      }
    }
  }

  const record = ipRequests.get(ip);
  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request) {
  try {
    // 1. IP Rate Limiting check
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!checkRateLimit(rawIp)) {
      return NextResponse.json(
        { error: 'Занадто багато спроб. Будь ласка, зачекайте кілька хвилин перед повторною відправкою.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, phone, email, message, company, formLoadedAt } = body;

    // 2. Honeypot check: automated bots populate hidden fields
    if (company && String(company).trim().length > 0) {
      // Silently succeed so the bot does not adapt, but do NOT forward to Telegram
      return NextResponse.json({ success: true });
    }

    // 3. Time-trap check: humans take > 2 seconds to fill the form
    if (formLoadedAt) {
      const elapsed = Date.now() - Number(formLoadedAt);
      if (elapsed >= 0 && elapsed < 2000) {
        // Silently succeed for bots submitting faster than 2 seconds
        return NextResponse.json({ success: true });
      }
    }

    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedEmail = email?.trim();
    const trimmedMessage = message?.trim();

    // 4. Required fields validation
    if (!trimmedName || !trimmedPhone || !trimmedMessage) {
      return NextResponse.json(
        { error: "Ім'я, телефон та повідомлення обов'язкові для заповнення" },
        { status: 400 }
      );
    }

    // 5. Phone validation: must contain between 10 and 15 digits
    const digitsCount = trimmedPhone.replace(/\D/g, '').length;
    if (digitsCount < 10 || digitsCount > 15) {
      return NextResponse.json(
        { error: 'Введіть коректний номер телефону' },
        { status: 400 }
      );
    }

    // 6. Email validation (optional field) & length constraints
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Введіть коректну email-адресу' },
        { status: 400 }
      );
    }

    const safeName = trimmedName.slice(0, 100);
    const safePhone = trimmedPhone.slice(0, 25);
    const safeEmail = trimmedEmail ? trimmedEmail.slice(0, 150) : '';
    const safeMessage = trimmedMessage.slice(0, 500);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram configuration missing: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set.');
      return NextResponse.json(
        { error: 'Сервіс тимчасово недоступний' },
        { status: 500 }
      );
    }

    const currentDate = new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const text = `
<b>🟢 Нова заявка з сайту!</b>

<b>Дата:</b> ${currentDate}
<b>Ім'я:</b> ${escapeHtml(safeName)}
<b>Телефон:</b> ${escapeHtml(safePhone)}
<b>Email:</b> ${safeEmail ? escapeHtml(safeEmail) : 'Не вказано'}
<b>Повідомлення:</b> ${escapeHtml(safeMessage)}
`.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Помилка відправки в Telegram');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json(
      { error: 'Не вдалося відправити повідомлення' },
      { status: 500 }
    );
  }
}
