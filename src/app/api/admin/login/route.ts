import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
  getAdminCredentials,
} from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

// In-memory rate limiting map: ip -> { count, lockUntil }
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (record.lockUntil > now) {
      const waitSeconds = Math.ceil((record.lockUntil - now) / 1000);
      return { allowed: false, waitSeconds };
    }
    // Lock expired, reset
    if (record.lockUntil <= now && record.count >= 5) {
      loginAttempts.delete(ip);
    }
  }
  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockUntil = now + 15 * 60 * 1000; // 15 minutes lockout
  }
  loginAttempts.set(ip, record);
}

function recordSuccessfulLogin(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';

    // 1. Check Rate Limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login gagal. Akun dikunci sementara. Silakan coba lagi dalam ${rateCheck.waitSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // 2. Cryptographic constant-time & hashed verification
    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Username atau password admin salah.' },
        { status: 401 }
      );
    }

    recordSuccessfulLogin(ip);

    const creds = getAdminCredentials();
    const token = createAdminToken(creds.username);
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      username: creds.username,
    });

    // Set secure HTTP-only encrypted session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error('[admin:login] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses login.' },
      { status: 500 }
    );
  }
}
