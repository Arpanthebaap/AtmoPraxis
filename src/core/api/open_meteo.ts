import { AirQualityState, HourlyForecastPoint, LocationData, PollutantReadings } from '../../types';
import { calculateIndiaNaqi, calculateUsAqi, getAqiCategory } from '../symbolic/aqi_calculator';
import { computeInversionDynamics } from '../symbolic/thermal_inversion';
import { APP_CONFIG } from '../../constants';

interface CacheEntry {
  timestamp: number;
  data: AirQualityState;
}

interface OpenMeteoHourlyAqi {
  time?: string[];
  pm10?: number[];
  pm2_5?: number[];
  carbon_monoxide?: number[];
  nitrogen_dioxide?: number[];
  sulphur_dioxide?: number[];
  ozone?: number[];
  us_aqi?: number[];
}

interface OpenMeteoAqiPayload {
  hourly?: OpenMeteoHourlyAqi;
}

interface OpenMeteoHourlyWeather {
  temperature_2m?: number[];
  relative_humidity_2m?: number[];
  wind_speed_10m?: number[];
}

interface OpenMeteoWeatherPayload {
  hourly?: OpenMeteoHourlyWeather;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = APP_CONFIG.CACHE_TTL_MS;

/**
 * Fetches real-time air speciation and boundary layer meteorology from Open-Meteo APIs.
 * Includes in-memory caching, network timeout controls, and a deterministic synthetic winter smog fallback.
 */
export async function fetchLiveAirQuality(location: LocationData): Promise<AirQualityState> {
  const cacheKey = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.NETWORK_TIMEOUT_MS);

  try {
    // Open-Meteo Air Quality API (Zero API key required)
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=auto&forecast_days=2`;
    
    // Open-Meteo Weather API for boundary layer temperature, wind, and humidity
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=2`;

    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl, { signal: controller.signal }),
      fetch(weatherUrl, { signal: controller.signal }),
    ]);

    if (!aqiRes.ok || !weatherRes.ok) {
      throw new Error(`Upstream meteorological data stream unavailable (AQI: ${aqiRes.status}, Weather: ${weatherRes.status})`);
    }

    const aqiData: OpenMeteoAqiPayload = await aqiRes.json();
    const weatherData: OpenMeteoWeatherPayload = await weatherRes.json();

    const result = parseOpenMeteoPayload(location, aqiData, weatherData);
    cache.set(cacheKey, { timestamp: now, data: result });
    return result;
  } catch (err) {
    console.warn('Real-time meteorological fetch error, falling back to deterministic local model:', err);
    return generateSyntheticWinterSmogState(location);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parses raw JSON responses from Open-Meteo into the typed AirQualityState schema.
 */
export function parseOpenMeteoPayload(
  location: LocationData,
  aqiData: OpenMeteoAqiPayload,
  weatherData: OpenMeteoWeatherPayload
): AirQualityState {
  const hourlyTimes: string[] = aqiData.hourly?.time ?? [];
  const currentHourIndex = Math.min(
    new Date().getHours(),
    Math.max(0, hourlyTimes.length - 1)
  );

  const pm25Arr: number[] = aqiData.hourly?.pm2_5 ?? [];
  const pm10Arr: number[] = aqiData.hourly?.pm10 ?? [];
  const no2Arr: number[] = aqiData.hourly?.nitrogen_dioxide ?? [];
  const so2Arr: number[] = aqiData.hourly?.sulphur_dioxide ?? [];
  const coArr: number[] = aqiData.hourly?.carbon_monoxide ?? [];
  const o3Arr: number[] = aqiData.hourly?.ozone ?? [];

  const tempArr: number[] = weatherData.hourly?.temperature_2m ?? [];
  const windArr: number[] = weatherData.hourly?.wind_speed_10m ?? [];
  const humidityArr: number[] = weatherData.hourly?.relative_humidity_2m ?? [];

  // Extract current readings with fallback defaults
  const currentPm25 = pm25Arr[currentHourIndex] ?? 45;
  const currentPm10 = pm10Arr[currentHourIndex] ?? 85;
  const currentNo2 = no2Arr[currentHourIndex] ?? 35;
  const currentSo2 = so2Arr[currentHourIndex] ?? 12;
  const currentCo = (coArr[currentHourIndex] ?? 450) / 1000; // convert µg/m³ to mg/m³
  const currentO3 = o3Arr[currentHourIndex] ?? 28;

  const currentTemp = tempArr[currentHourIndex] ?? 18;
  const currentWind = windArr[currentHourIndex] ?? 8;
  const currentHumidity = humidityArr[currentHourIndex] ?? 65;

  const currentPollutants: PollutantReadings = {
    pm25: Math.round(currentPm25),
    pm10: Math.round(currentPm10),
    no2: Math.round(currentNo2),
    so2: Math.round(currentSo2),
    o3: Math.round(currentO3),
    co: Number(currentCo.toFixed(2)),
  };

  const usCalc = calculateUsAqi(currentPollutants);
  const inCalc = calculateIndiaNaqi(currentPollutants);

  const atmosphere = computeInversionDynamics(
    new Date().getHours(),
    currentTemp,
    currentWind,
    currentHumidity
  );

  // Build 24-hour timeline
  const hourly: HourlyForecastPoint[] = [];
  const totalHours = Math.min(24, hourlyTimes.length);

  for (let i = 0; i < totalHours; i++) {
    const rawTime = hourlyTimes[i] ?? `T${String(i).padStart(2, '0')}:00`;
    const hourVal = new Date(rawTime).getHours();
    const p25 = pm25Arr[i] ?? 35;
    const p10 = pm10Arr[i] ?? 70;
    const temp = tempArr[i] ?? 18;
    const wind = windArr[i] ?? 8;
    const hum = humidityArr[i] ?? 60;

    const hourPollutants: PollutantReadings = {
      pm25: Math.round(p25),
      pm10: Math.round(p10),
      no2: Math.round(no2Arr[i] ?? 30),
      so2: Math.round(so2Arr[i] ?? 10),
      o3: Math.round(o3Arr[i] ?? 25),
      co: Number(((coArr[i] ?? 400) / 1000).toFixed(2)),
    };

    const hUs = calculateUsAqi(hourPollutants).aqi;
    const hIn = calculateIndiaNaqi(hourPollutants).aqi;
    const hAtmo = computeInversionDynamics(hourVal, temp, wind, hum);

    // Recommended outdoor window: daylight solar mixing (11:00 - 15:30) with non-extreme inversion risk
    const isOutdoorOk = hourVal >= 11 && hourVal <= 15 && hAtmo.inversionTrappingRisk !== 'Extreme';

    hourly.push({
      time: rawTime,
      hour: hourVal,
      pm25: hourPollutants.pm25,
      pm10: hourPollutants.pm10,
      aqiUs: hUs,
      aqiIndia: hIn,
      temperature: Math.round(temp),
      windSpeed: Math.round(wind),
      isRecommendedOutdoorWindow: isOutdoorOk,
      inversionRisk: hAtmo.inversionTrappingRisk,
    });
  }

  // If hourly array was empty (upstream missing time array), synthesize 24 points
  if (hourly.length === 0) {
    return generateSyntheticWinterSmogState(location);
  }

  return {
    location,
    timestamp: new Date().toISOString(),
    pollutants: currentPollutants,
    aqiUs: usCalc.aqi,
    aqiIndia: inCalc.aqi,
    categoryUs: getAqiCategory(usCalc.aqi),
    categoryIndia: getAqiCategory(inCalc.aqi),
    dominantPollutant: usCalc.dominant,
    atmosphere,
    hourly,
  };
}

/**
 * Deterministic biophysical fallback model generating diurnal winter smog curves
 * based on latitude and regional pollution baselines.
 */
export function generateSyntheticWinterSmogState(location: LocationData): AirQualityState {
  const currentHour = new Date().getHours();
  // Typical winter smog diurnal pattern: nocturnal spike at 07:00, dip at 13:00, secondary spike at 21:00
  const isSouthAsia = location.countryCode === 'IN' || location.countryCode === 'PK';
  const baselinePm25 = isSouthAsia ? 185 : 45;
  const currentTemp = isSouthAsia ? 16 : 6;
  const currentWind = 4.5;
  const currentHumidity = 78;

  const currentPollutants: PollutantReadings = {
    pm25: baselinePm25,
    pm10: baselinePm25 * 1.6,
    no2: 52,
    so2: 18,
    o3: 22,
    co: 1.4,
  };

  const usCalc = calculateUsAqi(currentPollutants);
  const inCalc = calculateIndiaNaqi(currentPollutants);
  const atmosphere = computeInversionDynamics(currentHour, currentTemp, currentWind, currentHumidity);

  const hourly: HourlyForecastPoint[] = [];
  for (let h = 0; h < 24; h++) {
    // Diurnal variation curve: peaks morning and night
    const morningPeak = Math.exp(-Math.pow((h - 7.5) / 2.5, 2)) * 1.5;
    const eveningPeak = Math.exp(-Math.pow((h - 21) / 3, 2)) * 1.3;
    const middayDip = Math.max(0.5, 1 - Math.exp(-Math.pow((h - 13.5) / 3.5, 2)) * 0.5);
    const hourlyFactor = Math.max(0.4, (morningPeak + eveningPeak + middayDip) / 1.5);

    const hPm25 = Math.round(baselinePm25 * hourlyFactor);
    const hPm10 = Math.round(hPm25 * 1.6);
    const hPollutants: PollutantReadings = {
      pm25: hPm25,
      pm10: hPm10,
      no2: Math.round(40 * hourlyFactor),
      so2: 15,
      o3: Math.round(15 + (h >= 11 && h <= 16 ? 25 : 5)),
      co: Number((0.8 * hourlyFactor).toFixed(2)),
    };

    const hUs = calculateUsAqi(hPollutants).aqi;
    const hIn = calculateIndiaNaqi(hPollutants).aqi;
    const hAtmo = computeInversionDynamics(h, currentTemp, currentWind, currentHumidity);
    const isOutdoorOk = h >= 11 && h <= 15 && hAtmo.inversionTrappingRisk !== 'Extreme';

    hourly.push({
      time: `2026-11-20T${String(h).padStart(2, '0')}:00`,
      hour: h,
      pm25: hPm25,
      pm10: hPm10,
      aqiUs: hUs,
      aqiIndia: hIn,
      temperature: Math.round(currentTemp + (h >= 10 && h <= 16 ? 5 : -2)),
      windSpeed: Math.round(currentWind + (h >= 11 && h <= 16 ? 4 : 0)),
      isRecommendedOutdoorWindow: isOutdoorOk,
      inversionRisk: hAtmo.inversionTrappingRisk,
    });
  }

  return {
    location,
    timestamp: new Date().toISOString(),
    pollutants: currentPollutants,
    aqiUs: usCalc.aqi,
    aqiIndia: inCalc.aqi,
    categoryUs: getAqiCategory(usCalc.aqi),
    categoryIndia: getAqiCategory(inCalc.aqi),
    dominantPollutant: usCalc.dominant,
    atmosphere,
    hourly,
  };
}
