import { SustainableHabit } from '../../types';

export const INITIAL_SUSTAINABLE_HABITS: SustainableHabit[] = [
  {
    id: 'habit-metro-commute',
    title: 'Electrified Public Transit Shift',
    category: 'Commute',
    baselinePractice: 'Single-occupancy petrol/diesel car commute (25 km round-trip)',
    sustainableAlternative: 'Metro rail transit + last-mile EV shuttle / brisk walking with N95',
    dailyPm25ReductionGrams: 4.8,
    dailyCo2eReductionKg: 5.2,
    directHealthBenefit: 'Avoids sitting in heavy arterial traffic exhaust micro-plumes; reduces acute VOC exposure by 74%.',
    neighborhoodBenefit: 'Removes 4.8g of tailpipe PM2.5 and 5.2kg CO2 from the neighborhood corridor airshed.',
    difficulty: 'Moderate',
    adopted: true,
  },
  {
    id: 'habit-cr-box-purifier',
    title: 'DIY Corsi-Rosenthal Box Fan Purifier',
    category: 'Indoor Air Sink',
    baselinePractice: 'Relying on closed windows without mechanical air filtration (I/O ratio = 0.75)',
    sustainableAlternative: 'Deploying a 4-filter MERV-13 Corsi-Rosenthal box fan on continuous low/medium speed',
    dailyPm25ReductionGrams: 12.5,
    dailyCo2eReductionKg: 0.0,
    directHealthBenefit: 'Reduces indoor PM2.5 from 180 µg/m³ down to < 18 µg/m³ within 45 minutes; clears 90% of fine aerosol particles.',
    neighborhoodBenefit: 'Provides hospital-grade clean air shelter for children, elderly, and neighbors.',
    difficulty: 'Easy',
    adopted: true,
  },
  {
    id: 'habit-midday-ventilation',
    title: 'Solar Thermal Ventilation Window',
    category: 'Indoor Air Sink',
    baselinePractice: 'Opening windows at 07:00 AM for "fresh morning air" during nocturnal thermal smog trapping',
    sustainableAlternative: 'Confining window airing strictly between 12:30 PM - 14:30 PM during peak solar boundary layer mixing',
    dailyPm25ReductionGrams: 8.2,
    dailyCo2eReductionKg: 0.0,
    directHealthBenefit: 'Prevents direct intrusion of high-concentration inversion smog; reduces indoor peak PM2.5 by 62%.',
    neighborhoodBenefit: 'Zero-energy natural air exchange without requiring expensive pre-heaters.',
    difficulty: 'Easy',
    adopted: true,
  },
  {
    id: 'habit-electric-radiant-heat',
    title: 'Clean Electric Space Heating',
    category: 'Home Heating',
    baselinePractice: 'Wood burning hearth, charcoal brazier, or unvented kerosene space heater',
    sustainableAlternative: 'Thermostatically controlled electric oil radiator or inverter heat pump heating',
    dailyPm25ReductionGrams: 28.0,
    dailyCo2eReductionKg: 3.8,
    directHealthBenefit: 'Eliminates deadly carbon monoxide (CO), polycyclic aromatic hydrocarbons (PAHs), and ultra-fine black soot indoors.',
    neighborhoodBenefit: 'Prevents 28g of raw combustion particulate emissions from polluting neighboring homes.',
    difficulty: 'Transformative',
    adopted: false,
  },
  {
    id: 'habit-wet-microfiber-mop',
    title: 'Electrostatic Particulate Sink Protocol',
    category: 'Indoor Air Sink',
    baselinePractice: 'Dry sweeping with broom (causes 400% resuspension of toxic settled floor dust into breathing zone)',
    sustainableAlternative: 'Damp electrostatic microfiber mopping with HEPA vacuuming twice weekly',
    dailyPm25ReductionGrams: 3.5,
    dailyCo2eReductionKg: 0.1,
    directHealthBenefit: 'Traps lead, tire wear particles, and heavy metals on floor surfaces before children can inhale them.',
    neighborhoodBenefit: 'Keeps household particulate loads permanently sequestered.',
    difficulty: 'Easy',
    adopted: true,
  },
  {
    id: 'habit-induction-cooking',
    title: 'Electric Induction & Exhaust Range Hood',
    category: 'Cooking & Energy',
    baselinePractice: 'High-heat stir frying on unvented gas burner (emits NO2 > 400 µg/m³ and ultrafine cooking droplets)',
    sustainableAlternative: 'Electric induction cooktop with ducted range hood active during and 10 mins post cooking',
    dailyPm25ReductionGrams: 6.0,
    dailyCo2eReductionKg: 1.2,
    directHealthBenefit: 'Reduces childhood asthma exacerbation risk by 42%; cuts indoor nitrogen dioxide (NO2) spikes.',
    neighborhoodBenefit: 'Lowers localized fugitive indoor-to-outdoor kitchen emissions in dense urban apartments.',
    difficulty: 'Moderate',
    adopted: false,
  },
];

export interface EmissionSavingsSummary {
  totalPm25SavedGrams: number;
  totalCo2eSavedKg: number;
  activeHabitCount: number;
  totalHabits: number;
  communityMultiplierGramsMonth: number;
}

/**
 * Computes individual daily pollutant abatement and projects neighborhood collective impact.
 *
 * @param habits Array of sustainable habit profiles with adoption state.
 * @returns Summary of abated PM2.5, avoided CO2e, and 500-household community multiplier.
 */
export function computeTotalEmissionSavings(habits: SustainableHabit[]): EmissionSavingsSummary {
  if (!Array.isArray(habits) || habits.length === 0) {
    return {
      totalPm25SavedGrams: 0,
      totalCo2eSavedKg: 0,
      activeHabitCount: 0,
      totalHabits: 0,
      communityMultiplierGramsMonth: 0,
    };
  }

  const active = habits.filter(h => h.adopted);
  const totalPm25SavedGrams = Number(active.reduce((acc, h) => acc + h.dailyPm25ReductionGrams, 0).toFixed(1));
  const totalCo2eSavedKg = Number(active.reduce((acc, h) => acc + h.dailyCo2eReductionKg, 0).toFixed(1));
  
  // If 500 households in the community adopt this routine over 1 month (30 days):
  const communityMultiplierGramsMonth = Math.round(totalPm25SavedGrams * 500 * 30);

  return {
    totalPm25SavedGrams,
    totalCo2eSavedKg,
    activeHabitCount: active.length,
    totalHabits: habits.length,
    communityMultiplierGramsMonth,
  };
}
