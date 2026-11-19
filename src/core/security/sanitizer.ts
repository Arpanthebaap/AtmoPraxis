/**
 * Security & Input Sanitization Utilities for AtmoPraxis
 */

/**
 * Validates whether a Gemini API key matches Google's API key format.
 * Format: starts with AIzaSy or AIza, alphanumeric with underscores and hyphens, typically 39 chars.
 */
export function isValidGeminiApiKey(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  // Standard Google API key regex: AIza followed by 35 alphanumeric characters, underscores, or hyphens
  const googleApiKeyRegex = /^AIza[0-9A-Za-z\-_]{35}$/;
  // Also permit general test keys of reasonable length (30-60 chars) if alphanumeric/hyphen/underscore
  const generalKeyRegex = /^[0-9A-Za-z\-_]{30,60}$/;
  return googleApiKeyRegex.test(trimmed) || generalKeyRegex.test(trimmed);
}

/**
 * Sanitizes user-provided text before embedding into LLM prompts or templates,
 * mitigating prompt injection, delimiter breakout, and invisible control character abuse.
 */
export function sanitizePromptInput(input: string, maxLength: number = 200): string {
  if (!input) return '';

  return (
    input
      .trim()
      // Remove control characters and non-printable characters (except normal space)
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // Remove potential markdown code fence delimiters that could hijack JSON format
      .replace(/```/g, '')
      // Remove excessive repetitive whitespace
      .replace(/\s+/g, ' ')
      // Enforce hard character ceiling
      .slice(0, maxLength)
  );
}

const memoryStorageFallback = new Map<string, string>();

/**
 * Safe sessionStorage accessor wrapped in try-catch with in-memory fallback
 * to support private browsing, SSR/Node.js testing, and iframe sandboxes.
 */
export const SafeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch {
      // Storage access blocked or restricted
    }
    return memoryStorageFallback.get(key) ?? null;
  },

  setItem(key: string, value: string): boolean {
    memoryStorageFallback.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
        return true;
      }
    } catch {
      // Storage quota exceeded or disabled
    }
    return true;
  },

  removeItem(key: string): boolean {
    memoryStorageFallback.delete(key);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
        return true;
      }
    } catch {
      // Storage access blocked
    }
    return true;
  },
};
