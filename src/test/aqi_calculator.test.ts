import { describe, it, expect } from 'vitest';
import {
  calculateUsAqi,
  calculateIndiaNaqi,
  getAqiCategory,
} from '../core/symbolic/aqi_calculator';
import { PollutantReadings } from '../types';

describe('AQI Calculator Symbolic Engine', () => {
  it('correctly interpolates US EPA PM2.5 breakpoints', () => {
    // 0 - 9.0 -> 0 - 50 (Good)
    const testPollutants1: PollutantReadings = {
      pm25: 4.5,
      pm10: 10,
      no2: 10,
      so2: 5,
      o3: 15,
      co: 0.2,
    };
    const res1 = calculateUsAqi(testPollutants1);
    expect(res1.aqi).toBeGreaterThanOrEqual(0);
    expect(res1.aqi).toBeLessThanOrEqual(50);
    expect(getAqiCategory(res1.aqi)).toBe('Good');

    // 55.5 - 125.4 -> 151 - 200 (Unhealthy)
    const testPollutants2: PollutantReadings = {
      pm25: 65.0,
      pm10: 100,
      no2: 20,
      so2: 10,
      o3: 20,
      co: 0.5,
    };
    const res2 = calculateUsAqi(testPollutants2);
    expect(res2.aqi).toBeGreaterThanOrEqual(151);
    expect(res2.aqi).toBeLessThanOrEqual(200);
    expect(getAqiCategory(res2.aqi)).toBe('Unhealthy');
  });

  it('correctly calculates India National AQI (NAQI CPCB standards)', () => {
    // Under India NAQI: 0-30 µg/m³ PM2.5 is Good (0-50 AQI)
    const indianGood: PollutantReadings = {
      pm25: 25,
      pm10: 40,
      no2: 20,
      so2: 5,
      o3: 15,
      co: 0.3,
    };
    const resGood = calculateIndiaNaqi(indianGood);
    expect(resGood.aqi).toBeLessThanOrEqual(50);
    expect(getAqiCategory(resGood.aqi)).toBe('Good');

    // Under India NAQI: > 250 µg/m³ is Severe (401-500)
    const indianSevere: PollutantReadings = {
      pm25: 350,
      pm10: 550,
      no2: 90,
      so2: 40,
      o3: 35,
      co: 3.5,
    };
    const resSevere = calculateIndiaNaqi(indianSevere);
    expect(resSevere.aqi).toBeGreaterThanOrEqual(401);
    expect(getAqiCategory(resSevere.aqi)).toBe('Severe+');
  });

  it('handles zero and negative boundary conditions gracefully', () => {
    const zeroPollutants: PollutantReadings = {
      pm25: 0,
      pm10: 0,
      no2: 0,
      so2: 0,
      o3: 0,
      co: 0,
    };
    const res = calculateUsAqi(zeroPollutants);
    expect(res.aqi).toBe(0);
    expect(getAqiCategory(res.aqi)).toBe('Good');
  });
});
