import { AirQualityState, DailyRoutinePlan, RoutineItem } from '../../types';

export function generateDeterministicDailyRoutine(
  state: AirQualityState,
  targetAudience: 'Family with Children' | 'Working Commuters' | 'Elderly / Vulnerable' | 'Active Fitness',
  selectedCommute: string
): DailyRoutinePlan {
  const aqi = state.aqiUs;
  const isSevere = aqi > 200;

  let headline = '';
  let routines: RoutineItem[] = [];
  let summary = '';
  let reductionPct = 65;

  if (targetAudience === 'Family with Children') {
    headline = isSevere
      ? `High-Inversion Smog Protocol for Families: Indoor Shielding & Midday Window in ${state.location.city}`
      : `Family Clean Air Routine: Low-Exposure School Runs & Purified Sleep in ${state.location.city}`;
    
    summary = `Thermal boundary layer is compressed to ${state.atmosphere.boundaryLayerHeight}m. Morning cold air pools high concentrations of PM2.5 at child breathing height (~0.8m). Keep morning preparation indoors with DIY C-R filtration running; shift outdoor play exclusively to 12:30 - 14:30.`;
    reductionPct = isSevere ? 76 : 58;

    routines = [
      {
        id: 'fam-1',
        timeSlot: '06:45 - 07:30',
        activity: 'Morning School Preparation & Breakfast',
        venue: 'indoor',
        originalExposureRisk: isSevere ? 'High' : 'Moderate',
        optimizedTimeSlot: '06:45 - 07:30',
        mitigationStrategy: 'Keep all exterior doors/windows sealed. Run Corsi-Rosenthal box fan on medium speed in dining area. Avoid gas stove high-heat frying.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 1.2,
      },
      {
        id: 'fam-2',
        timeSlot: '07:45 - 08:30',
        activity: 'School Commute & Drop-off',
        venue: 'outdoor',
        originalExposureRisk: 'High',
        optimizedTimeSlot: '08:00 - 08:35',
        mitigationStrategy: `Equip children with well-fitted pediatric particulate respirators (KF94/N95). If driving, switch cabin AC to internal recirculation. Avoid vehicle idling at school drop-off gates.`,
        recommendedVenue: 'outdoor',
        emissionSavingGrams: 3.5,
      },
      {
        id: 'fam-3',
        timeSlot: '12:30 - 13:30',
        activity: 'Midday Natural Air Exchange & Outdoor Recess',
        venue: 'outdoor',
        originalExposureRisk: 'Moderate',
        optimizedTimeSlot: '12:45 - 13:45',
        mitigationStrategy: `Solar thermal heating expands the planetary boundary layer to ${Math.max(400, state.atmosphere.boundaryLayerHeight * 2)}m, dispersing ground smog. Crack windows for 20 minutes for cross-flushing CO2, then re-seal.`,
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 0.8,
      },
      {
        id: 'fam-4',
        timeSlot: '18:00 - 19:30',
        activity: 'Evening Family Time & Homework',
        venue: 'indoor',
        originalExposureRisk: 'Moderate',
        optimizedTimeSlot: '18:00 - 19:30',
        mitigationStrategy: 'Electrostatic damp microfiber mop living room floor to capture settled dust and tire particulates. Re-activate C-R purifier on high.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 2.0,
      },
      {
        id: 'fam-5',
        timeSlot: '21:00 - 07:00',
        activity: 'Overnight Sleep Shield',
        venue: 'indoor',
        originalExposureRisk: 'High',
        optimizedTimeSlot: '21:00 - 07:00',
        mitigationStrategy: 'Close bedroom door. Maintain C-R box purifier on whisper low speed for continuous 4-6 ACH hospital-grade filtration throughout nocturnal inversion trap.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 1.5,
      },
    ];
  } else if (targetAudience === 'Working Commuters') {
    headline = isSevere
      ? `Commuter Toxic Exposure Minimization: Off-Peak Transit & Cabin Recirculation`
      : `Optimized Low-Emission Commute & Office Air Quality Schedule`;

    summary = `Arterial road traffic during 08:00 - 10:00 produces concentrated black carbon and NOx corridors. Shift to electrified rail transit or adjust commute times to bypass peak morning smog stagnation.`;
    reductionPct = isSevere ? 72 : 54;

    routines = [
      {
        id: 'com-1',
        timeSlot: '07:30 - 08:30',
        activity: 'Morning Work Commute',
        venue: 'outdoor',
        originalExposureRisk: 'High',
        optimizedTimeSlot: '08:45 - 09:30 (or Remote Early Start)',
        mitigationStrategy: `Shift travel window by 45 minutes to avoid peak thermal inversion. Use Metro rail transit instead of private car (${selectedCommute}). Wear fit-checked N95 respirator.`,
        recommendedVenue: 'outdoor',
        emissionSavingGrams: 5.4,
      },
      {
        id: 'com-2',
        timeSlot: '12:00 - 13:00',
        activity: 'Lunch & Fresh Air Break',
        venue: 'outdoor',
        originalExposureRisk: 'Moderate',
        optimizedTimeSlot: '12:30 - 13:15',
        mitigationStrategy: 'Optimal daily solar mixing window. Short walking errand acceptable, preferably through green park spaces away from multi-lane vehicular avenues.',
        recommendedVenue: 'outdoor',
        emissionSavingGrams: 1.0,
      },
      {
        id: 'com-3',
        timeSlot: '17:30 - 18:45',
        activity: 'Evening Return Commute',
        venue: 'outdoor',
        originalExposureRisk: 'High',
        optimizedTimeSlot: '17:15 - 18:00 (Before Nocturnal Inversion Descends)',
        mitigationStrategy: 'Depart before sunset radiative cooling triggers the ground inversion trap. Use public transit and avoid congested bumper-to-bumper routes.',
        recommendedVenue: 'outdoor',
        emissionSavingGrams: 4.8,
      },
      {
        id: 'com-4',
        timeSlot: '19:30 - 21:00',
        activity: 'Dinner & Indoor Decompression',
        venue: 'indoor',
        originalExposureRisk: 'Low',
        optimizedTimeSlot: '19:30 - 21:00',
        mitigationStrategy: 'Remove outdoor footwear and outerwear at entry vestibule to prevent carrying aerosolized soot into core living areas.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 0.5,
      },
    ];
  } else if (targetAudience === 'Active Fitness') {
    headline = isSevere
      ? `Critical Smog Alert for Athletes: Cardiovascular Protection & Indoor Aerobics`
      : `Metabolic Smog Alignment: Shifting Heavy Ventilation to Midday Windows`;

    summary = `Vigorous aerobic running increases tidal minute ventilation from 6 L/min to over 45 L/min (7.5x inhalation rate), depositing ultra-fine PM2.5 deep into alveolar tissue. Outdoor morning workouts are prohibited during severe inversion.`;
    reductionPct = 84;

    routines = [
      {
        id: 'fit-1',
        timeSlot: '06:00 - 07:15',
        activity: 'Morning Outdoor 10k Run / Cycling',
        venue: 'outdoor',
        originalExposureRisk: 'High',
        optimizedTimeSlot: 'Shift to Indoor Treadmill / Stationary Bike',
        mitigationStrategy: 'DO NOT run outdoors during 06:00 - 08:30 inversion peak (equivalent to inhaling 4+ cigarettes in 45 min). Run indoors in a HEPA/C-R filtered room.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 0.0,
      },
      {
        id: 'fit-2',
        timeSlot: '12:45 - 13:45',
        activity: 'Midday Outdoor Brisk Walk or Mobility Training',
        venue: 'outdoor',
        originalExposureRisk: 'Moderate',
        optimizedTimeSlot: '13:00 - 13:45',
        mitigationStrategy: 'Solar heating thins the smog layer. Light aerobic activity in open-sky park acceptable with continuous nasal breathing (which filters coarse particulates).',
        recommendedVenue: 'outdoor',
        emissionSavingGrams: 0.5,
      },
      {
        id: 'fit-3',
        timeSlot: '18:30 - 19:45',
        activity: 'Indoor High-Intensity Strength & Conditioning',
        venue: 'indoor',
        originalExposureRisk: 'Low',
        optimizedTimeSlot: '18:30 - 19:45',
        mitigationStrategy: 'Pre-filter the workout space for 30 minutes on high speed before training to lower ambient PM2.5 below 15 µg/m³.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 0.0,
      },
    ];
  } else {
    // Elderly / Vulnerable
    headline = `Vulnerable Population Clean Air Shield: 24-Hour Micro-Environment Defense`;
    summary = `Elderly individuals and those with asthma, COPD, or cardiovascular conditions face severe inflammatory triggers from fine particulate spikes. Prioritize complete room sealing and continuous filtration.`;
    reductionPct = 81;

    routines = [
      {
        id: 'vul-1',
        timeSlot: '07:00 - 09:00',
        activity: 'Morning Routine & Medication',
        venue: 'indoor',
        originalExposureRisk: 'High',
        optimizedTimeSlot: '07:00 - 09:00',
        mitigationStrategy: 'Remain strictly indoors in a purified "Clean Air Safe Zone". Check pulse oximetry and keep prescribed bronchodilators accessible.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 0.0,
      },
      {
        id: 'vul-2',
        timeSlot: '12:30 - 13:30',
        activity: 'Courtyard Sitting / Sunlight Vitamin D Exposure',
        venue: 'outdoor',
        originalExposureRisk: 'Moderate',
        optimizedTimeSlot: '13:00 - 13:30',
        mitigationStrategy: 'Brief 20-minute sunlight exposure during lowest diurnal smog point. Wear N95/KF94 mask if AQI exceeds 150.',
        recommendedVenue: 'outdoor',
        emissionSavingGrams: 0.0,
      },
      {
        id: 'vul-3',
        timeSlot: '15:00 - 17:00',
        activity: 'Indoor Reading & Hydration',
        venue: 'indoor',
        originalExposureRisk: 'Low',
        optimizedTimeSlot: '15:00 - 17:00',
        mitigationStrategy: 'Maintain indoor relative humidity between 40% - 50% to optimize mucosal ciliary clearance and prevent particle suspension.',
        recommendedVenue: 'indoor_purified',
        emissionSavingGrams: 0.0,
      },
    ];
  }

  return {
    headline,
    targetAudience,
    smogPhase: state.atmosphere.inversionTrappingRisk === 'Extreme' ? 'Morning Peak Inversion' : 'Midday Solar Dispersal',
    routines,
    mitigationSummary: summary,
    totalExposureReductionPct: reductionPct,
  };
}
