import { PhysiologicalImpactMetrics } from '../../types';

/**
 * Human Respiratory Particulate Deposition & Inhalation Micro-Dosage Engine.
 * 
 * Based on physiological minute ventilation rate V_E (Liters/min) across activities:
 * - Resting / Sleep: ~6.0 L/min = 0.36 m³/h
 * - Light Indoor Sedentary: ~10.0 L/min = 0.60 m³/h
 * - Moderate Outdoor Transit (Walking / Commute): ~25.0 L/min = 1.50 m³/h
 * - Intense Outdoor Exercise (Jogging / Cycling): ~45.0 L/min = 2.70 m³/h
 * 
 * Daily Inhaled Dosage Formulation:
 * Inhaled Mass (µg) = Sum_{t} [ Concentration_PM2.5(t) * V_E(activity_t) * Duration(t) ]
 * 
 * Equivalent Cigarettes:
 * Based on Richard Muller & Elizabeth Muller (Berkeley Earth) formulation:
 * One cigarette per day is roughly equivalent to a continuous PM2.5 exposure of 22 µg/m³.
 * Daily Inhaled Cigarette Equivalent ≈ Daily Inhaled Mass (µg) / (22 µg/m³ * 10.8 m³/day average baseline breathing)
 * ≈ Daily Inhaled Mass (µg) / 237.6 µg.
 */

export function calculateInhalationDosage(
  outdoorPm25: number,
  indoorPm25Unpurified: number,
  indoorPm25Purified: number,
  commuteMode: 'outdoor_unprotected' | 'outdoor_masked' | 'metro_transit' | 'car_hepa'
): PhysiologicalImpactMetrics {
  // Typical daily routine time allocation:
  // 8 hours sleep (indoor)
  // 8 hours indoor work / school
  // 6 hours indoor home activities
  // 2 hours commute / errands

  // Mask filtration efficiency (N95 tight seal ~95%, standard surgical/cloth ~30%, none = 0%)
  let commuteMaskEfficiency = 0.0;
  if (commuteMode === 'outdoor_masked') commuteMaskEfficiency = 0.92;
  if (commuteMode === 'metro_transit') commuteMaskEfficiency = 0.65;
  if (commuteMode === 'car_hepa') commuteMaskEfficiency = 0.85;

  const effectiveCommutePm25 = outdoorPm25 * (1 - commuteMaskEfficiency);

  // Unmitigated scenario (no indoor purifier, standard outdoor commute)
  // Indoor unpurified typically tracks outdoor with infiltration factor I/O ≈ 0.65 to 0.80
  const sleepInhaledUnmitigated = indoorPm25Unpurified * 0.36 * 8; // 8h sleep
  const dayIndoorInhaledUnmitigated = indoorPm25Unpurified * 0.60 * 14; // 14h indoor
  const commuteInhaledUnmitigated = outdoorPm25 * 1.50 * 2; // 2h commute
  const unmitigatedTotalMicrograms = sleepInhaledUnmitigated + dayIndoorInhaledUnmitigated + commuteInhaledUnmitigated;

  // Mitigated scenario with AtmoPraxis:
  // Using C-R DIY Purifier (indoor PM2.5 drops to indoorPm25Purified ~10-20 µg/m³) + Protected Commute
  const sleepInhaledMitigated = indoorPm25Purified * 0.36 * 8;
  const dayIndoorInhaledMitigated = indoorPm25Purified * 0.60 * 14;
  const commuteInhaledMitigated = effectiveCommutePm25 * 1.50 * 2;
  const mitigatedTotalMicrograms = sleepInhaledMitigated + dayIndoorInhaledMitigated + commuteInhaledMitigated;

  // Cigarette equivalents
  const unmitigatedCigarettes = Number((unmitigatedTotalMicrograms / 237.6).toFixed(1));
  const mitigatedCigarettes = Number((mitigatedTotalMicrograms / 237.6).toFixed(1));
  const preventedCigarettes = Number(Math.max(0, unmitigatedCigarettes - mitigatedCigarettes).toFixed(1));

  // Alveolar fine particulate penetration fraction (PM2.5 reaches deep non-ciliated bronchiole spaces)
  const alveolarDepositionPct = 68;

  // Relative Respiratory Stress Index (0 to 100)
  const stressScore = Math.min(100, Math.round((mitigatedTotalMicrograms / 1500) * 100));

  return {
    dailyInhaledPm25RestMicrograms: Math.round(dayIndoorInhaledMitigated + sleepInhaledMitigated),
    dailyInhaledPm25CommuteMicrograms: Math.round(commuteInhaledMitigated),
    dailyInhaledPm25TotalMicrograms: Math.round(mitigatedTotalMicrograms),
    equivalentCigarettesInhaled: mitigatedCigarettes,
    alveolarDepositionPct,
    respiratoryStressIndex: stressScore,
    mitigatedDosageWithAtmoPraxisMicrograms: Math.round(mitigatedTotalMicrograms),
    preventedCigarettesEquivalent: preventedCigarettes,
  };
}
