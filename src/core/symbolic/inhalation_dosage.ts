import { PhysiologicalImpactMetrics } from '../../types';
import {
  BERKELEY_EARTH_PM25_UG_PER_CIGARETTE,
  BIOPHYSICAL_DEFAULTS,
} from '../../constants';

/**
 * Human Respiratory Particulate Deposition & Inhalation Micro-Dosage Engine.
 * 
 * Based on physiological minute ventilation rate V_E across activities:
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
 *
 * @param outdoorPm25 Ambient outdoor PM2.5 concentration in µg/m³.
 * @param indoorPm25Unpurified Indoor PM2.5 without active filtration (I/O infiltration).
 * @param indoorPm25Purified Indoor PM2.5 with AtmoPraxis Corsi-Rosenthal filtration running.
 * @param commuteMode Commute transit protection mode.
 * @returns Comprehensive physiological dosimetry metrics.
 */
export function calculateInhalationDosage(
  outdoorPm25: number,
  indoorPm25Unpurified: number,
  indoorPm25Purified: number,
  commuteMode: 'outdoor_unprotected' | 'outdoor_masked' | 'metro_transit' | 'car_hepa'
): PhysiologicalImpactMetrics {
  const safeOutdoor = Math.max(0, outdoorPm25);
  const safeUnpurified = Math.max(0, indoorPm25Unpurified);
  const safePurified = Math.max(0, indoorPm25Purified);

  // Mask filtration efficiency (N95 tight seal ~92%, metro closed cabin ~65%, car HEPA ~85%, none = 0%)
  let commuteMaskEfficiency = 0.0;
  if (commuteMode === 'outdoor_masked') commuteMaskEfficiency = 0.92;
  if (commuteMode === 'metro_transit') commuteMaskEfficiency = 0.65;
  if (commuteMode === 'car_hepa') commuteMaskEfficiency = 0.85;

  const effectiveCommutePm25 = safeOutdoor * (1 - commuteMaskEfficiency);

  // Unmitigated scenario (no indoor purifier, standard unprotected outdoor commute)
  // Time allocation: 8h sleep (0.36 m³/h), 14h indoor (0.60 m³/h), 2h commute (1.50 m³/h)
  const sleepInhaledUnmitigated = safeUnpurified * 0.36 * 8;
  const dayIndoorInhaledUnmitigated = safeUnpurified * 0.60 * 14;
  const commuteInhaledUnmitigated = safeOutdoor * 1.50 * 2;
  const unmitigatedTotalMicrograms = sleepInhaledUnmitigated + dayIndoorInhaledUnmitigated + commuteInhaledUnmitigated;

  // Mitigated scenario with AtmoPraxis:
  // Using C-R DIY Purifier (indoor PM2.5 drops to purified baseline) + Protected Commute
  const sleepInhaledMitigated = safePurified * 0.36 * 8;
  const dayIndoorInhaledMitigated = safePurified * 0.60 * 14;
  const commuteInhaledMitigated = effectiveCommutePm25 * 1.50 * 2;
  const mitigatedTotalMicrograms = sleepInhaledMitigated + dayIndoorInhaledMitigated + commuteInhaledMitigated;

  // Cigarette equivalents via Berkeley Earth constant
  const unmitigatedCigarettes = Number((unmitigatedTotalMicrograms / BERKELEY_EARTH_PM25_UG_PER_CIGARETTE).toFixed(1));
  const mitigatedCigarettes = Number((mitigatedTotalMicrograms / BERKELEY_EARTH_PM25_UG_PER_CIGARETTE).toFixed(1));
  const preventedCigarettes = Number(Math.max(0, unmitigatedCigarettes - mitigatedCigarettes).toFixed(1));

  // Alveolar fine particulate penetration fraction from centralized biophysical constants
  const alveolarDepositionPct = BIOPHYSICAL_DEFAULTS.ALVEOLAR_DEPOSITION_FRACTION_PCT;

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
