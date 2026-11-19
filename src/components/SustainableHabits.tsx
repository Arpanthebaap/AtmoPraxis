import React, { useState } from 'react';
import { Leaf, Users, CheckCircle, Circle, Sparkles } from 'lucide-react';
import { SustainableHabit } from '../types';
import {
  INITIAL_SUSTAINABLE_HABITS,
  computeTotalEmissionSavings,
} from '../core/symbolic/emission_abatement';

export const SustainableHabits: React.FC = () => {
  const [habits, setHabits] = useState<SustainableHabit[]>(INITIAL_SUSTAINABLE_HABITS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleToggleHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, adopted: !h.adopted } : h))
    );
  };

  const summary = computeTotalEmissionSavings(habits);

  const categories = ['All', 'Commute', 'Home Heating', 'Indoor Air Sink', 'Cooking & Energy'];
  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter(h => h.category === selectedCategory);

  return (
    <section 
      aria-label="Sustainable Lifestyle Alternatives and Emission Abatement"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl space-y-6"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <span>Sustainable Habits &amp; Emission Abatement Engine</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
              Quantified Impact Tracker
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replace high-emission winter habits with sustainable alternatives to slash personal and neighborhood toxic exposure
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Savings Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily PM2.5 Prevented */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Daily PM2.5 Abated</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              +{summary.totalPm25SavedGrams} <span className="text-xs font-normal text-slate-400">grams/day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Active habits: {summary.activeHabitCount} of {summary.totalHabits}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Daily CO2e Prevented */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Daily Carbon (CO₂e) Saved</div>
            <div className="text-2xl font-black font-mono text-teal-300 mt-0.5">
              +{summary.totalCo2eSavedKg} <span className="text-xs font-normal text-slate-400">kg/day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Automobile &amp; fuel emissions
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Leaf className="w-5 h-5" />
          </div>
        </div>

        {/* Neighborhood Collective Multiplier */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Neighborhood Multiplier (500 homes)</div>
            <div className="text-2xl font-black font-mono text-amber-300 mt-0.5">
              {(summary.communityMultiplierGramsMonth / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">kg PM/mo</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Airshed collective impact
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHabits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => handleToggleHabit(habit.id)}
            className={`p-5 rounded-xl border transition-all cursor-pointer relative ${
              habit.adopted
                ? 'bg-slate-950/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 opacity-75'
            }`}
          >
            {/* Top row: Category tag & Adopt checkbox */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                {habit.category} • {habit.difficulty}
              </span>

              <button
                type="button"
                className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  habit.adopted
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                aria-label={`Toggle habit: ${habit.title}`}
              >
                {habit.adopted ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Adopted</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5" />
                    <span>Adopt</span>
                  </>
                )}
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-2">{habit.title}</h3>

            {/* Before vs After comparison */}
            <div className="space-y-2 text-xs mb-4">
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-slate-300">
                <span className="text-rose-400 font-bold block mb-0.5">High-Emission Baseline:</span>
                {habit.baselinePractice}
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-slate-200">
                <span className="text-emerald-400 font-bold block mb-0.5">Sustainable Alternative:</span>
                {habit.sustainableAlternative}
              </div>
            </div>

            {/* Impact Details */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Personal Direct Benefit</span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{habit.directHealthBenefit}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Community Airshed Gain</span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{habit.neighborhoodBenefit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
