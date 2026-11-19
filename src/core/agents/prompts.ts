import { AirQualityState } from '../../types';
import { sanitizePromptInput } from '../security/sanitizer';

/**
 * Builds the authoritative system prompt instructing Gemini to act as the
 * AtmoPraxis biophysical urban air quality co-pilot.
 */
export function buildRoutineSystemPrompt(): string {
  return `You are AtmoPraxis, an elite atmospheric health scientist and urban air quality co-pilot.
Your mission is to help families, commuters, and communities navigate severe winter smog by generating actionable, science-backed daily routines, indoor air bio-hacks, and low-emission alternatives.

Core Principles:
1. Physical realism: In winter smog, nocturnal thermal inversions trap toxic particulates near breathing height until midday solar radiation expands the planetary boundary layer. Never schedule morning aerobic outdoor activity during peak inversion (06:00 - 09:30).
2. Actionable & low-cost: Emphasize practical DIY bio-hacks (e.g. Corsi-Rosenthal boxes, positive-pressure air locks, midday micro-ventilation, electrostatic microfiber mopping).
3. Emission reduction: Suggest tangible alternatives (shifting private combustion car trips to metro/active transit, avoiding biomass/wood burning, synchronizing chores).
4. Explanatory clarity: Clearly explain the physiological mechanism and community airshed impact of each choice.

Output strictly formatted JSON matching the requested schema. Do not enclose in markdown blocks.`;
}

/**
 * Builds the user prompt parameterized with live atmospheric telemetry and user lifestyle profile.
 * Sanitizes all input strings to prevent prompt injection.
 */
export function buildRoutineUserPrompt(
  state: AirQualityState,
  targetAudience: 'Family with Children' | 'Working Commuters' | 'Elderly / Vulnerable' | 'Active Fitness',
  selectedCommute: string
): string {
  const safeCity = sanitizePromptInput(state.location.city, 50);
  const safeCountry = sanitizePromptInput(state.location.country, 50);
  const safeCommute = sanitizePromptInput(selectedCommute, 80);

  return `Generate an optimized, low-emission daily routine for:
- Location: ${safeCity}, ${safeCountry}
- Current AQI (US EPA): ${state.aqiUs} (${state.categoryUs})
- Dominant Pollutant: ${state.dominantPollutant} (PM2.5: ${state.pollutants.pm25} µg/m³)
- Inversion Trapping Risk: ${state.atmosphere.inversionTrappingRisk} (Mixing height: ${state.atmosphere.boundaryLayerHeight}m)
- Target Persona: ${targetAudience}
- Baseline Commute Mode: ${safeCommute}

Return a valid JSON object with the following structure:
{
  "headline": string,
  "targetAudience": "${targetAudience}",
  "smogPhase": "Morning Peak Inversion" | "Midday Solar Dispersal" | "Evening Traffic Buildup" | "Nocturnal Smog Trap",
  "mitigationSummary": string,
  "totalExposureReductionPct": number (e.g. 68),
  "routines": [
    {
      "id": string,
      "timeSlot": string (e.g. "06:30 - 07:45"),
      "activity": string,
      "venue": "indoor" | "outdoor",
      "originalExposureRisk": "High" | "Moderate" | "Low",
      "optimizedTimeSlot": string,
      "mitigationStrategy": string,
      "recommendedVenue": "outdoor" | "indoor_purified" | "indoor_sealed",
      "emissionSavingGrams": number
    }
  ]
}`;
}
