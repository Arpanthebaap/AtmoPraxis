import { AirQualityState, DailyRoutinePlan } from '../../types';
import { generateDeterministicDailyRoutine } from './offline_generator';
import { buildRoutineSystemPrompt, buildRoutineUserPrompt } from './prompts';

export class GeminiAgentClient {
  private apiKey: string | null = null;
  private modelName: string = 'gemini-2.5-flash';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim() || null;
    if (this.apiKey) {
      sessionStorage.setItem('atmopraxis_gemini_key', this.apiKey);
    } else {
      sessionStorage.removeItem('atmopraxis_gemini_key');
    }
  }

  public getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    const stored = sessionStorage.getItem('atmopraxis_gemini_key');
    if (stored) {
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

    try {
      const systemPrompt = buildRoutineSystemPrompt();
      const userPrompt = buildRoutineUserPrompt(state, targetAudience, selectedCommute);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${key}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty Gemini response payload');

      const parsed: DailyRoutinePlan = JSON.parse(rawText);
      return parsed;
    } catch (err) {
      console.warn('Gemini inference failed, falling back to deterministic local model:', err);
      return generateDeterministicDailyRoutine(state, targetAudience, selectedCommute);
    }
  }
}

export const defaultGeminiClient = new GeminiAgentClient();
