import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import type { UserRole } from '../models/types.ts';

let EPHEMERAL_JWT_SECRET: string | null = null;

export function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  if (process.env.NODE_ENV === 'production' || process.env.STRICT_ENV === 'true') {
    throw new Error(
      'FATAL: Missing or insecure JWT_SECRET environment variable (minimum 16 characters required). Configure JWT_SECRET in .env before starting the server.'
    );
  }
  if (!EPHEMERAL_JWT_SECRET) {
    EPHEMERAL_JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn(
      '[VELORA SECURITY]: JWT_SECRET not set in environment; generated ephemeral 256-bit runtime secret for development preview. Configure JWT_SECRET in .env for persistent tokens.'
    );
  }
  return EPHEMERAL_JWT_SECRET;
}

/**
 * Hashes a plaintext password using bcrypt with a unique per-password cryptographic salt (cost factor 10).
 */
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  try {
    return bcrypt.compareSync(password, storedHash);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically random password reset token and its SHA-256 hash.
 * Only the hash is stored in the database.
 */
export function generatePasswordResetToken(): {
  rawToken: string;
  tokenHash: string;
  expiresAt: string;
} {
  const rawToken = 'VLR-' + crypto.randomBytes(12).toString('hex').toUpperCase();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
  return { rawToken, tokenHash, expiresAt };
}

export function hashResetToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim().toUpperCase()).digest('hex');
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  exp?: number;
  iss?: string;
}

export function signToken(payload: Omit<JwtPayload, 'exp' | 'iss'>, expiresInHours = 72): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    },
    getJwtSecret(),
    {
      expiresIn: `${expiresInHours}h`,
      issuer: 'velora-api',
    }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'velora-api',
    }) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a moment before retrying.',
    error: 'Too many requests. Please wait a moment before retrying.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    error: 'Too many authentication attempts. Please try again later.',
  },
});

export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function generateEntityId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
