import React, { useState } from 'react';
import { Calendar, Users, Car, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { AirQualityState, DailyRoutinePlan } from '../types';
import { defaultGeminiClient } from '../core/agents/gemini_client';
import { generateDeterministicDailyRoutine } from '../core/agents/offline_generator';

interface RoutinePlannerProps {
  state: AirQualityState;
  hasApiKey: boolean;
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({ state, hasApiKey }) => {
  const [targetAudience, setTargetAudience] = useState<
    'Family with Children' | 'Working Commuters' | 'Elderly / Vulnerable' | 'Active Fitness'
  >('Family with Children');

  const [commuteMode, setCommuteMode] = useState('Petrol/Diesel Car');
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize with deterministic baseline
  const [plan, setPlan] = useState<DailyRoutinePlan>(() =>
    generateDeterministicDailyRoutine(state, 'Family with Children', 'Petrol/Diesel Car')
  );

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const generated = await defaultGeminiClient.generateDailyRoutine(state, targetAudience, commuteMode);
      setPlan(generated);
    } catch (err) {
      console.warn('Error generating plan:', err);
      const fallback = generateDeterministicDailyRoutine(state, targetAudience, commuteMode);
      setPlan(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section 
      aria-label="Low-Emission Daily Routine Optimizer"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl space-y-6"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Low-Emission Daily Routine Studio</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              GenAI + Biophysical Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalized spatiotemporal activity schedules tailored to {state.location.city}&apos;s winter inversion pattern
          </p>
        </div>

        {/* Generate / Recalculate Button */}
        <button
          type="button"
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Optimal Schedule...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{hasApiKey ? 'Generate via Gemini 2.5' : 'Optimize Daily Routine'}</span>
            </>
          )}
        </button>
      </div>

      {/* Persona & Lifestyle Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Persona Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Household Persona</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Family with Children', 'Working Commuters', 'Elderly / Vulnerable', 'Active Fitness'] as const).map(
              (persona) => (
                <button
                  key={persona}
                  type="button"
                  onClick={() => setTargetAudience(persona)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    targetAudience === persona
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {persona}
                </button>
              )
            )}
          </div>
        </div>

        {/* Commute Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span>Baseline Commuting Method</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Petrol/Diesel Car', 'Metro / Electrified Rail', 'Bicycle / Walking', 'Electric Vehicle'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCommuteMode(mode)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  commuteMode === mode
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routine Plan Summary Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white">{plan.headline}</div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {plan.mitigationSummary}
          </p>
        </div>
        <div className="flex-shrink-0 text-center bg-emerald-950/70 border border-emerald-500/40 px-4 py-2.5 rounded-xl">
          <div className="text-2xl font-black font-mono text-emerald-400">
            -{plan.totalExposureReductionPct}%
          </div>
          <div className="text-[10px] text-emerald-300 uppercase font-semibold">
            Toxic Dose Reduction
          </div>
        </div>
      </div>

      {/* Timeline Routine Cards */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
          Synchronized Activity Milestones & Bio-Shielding Protocol
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {plan.routines.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Left Column: Time & Activity */}
              <div className="space-y-1 md:w-1/3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-400 line-through">
                    {item.timeSlot}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    {item.optimizedTimeSlot}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">{item.activity}</div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span>Venue: </span>
                  <span className="capitalize font-medium text-slate-300">
                    {item.recommendedVenue.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Middle Column: Mitigation Strategy */}
              <div className="md:w-1/2 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                <strong className="text-emerald-400">Action Protocol: </strong>
                {item.mitigationStrategy}
              </div>

              {/* Right Column: Grams Avoided */}
              <div className="md:w-1/6 flex md:flex-col items-center md:items-end justify-between w-full">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Emissions Saved
                </span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  +{item.emissionSavingGrams}g PM
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
