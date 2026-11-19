import { AirQualityState, DailyRoutinePlan } from '../../types';
import { generateDeterministicDailyRoutine } from './offline_generator';
import { buildRoutineSystemPrompt, buildRoutineUserPrompt } from './prompts';
import { safeParseDailyRoutinePlan } from './schema_validator';
import { isValidGeminiApiKey, SafeStorage } from '../security/sanitizer';
import { APP_CONFIG } from '../../constants';

/**
 * Enterprise-grade client for Google Gemini 2.5 Flash generative synthesis.
 * Implements ephemeral browser session storage, input sanitization, network timeouts,
 * and deterministic biophysical offline fallbacks.
 */
export class GeminiAgentClient {
  private apiKey: string | null = null;
  private readonly modelName: string = APP_CONFIG.DEFAULT_GEMINI_MODEL;
  private readonly requestTimeoutMs: number = APP_CONFIG.NETWORK_TIMEOUT_MS;

  constructor(apiKey?: string) {
    if (apiKey && isValidGeminiApiKey(apiKey)) {
      this.apiKey = apiKey.trim();
    } else {
      const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
      if (isValidGeminiApiKey(envKey)) {
        this.apiKey = envKey.trim();
      }
    }
  }

  public setApiKey(key: string): boolean {
    const trimmed = key ? key.trim() : '';
    if (!trimmed) {
      this.apiKey = null;
      SafeStorage.removeItem(APP_CONFIG.STORAGE_KEY_API_KEY);
      return true;
    }

    if (isValidGeminiApiKey(trimmed)) {
      this.apiKey = trimmed;
      SafeStorage.setItem(APP_CONFIG.STORAGE_KEY_API_KEY, trimmed);
      return true;
    }

    return false;
  }

  public getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    const stored = SafeStorage.getItem(APP_CONFIG.STORAGE_KEY_API_KEY);
    if (stored && isValidGeminiApiKey(stored)) {
      this.apiKey = stored;
      return stored;
    }
    return null;
  }

  public hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  public async generateDailyRoutine(
    state: AirQualityState,
    targetAudience: 'Family with Children' | 'Working Commuters' | 'Elderly / Vulnerable' | 'Active Fitness',
    selectedCommute: string
  ): Promise<DailyRoutinePlan> {
    const key = this.getApiKey();

    if (!key) {
      // Deterministic physics-based fallback
      return generateDeterministicDailyRoutine(state, targetAudience, selectedCommute);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const systemPrompt = buildRoutineSystemPrompt();
      const userPrompt = buildRoutineUserPrompt(state, targetAudience, selectedCommute);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${encodeURIComponent(key)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty Gemini response payload');

      const parsed = safeParseDailyRoutinePlan(rawText);
      if (!parsed) {
        throw new Error('Gemini response could not be validated against DailyRoutinePlan schema');
      }

      return parsed;
    } catch (err) {
      console.warn('Gemini inference failed, falling back to deterministic local model:', err);
      return generateDeterministicDailyRoutine(state, targetAudience, selectedCommute);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const defaultGeminiClient = new GeminiAgentClient();
