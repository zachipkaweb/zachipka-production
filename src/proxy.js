// ============================================================================
// Admin Route Protection Middleware (Proxy)
// Intercepts /admin requests, verifies JWT session cookies, and handles redirects.
// Allows Server Actions to reach action handlers directly for granular auth checks.
// ============================================================================

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

async function isTokenValid(token) {
  if (!token) return false;
  try {
    const secretKey = process.env.SESSION_SECRET;
    if (!secretKey) return false;
    const encodedKey = new TextEncoder().encode(secretKey);

    await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
      requiredClaims: ['exp'],
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const hasValidSession = await isTokenValid(token);

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasValidSession) {
      const isServerAction = request.headers.has('next-action');
      if (isServerAction) {
        return NextResponse.next();
      }

      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === '/admin/login' && hasValidSession) {
    const adminUrl = new URL('/admin', request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
