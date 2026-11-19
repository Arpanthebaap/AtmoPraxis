import React, { useState } from 'react';
import { Leaf, Users, CheckCircle, Circle, Sparkles } from 'lucide-react';
import { SustainableHabit } from '../types';
import {
  INITIAL_SUSTAINABLE_HABITS,
  computeTotalEmissionSavings,
} from '../core/symbolic/emission_abatement';

/**
 * Interactive Sustainable Habits & Emission Abatement Simulator.
 * Allows users to adopt clean urban lifestyle alternatives (transit shifting,
 * clean heating, indoor dust sinks) and calculate individual and community-wide
 * avoided particulate (PM2.5) and carbon (CO2e) emissions.
 */
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
              <Leaf className="w-5 h-5 text-emerald-400" aria-hidden="true" />
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
        <nav 
          aria-label="Habit categories"
          className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs"
        >
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
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
        </nav>
      </div>

      {/* Aggregate Savings Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-live="polite">
        {/* Daily PM2.5 Prevented */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Daily PM2.5 Abated</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              +{summary.totalPm25SavedGrams} <span className="text-xs font-normal text-slate-400 font-sans">grams/day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Active habits: {summary.activeHabitCount} of {summary.totalHabits}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        {/* Daily CO2e Prevented */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Daily Carbon (CO₂e) Saved</div>
            <div className="text-2xl font-black font-mono text-teal-300 mt-0.5">
              +{summary.totalCo2eSavedKg} <span className="text-xs font-normal text-slate-400 font-sans">kg/day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Automobile &amp; fuel emissions
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Leaf className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        {/* Neighborhood Collective Multiplier */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Neighborhood Impact (500 Homes)</div>
            <div className="text-2xl font-black font-mono text-white mt-0.5">
              {(summary.communityMultiplierGramsMonth / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">kg PM/month</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Corridor collective airshed effect
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Habits Action Cards List */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
          Available Winter Smog Mitigation Protocols
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              role="checkbox"
              aria-checked={habit.adopted}
              tabIndex={0}
              onClick={() => handleToggleHabit(habit.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleToggleHabit(habit.id);
                }
              }}
              className={`p-5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                habit.adopted
                  ? 'bg-slate-950/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {habit.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2">{habit.title}</h4>
                  </div>

                  <div className="flex-shrink-0 text-emerald-400">
                    {habit.adopted ? (
                      <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="text-slate-400">
                    <strong className="text-rose-400">Baseline practice: </strong>
                    <span className="line-through">{habit.baselinePractice}</span>
                  </div>
                  <div className="text-slate-200">
                    <strong className="text-emerald-400">Sustainable alternative: </strong>
                    {habit.sustainableAlternative}
                  </div>
                </div>
              </div>

              {/* Quantitative Metrics Badge */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  +{habit.dailyPm25ReductionGrams}g PM2.5/day
                </span>
                {habit.dailyCo2eReductionKg > 0 && (
                  <span className="text-teal-300 font-medium">
                    +{habit.dailyCo2eReductionKg}kg CO₂e
                  </span>
                )}
                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                    habit.difficulty === 'Easy'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                      : habit.difficulty === 'Moderate'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                      : 'bg-purple-950/60 text-purple-300 border border-purple-700/50'
                  }`}
                >
                  {habit.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
