import { describe, it, expect } from 'vitest';
import { generateDeterministicDailyRoutine } from '../core/agents/offline_generator';
import { generateSyntheticWinterSmogState } from '../core/api/open_meteo';
import { PRESET_LOCATIONS } from '../core/api/geocoding';

describe('Deterministic Biophysical Routine Generator (Offline Engine)', () => {
  const delhiLocation = PRESET_LOCATIONS[0];
  const severeSmogState = generateSyntheticWinterSmogState(delhiLocation);

  it('generates a valid routine for Family with Children under severe winter smog', () => {
    const routine = generateDeterministicDailyRoutine(
      severeSmogState,
      'Family with Children',
      'Petrol/Diesel Car'
    );

    expect(routine).toBeDefined();
    expect(routine.targetAudience).toBe('Family with Children');
    expect(routine.totalExposureReductionPct).toBeGreaterThanOrEqual(50);
    expect(routine.routines.length).toBeGreaterThanOrEqual(4);

    // Verify all routines have required biophysical properties
    routine.routines.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.timeSlot).toBeDefined();
      expect(item.optimizedTimeSlot).toBeDefined();
      expect(item.mitigationStrategy).toBeDefined();
      expect(item.emissionSavingGrams).toBeGreaterThan(0);
    });
  });

  it('generates a valid routine for Working Commuters', () => {
    const routine = generateDeterministicDailyRoutine(
      severeSmogState,
      'Working Commuters',
      'Petrol/Diesel Car'
    );

    expect(routine.targetAudience).toBe('Working Commuters');
    expect(routine.routines.length).toBeGreaterThanOrEqual(4);
    // Commuter plan should focus on shifting morning peak transit
    const morningCommute = routine.routines.find((r) => r.activity.toLowerCase().includes('commute'));
    expect(morningCommute).toBeDefined();
    expect(morningCommute?.mitigationStrategy).toContain('Metro');
  });

  it('generates a valid routine for Elderly / Vulnerable cohorts', () => {
    const routine = generateDeterministicDailyRoutine(
      severeSmogState,
      'Elderly / Vulnerable',
      'Walking / Local'
    );

    expect(routine.targetAudience).toBe('Elderly / Vulnerable');
    expect(routine.totalExposureReductionPct).toBeGreaterThanOrEqual(60);
    // Should prioritize indoor air bio-shielding and midday exposure
    const sleepShield = routine.routines.find((r) => r.activity.toLowerCase().includes('sleep') || r.activity.toLowerCase().includes('nocturnal'));
    expect(sleepShield).toBeDefined();
  });

  it('generates a valid routine for Active Fitness / Athletes without morning outdoor runs', () => {
    const routine = generateDeterministicDailyRoutine(
      severeSmogState,
      'Active Fitness',
      'Bicycle'
    );

    expect(routine.targetAudience).toBe('Active Fitness');
    // Crucial biophysical safety invariant: Never outdoor jogging during peak morning smog trapping
    const morningWorkout = routine.routines.find((r) => r.timeSlot.includes('06:00') || r.timeSlot.includes('06:30'));
    expect(morningWorkout).toBeDefined();
    expect(morningWorkout?.recommendedVenue).toBe('indoor_purified');
  });

  it('adapts reduction percentage and headlines between moderate and severe smog', () => {
    const moderateState = {
      ...severeSmogState,
      aqiUs: 85,
      pollutants: { ...severeSmogState.pollutants, pm25: 28 },
    };

    const severeRoutine = generateDeterministicDailyRoutine(
      severeSmogState,
      'Family with Children',
      'Car'
    );
    const moderateRoutine = generateDeterministicDailyRoutine(
      moderateState,
      'Family with Children',
      'Car'
    );

    expect(severeRoutine.totalExposureReductionPct).toBeGreaterThan(moderateRoutine.totalExposureReductionPct);
    expect(severeRoutine.headline).not.toBe(moderateRoutine.headline);
  });
});
