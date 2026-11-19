import { describe, it, expect } from 'vitest';
import {
  calculateUsAqi,
  calculateIndiaNaqi,
  getAqiCategory,
  getAqiColorCode,
  calculateSubIndex,
} from '../core/symbolic/aqi_calculator';
import { PollutantReadings } from '../types';

describe('AQI Calculator Symbolic Engine', () => {
  it('correctly interpolates US EPA PM2.5 breakpoints across categories', () => {
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

    // 9.1 - 35.4 -> 51 - 100 (Moderate)
    const testPollutantsMod: PollutantReadings = {
      pm25: 25.0,
      pm10: 40,
      no2: 15,
      so2: 5,
      o3: 20,
      co: 0.3,
    };
    const resMod = calculateUsAqi(testPollutantsMod);
    expect(resMod.aqi).toBeGreaterThanOrEqual(51);
    expect(resMod.aqi).toBeLessThanOrEqual(100);
    expect(getAqiCategory(resMod.aqi)).toBe('Moderate');

    // 35.5 - 55.4 -> 101 - 150 (Unhealthy for Sensitive Groups)
    const testPollutantsSens: PollutantReadings = {
      pm25: 45.0,
      pm10: 60,
      no2: 20,
      so2: 8,
      o3: 25,
      co: 0.4,
    };
    const resSens = calculateUsAqi(testPollutantsSens);
    expect(resSens.aqi).toBeGreaterThanOrEqual(101);
    expect(resSens.aqi).toBeLessThanOrEqual(150);
    expect(getAqiCategory(resSens.aqi)).toBe('Unhealthy for Sensitive Groups');

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

    // 125.5 - 225.4 -> 201 - 300 (Very Unhealthy)
    const testPollutantsVU: PollutantReadings = {
      pm25: 180.0,
      pm10: 220,
      no2: 40,
      so2: 15,
      o3: 30,
      co: 1.0,
    };
    const resVU = calculateUsAqi(testPollutantsVU);
    expect(resVU.aqi).toBeGreaterThanOrEqual(201);
    expect(resVU.aqi).toBeLessThanOrEqual(300);
    expect(getAqiCategory(resVU.aqi)).toBe('Very Unhealthy');

    // 225.5 - 325.4 -> 301 - 400 (Hazardous)
    const testPollutantsHaz: PollutantReadings = {
      pm25: 280.0,
      pm10: 350,
      no2: 50,
      so2: 20,
      o3: 40,
      co: 1.5,
    };
    const resHaz = calculateUsAqi(testPollutantsHaz);
    expect(resHaz.aqi).toBeGreaterThanOrEqual(301);
    expect(resHaz.aqi).toBeLessThanOrEqual(400);
    expect(getAqiCategory(resHaz.aqi)).toBe('Hazardous');
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

  it('correctly determines dominant pollutant when PM10 is higher than PM2.5 sub-index', () => {
    const pm10Dominant: PollutantReadings = {
      pm25: 5,    // very low PM2.5
      pm10: 400,  // very high PM10 (dust storm)
      no2: 10,
      so2: 5,
      o3: 10,
      co: 0.1,
    };
    const res = calculateUsAqi(pm10Dominant);
    expect(res.dominant).toBe('PM10');
    expect(res.aqi).toBeGreaterThan(100);

    const resIn = calculateIndiaNaqi(pm10Dominant);
    expect(resIn.dominant).toBe('PM10');
  });

  it('handles zero, negative, and extreme out-of-bounds boundary conditions', () => {
    const zeroPollutants: PollutantReadings = {
      pm25: 0,
      pm10: 0,
      no2: 0,
      so2: 0,
      o3: 0,
      co: 0,
    };
    const resZero = calculateUsAqi(zeroPollutants);
    expect(resZero.aqi).toBe(0);
    expect(getAqiCategory(resZero.aqi)).toBe('Good');

    // Negative values
    expect(calculateSubIndex(-15, [])).toBe(0);

    // Extreme off-the-charts smog (> 500 µg/m³) capped at 999
    const extremePollutants: PollutantReadings = {
      pm25: 850,
      pm10: 1200,
      no2: 150,
      so2: 80,
      o3: 90,
      co: 8.0,
    };
    const resExtreme = calculateUsAqi(extremePollutants);
    expect(resExtreme.aqi).toBeLessThanOrEqual(999);
    expect(resExtreme.aqi).toBeGreaterThan(500);
    expect(getAqiCategory(resExtreme.aqi)).toBe('Severe+');
  });

  it('returns valid color and border class codes for all categories', () => {
    const categories = [
      'Good',
      'Moderate',
      'Unhealthy for Sensitive Groups',
      'Unhealthy',
      'Very Unhealthy',
      'Hazardous',
      'Severe+',
    ] as const;

    categories.forEach((cat) => {
      const code = getAqiColorCode(cat);
      expect(code.bg).toBeDefined();
      expect(code.text).toBeDefined();
      expect(code.border).toBeDefined();
      expect(code.hex.startsWith('#')).toBe(true);
    });
  });
});
