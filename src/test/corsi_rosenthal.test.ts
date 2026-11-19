import { describe, it, expect } from 'vitest';
import {
  calculateCorsiRosenthalMetrics,
  getDefaultCorsiRosenthalConfig,
} from '../core/symbolic/corsi_rosenthal';

describe('Corsi-Rosenthal Box Purifier Symbolic Engine', () => {
  it('computes room volume and CADR accurately for default 16x14x9 room', () => {
    const config = getDefaultCorsiRosenthalConfig();
    const metrics = calculateCorsiRosenthalMetrics(config);

    // 16 * 14 * 9 = 2016 cubic feet
    expect(metrics.roomVolumeCuFt).toBe(2016);
    expect(metrics.roomVolumeM3).toBeCloseTo(57.1, 1);

    // CADR should be in realistic high-efficiency range (300 - 600 CFM)
    expect(metrics.effectiveCadrCfm).toBeGreaterThan(300);
    expect(metrics.effectiveCadrCfm).toBeLessThan(650);

    // ACH = (CADR * 60) / 2016 -> should achieve > 6 ACH (Hospital Grade)
    expect(metrics.airChangesPerHour).toBeGreaterThanOrEqual(6.0);
    expect(metrics.achRating).toBe('Ideal Hospital-Grade');

    // Clearance half-life should be under 10 minutes
    expect(metrics.pm25HalfLifeMinutes).toBeLessThan(10);
    expect(metrics.timeToClean90PctMinutes).toBeLessThan(25);
  });

  it('reflects higher performance with 5-filter configuration vs 4-filter', () => {
    const config4 = { ...getDefaultCorsiRosenthalConfig(), filterCount: 4 as const };
    const config5 = { ...getDefaultCorsiRosenthalConfig(), filterCount: 5 as const };

    const metrics4 = calculateCorsiRosenthalMetrics(config4);
    const metrics5 = calculateCorsiRosenthalMetrics(config5);

    expect(metrics5.effectiveCadrCfm).toBeGreaterThan(metrics4.effectiveCadrCfm);
    expect(metrics5.airChangesPerHour).toBeGreaterThan(metrics4.airChangesPerHour);
    expect(metrics5.estimatedFilterLifespanDays).toBeGreaterThan(metrics4.estimatedFilterLifespanDays);
  });

  it('adjusts CADR properly across fan speed settings', () => {
    const low = calculateCorsiRosenthalMetrics({ ...getDefaultCorsiRosenthalConfig(), fanSpeedSetting: 'Low' });
    const med = calculateCorsiRosenthalMetrics({ ...getDefaultCorsiRosenthalConfig(), fanSpeedSetting: 'Medium' });
    const high = calculateCorsiRosenthalMetrics({ ...getDefaultCorsiRosenthalConfig(), fanSpeedSetting: 'High' });

    expect(low.effectiveCadrCfm).toBeLessThan(med.effectiveCadrCfm);
    expect(med.effectiveCadrCfm).toBeLessThan(high.effectiveCadrCfm);
  });
});
