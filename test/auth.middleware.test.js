import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, sendTokenCookie } from '../server/middleware/auth.js';

describe('Auth Middleware - generateToken()', () => {
  it('should generate a valid JWT containing the user id', () => {
    const fakeUser = { _id: '64f1a2b3c4d5e6f7a8b9c0d1' };
    const token = generateToken(fakeUser);

    expect(typeof token).toBe('string');

    const decoded = jwt.decode(token);
    expect(decoded.id).toBe(fakeUser._id);
  });

  it('should set token expiry to 30 days', () => {
    const fakeUser = { _id: '64f1a2b3c4d5e6f7a8b9c0d1' };
    const token = generateToken(fakeUser);
    const decoded = jwt.decode(token);

    const expectedExpirySeconds = 30 * 24 * 60 * 60; // 30 days in seconds
    const actualExpirySeconds = decoded.exp - decoded.iat;

    // Allow 5 second tolerance for test execution time
    expect(actualExpirySeconds).toBeGreaterThan(expectedExpirySeconds - 5);
    expect(actualExpirySeconds).toBeLessThan(expectedExpirySeconds + 5);
  });

  it('should generate different tokens for different users', () => {
    const tokenA = generateToken({ _id: 'userA' });
    const tokenB = generateToken({ _id: 'userB' });

    expect(tokenA).not.toBe(tokenB);
  });
});

describe('Auth Middleware - sendTokenCookie()', () => {
  it('should set an httpOnly cookie named "token"', () => {
    const mockRes = { cookie: vi.fn() };

    sendTokenCookie(mockRes, 'sample.jwt.token');

    expect(mockRes.cookie).toHaveBeenCalledTimes(1);
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'token',
      'sample.jwt.token',
      expect.objectContaining({ httpOnly: true })
    );
  });

  it('should set cookie expiry roughly 30 days in the future', () => {
    const mockRes = { cookie: vi.fn() };
    const before = Date.now();

    sendTokenCookie(mockRes, 'sample.jwt.token');

    const options = mockRes.cookie.mock.calls[0][2];
    const expiryMs = options.expires.getTime() - before;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    // within 5 seconds tolerance
    expect(expiryMs).toBeGreaterThan(thirtyDaysMs - 5000);
    expect(expiryMs).toBeLessThan(thirtyDaysMs + 5000);
  });
});
