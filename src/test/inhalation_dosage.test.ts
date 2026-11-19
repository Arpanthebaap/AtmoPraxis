import { describe, it, expect } from 'vitest';
import { calculateInhalationDosage } from '../core/symbolic/inhalation_dosage';

describe('Inhalation Micro-Dosage Symbolic Engine', () => {
  it('correctly quantifies prevented particulate inhalation and cigarette equivalence', () => {
    // Severe smog day: Outdoor PM2.5 = 250 µg/m³
    // Unpurified indoor = 180 µg/m³
    // Purified indoor (AtmoPraxis) = 15 µg/m³
    const result = calculateInhalationDosage(250, 180, 15, 'outdoor_masked');

    // Total mitigated micrograms should be substantially lower than unmitigated baseline
    expect(result.dailyInhaledPm25TotalMicrograms).toBeLessThan(1000);
    // Prevented cigarettes should be positive and substantial on a 250 AQI day
    expect(result.preventedCigarettesEquivalent).toBeGreaterThan(5.0);
    expect(result.alveolarDepositionPct).toBe(68);
  });
});
