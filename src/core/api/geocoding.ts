import { LocationData } from '../../types';

export const PRESET_LOCATIONS: LocationData[] = [
  { city: 'Delhi', country: 'India', countryCode: 'IN', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { city: 'Kolkata', country: 'India', countryCode: 'IN', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { city: 'Mumbai', country: 'India', countryCode: 'IN', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { city: 'Lahore', country: 'Pakistan', countryCode: 'PK', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { city: 'Beijing', country: 'China', countryCode: 'CN', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai' },
  { city: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { city: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { city: 'Warsaw', country: 'Poland', countryCode: 'PL', latitude: 52.2297, longitude: 21.0122, timezone: 'Europe/Warsaw' },
  { city: 'Los Angeles', country: 'United States', countryCode: 'US', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { city: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
];

export async function searchLocations(query: string): Promise<LocationData[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) {
    return PRESET_LOCATIONS.slice(0, 5);
  }

  // Check matching presets first
  const matchingPresets = PRESET_LOCATIONS.filter(
    loc => loc.city.toLowerCase().includes(trimmed) || loc.country.toLowerCase().includes(trimmed)
  );

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding response failed');
    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      const liveResults: LocationData[] = data.results.map((r: any) => ({
        city: r.name,
        country: r.country || '',
        countryCode: r.country_code || '',
        latitude: r.latitude,
        longitude: r.longitude,
        timezone: r.timezone || 'UTC',
        elevation: r.elevation,
      }));

      // Merge and deduplicate by city + country
      const map = new Map<string, LocationData>();
      for (const loc of [...matchingPresets, ...liveResults]) {
        map.set(`${loc.city.toLowerCase()}-${loc.country.toLowerCase()}`, loc);
      }
      return Array.from(map.values()).slice(0, 6);
    }
  } catch (err) {
    console.warn('Geocoding fetch failed, falling back to preset index:', err);
  }

  return matchingPresets.length > 0 ? matchingPresets : PRESET_LOCATIONS.slice(0, 5);
}
