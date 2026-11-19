import { describe, it, expect } from 'vitest';
import { isValidGeminiApiKey, sanitizePromptInput, SafeStorage } from '../core/security/sanitizer';

describe('Security & Sanitization Utilities', () => {
  describe('isValidGeminiApiKey', () => {
    it('accepts standard Google Gemini API keys starting with AIza', () => {
      const validKey = 'AIzaSy' + 'A'.repeat(33);
      expect(isValidGeminiApiKey(validKey)).toBe(true);
    });

    it('accepts generic valid alphanumeric tokens of sufficient length', () => {
      const generalKey = 'abc123_-' + 'x'.repeat(30);
      expect(isValidGeminiApiKey(generalKey)).toBe(true);
    });

    it('rejects empty, short, or invalid keys', () => {
      expect(isValidGeminiApiKey('')).toBe(false);
      expect(isValidGeminiApiKey('   ')).toBe(false);
      expect(isValidGeminiApiKey('AIza123')).toBe(false);
      expect(isValidGeminiApiKey('invalid key with spaces!@#$%^&*()')).toBe(false);
    });
  });

  describe('sanitizePromptInput', () => {
    it('removes markdown code fences to prevent JSON breakout attacks', () => {
      const input = 'Metro ```hack system``` and car';
      expect(sanitizePromptInput(input)).toBe('Metro hack system and car');
    });

    it('removes control characters', () => {
      const input = 'Clean\x00\x08Air\x1FCommute';
      expect(sanitizePromptInput(input)).toBe('CleanAirCommute');
    });

    it('collapses excessive whitespace and enforces length caps', () => {
      const input = '  A   very    long     commute    route  ';
      expect(sanitizePromptInput(input, 15)).toBe('A very long com');
    });

    it('handles empty or null-like inputs safely', () => {
      expect(sanitizePromptInput('')).toBe('');
    });
  });

  describe('SafeStorage', () => {
    it('safely sets, gets, and removes values without throwing exceptions', () => {
      const key = 'test_key_atmopraxis';
      const val = 'test_val_123';
      
      SafeStorage.setItem(key, val);
      expect(SafeStorage.getItem(key)).toBe(val);

      SafeStorage.removeItem(key);
      expect(SafeStorage.getItem(key)).toBeNull();
    });
  });
});
