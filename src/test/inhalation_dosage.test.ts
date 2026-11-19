import { describe, it, expect } from 'vitest';
import { calculateInhalationDosage } from '../core/symbolic/inhalation_dosage';

describe('Human Respiratory Micro-Dosimetry & Berkeley Earth Engine', () => {
  it('demonstrates marked reduction in toxic particulate dose with AtmoPraxis C-R box bio-shielding', () => {
    const outdoorPm25 = 250;           // Severe winter smog
    const unpurifiedIndoorPm25 = 180;  // High infiltration without mechanical filtration
    const purifiedIndoorPm25 = 15;     // Hospital-grade C-R box filtration

    const dosage = calculateInhalationDosage(
      outdoorPm25,
      unpurifiedIndoorPm25,
      purifiedIndoorPm25,
      'outdoor_masked'
    );

    // Prevented cigarettes equivalent must be positive
    expect(dosage.preventedCigarettesEquivalent).toBeGreaterThan(5);
    expect(dosage.dailyInhaledPm25TotalMicrograms).toBeLessThan(1000);
    expect(dosage.alveolarDepositionPct).toBe(68);
    expect(dosage.respiratoryStressIndex).toBeLessThanOrEqual(100);
    expect(dosage.respiratoryStressIndex).toBeGreaterThan(0);
  });

  it('evaluates commute protection modes across unprotected, masked, metro, and car HEPA', () => {
    const outdoor = 200;
    const unpurified = 150;
    const purified = 15;

    const unmasked = calculateInhalationDosage(outdoor, unpurified, purified, 'outdoor_unprotected');
    const masked = calculateInhalationDosage(outdoor, unpurified, purified, 'outdoor_masked');
    const metro = calculateInhalationDosage(outdoor, unpurified, purified, 'metro_transit');
    const carHepa = calculateInhalationDosage(outdoor, unpurified, purified, 'car_hepa');

    // N95 masked commute should inhale fewer commute micrograms than unprotected
    expect(masked.dailyInhaledPm25CommuteMicrograms).toBeLessThan(unmasked.dailyInhaledPm25CommuteMicrograms);
    // Metro transit also provides protection over walking unprotected in street exhaust
    expect(metro.dailyInhaledPm25CommuteMicrograms).toBeLessThan(unmasked.dailyInhaledPm25CommuteMicrograms);
    // Car with cabin HEPA filter
    expect(carHepa.dailyInhaledPm25CommuteMicrograms).toBeLessThan(unmasked.dailyInhaledPm25CommuteMicrograms);
  });

  it('models clean air scenario where prevented cigarettes is 0', () => {
    const cleanOutdoor = 10;
    const cleanIndoor = 8;
    const purified = 5;

    const dosage = calculateInhalationDosage(cleanOutdoor, cleanIndoor, purified, 'outdoor_masked');
    expect(dosage.preventedCigarettesEquivalent).toBeLessThanOrEqual(1.0);
    expect(dosage.respiratoryStressIndex).toBeLessThan(15);
  });

  it('handles zero pollutant concentrations safely', () => {
    const dosage = calculateInhalationDosage(0, 0, 0, 'outdoor_masked');
    expect(dosage.dailyInhaledPm25TotalMicrograms).toBe(0);
    expect(dosage.equivalentCigarettesInhaled).toBe(0);
    expect(dosage.preventedCigarettesEquivalent).toBe(0);
    expect(dosage.respiratoryStressIndex).toBe(0);
  });
});
