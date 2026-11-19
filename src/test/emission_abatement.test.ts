import { describe, it, expect } from 'vitest';
import {
  computeTotalEmissionSavings,
  INITIAL_SUSTAINABLE_HABITS,
} from '../core/symbolic/emission_abatement';

describe('Emission Abatement Symbolic Engine', () => {
  it('aggregates daily PM2.5 and CO2 savings across adopted habits', () => {
    const summary = computeTotalEmissionSavings(INITIAL_SUSTAINABLE_HABITS);

    expect(summary.totalPm25SavedGrams).toBeGreaterThan(0);
    expect(summary.totalCo2eSavedKg).toBeGreaterThan(0);
    expect(summary.activeHabitCount).toBeGreaterThan(0);
    expect(summary.communityMultiplierGramsMonth).toBeGreaterThan(10000);
  });
});
