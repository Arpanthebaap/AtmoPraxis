import { describe, it, expect } from 'vitest';
import { safeParseDailyRoutinePlan } from '../core/agents/schema_validator';
import { GeminiAgentClient } from '../core/agents/gemini_client';
import { generateSyntheticWinterSmogState } from '../core/api/open_meteo';
import { PRESET_LOCATIONS } from '../core/api/geocoding';

describe('Gemini Agent Client & Schema Validation', () => {
  const dummyState = generateSyntheticWinterSmogState(PRESET_LOCATIONS[0]);

  describe('safeParseDailyRoutinePlan', () => {
    it('correctly parses raw valid JSON payload', () => {
      const validJson = JSON.stringify({
        headline: 'Clean Air Schedule for Delhi',
        targetAudience: 'Family with Children',
        smogPhase: 'Morning Peak Inversion',
        mitigationSummary: 'Shield indoors during early hours.',
        totalExposureReductionPct: 75,
        routines: [
          {
            id: 'r-1',
            timeSlot: '07:00 - 08:00',
            activity: 'School Prep',
            venue: 'indoor',
            originalExposureRisk: 'High',
            optimizedTimeSlot: '07:00 - 08:00',
            mitigationStrategy: 'Keep C-R box fan on medium.',
            recommendedVenue: 'indoor_purified',
            emissionSavingGrams: 2.5,
          },
        ],
      });

      const parsed = safeParseDailyRoutinePlan(validJson);
      expect(parsed).not.toBeNull();
      expect(parsed?.headline).toBe('Clean Air Schedule for Delhi');
      expect(parsed?.totalExposureReductionPct).toBe(75);
      expect(parsed?.routines.length).toBe(1);
    });

    it('successfully extracts JSON enclosed in markdown code fences', () => {
      const fencedPayload = '```json\n{"headline":"Markdown Test","targetAudience":"Working Commuters","smogPhase":"Midday Solar Dispersal","mitigationSummary":"Test summary","totalExposureReductionPct":60,"routines":[{"id":"m-1","timeSlot":"12:00 - 13:00","activity":"Lunch Walk","venue":"outdoor","originalExposureRisk":"Moderate","optimizedTimeSlot":"12:30 - 13:30","mitigationStrategy":"Brisk walk","recommendedVenue":"outdoor","emissionSavingGrams":1.0}]}\n```';

      const parsed = safeParseDailyRoutinePlan(fencedPayload);
      expect(parsed).not.toBeNull();
      expect(parsed?.headline).toBe('Markdown Test');
      expect(parsed?.targetAudience).toBe('Working Commuters');
    });

    it('returns null on invalid JSON strings', () => {
      expect(safeParseDailyRoutinePlan('This is not json at all')).toBeNull();
      expect(safeParseDailyRoutinePlan('{ incomplete json')).toBeNull();
      expect(safeParseDailyRoutinePlan('')).toBeNull();
    });

    it('returns null if routines array is missing or empty', () => {
      const emptyRoutines = JSON.stringify({
        headline: 'No Routines',
        targetAudience: 'Family with Children',
        smogPhase: 'Nocturnal Smog Trap',
        mitigationSummary: 'Test',
        totalExposureReductionPct: 50,
        routines: [],
      });
      expect(safeParseDailyRoutinePlan(emptyRoutines)).toBeNull();
    });
  });

  describe('GeminiAgentClient offline fallback', () => {
    it('executes deterministic fallback without throwing when no API key is provided', async () => {
      const client = new GeminiAgentClient();
      expect(client.hasApiKey()).toBe(false);

      const routine = await client.generateDailyRoutine(
        dummyState,
        'Family with Children',
        'Metro'
      );

      expect(routine).toBeDefined();
      expect(routine.targetAudience).toBe('Family with Children');
      expect(routine.routines.length).toBeGreaterThan(0);
    });

    it('manages API key setter and rejection of invalid format', () => {
      const client = new GeminiAgentClient();

      // Invalid short key should be rejected
      const invalidResult = client.setApiKey('short');
      expect(invalidResult).toBe(false);
      expect(client.hasApiKey()).toBe(false);

      // Valid key format should be accepted
      const validKey = 'AIzaSy' + 'B'.repeat(33);
      const validResult = client.setApiKey(validKey);
      expect(validResult).toBe(true);
      expect(client.hasApiKey()).toBe(true);
      expect(client.getApiKey()).toBe(validKey);

      // Clearing key
      client.setApiKey('');
      expect(client.hasApiKey()).toBe(false);
    });
  });
});
