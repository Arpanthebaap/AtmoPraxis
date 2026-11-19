import { describe, it, expect } from 'vitest';
import { searchLocations, PRESET_LOCATIONS } from '../core/api/geocoding';

describe('Geocoding & High-Smog Corridors', () => {
  it('returns preset locations for empty or single-character queries', async () => {
    const resultsEmpty = await searchLocations('');
    expect(resultsEmpty.length).toBe(5);
    expect(resultsEmpty[0].city).toBe('Delhi');

    const resultsSingle = await searchLocations('a');
    expect(resultsSingle.length).toBe(5);
  });

  it('matches predefined preset cities case-insensitively without network dependency', async () => {
    const results = await searchLocations('delhi');
    expect(results.some((r) => r.city === 'Delhi')).toBe(true);

    const resultsKolkata = await searchLocations('KOLKATA');
    expect(resultsKolkata.some((r) => r.city === 'Kolkata')).toBe(true);

    const resultsBeijing = await searchLocations('beijing');
    expect(resultsBeijing.some((r) => r.city === 'Beijing')).toBe(true);
  });

  it('matches predefined preset countries', async () => {
    const resultsIndia = await searchLocations('India');
    expect(resultsIndia.length).toBeGreaterThanOrEqual(1);
    expect(resultsIndia.every((r) => r.country === 'India')).toBe(true);
  });

  it('verifies coordinate boundaries for all preset locations', () => {
    PRESET_LOCATIONS.forEach((loc) => {
      expect(loc.city).toBeDefined();
      expect(loc.country).toBeDefined();
      expect(loc.latitude).toBeGreaterThanOrEqual(-90);
      expect(loc.latitude).toBeLessThanOrEqual(90);
      expect(loc.longitude).toBeGreaterThanOrEqual(-180);
      expect(loc.longitude).toBeLessThanOrEqual(180);
      expect(loc.timezone).toBeDefined();
    });
  });
});
