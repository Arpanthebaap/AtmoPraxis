import { describe, it, expect } from 'vitest';
import {
  computeTotalEmissionSavings,
  INITIAL_SUSTAINABLE_HABITS,
} from '../core/symbolic/emission_abatement';
import { SustainableHabit } from '../types';

describe('Emission Abatement & Carbon Model', () => {
  it('correctly aggregates active habits and neighborhood collective multiplier', () => {
    const summary = computeTotalEmissionSavings(INITIAL_SUSTAINABLE_HABITS);

    expect(summary.totalHabits).toBe(INITIAL_SUSTAINABLE_HABITS.length);
    expect(summary.activeHabitCount).toBeGreaterThan(0);
    expect(summary.totalPm25SavedGrams).toBeGreaterThan(0);
    expect(summary.totalCo2eSavedKg).toBeGreaterThan(0);

    // Multiplier for 500 households over 30 days:
    // Grams/month = totalPm25SavedGrams * 500 * 30
    const expectedMonthMultiplier = Math.round(summary.totalPm25SavedGrams * 500 * 30);
    expect(summary.communityMultiplierGramsMonth).toBe(expectedMonthMultiplier);
  });

  it('updates total savings when all habits are toggled active', () => {
    const allActive = INITIAL_SUSTAINABLE_HABITS.map((h) => ({ ...h, adopted: true }));
    const summary = computeTotalEmissionSavings(allActive);

    expect(summary.activeHabitCount).toBe(allActive.length);
    const expectedPmTotal = Number(allActive.reduce((sum, h) => sum + h.dailyPm25ReductionGrams, 0).toFixed(1));
    expect(summary.totalPm25SavedGrams).toBe(expectedPmTotal);
  });

  it('returns 0 when no habits are adopted', () => {
    const noneActive = INITIAL_SUSTAINABLE_HABITS.map((h) => ({ ...h, adopted: false }));
    const summary = computeTotalEmissionSavings(noneActive);

    expect(summary.activeHabitCount).toBe(0);
    expect(summary.totalPm25SavedGrams).toBe(0);
    expect(summary.totalCo2eSavedKg).toBe(0);
    expect(summary.communityMultiplierGramsMonth).toBe(0);
  });

  it('handles empty habit arrays safely', () => {
    const summary = computeTotalEmissionSavings([]);
    expect(summary.totalHabits).toBe(0);
    expect(summary.activeHabitCount).toBe(0);
    expect(summary.totalPm25SavedGrams).toBe(0);
  });

  it('validates habit categories and difficulty rating integrity', () => {
    const validCategories: SustainableHabit['category'][] = [
      'Commute',
      'Home Heating',
      'Indoor Air Sink',
      'Cooking & Energy',
      'Community Action',
    ];

    INITIAL_SUSTAINABLE_HABITS.forEach((h) => {
      expect(validCategories).toContain(h.category);
      expect(h.dailyPm25ReductionGrams).toBeGreaterThan(0);
      expect(h.directHealthBenefit).toBeDefined();
      expect(h.neighborhoodBenefit).toBeDefined();
    });
  });
});
