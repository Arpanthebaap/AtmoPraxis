import { AqiCategory, PollutantReadings } from '../../types';

export interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// US EPA Breakpoints for PM2.5 (24-hour average in µg/m³) - 2024 updated standards
export const US_EPA_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 400 },
  { cLow: 325.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

// US EPA Breakpoints for PM10 (24-hour average in µg/m³)
export const US_EPA_PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
  { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
];

// India National AQI (NAQI CPCB) Breakpoints for PM2.5 (in µg/m³)
export const INDIA_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
];

// India NAQI Breakpoints for PM10 (in µg/m³)
export const INDIA_PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
  { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
  { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
  { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
];

/**
 * Standard piecewise linear interpolation formula for Air Quality Sub-Index:
 * Ip = [ (IHi - ILo) / (BPHi - BPLo) ] * (Cp - BPLo) + ILo
 *
 * @param concentration Pollutant mass concentration in ambient air.
 * @param breakpoints Table of regulatory breakpoint bounds.
 * @returns Evaluated integer sub-index score.
 */
export function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration <= 0 || !Array.isArray(breakpoints) || breakpoints.length === 0) return 0;

  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const index = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(index);
    }
  }

  // Beyond maximum defined breakpoint (Extreme emergency category capped at 999)
  const last = breakpoints[breakpoints.length - 1];
  if (concentration > last.cHigh) {
    const scaleFactor = concentration / last.cHigh;
    return Math.min(999, Math.round(last.iHigh * scaleFactor));
  }

  return 0;
}

/**
 * Calculates US EPA composite Air Quality Index and identifies the primary risk driver.
 *
 * @param pollutants Current measured concentration of ambient atmospheric pollutants.
 * @returns Overall composite AQI value and dominant pollutant name.
 */
export function calculateUsAqi(pollutants: PollutantReadings): { aqi: number; dominant: string } {
  const pm25Sub = calculateSubIndex(pollutants.pm25, US_EPA_PM25_BREAKPOINTS);
  const pm10Sub = calculateSubIndex(pollutants.pm10, US_EPA_PM10_BREAKPOINTS);

  if (pm25Sub >= pm10Sub) {
    return { aqi: pm25Sub, dominant: 'PM2.5' };
  } else {
    return { aqi: pm10Sub, dominant: 'PM10' };
  }
}

/**
 * Calculates India National Air Quality Index (NAQI CPCB) and dominant pollutant.
 *
 * @param pollutants Current measured concentration of ambient atmospheric pollutants.
 * @returns Overall composite AQI value and dominant pollutant name.
 */
export function calculateIndiaNaqi(pollutants: PollutantReadings): { aqi: number; dominant: string } {
  const pm25Sub = calculateSubIndex(pollutants.pm25, INDIA_PM25_BREAKPOINTS);
  const pm10Sub = calculateSubIndex(pollutants.pm10, INDIA_PM10_BREAKPOINTS);

  if (pm25Sub >= pm10Sub) {
    return { aqi: pm25Sub, dominant: 'PM2.5' };
  } else {
    return { aqi: pm10Sub, dominant: 'PM10' };
  }
}

/**
 * Maps numerical AQI score to standardized health hazard classification.
 *
 * @param aqi Numerical Air Quality Index value.
 * @returns Human-readable health category classification.
 */
export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  if (aqi <= 400) return 'Hazardous';
  return 'Severe+';
}

/**
 * Returns Tailwind CSS styling classes and hex color code for a given AQI category.
 *
 * @param category Evaluated AQI category name.
 * @returns Object with background, text, border CSS classes and hex code.
 */
export function getAqiColorCode(category: AqiCategory): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  switch (category) {
    case 'Good':
      return { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10b981' };
    case 'Moderate':
      return { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#f59e0b' };
    case 'Unhealthy for Sensitive Groups':
      return { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/30', hex: '#f97316' };
    case 'Unhealthy':
      return { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-500/30', hex: '#ef4444' };
    case 'Very Unhealthy':
      return { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30', hex: '#8b5cf6' };
    case 'Hazardous':
      return { bg: 'bg-red-950/60', text: 'text-red-300', border: 'border-red-600/50', hex: '#881337' };
    case 'Severe+':
    default:
      return { bg: 'bg-stone-950/80', text: 'text-rose-500 font-bold', border: 'border-rose-700', hex: '#4c0519' };
  }
}
