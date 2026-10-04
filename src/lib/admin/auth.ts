import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'upton_admin_session';

const DEFAULT_ADMIN_USER = 'tony';
const DEFAULT_ADMIN_PASS = 'wirsumatmo123';

// Salt for password hashing
const PASSWORD_SALT = 'upton_auth_salt_tony_2026';

/**
 * Computes a secure cryptographic hash using scrypt key derivation.
 */
export function hashPassword(password: string): string {
  const derived = crypto.scryptSync(password, PASSWORD_SALT, 64);
  return derived.toString('hex');
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_RESET_USER || DEFAULT_ADMIN_USER,
    password: process.env.ADMIN_RESET_PASS || DEFAULT_ADMIN_PASS,
  };
}

/**
 * Constant-time comparison of username and password against hash.
 */
export function verifyAdminCredentials(inputUser: string, inputPass: string): boolean {
  if (!inputUser || !inputPass) return false;

  const creds = getAdminCredentials();
  const expectedUser = creds.username.trim();
  const expectedPassHash = hashPassword(creds.password.trim());

  // 1. Check username with timing-safe comparison
  const inputUserBuf = Buffer.from(inputUser.trim());
  const expectedUserBuf = Buffer.from(expectedUser);
  if (inputUserBuf.length !== expectedUserBuf.length) {
    return false;
  }
  const userMatches = crypto.timingSafeEqual(inputUserBuf, expectedUserBuf);

  // 2. Hash incoming password and compare hashes with timing-safe comparison
  const inputHash = hashPassword(inputPass.trim());
  const inputHashBuf = Buffer.from(inputHash);
  const expectedHashBuf = Buffer.from(expectedPassHash);

  if (inputHashBuf.length !== expectedHashBuf.length) {
    return false;
  }
  const passMatches = crypto.timingSafeEqual(inputHashBuf, expectedHashBuf);

  return userMatches && passMatches;
}

function getEncryptionKey(): Buffer {
  const secret =
    process.env.CRON_SECRET ||
    process.env.SUPABASE_ANON_KEY ||
    'upton_admin_super_secret_session_2026';
  // Derive 32-byte (256-bit) key for AES-256-GCM
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Creates an AES-256-GCM encrypted session token valid for 24 hours.
 * Format: base64url(ivHex:authTagHex:ciphertextHex)
 */
export function createAdminToken(username: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({
    u: username,
    exp: expiresAt,
    nonce: crypto.randomBytes(8).toString('hex'),
  });

  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  const tokenRaw = `${iv.toString('hex')}:${authTag}:${encrypted}`;
  return Buffer.from(tokenRaw, 'utf8').toString('base64url');
}

/**
 * Decrypts and validates the AES-256-GCM encrypted session token.
 */
export function verifyAdminToken(token: string): { valid: boolean; username?: string } {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const [ivHex, authTagHex, encryptedHex] = raw.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return { valid: false };

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const data = JSON.parse(decrypted);
    if (!data.u || !data.exp) return { valid: false };

    if (Date.now() > data.exp) {
      return { valid: false };
    }

    return { valid: true, username: data.u };
  } catch {
    return { valid: false };
  }
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
