import { describe, it, expect } from 'vitest';
import {
  computeInversionDynamics,
  evaluateInversionSafety,
} from '../core/symbolic/thermal_inversion';

describe('Thermal Inversion Dynamics Engine', () => {
  it('detects severe boundary layer compression during winter morning peak (07:00)', () => {
    // 07:00 AM, 12°C, 3 km/h stagnant wind, 85% humidity
    const dynamics = computeInversionDynamics(7, 12, 3, 85);

    expect(dynamics.boundaryLayerHeight).toBeLessThan(250);
    expect(dynamics.inversionTrappingRisk).toBe('Extreme');
    expect(dynamics.ventilationEfficiency).toBeLessThan(35);

    const safety = evaluateInversionSafety(dynamics);
    expect(safety.isTrappingActive).toBe(true);
    expect(safety.recommendedOutdoorAction).toContain('curfew');
  });

  it('detects daytime boundary layer expansion during solar midday (13:00)', () => {
    // 13:00 PM, 22°C, 12 km/h wind, 45% humidity
    const dynamics = computeInversionDynamics(13, 22, 12, 45);

    expect(dynamics.boundaryLayerHeight).toBeGreaterThan(600);
    expect(dynamics.inversionTrappingRisk).not.toBe('Extreme');
    expect(dynamics.ventilationEfficiency).toBeGreaterThan(60);

    const safety = evaluateInversionSafety(dynamics);
    expect(safety.isTrappingActive).toBe(false);
    expect(safety.recommendedOutdoorAction).toContain('cross-ventilation');
  });
});
