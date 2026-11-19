import { CorsiRosenthalConfig, CorsiRosenthalMetrics } from '../../types';
import { CORSI_ROSENTHAL_DEFAULTS } from '../../constants';

/**
 * Deterministic Corsi-Rosenthal Box Fan Filtration & Room CADR Solver.
 * 
 * Developed by Dr. Richard Corsi and Jim Rosenthal, the Corsi-Rosenthal (C-R) box is a
 * scientifically validated, low-cost DIY air purifier composed of a 20" box fan and 4-5 MERV-13 filters.
 * Because the plenum geometry increases total filter surface area by ~400-500%, face velocity is dramatically
 * reduced, minimizing pressure drop across the fan blades and maximizing total volumetric flow.
 * 
 * Mathematical Formulation:
 * 1. Room Volume: V_room = L * W * H (cubic feet)
 * 2. Effective CADR: CADR = Q_fan_loaded * SinglePassEfficiency
 *    - MERV-13 single-pass particle removal efficiency for 0.3 - 2.5 µm is ~82%
 *    - 4-filter plenum achieves ~450 - 550 CFM on medium/high speed.
 * 3. Air Changes per Hour (ACH): ACH = (CADR * 60) / V_room
 * 4. Exponential Decay Law: C(t) = C_0 * e^(-ACH * t)
 *    - Half-life (50% reduction): t_half = ln(2) / ACH * 60 (minutes)
 *    - 90% reduction: t_90 = -ln(0.10) / ACH * 60 (minutes)
 *    - 99% reduction: t_99 = -ln(0.01) / ACH * 60 (minutes)
 *
 * @param config Specification of room dimensions, fan speed, filter rating, and carbon pad.
 * @returns Computed metrics including effective CADR, ACH, aerosol clearance times, and DIY build cost.
 */
export function calculateCorsiRosenthalMetrics(config: CorsiRosenthalConfig): CorsiRosenthalMetrics {
  const roomVolumeCuFt = Math.max(0, Math.round(config.roomLengthFt * config.roomWidthFt * config.roomHeightFt));
  const roomVolumeM3 = Number((roomVolumeCuFt * 0.0283168).toFixed(1));

  // Determine fan speed air flow multiplier from centralized constants
  const speedMultiplier = CORSI_ROSENTHAL_DEFAULTS.SPEED_MULTIPLIERS[config.fanSpeedSetting] ?? 1.0;

  // MERV filtration efficiency for fine aerosol / PM2.5 (0.3 - 2.5 micron)
  const filterEfficiency = config.filterMerv === 14 
    ? CORSI_ROSENTHAL_DEFAULTS.FILTER_EFFICIENCY.MERV14 
    : CORSI_ROSENTHAL_DEFAULTS.FILTER_EFFICIENCY.MERV13;

  // 4 vs 5 filter surface area factor:
  // 5 filters (4 sides + 1 bottom) lowers face resistance further by 15-18%
  const surfaceAreaFactor = config.filterCount === 5 
    ? CORSI_ROSENTHAL_DEFAULTS.SURFACE_AREA_FACTOR_5_FILTER 
    : 1.0;

  // Carbon pad resistance penalty (carbon adds slight flow impedance ~6%, but removes NO2 & VOCs)
  const carbonImpedance = config.hasCarbonLayer 
    ? CORSI_ROSENTHAL_DEFAULTS.CARBON_PAD_IMPEDANCE 
    : 1.0;

  // Realistic loaded CFM for standard 20-inch box fan (e.g. Lasko 3720 / 3733 with front cardboard shroud)
  const baseLoadedFlowCfm = CORSI_ROSENTHAL_DEFAULTS.BOX_FAN_LOADED_HIGH_CFM;
  const effectiveCadrCfm = Math.round(
    baseLoadedFlowCfm * speedMultiplier * surfaceAreaFactor * filterEfficiency * carbonImpedance
  );

  // Air Changes per Hour (ACH)
  const rawAch = roomVolumeCuFt > 0 ? (effectiveCadrCfm * 60) / roomVolumeCuFt : 0;
  const airChangesPerHour = Number(rawAch.toFixed(2));

  // Categorize ACH rating based on CDC / ASHRAE / WHO airborne standards:
  // < 3: Insufficient; 3 - 5: Moderate; 6 - 11: Ideal Hospital-Grade; >= 12: Maximum Protection
  let achRating: 'Insufficient' | 'Moderate' | 'Ideal Hospital-Grade' | 'Maximum Protection' = 'Insufficient';
  if (airChangesPerHour >= 12) {
    achRating = 'Maximum Protection';
  } else if (airChangesPerHour >= 6) {
    achRating = 'Ideal Hospital-Grade';
  } else if (airChangesPerHour >= 3) {
    achRating = 'Moderate';
  }

  // Clearance times (minutes)
  let halfLifeMinutes = 0;
  let timeToClean90PctMinutes = 0;
  let timeToClean99PctMinutes = 0;

  if (airChangesPerHour > 0) {
    halfLifeMinutes = Number(((Math.LN2 / airChangesPerHour) * 60).toFixed(1));
    timeToClean90PctMinutes = Number(((2.3026 / airChangesPerHour) * 60).toFixed(1));
    timeToClean99PctMinutes = Number(((4.6052 / airChangesPerHour) * 60).toFixed(1));
  }

  // Cost calculation (USD) from centralized constants
  const fanCost = CORSI_ROSENTHAL_DEFAULTS.COSTS.FAN_USD;
  const filterUnitCost = config.filterMerv === 14 
    ? CORSI_ROSENTHAL_DEFAULTS.COSTS.MERV14_FILTER_USD 
    : CORSI_ROSENTHAL_DEFAULTS.COSTS.MERV13_FILTER_USD;
  const filtersTotalCost = config.filterCount * filterUnitCost;
  const carbonCost = config.hasCarbonLayer ? CORSI_ROSENTHAL_DEFAULTS.COSTS.CARBON_PAD_USD : 0;
  const miscCost = CORSI_ROSENTHAL_DEFAULTS.COSTS.SHROUD_AND_TAPE_USD;
  const estimatedBuildCostUsd = fanCost + filtersTotalCost + carbonCost + miscCost;

  // Filter lifespan: under severe winter smog (daily AQI > 200), typical life is 90-120 days.
  // With 5 filters it lasts ~150 days due to increased dust holding capacity.
  const estimatedFilterLifespanDays = config.filterCount === 5 ? 150 : 120;

  return {
    roomVolumeCuFt,
    roomVolumeM3,
    effectiveCadrCfm,
    airChangesPerHour,
    achRating,
    timeToClean90PctMinutes,
    timeToClean99PctMinutes,
    pm25HalfLifeMinutes: halfLifeMinutes,
    estimatedBuildCostUsd,
    estimatedFilterLifespanDays,
  };
}

/**
 * Returns baseline configuration representing a standard master bedroom C-R box setup.
 */
export function getDefaultCorsiRosenthalConfig(): CorsiRosenthalConfig {
  return {
    roomLengthFt: 16,
    roomWidthFt: 14,
    roomHeightFt: 9,
    fanNominalCfm: CORSI_ROSENTHAL_DEFAULTS.BOX_FAN_FREE_CFM,
    filterCount: 4,
    filterMerv: 13,
    hasCarbonLayer: true,
    fanSpeedSetting: 'Medium',
  };
}
