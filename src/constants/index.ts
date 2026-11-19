/**
 * AtmoPraxis Global Biophysical & Atmospheric Constants
 */

// WHO Global Air Quality Guidelines (2021) 24-hour caps
export const WHO_AIR_QUALITY_CAPS = {
  PM25_24H_UG_M3: 15,
  PM10_24H_UG_M3: 45,
  NO2_24H_UG_M3: 25,
  SO2_24H_UG_M3: 40,
  CO_24H_MG_M3: 4,
  O3_8H_UG_M3: 100,
} as const;

// Berkeley Earth Particulate Dosage Formulation Constants
// 1 cigarette ≈ continuous 22 µg/m³ PM2.5 over 24 hours (with ~10.8 m³ average adult breathing volume)
// 22 µg/m³ * 10.8 m³ = 237.6 µg PM2.5 per cigarette equivalent
export const BERKELEY_EARTH_PM25_UG_PER_CIGARETTE = 237.6;

// Human Minute Ventilation Rates (Liters per minute) across physical activities
export const MINUTE_VENTILATION_RATES = {
  REST_SLEEP_L_MIN: 6.0,          // 0.36 m³/h
  LIGHT_SEDENTARY_L_MIN: 10.0,    // 0.60 m³/h
  MODERATE_TRANSIT_L_MIN: 25.0,   // 1.50 m³/h
  INTENSE_EXERCISE_L_MIN: 45.0,   // 2.70 m³/h
} as const;

// Infiltration & Physiological Deposition Constants
export const BIOPHYSICAL_DEFAULTS = {
  INDOOR_OUTDOOR_INFILTRATION_RATIO: 0.75, // Typical urban dwelling without mechanical filtration
  PURIFIED_INDOOR_TARGET_PM25_UG_M3: 15,   // AtmoPraxis C-R box target indoor baseline
  ALVEOLAR_DEPOSITION_FRACTION_PCT: 68,   // ICRP deep lung tissue penetration fraction
} as const;

// Corsi-Rosenthal Box Purifier Fluid Dynamic Constants
export const CORSI_ROSENTHAL_DEFAULTS = {
  BOX_FAN_FREE_CFM: 2000,
  BOX_FAN_LOADED_HIGH_CFM: 580,
  SPEED_MULTIPLIERS: {
    High: 1.0,
    Medium: 0.78,
    Low: 0.55,
  },
  FILTER_EFFICIENCY: {
    MERV13: 0.82,
    MERV14: 0.90,
  },
  SURFACE_AREA_FACTOR_5_FILTER: 1.15,
  CARBON_PAD_IMPEDANCE: 0.94,
  COSTS: {
    FAN_USD: 22,
    MERV13_FILTER_USD: 12,
    MERV14_FILTER_USD: 16,
    CARBON_PAD_USD: 15,
    SHROUD_AND_TAPE_USD: 6,
  },
} as const;

// Tropospheric Boundary Layer & Inversion Thresholds
export const ATMOSPHERE_THRESHOLDS = {
  CRITICAL_MIXING_HEIGHT_METERS: 200,
  GOOD_DISPERSION_HEIGHT_METERS: 800,
  STAGNANT_WIND_SPEED_KMH: 6.0,
  VENTILATION_COEF_HAZARD_M2_S: 2000,
  DEFAULT_SOLAR_WINDOW: '12:30 - 14:30 (Solar Peak)',
} as const;

// Application Configuration & Network Limits
export const APP_CONFIG = {
  NETWORK_TIMEOUT_MS: 10000, // 10 seconds timeout
  CACHE_TTL_MS: 15 * 60 * 1000, // 15 minutes
  STORAGE_KEY_API_KEY: 'atmopraxis_gemini_key',
  DEFAULT_GEMINI_MODEL: 'gemini-2.5-flash',
} as const;
