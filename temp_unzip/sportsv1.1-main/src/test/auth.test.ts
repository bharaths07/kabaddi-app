import { describe, it, expect } from 'vitest';

// Mock validation logic from DualPanelLoginScreen
const validatePhone = (phone: string) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phone) return { isValid: false, error: 'Empty' };
  if (!phoneRegex.test(phone)) return { isValid: false, error: 'Invalid Format' };
  return { isValid: true };
};

describe('Authentication Validation Logic', () => {
  
  it('should validate correct 10-digit phone numbers', () => {
    const result = validatePhone('9876543210');
    expect(result.isValid).toBe(true);
  });

  it('should validate correct 12-digit phone numbers (with country code)', () => {
    const result = validatePhone('919876543210');
    expect(result.isValid).toBe(true);
  });

  it('should reject phone numbers shorter than 10 digits', () => {
    const result = validatePhone('123456');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid Format');
  });

  it('should reject phone numbers longer than 15 digits', () => {
    const result = validatePhone('1234567890123456');
    expect(result.isValid).toBe(false);
  });

  it('should reject non-numeric characters', () => {
    const result = validatePhone('98765abcde');
    expect(result.isValid).toBe(false);
  });

  it('should reject empty input', () => {
    const result = validatePhone('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Empty');
  });

});
