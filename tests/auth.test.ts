import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { hashPassword, comparePassword, signJwtToken, verifyJwtToken } from '../src/lib/auth';
import { registerSchema, loginSchema } from '../src/lib/validation';

describe('Authentication & Security Suite', () => {
  it('TC-AUTH-01: Should securely hash password with bcrypt salt', async () => {
    const plain = 'secretPassword123';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

    const isMatch = await comparePassword(plain, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('wrongPass', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('TC-AUTH-02: Should validate registration payload with valid fields', () => {
    const validData = {
      name: 'John Test',
      email: 'johntest@example.com',
      password: 'password123',
      role: 'CUSTOMER' as const,
      phone: '+1 555-0199',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('TC-AUTH-03: Should reject invalid email and short passwords', () => {
    const invalidData = {
      name: 'J',
      email: 'not-an-email',
      password: '123',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('TC-AUTH-04: Should sign and correctly verify JWT session tokens', () => {
    const payload = {
      userId: 'user-cuid-123',
      email: 'alex@example.com',
      role: 'CUSTOMER' as const,
      name: 'Alex Johnson',
    };

    const token = signJwtToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyJwtToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });
});
