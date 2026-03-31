import { describe, it, expect } from 'vitest';
import { isNonProd, shouldBypassAuth } from '@/features/auth/utils/authBypass';

describe('authBypass util', () => {
  it('blocks bypass in production', () => {
    const env = { PROD: true, VITE_AUTH_BYPASS: 'true' };
    expect(isNonProd(env)).toBe(false);
    expect(shouldBypassAuth(env)).toBe(false);
  });

  it('allows bypass in non-production when flag set', () => {
    const env = { PROD: false, VITE_AUTH_BYPASS: 'true' };
    expect(isNonProd(env)).toBe(true);
    expect(shouldBypassAuth(env)).toBe(true);
  });
});
