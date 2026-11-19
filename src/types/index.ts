export type AqiStandard = 'US_EPA' | 'INDIA_NAQI';

export type AqiCategory = 
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'
  | 'Severe+';

export interface LocationData {
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
}

export interface PollutantReadings {
  pm25: number;        // µg/m³
  pm10: number;        // µg/m³
  no2: number;         // µg/m³
  so2: number;         // µg/m³
  o3: number;          // µg/m³
  co: number;          // mg/m³
}

export interface AtmosphericDynamics {
  temperature2m: number;         // °C
  relativeHumidity: number;      // %
  windSpeed10m: number;          // km/h
  boundaryLayerHeight: number;   // meters
  inversionStrength: number;     // °C difference or index (0-100)
  inversionTrappingRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  ventilationEfficiency: number; // % estimated dispersion capability
}

export interface HourlyForecastPoint {
  time: string;           // ISO timestamp or HH:mm
  hour: number;           // 0 - 23
  pm25: number;           // µg/m³
  pm10: number;           // µg/m³
  aqiUs: number;          // 0 - 500+
  aqiIndia: number;       // 0 - 500+
  temperature: number;    // °C
  windSpeed: number;      // km/h
  isRecommendedOutdoorWindow: boolean;
  inversionRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
}

export interface AirQualityState {
  location: LocationData;
  timestamp: string;
  pollutants: PollutantReadings;
  aqiUs: number;
  aqiIndia: number;
  categoryUs: AqiCategory;
  categoryIndia: AqiCategory;
  dominantPollutant: string;
  atmosphere: AtmosphericDynamics;
  hourly: HourlyForecastPoint[];
}

export interface RoutineItem {
  id: string;
  timeSlot: string;         // e.g. "06:30 - 07:30"
  activity: string;         // e.g. "Morning Aerobic Jogging"
  venue: 'outdoor' | 'indoor';
  originalExposureRisk: 'High' | 'Moderate' | 'Low';
  optimizedTimeSlot: string;
  mitigationStrategy: string;
  recommendedVenue: 'outdoor' | 'indoor_purified' | 'indoor_sealed';
  emissionSavingGrams: number; // grams PM2.5 / NOx avoided
}

export interface DailyRoutinePlan {
  headline: string;
  targetAudience: 'Family with Children' | 'Working Commuters' | 'Elderly / Vulnerable' | 'Active Fitness';
  smogPhase: 'Morning Peak Inversion' | 'Midday Solar Dispersal' | 'Evening Traffic Buildup' | 'Nocturnal Smog Trap';
  routines: RoutineItem[];
  mitigationSummary: string;
  totalExposureReductionPct: number;
}

export interface CorsiRosenthalConfig {
  roomLengthFt: number;
  roomWidthFt: number;
  roomHeightFt: number;
  fanNominalCfm: number;       // typically 2,000 CFM for standard 20" box fan
  filterCount: 4 | 5;          // 4-filter cube or 5-filter compactor (with bottom)
  filterMerv: 13 | 14;         // MERV-13 vs MERV-14
  hasCarbonLayer: boolean;     // Activated carbon pad for VOCs & NO2
  fanSpeedSetting: 'Low' | 'Medium' | 'High';
}

export interface CorsiRosenthalMetrics {
  roomVolumeCuFt: number;
  roomVolumeM3: number;
  effectiveCadrCfm: number;     // Clean Air Delivery Rate (CFM)
  airChangesPerHour: number;    // ACH
  achRating: 'Insufficient' | 'Moderate' | 'Ideal Hospital-Grade' | 'Maximum Protection';
  timeToClean90PctMinutes: number;
  timeToClean99PctMinutes: number;
  pm25HalfLifeMinutes: number;
  estimatedBuildCostUsd: number;
  estimatedFilterLifespanDays: number;
}

export interface SustainableHabit {
  id: string;
  title: string;
  category: 'Commute' | 'Home Heating' | 'Indoor Air Sink' | 'Cooking & Energy' | 'Community Action';
  baselinePractice: string;
  sustainableAlternative: string;
  dailyPm25ReductionGrams: number;
  dailyCo2eReductionKg: number;
  directHealthBenefit: string;
  neighborhoodBenefit: string;
  difficulty: 'Easy' | 'Moderate' | 'Transformative';
  adopted: boolean;
}

export interface PhysiologicalImpactMetrics {
  dailyInhaledPm25RestMicrograms: number;
  dailyInhaledPm25CommuteMicrograms: number;
  dailyInhaledPm25TotalMicrograms: number;
  equivalentCigarettesInhaled: number; // 22 µg/m³ 24h exposure ≈ 1 cigarette (Berkeley Earth model)
  alveolarDepositionPct: number;       // approx 60-70% for PM2.5 ultrafine fraction
  respiratoryStressIndex: number;      // 0 - 100
  mitigatedDosageWithAtmoPraxisMicrograms: number;
  preventedCigarettesEquivalent: number;
}

export interface CleanAirDossier {
  generatedAt: string;
  location: LocationData;
  currentAqi: number;
  aqiCategory: AqiCategory;
  optimalWindows: string[];
  safeCommuteWindow: string;
  diyPurifierSpec: string;
  topHabits: string[];
  inversionAdvisory: string;
}
