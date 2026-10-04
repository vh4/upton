import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'upton_admin_session';

const DEFAULT_ADMIN_USER = 'tony';
const DEFAULT_ADMIN_PASS = 'wirsumatmo123';

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_RESET_USER || DEFAULT_ADMIN_USER,
    password: process.env.ADMIN_RESET_PASS || DEFAULT_ADMIN_PASS,
  };
}

function getSecretKey(): string {
  return (
    process.env.CRON_SECRET ||
    process.env.SUPABASE_ANON_KEY ||
    'upton_admin_super_secret_session_2026'
  );
}

/**
 * Creates a signed HMAC admin session token valid for 24 hours.
 */
export function createAdminToken(username: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = `${username}:${expiresAt}`;
  const hmac = crypto
    .createHmac('sha256', getSecretKey())
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

/**
 * Verifies the admin session token.
 */
export function verifyAdminToken(token: string): { valid: boolean; username?: string } {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const [username, expStr, hmac] = raw.split(':');
    if (!username || !expStr || !hmac) return { valid: false };

    const expiresAt = parseInt(expStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false };
    }

    const expectedHmac = crypto
      .createHmac('sha256', getSecretKey())
      .update(`${username}:${expiresAt}`)
      .digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return { valid: true, username };
    }
  } catch {
    return { valid: false };
  }
  return { valid: false };
}

/**
 * Checks whether the incoming request contains a valid admin session cookie or Authorization header.
 */
export function isAuthenticatedAdmin(request: NextRequest): boolean {
  // 1. Check cookie
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookie && verifyAdminToken(cookie).valid) {
    return true;
  }

  // 2. Check Bearer Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminToken(token).valid) {
      return true;
    }
  }

  return false;
}
