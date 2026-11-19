import { describe, it, expect } from 'vitest';
import { generateSyntheticWinterSmogState, parseOpenMeteoPayload } from '../core/api/open_meteo';
import { PRESET_LOCATIONS } from '../core/api/geocoding';

describe('Open-Meteo Atmospheric Ingestion & Fallbacks', () => {
  const delhi = PRESET_LOCATIONS[0];
  const london = PRESET_LOCATIONS[5];

  describe('generateSyntheticWinterSmogState', () => {
    it('generates 24-hour diurnal curve for high-smog Asian airsheds', () => {
      const state = generateSyntheticWinterSmogState(delhi);
      expect(state.location.city).toBe('Delhi');
      expect(state.hourly.length).toBe(24);
      expect(state.pollutants.pm25).toBeGreaterThanOrEqual(150);
      expect(state.aqiUs).toBeGreaterThanOrEqual(200);
      expect(state.dominantPollutant).toBe('PM2.5');

      // Check outdoor window recommendations
      const middayHours = state.hourly.filter((h) => h.hour >= 12 && h.hour <= 14);
      expect(middayHours.length).toBeGreaterThan(0);
      expect(middayHours.some((h) => h.isRecommendedOutdoorWindow)).toBe(true);
    });

    it('generates appropriate baselines for European/Western cities', () => {
      const state = generateSyntheticWinterSmogState(london);
      expect(state.location.city).toBe('London');
      expect(state.pollutants.pm25).toBeLessThan(100);
      expect(state.hourly.length).toBe(24);
    });
  });

  describe('parseOpenMeteoPayload', () => {
    it('safely handles empty or missing upstream payloads without crashing', () => {
      const emptyAqi = {};
      const emptyWeather = {};

      const state = parseOpenMeteoPayload(delhi, emptyAqi, emptyWeather);
      expect(state).toBeDefined();
      expect(state.location.city).toBe('Delhi');
      expect(state.hourly.length).toBe(24);
      expect(state.pollutants.pm25).toBeGreaterThan(0);
    });

    it('accurately maps full API telemetry arrays', () => {
      const mockTimes = Array.from({ length: 24 }, (_, i) => `2026-11-20T${String(i).padStart(2, '0')}:00`);
      const mockPm25 = Array.from({ length: 24 }, () => 120);
      const mockPm10 = Array.from({ length: 24 }, () => 200);

      const mockAqi = {
        hourly: {
          time: mockTimes,
          pm2_5: mockPm25,
          pm10: mockPm10,
          carbon_monoxide: Array(24).fill(600),
          nitrogen_dioxide: Array(24).fill(45),
          sulphur_dioxide: Array(24).fill(15),
          ozone: Array(24).fill(30),
        },
      };

      const mockWeather = {
        hourly: {
          temperature_2m: Array(24).fill(15),
          relative_humidity_2m: Array(24).fill(70),
          wind_speed_10m: Array(24).fill(5),
        },
      };

      const state = parseOpenMeteoPayload(delhi, mockAqi, mockWeather);
      expect(state.pollutants.pm25).toBe(120);
      expect(state.pollutants.pm10).toBe(200);
      expect(state.hourly.length).toBe(24);
      expect(state.atmosphere.windSpeed10m).toBe(5);
    });
  });
});
