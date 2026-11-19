import { describe, it, expect } from 'vitest';
import {
  computeInversionDynamics,
  evaluateInversionSafety,
} from '../core/symbolic/thermal_inversion';

describe('Tropospheric Thermal Inversion & Boundary Layer Engine', () => {
  it('correctly models shallow boundary layer and extreme trapping during morning radiative cooling', () => {
    // 07:00 AM (Peak morning inversion), low wind (3 km/h), high humidity (85%)
    const morningSmog = computeInversionDynamics(7, 12, 3, 85);

    expect(morningSmog.boundaryLayerHeight).toBeLessThan(300);
    expect(morningSmog.inversionTrappingRisk).toBe('Extreme');
    expect(morningSmog.ventilationEfficiency).toBeLessThan(40);

    const safety = evaluateInversionSafety(morningSmog);
    expect(safety.isTrappingActive).toBe(true);
    expect(safety.trappingRiskLevel).toBe('Extreme');
    expect(safety.ventilationCoefficient).toBeLessThan(2000); // Below 2,000 m²/s threshold
    expect(safety.recommendedOutdoorAction).toContain('curfew');
    expect(safety.scientificExplanation).toBeDefined();
  });

  it('correctly models midday solar convection boundary layer expansion', () => {
    // 13:00 PM (Solar peak), moderate wind (12 km/h), moderate humidity (45%)
    const middaySolar = computeInversionDynamics(13, 22, 12, 45);

    expect(middaySolar.boundaryLayerHeight).toBeGreaterThan(600);
    expect(middaySolar.inversionTrappingRisk).not.toBe('Extreme');
    expect(middaySolar.ventilationEfficiency).toBeGreaterThan(50);

    const safety = evaluateInversionSafety(middaySolar);
    expect(safety.trappingRiskLevel).not.toBe('Extreme');
    expect(safety.ventilationCoefficient).toBeGreaterThan(1500);
  });

  it('proves higher wind speeds enhance mechanical turbulence and lower trapping risk', () => {
    const calmNight = computeInversionDynamics(23, 10, 2, 80);
    const windyNight = computeInversionDynamics(23, 10, 18, 80);

    expect(windyNight.boundaryLayerHeight).toBeGreaterThan(calmNight.boundaryLayerHeight);
    expect(windyNight.ventilationEfficiency).toBeGreaterThan(calmNight.ventilationEfficiency);
  });

  it('evaluates inversion safety across all risk categories (Extreme, High, Moderate, Low)', () => {
    const extremeAtmo = computeInversionDynamics(6, 8, 2, 90);
    const highAtmo = computeInversionDynamics(8, 12, 5, 70);
    const modAtmo = computeInversionDynamics(10, 16, 8, 60);
    const lowAtmo = computeInversionDynamics(14, 24, 15, 35);

    const safeExtreme = evaluateInversionSafety(extremeAtmo);
    const safeHigh = evaluateInversionSafety(highAtmo);
    const safeMod = evaluateInversionSafety(modAtmo);
    const safeLow = evaluateInversionSafety(lowAtmo);

    expect(safeExtreme.recommendedOutdoorAction).toBeDefined();
    expect(safeHigh.recommendedOutdoorAction).toBeDefined();
    expect(safeMod.recommendedOutdoorAction).toBeDefined();
    expect(safeLow.recommendedOutdoorAction).toBeDefined();
    expect(safeLow.isTrappingActive).toBe(false);
  });
});
