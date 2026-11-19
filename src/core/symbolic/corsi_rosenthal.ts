import { CorsiRosenthalConfig, CorsiRosenthalMetrics } from '../../types';

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
 *    - MERV-13 single-pass particle removal efficiency for 0.3 - 2.5 µm is ~80% - 85%
 *    - 4-filter plenum achieves ~450 - 550 CFM on medium/high speed.
 * 3. Air Changes per Hour (ACH): ACH = (CADR * 60) / V_room
 * 4. Exponential Decay Law: C(t) = C_0 * e^(-ACH * t)
 *    - Half-life (50% reduction): t_half = ln(2) / ACH * 60 (minutes)
 *    - 90% reduction: t_90 = -ln(0.10) / ACH * 60 (minutes)
 *    - 99% reduction: t_99 = -ln(0.01) / ACH * 60 (minutes)
 */

export function calculateCorsiRosenthalMetrics(config: CorsiRosenthalConfig): CorsiRosenthalMetrics {
  const roomVolumeCuFt = Math.round(config.roomLengthFt * config.roomWidthFt * config.roomHeightFt);
  const roomVolumeM3 = Number((roomVolumeCuFt * 0.0283168).toFixed(1));

  // Determine fan speed air flow multiplier
  let speedMultiplier = 1.0; // High speed default
  if (config.fanSpeedSetting === 'Medium') speedMultiplier = 0.78;
  if (config.fanSpeedSetting === 'Low') speedMultiplier = 0.55;

  // MERV filtration efficiency for fine aerosol / PM2.5 (0.3 - 2.5 micron)
  const filterEfficiency = config.filterMerv === 14 ? 0.90 : 0.82;

  // 4 vs 5 filter surface area factor:
  // 5 filters (4 sides + 1 bottom) lowers face resistance further by 18%
  const surfaceAreaFactor = config.filterCount === 5 ? 1.15 : 1.0;

  // Carbon pad resistance penalty (carbon adds slight flow impedance ~6%, but removes NO2 & VOCs)
  const carbonImpedance = config.hasCarbonLayer ? 0.94 : 1.0;

  // Realistic loaded CFM for standard 20-inch box fan (e.g. Lasko 3720 / 3733)
  // Free air is ~2000 CFM, loaded across 4 MERV-13 filters with shroud is ~580 CFM on high
  const baseLoadedFlowCfm = 580;
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

  // Cost calculation (USD)
  // Box fan: ~$22, MERV-13 filters: ~$12 each, Duct tape/shroud cardboard: ~$6, Carbon pad: ~$15
  const fanCost = 22;
  const filterUnitCost = config.filterMerv === 14 ? 16 : 12;
  const filtersTotalCost = config.filterCount * filterUnitCost;
  const carbonCost = config.hasCarbonLayer ? 15 : 0;
  const miscCost = 6;
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

export function getDefaultCorsiRosenthalConfig(): CorsiRosenthalConfig {
  return {
    roomLengthFt: 16,
    roomWidthFt: 14,
    roomHeightFt: 9,
    fanNominalCfm: 2000,
    filterCount: 4,
    filterMerv: 13,
    hasCarbonLayer: true,
    fanSpeedSetting: 'Medium',
  };
}
