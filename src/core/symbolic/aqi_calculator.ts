import { AqiCategory, PollutantReadings } from '../../types';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// US EPA Breakpoints for PM2.5 (24-hour average in µg/m³) - 2024 updated standards
const US_EPA_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 400 },
  { cLow: 325.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

// US EPA Breakpoints for PM10 (24-hour average in µg/m³)
const US_EPA_PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
  { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
];

// India National AQI (NAQI CPCB) Breakpoints for PM2.5 (in µg/m³)
const INDIA_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
];

// India NAQI Breakpoints for PM10 (in µg/m³)
const INDIA_PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
  { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
  { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
  { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
];

/**
 * Standard piecewise linear interpolation formula:
 * Ip = [ (IHi - ILo) / (BPHi - BPLo) ] * (Cp - BPLo) + ILo
 */
export function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration <= 0) return 0;

  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const index = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(index);
    }
  }

  // Beyond maximum defined breakpoint (Extreme emergency category)
  const last = breakpoints[breakpoints.length - 1];
  if (concentration > last.cHigh) {
    const scaleFactor = concentration / last.cHigh;
    return Math.min(999, Math.round(last.iHigh * scaleFactor));
  }

  return 0;
}

export function calculateUsAqi(pollutants: PollutantReadings): { aqi: number; dominant: string } {
  const pm25Sub = calculateSubIndex(pollutants.pm25, US_EPA_PM25_BREAKPOINTS);
  const pm10Sub = calculateSubIndex(pollutants.pm10, US_EPA_PM10_BREAKPOINTS);

  if (pm25Sub >= pm10Sub) {
    return { aqi: pm25Sub, dominant: 'PM2.5' };
  } else {
    return { aqi: pm10Sub, dominant: 'PM10' };
  }
}

export function calculateIndiaNaqi(pollutants: PollutantReadings): { aqi: number; dominant: string } {
  const pm25Sub = calculateSubIndex(pollutants.pm25, INDIA_PM25_BREAKPOINTS);
  const pm10Sub = calculateSubIndex(pollutants.pm10, INDIA_PM10_BREAKPOINTS);

  if (pm25Sub >= pm10Sub) {
    return { aqi: pm25Sub, dominant: 'PM2.5' };
  } else {
    return { aqi: pm10Sub, dominant: 'PM10' };
  }
}

export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  if (aqi <= 400) return 'Hazardous';
  return 'Severe+';
}

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
