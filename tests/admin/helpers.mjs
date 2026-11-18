// Shared helpers for the admin-panel test suite.
//
// The suite is black-box: it talks to a running Next.js server over HTTP
// (default http://localhost:3000, override with BASE_URL) and, for the
// prices tests, to the database through Prisma.
//
// Server Actions are invoked exactly the way the React client does it:
// POST to a page URL with a `Next-Action: <id>` header and a multipart body
// encoded in the React Flight "reply" format (root args in field "0",
// FormData arguments as "$K<n>" with fields prefixed "_<n>_").

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SignJWT, base64url } from 'jose';

export const ROOT = path.resolve(import.meta.dirname, '../..');

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // .env is optional when variables are provided by the environment.
}

export const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const COOKIE_NAME = 'admin_session';
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ---------------------------------------------------------------------------
// Server reachability
// ---------------------------------------------------------------------------

export async function assertServerUp() {
  try {
    await fetch(`${BASE_URL}/admin/login`, { redirect: 'manual' });
  } catch (err) {
    throw new Error(
      `Next.js server is not reachable at ${BASE_URL}. Start it with \`npm run dev\` ` +
        `(or set BASE_URL). Original error: ${err.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// Server action IDs (read from the build manifest, dev or prod)
// ---------------------------------------------------------------------------

const MANIFEST_CANDIDATES = [
  '.next/dev/server/server-reference-manifest.json',
  '.next/server/server-reference-manifest.json',
];

export function getActionId(exportedName, filename) {
  for (const rel of MANIFEST_CANDIDATES) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) continue;
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const [id, entry] of Object.entries(manifest.node ?? {})) {
      if (entry.exportedName === exportedName && (!filename || entry.filename === filename)) {
        return id;
      }
    }
  }
  throw new Error(
    `Server action "${exportedName}" not found in the manifest. ` +
      'Open /admin/login and /admin/training once in the browser so Next compiles them.'
  );
}

export const ACTIONS = {
  get login() {
    return getActionId('loginAction', 'src/app/admin/login/actions.js');
  },
  get logout() {
    return getActionId('logoutAction', 'src/app/admin/actions.js');
  },
  get updatePrices() {
    return getActionId('updateTrainingPricesAction', 'src/app/admin/training/actions.js');
  },
  get updateEvents() {
    return getActionId('updateEventsAction', 'src/app/admin/events/actions.js');
  },
  get addEvent() {
    return getActionId('addEventAction', 'src/app/admin/events/actions.js');
  },
  get deleteEvent() {
    return getActionId('deleteEventAction', 'src/app/admin/events/actions.js');
  },
  get updateTeam() {
    return getActionId('updateTeamAction', 'src/app/admin/team/actions.js');
  },
  get addTeam() {
    return getActionId('addTeamAction', 'src/app/admin/team/actions.js');
  },
  get deleteTeam() {
    return getActionId('deleteTeamAction', 'src/app/admin/team/actions.js');
  },
};

// ---------------------------------------------------------------------------
// Network helpers
// ---------------------------------------------------------------------------

/** Random private IP (10.0.0.0/8) so tests practically never share a rate-limit bucket. */
export function randomIp() {
  return `10.${crypto.randomInt(0, 256)}.${crypto.randomInt(0, 256)}.${crypto.randomInt(1, 255)}`;
}

export function cookieHeader(token) {
  return token ? `${COOKIE_NAME}=${token}` : undefined;
}

export async function get(pathname, { token, headers = {} } = {}) {
  const res = await fetch(BASE_URL + pathname, {
    redirect: 'manual',
    headers: { ...(token ? { Cookie: cookieHeader(token) } : {}), ...headers },
  });
  const body = await res.text();
  return { res, status: res.status, body, location: res.headers.get('location') };
}

/**
 * Invoke a Server Action.
 * @param {object} opts
 * @param {string} opts.page      page URL the action is posted to (e.g. '/admin/login')
 * @param {string} opts.actionId
 * @param {Array}  opts.args      action arguments; a FormData-like object is passed as
 *                                `{ formData: [[key, value], ...] }`
 */
export async function callAction({ page, actionId, args = [], token, ip, origin = BASE_URL, headers = {} }) {
  const body = new FormData();
  let nextPart = 1;
  const encodedArgs = args.map((arg) => {
    if (arg && typeof arg === 'object' && Array.isArray(arg.formData)) {
      const id = nextPart++;
      for (const [k, v] of arg.formData) body.append(`_${id}_${k}`, v);
      return `$K${id.toString(16)}`;
    }
    return arg;
  });
  body.append('0', JSON.stringify(encodedArgs));

  const reqHeaders = {
    'Next-Action': actionId,
    Accept: 'text/x-component',
    ...(origin ? { Origin: origin } : {}),
    ...(ip ? { 'x-vercel-forwarded-for': ip } : {}),
    ...(token ? { Cookie: cookieHeader(token) } : {}),
    ...headers,
  };

  const started = Date.now();
  const res = await fetch(BASE_URL + page, { method: 'POST', redirect: 'manual', headers: reqHeaders, body });
  const text = await res.text();
  return {
    res,
    status: res.status,
    text,
    elapsedMs: Date.now() - started,
    result: parseActionResult(text),
    setCookies: res.headers.getSetCookie(),
    location: res.headers.get('location'),
    actionRedirect: res.headers.get('x-action-redirect'),
  };
}

/** Extracts the action return value from a React Flight response. */
export function parseActionResult(text) {
  const rows = new Map();
  for (const line of text.split('\n')) {
    const m = line.match(/^([0-9a-f]+):(.*)$/);
    if (!m) continue;
    const [, id, payload] = m;
    if (!/^[[{"]|^(true|false|null|-?\d)/.test(payload)) continue; // skip D/I/E/... rows
    try {
      rows.set(id, JSON.parse(payload));
    } catch {
      // ignore non-JSON rows
    }
  }
  const root = rows.get('0');
  if (root && typeof root.a === 'string' && root.a.startsWith('$@')) {
    return rows.get(root.a.slice(2));
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Login / cookies
// ---------------------------------------------------------------------------

export function login(password, { ip = randomIp(), origin, rawValue, headers } = {}) {
  const value = rawValue ?? password;
  return callAction({
    page: '/admin/login',
    actionId: ACTIONS.login,
    args: [null, { formData: value === undefined ? [] : [['password', value]] }],
    ip,
    origin,
    headers,
  });
}

export function findSetCookie(setCookies, name = COOKIE_NAME) {
  const raw = setCookies.find((c) => c.startsWith(`${name}=`));
  if (!raw) return null;
  const [pair, ...attrs] = raw.split(';').map((s) => s.trim());
  const value = pair.slice(name.length + 1);
  const attributes = {};
  for (const a of attrs) {
    const [k, ...v] = a.split('=');
    attributes[k.toLowerCase()] = v.length ? v.join('=') : true;
  }
  return { raw, value, attributes };
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

const encoder = new TextEncoder();

export async function signToken({ payload = { role: 'admin' }, secret = SESSION_SECRET, alg = 'HS256', exp = '24h', iat = true } = {}) {
  let jwt = new SignJWT(payload).setProtectedHeader({ alg });
  if (iat) jwt = jwt.setIssuedAt(typeof iat === 'number' ? iat : undefined);
  if (exp !== null) jwt = jwt.setExpirationTime(exp);
  return jwt.sign(encoder.encode(secret));
}

export function unsignedToken(payload = { role: 'admin' }) {
  const header = base64url.encode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url.encode(JSON.stringify({ ...payload, iat: now, exp: now + 3600 }));
  return `${header}.${body}.`;
}

export function decodeJwt(token) {
  const [h, p] = token.split('.');
  return {
    header: JSON.parse(Buffer.from(h, 'base64url').toString()),
    payload: JSON.parse(Buffer.from(p, 'base64url').toString()),
  };
}

// ---------------------------------------------------------------------------
// Database helpers (QA row is invisible on the public site: unknown category)
// ---------------------------------------------------------------------------

let prismaSingleton;
export async function getPrisma() {
  if (!prismaSingleton) {
    const { PrismaClient } = (await import('@prisma/client')).default;
    prismaSingleton = new PrismaClient();
  }
  return prismaSingleton;
}

export async function disconnectPrisma() {
  if (prismaSingleton) await prismaSingleton.$disconnect();
  prismaSingleton = undefined;
}

export const QA_CATEGORY = 'qa_test';
