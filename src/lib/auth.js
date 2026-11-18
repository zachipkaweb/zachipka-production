// ============================================================================
// Admin Authentication & Session Management
// Uses JWT signed tokens (via `jose`) stored in httpOnly secure cookies.
// ============================================================================

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const EXPIRATION_TIME = "15m";

function getEncodedKey() {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error("SESSION_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secretKey);
}

/** Signs a payload with HS256 algorithm and a 15-minute expiration time */
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION_TIME)
    .sign(getEncodedKey());
}

/** Verifies and decrypts a JWT token, requiring the expiration claim */
export async function decrypt(token) {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
      requiredClaims: ["exp"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

/** Creates a secure httpOnly cookie session for the authenticated admin */
export async function createSession() {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const sessionData = { role: "admin", expiresAt };
  const token = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/** Verifies the current admin session cookie; returns authentication status and payload */
export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) {
    return { isAuth: false };
  }
  const payload = await decrypt(cookie);

  if (!payload) {
    return { isAuth: false };
  }

  return { isAuth: true, user: payload };
}

/** Clears the admin session cookie on logout */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}