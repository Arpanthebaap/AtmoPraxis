import { DailyRoutinePlan, RoutineItem } from '../../types';

/**
 * Safely parses and validates a JSON response string from Gemini into a typed DailyRoutinePlan.
 * Strips code markdown fences and validates required properties.
 */
export function safeParseDailyRoutinePlan(rawText: string): DailyRoutinePlan | null {
  if (!rawText || typeof rawText !== 'string') return null;

  try {
    let cleaned = rawText.trim();

    // Strip markdown code fences if model enclosed JSON in ```json ... ```
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object') return null;

    // Validate headline and mitigationSummary
    const headline = typeof parsed.headline === 'string' && parsed.headline.trim() 
      ? parsed.headline.trim() 
      : 'AtmoPraxis Winter Smog Adaptive Routine';

    const mitigationSummary = typeof parsed.mitigationSummary === 'string' && parsed.mitigationSummary.trim()
      ? parsed.mitigationSummary.trim()
      : 'Spatiotemporally optimized schedule to bypass peak nocturnal inversion.';

    const validAudiences: DailyRoutinePlan['targetAudience'][] = [
      'Family with Children',
      'Working Commuters',
      'Elderly / Vulnerable',
      'Active Fitness',
    ];
    const targetAudience: DailyRoutinePlan['targetAudience'] = validAudiences.includes(parsed.targetAudience)
      ? parsed.targetAudience
      : 'Family with Children';

    const validPhases: DailyRoutinePlan['smogPhase'][] = [
      'Morning Peak Inversion',
      'Midday Solar Dispersal',
      'Evening Traffic Buildup',
      'Nocturnal Smog Trap',
    ];
    const smogPhase: DailyRoutinePlan['smogPhase'] = validPhases.includes(parsed.smogPhase)
      ? parsed.smogPhase
      : 'Morning Peak Inversion';

    const totalExposureReductionPct = typeof parsed.totalExposureReductionPct === 'number' && !isNaN(parsed.totalExposureReductionPct)
      ? Math.max(10, Math.min(95, Math.round(parsed.totalExposureReductionPct)))
      : 65;

    // Validate routines array
    const routines: RoutineItem[] = [];
    if (Array.isArray(parsed.routines)) {
      parsed.routines.forEach((r: unknown, idx: number) => {
        if (r && typeof r === 'object') {
          const item = r as Record<string, unknown>;
          routines.push({
            id: typeof item.id === 'string' ? item.id : `routine-${idx + 1}`,
            timeSlot: typeof item.timeSlot === 'string' ? item.timeSlot : '08:00 - 09:00',
            activity: typeof item.activity === 'string' ? item.activity : 'Daily Activity',
            venue: item.venue === 'indoor' || item.venue === 'outdoor' ? item.venue : 'indoor',
            originalExposureRisk: item.originalExposureRisk === 'High' || item.originalExposureRisk === 'Moderate' || item.originalExposureRisk === 'Low'
              ? item.originalExposureRisk
              : 'Moderate',
            optimizedTimeSlot: typeof item.optimizedTimeSlot === 'string' ? item.optimizedTimeSlot : '08:00 - 09:00',
            mitigationStrategy: typeof item.mitigationStrategy === 'string' ? item.mitigationStrategy : 'Utilize indoor HEPA filtration.',
            recommendedVenue: item.recommendedVenue === 'outdoor' || item.recommendedVenue === 'indoor_purified' || item.recommendedVenue === 'indoor_sealed'
              ? item.recommendedVenue
              : 'indoor_purified',
            emissionSavingGrams: typeof item.emissionSavingGrams === 'number' && !isNaN(item.emissionSavingGrams)
              ? Number(item.emissionSavingGrams.toFixed(1))
              : 1.5,
          });
        }
      });
    }

    if (routines.length === 0) return null;

    return {
      headline,
      targetAudience,
      smogPhase,
      mitigationSummary,
      totalExposureReductionPct,
      routines,
    };
  } catch (err) {
    console.warn('Failed to parse Gemini daily routine schema:', err);
    return null;
  }
}
