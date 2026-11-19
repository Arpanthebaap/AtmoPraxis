import { describe, it, expect } from 'vitest';
import {
  calculateCorsiRosenthalMetrics,
  getDefaultCorsiRosenthalConfig,
} from '../core/symbolic/corsi_rosenthal';

describe('Corsi-Rosenthal Box Purifier Fluid Dynamic Solver', () => {
  it('calculates default 4-filter MERV-13 medium-speed metrics accurately', () => {
    const config = getDefaultCorsiRosenthalConfig(); // 16x14x9 room, 4 MERV-13 filters, Medium speed, Carbon pad
    const metrics = calculateCorsiRosenthalMetrics(config);

    expect(metrics.roomVolumeCuFt).toBe(2016);
    expect(metrics.effectiveCadrCfm).toBe(349);
    expect(metrics.airChangesPerHour).toBeGreaterThanOrEqual(10);
    expect(metrics.achRating).toBe('Ideal Hospital-Grade');

    // Exponential clearance physics: 90% and 99% times should be physically realistic (< 30 mins)
    expect(metrics.pm25HalfLifeMinutes).toBeLessThan(5);
    expect(metrics.timeToClean90PctMinutes).toBeLessThan(15);
    expect(metrics.timeToClean99PctMinutes).toBeLessThan(30);

    // Build cost should be well under $100
    expect(metrics.estimatedBuildCostUsd).toBeLessThan(100);
    expect(metrics.estimatedBuildCostUsd).toBeGreaterThan(60);
  });

  it('calculates high-speed shroud configuration delivering maximum protection ACH', () => {
    const highSpeedConfig = {
      ...getDefaultCorsiRosenthalConfig(),
      fanSpeedSetting: 'High' as const,
      hasCarbonLayer: false,
    };
    const metrics = calculateCorsiRosenthalMetrics(highSpeedConfig);

    expect(metrics.effectiveCadrCfm).toBeGreaterThan(450);
    expect(metrics.airChangesPerHour).toBeGreaterThanOrEqual(12);
    expect(metrics.achRating).toBe('Maximum Protection');
  });

  it('proves 5-filter compactor plenum outperforms 4-filter cube in CADR', () => {
    const baseConfig = getDefaultCorsiRosenthalConfig();
    const metrics4 = calculateCorsiRosenthalMetrics({ ...baseConfig, filterCount: 4 });
    const metrics5 = calculateCorsiRosenthalMetrics({ ...baseConfig, filterCount: 5 });

    expect(metrics5.effectiveCadrCfm).toBeGreaterThan(metrics4.effectiveCadrCfm);
    expect(metrics5.airChangesPerHour).toBeGreaterThan(metrics4.airChangesPerHour);
    expect(metrics5.estimatedFilterLifespanDays).toBeGreaterThan(metrics4.estimatedFilterLifespanDays);
  });

  it('evaluates fan speed attenuation across High, Medium, and Low settings', () => {
    const base = getDefaultCorsiRosenthalConfig();
    const high = calculateCorsiRosenthalMetrics({ ...base, fanSpeedSetting: 'High' });
    const med = calculateCorsiRosenthalMetrics({ ...base, fanSpeedSetting: 'Medium' });
    const low = calculateCorsiRosenthalMetrics({ ...base, fanSpeedSetting: 'Low' });

    expect(high.effectiveCadrCfm).toBeGreaterThan(med.effectiveCadrCfm);
    expect(med.effectiveCadrCfm).toBeGreaterThan(low.effectiveCadrCfm);
  });

  it('models activated carbon layer impedance and cost inclusion', () => {
    const base = getDefaultCorsiRosenthalConfig();
    const withoutCarbon = calculateCorsiRosenthalMetrics({ ...base, hasCarbonLayer: false });
    const withCarbon = calculateCorsiRosenthalMetrics({ ...base, hasCarbonLayer: true });

    // Carbon adds ~6% impedance to air flow
    expect(withCarbon.effectiveCadrCfm).toBeLessThan(withoutCarbon.effectiveCadrCfm);
    // But adds ~$15 to total build cost
    expect(withCarbon.estimatedBuildCostUsd).toBe(withoutCarbon.estimatedBuildCostUsd + 15);
  });

  it('correctly tiers ACH ratings for large volume spaces', () => {
    const base = getDefaultCorsiRosenthalConfig();
    // Huge hall (35 x 30 x 14 ft = 14,700 cu ft)
    const largeRoom = calculateCorsiRosenthalMetrics({
      ...base,
      roomLengthFt: 35,
      roomWidthFt: 30,
      roomHeightFt: 14,
      fanSpeedSetting: 'Low',
    });

    expect(largeRoom.airChangesPerHour).toBeLessThan(3);
    expect(largeRoom.achRating).toBe('Insufficient');
  });

  it('handles zero room dimensions gracefully without dividing by zero', () => {
    const zeroRoom = calculateCorsiRosenthalMetrics({
      roomLengthFt: 0,
      roomWidthFt: 0,
      roomHeightFt: 0,
      fanNominalCfm: 2000,
      filterCount: 4,
      filterMerv: 13,
      hasCarbonLayer: false,
      fanSpeedSetting: 'High',
    });

    expect(zeroRoom.roomVolumeCuFt).toBe(0);
    expect(zeroRoom.airChangesPerHour).toBe(0);
    expect(zeroRoom.pm25HalfLifeMinutes).toBe(0);
  });
});
