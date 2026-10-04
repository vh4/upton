import { NextRequest, NextResponse } from 'next/server';
import { getAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const creds = getAdminCredentials();

    if (
      !username ||
      !password ||
      username.trim() !== creds.username ||
      password.trim() !== creds.password
    ) {
      return NextResponse.json(
        { error: 'Username atau password admin salah.' },
        { status: 401 }
      );
    }

    const token = createAdminToken(creds.username);
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      username: creds.username,
    });

    // Set secure HTTP-only cookie
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
