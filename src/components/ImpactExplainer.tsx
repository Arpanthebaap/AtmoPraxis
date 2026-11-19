import React from 'react';
import { HeartPulse, Cigarette, Shield, Droplets, CheckCircle2 } from 'lucide-react';
import { AirQualityState } from '../types';
import { calculateInhalationDosage } from '../core/symbolic/inhalation_dosage';

interface ImpactExplainerProps {
  state: AirQualityState;
}

export const ImpactExplainer: React.FC<ImpactExplainerProps> = ({ state }) => {
  const outdoorPm = state.pollutants.pm25;
  const unpurifiedIndoor = Math.round(outdoorPm * 0.75); // typical I/O infiltration
  const purifiedIndoor = 15; // AtmoPraxis C-R box standard

  const dosage = calculateInhalationDosage(outdoorPm, unpurifiedIndoor, purifiedIndoor, 'outdoor_masked');

  return (
    <section 
      aria-label="Direct Human Health and Physiological Impact Explainer"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl space-y-6"
    >
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-5 h-5 text-rose-400" />
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
        <div className="p-5 rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 border border-rose-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-rose-300">
              Toxic Equivalence
            </span>
            <Cigarette className="w-4 h-4 text-rose-400" />
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
        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-emerald-300">
              Inhalation Dose Shield
            </span>
            <Shield className="w-4 h-4 text-emerald-400" />
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
        <div className="p-5 rounded-xl bg-gradient-to-br from-teal-950/40 via-slate-950 to-slate-950 border border-teal-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-teal-300">
              Alveolar Deposition
            </span>
            <Droplets className="w-4 h-4 text-teal-400" />
          </div>

          <div className="text-3xl font-black font-mono text-teal-300 mt-1">
            {dosage.alveolarDepositionPct}%{' '}
            <span className="text-sm font-normal text-slate-400 font-sans">
              Deep Lung Penetration
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Particles smaller than 2.5 micrometers bypass upper nasal cilia and embed directly into terminal
            pulmonary alveoli, crossing into the bloodstream. AtmoPraxis protocols protect this vascular barrier.
          </p>
        </div>
      </div>

      {/* Physiological Mechanism Breakdown */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
          How Your Daily Choices Compound: Biological Path to Clean Air Health
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cardiovascular Inflammation</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Lowering resting indoor PM2.5 from 180 to 15 µg/m³ reduces systemic C-reactive protein (CRP) and
              blood pressure spikes, mitigating acute myocardial infarction risks during severe winter smog episodes.
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bronchial &amp; Mucosal Defense</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Confining ventilation to midday solar windows prevents high-concentration NO2 and ozone acid plumes
              from eroding the respiratory epithelium, preventing childhood asthma triggers.
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cognitive Acuity &amp; Sleep Quality</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Continuous nocturnal hospital-grade filtration reduces micro-arousals caused by nasal irritation,
              restoring deep REM sleep and reducing morning smog-induced headaches and brain fog.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
