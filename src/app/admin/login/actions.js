'use server';

// ============================================================================
// Admin Login Server Actions & Security Protection
// Defends against brute-force attacks via in-memory IP rate limiting,
// constant-time password comparison, and artificial response delays.
// ============================================================================

import crypto from 'node:crypto';
import { createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const ATTEMPTS_LIMIT = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;
const MAX_TRACKED_IPS = 1000;

const loginAttempts = new Map();

/** Cleans up expired IP lockouts to prevent memory leaks */
function cleanupAttempts() {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (data.lockUntil && now > data.lockUntil) {
      loginAttempts.delete(ip);
    }
  }
  if (loginAttempts.size > MAX_TRACKED_IPS) {
    const oldestKey = loginAttempts.keys().next().value;
    if (oldestKey) loginAttempts.delete(oldestKey);
  }
}

/** Resolves client IP address from trusted edge headers (Vercel, Cloudflare) */
function getClientIp(headerList) {
  const trustedIp =
    headerList.get('x-vercel-forwarded-for') ||
    headerList.get('cf-connecting-ip');

  return trustedIp ? trustedIp.split(',')[0].trim() : '127.0.0.1';
}

/** Prevents timing attacks via constant-time buffer comparison */
function safeComparePassword(input, expected) {
  const a = Buffer.from(String(input));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function checkRateLimit(clientIp){
    cleanupAttempts();
    const now = Date.now();
    const attemptData = loginAttempts.get(clientIp) || { count: 0, lockUntil: null};
    if (attemptData.lockUntil && now < attemptData.lockUntil){
        const remainingMinutes = Math.ceil((attemptData.lockUntil - now) / 60000);
        return {
            allowed: false,
            message: `Забагато невдалих спроб. Зачекайте ${remainingMinutes} хв.`,
        };
    } 
    return { allowed: true, attemptData };
}

function registerFailedAttempt(clientIp, attemptData) {
    const newCount = attemptData.count + 1;
    const now = Date.now();
    if (newCount >= ATTEMPTS_LIMIT) {
        loginAttempts.set(clientIp, {
            count: newCount,
            lockUntil: now + LOCK_TIME_MS,
        });
    } else {
        loginAttempts.set(clientIp, {
            count: newCount,
            lockUntil: null,
        });
    }
}

function resetAttempts(clientIp) {
    loginAttempts.delete(clientIp);
}


/**
 * Server action to authenticate admin login.
 * Validates rate limits, delays execution, verifies password, and initializes session.
 */
export async function loginAction(prevState, formData) {
  const headerList = await headers();
  const clientIp = getClientIp(headerList);

  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return { error: rateLimit.message };
  }

  const password = formData.get('password');

  await new Promise((resolve) => setTimeout(resolve, 500));
  if (!password || typeof password !== 'string') {
    return { error: 'Будь ласка, введіть пароль.' };
  }
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ПОМИЛКА: ADMIN_PASSWORD не задано в .env.local');
    return { error: 'Внутрішня помилка конфігурації сервера.' };
  }

  if (!safeComparePassword(password, adminPassword)) {
    registerFailedAttempt(clientIp, rateLimit.attemptData);

    const remainingAttempts = ATTEMPTS_LIMIT - (rateLimit.attemptData.count + 1);

    if (remainingAttempts <= 0) {
      return { error: 'Забагато невдалих спроб. Доступ тимчасово заблоковано на 15 хвилин.' };
    }
    return {
      error: `Невірний пароль! Залишилося спроб: ${remainingAttempts}`,
    };
  }

  resetAttempts(clientIp);

  await createSession();
  redirect('/admin');
}
