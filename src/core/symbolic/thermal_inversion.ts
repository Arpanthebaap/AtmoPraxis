import { AtmosphericDynamics } from '../../types';
import { ATMOSPHERE_THRESHOLDS } from '../../constants';

/**
 * Deterministic Boundary Layer & Thermal Inversion Trapping Solver.
 * 
 * In urban winter meteorology, nocturnal radiative cooling produces a positive thermal
 * lapse rate (dT/dz > 0) near the surface. This inversion layer forms a thermal "lid" that caps
 * vertical turbulent mixing. Pollutants from vehicles, cooking, and industrial heating are
 * compressed into an extremely shallow planetary boundary layer (PBL), multiplying surface
 * PM2.5 concentrations by 3x to 8x.
 */

export interface InversionAnalysisResult {
  isTrappingActive: boolean;
  trappingRiskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  trappingIndexScore: number; // 0 - 100
  boundaryLayerHeightMeters: number;
  ventilationCoefficient: number; // m²/s (Wind speed * Mixing height)
  recommendedOutdoorAction: string;
  scientificExplanation: string;
}

/**
 * Evaluates tropospheric boundary layer height, temperature gradient, and smog trapping risk.
 *
 * @param hour Local hour of day (0 - 23).
 * @param temp2m Ambient 2-meter air temperature in °C.
 * @param windSpeedKmH Surface 10-meter wind speed in km/h.
 * @param humidity Relative humidity percentage (0 - 100).
 * @returns Atmospheric dynamics object with boundary layer depth and trapping risk level.
 */
export function computeInversionDynamics(
  hour: number,
  temp2m: number,
  windSpeedKmH: number,
  humidity: number
): AtmosphericDynamics {
  const safeWind = Math.max(0, windSpeedKmH);
  const safeHumidity = Math.max(0, Math.min(100, humidity));

  // Model nocturnal inversion based on diurnal cycle and wind speed
  const isNocturnal = hour >= 20 || hour <= 8;
  const isPeakMorningInversion = hour >= 5 && hour <= 9;

  // Stagnant wind prevents mechanical turbulence and strengthens trapping
  const windFactor = Math.max(0.1, 1 - safeWind / 20);

  // Boundary layer height (meters): 
  // In sunny afternoons: 800 - 1500m; In winter smog nights/early mornings: 80 - 250m
  let basePblHeight: number;
  if (isPeakMorningInversion) {
    basePblHeight = 120 + (safeWind * 8);
  } else if (isNocturnal) {
    basePblHeight = 180 + (safeWind * 10);
  } else {
    // Solar insolation expands mixing layer
    const middaySolarEffect = Math.sin(((hour - 8) / 10) * Math.PI);
    basePblHeight = 450 + Math.max(0, middaySolarEffect * 850) + (safeWind * 15);
  }
  const boundaryLayerHeight = Math.round(Math.max(80, Math.min(1800, basePblHeight)));

  // Calculate Inversion Trapping Score (0 to 100)
  const pblPenalty = Math.max(0, (1 - boundaryLayerHeight / ATMOSPHERE_THRESHOLDS.GOOD_DISPERSION_HEIGHT_METERS) * 50);
  const stagnationPenalty = windFactor * 35;
  const humidityPenalty = (safeHumidity / 100) * 15;
  
  let trappingScore = Math.round(pblPenalty + stagnationPenalty + humidityPenalty);
  trappingScore = Math.max(5, Math.min(99, trappingScore));

  let trappingRisk: 'Low' | 'Moderate' | 'High' | 'Extreme' = 'Low';
  if (trappingScore >= 75) trappingRisk = 'Extreme';
  else if (trappingScore >= 55) trappingRisk = 'High';
  else if (trappingScore >= 35) trappingRisk = 'Moderate';

  // Ventilation efficiency (0 - 100%)
  const ventilationEfficiency = Math.max(5, Math.round(100 - trappingScore));

  // Temperature inversion strength (°C gradient)
  const inversionStrength = isNocturnal 
    ? Number((2.8 * windFactor + (safeHumidity > 70 ? 1.2 : 0)).toFixed(1))
    : Number((0.2 * (1 - windFactor)).toFixed(1));

  return {
    temperature2m: temp2m,
    relativeHumidity: safeHumidity,
    windSpeed10m: safeWind,
    boundaryLayerHeight,
    inversionStrength,
    inversionTrappingRisk: trappingRisk,
    ventilationEfficiency,
  };
}

/**
 * Assesses biological and operational safety based on evaluated atmospheric dynamics.
 *
 * @param dynamics Atmospheric sounding and boundary layer parameters.
 * @returns Inversion analysis with actionable public health recommendations.
 */
export function evaluateInversionSafety(dynamics: AtmosphericDynamics): InversionAnalysisResult {
  const windSpeedMs = (dynamics.windSpeed10m * 1000) / 3600;
  // Ventilation Coefficient (VC) = Mixing Height (m) * Wind Speed (m/s)
  // VC < 2,000 m²/s is classified as poor dispersion / high pollution hazard
  const ventilationCoefficient = Math.round(dynamics.boundaryLayerHeight * windSpeedMs);

  let recommendation = '';
  let explanation = '';

  switch (dynamics.inversionTrappingRisk) {
    case 'Extreme':
      recommendation = 'Hard curfew on outdoor aerobic activity. Seal windows; activate indoor recirculating filtration.';
      explanation = `Thermal inversion layer caps vertical mixing at only ${dynamics.boundaryLayerHeight}m with low surface wind (${dynamics.windSpeed10m} km/h). Severe toxic accumulation near ground breathing level.`;
      break;
    case 'High':
      recommendation = 'Shift all physical commutes and workouts to midday (12:00 - 15:30). Wear fit-tested N95 outdoors.';
      explanation = `Weak atmospheric boundary layer (${dynamics.boundaryLayerHeight}m) severely limits vertical dispersion. Combustion soot and vehicle tailpipe particles remain trapped.`;
      break;
    case 'Moderate':
      recommendation = 'Brief outdoor transit acceptable; avoid vigorous exercise alongside arterial traffic corridors.';
      explanation = `Moderate vertical mixing occurring. Localized microclimate pockets may still hold particulate plumes.`;
      break;
    case 'Low':
    default:
      recommendation = 'Optimal window for brief structural cross-ventilation and natural indoor air flushing.';
      explanation = `Solar thermal expansion has lofted the boundary layer to ${dynamics.boundaryLayerHeight}m. High turbulence allows rapid dispersion.`;
      break;
  }

  return {
    isTrappingActive: dynamics.inversionTrappingRisk === 'High' || dynamics.inversionTrappingRisk === 'Extreme',
    trappingRiskLevel: dynamics.inversionTrappingRisk,
    trappingIndexScore: Math.round(100 - dynamics.ventilationEfficiency),
    boundaryLayerHeightMeters: dynamics.boundaryLayerHeight,
    ventilationCoefficient,
    recommendedOutdoorAction: recommendation,
    scientificExplanation: explanation,
  };
}
