import React from 'react';
import { HeartPulse, Cigarette, Shield, Droplets } from 'lucide-react';
import { AirQualityState } from '../types';
import { calculateInhalationDosage } from '../core/symbolic/inhalation_dosage';
import { BIOPHYSICAL_DEFAULTS } from '../constants';

export interface ImpactExplainerProps {
  state: AirQualityState;
}

/**
 * Direct Physiological Impact & Cardiorespiratory Health Risk Explainer.
 * Translates ambient pollution mass concentration into human minute ventilation
 * micro-dosage, deep alveolar penetration, and equivalent daily cigarettes inhaled.
 */
export const ImpactExplainer: React.FC<ImpactExplainerProps> = ({ state }) => {
  const outdoorPm = state.pollutants.pm25;
  const unpurifiedIndoor = Math.round(outdoorPm * BIOPHYSICAL_DEFAULTS.INDOOR_OUTDOOR_INFILTRATION_RATIO);
  const purifiedIndoor = BIOPHYSICAL_DEFAULTS.PURIFIED_INDOOR_TARGET_PM25_UG_M3;

  const dosage = calculateInhalationDosage(outdoorPm, unpurifiedIndoor, purifiedIndoor, 'outdoor_masked');

  return (
    <section 
      aria-label="Direct Human Health and Physiological Impact Explainer"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl space-y-6"
    >
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-5 h-5 text-rose-400" aria-hidden="true" />
          <h2 className="text-xl font-bold text-white">
            Direct Physiological Impact &amp; Health Risk Translation
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Translating abstract ambient micrograms (µg/m³) into direct biophysical, cardiorespiratory, and cellular impacts
        </p>
      </div>

      {/* Main Quantitative Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Equivalent Cigarettes Prevented */}
        <div 
          aria-label={`Toxic Equivalence: ${dosage.preventedCigarettesEquivalent} cigarettes per day prevented with AtmoPraxis`}
          className="p-5 rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 border border-rose-900/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-rose-300">
              Toxic Equivalence
            </span>
            <Cigarette className="w-4 h-4 text-rose-400" aria-hidden="true" />
          </div>

          <div className="text-3xl font-black font-mono text-white mt-1">
            {dosage.preventedCigarettesEquivalent}{' '}
            <span className="text-sm font-normal text-slate-400 font-sans">
              Cigarettes / Day Prevented
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Based on the Berkeley Earth particulate dosage formulation, breathing unfiltered{' '}
            <strong className="text-white font-mono">{outdoorPm} µg/m³</strong> smog delivers the toxic
            equivalent of{' '}
            <strong className="text-rose-400 font-mono">
              {(dosage.preventedCigarettesEquivalent + dosage.equivalentCigarettesInhaled).toFixed(1)}{' '}
              cigarettes
            </strong>{' '}
            daily into sensitive lung tissues.
          </p>
        </div>

        {/* Daily Inhaled Micrograms Avoided */}
        <div 
          aria-label={`Inhalation Dose Shield: ${Math.round(dosage.dailyInhaledPm25TotalMicrograms * 2.8)} micrograms PM2.5 blocked`}
          className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-900/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-emerald-300">
              Inhalation Dose Shield
            </span>
            <Shield className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>

          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            -{Math.round(dosage.dailyInhaledPm25TotalMicrograms * 2.8)}{' '}
            <span className="text-sm font-normal text-slate-400 font-sans">µg PM2.5 Blocked</span>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            By shifting aerobic activities to solar dispersal hours and maintaining high-ACH indoor filtration,
            your lungs avoid inhaling millions of combustible combustion nanoparticles every single day.
          </p>
        </div>

        {/* Deep Alveolar Barrier Integrity */}
        <div 
          aria-label={`Alveolar Deposition: ${dosage.alveolarDepositionPct} percent deep lung penetration`}
          className="p-5 rounded-xl bg-gradient-to-br from-teal-950/40 via-slate-950 to-slate-950 border border-teal-900/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-teal-300">
              Alveolar Deposition
            </span>
            <Droplets className="w-4 h-4 text-teal-400" aria-hidden="true" />
          </div>

          <div className="text-3xl font-black font-mono text-teal-300 mt-1">
            {dosage.alveolarDepositionPct}%{' '}
            <span className="text-sm font-normal text-slate-400 font-sans">
              Deep Lung Penetration
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Ultrafine combustion nanoparticles (&lt; 2.5 µm) bypass nasal cilia and penetrate
            deep into non-ciliated terminal alveoli, entering capillaries and inducing systemic vascular inflammation.
          </p>
        </div>
      </div>
    </section>
  );
};
