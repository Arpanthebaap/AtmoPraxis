import React from 'react';
import { ShieldAlert, Sun, Clock, Layers, ArrowUpRight } from 'lucide-react';
import { AtmosphericDynamics, HourlyForecastPoint } from '../types';
import { evaluateInversionSafety } from '../core/symbolic/thermal_inversion';
import { ATMOSPHERE_THRESHOLDS } from '../constants';

export interface InversionAlertProps {
  atmosphere: AtmosphericDynamics;
  hourly: HourlyForecastPoint[];
}

/**
 * Tropospheric Thermal Inversion & Planetary Boundary Layer (PBL) Alert.
 * Visualizes boundary layer mixing height, nocturnal smog lock trapping risks,
 * ventilation coefficients, and the optimal solar convection ventilation window.
 */
export const InversionAlert: React.FC<InversionAlertProps> = ({ atmosphere, hourly }) => {
  const analysis = evaluateInversionSafety(atmosphere);

  // Identify optimal outdoor window from hourly data
  const optimalHours = hourly.filter((h) => h.isRecommendedOutdoorWindow);
  const windowStr =
    optimalHours.length > 0
      ? `${String(optimalHours[0].hour).padStart(2, '0')}:00 - ${String(
          optimalHours[optimalHours.length - 1].hour + 1
        ).padStart(2, '0')}:00`
      : ATMOSPHERE_THRESHOLDS.DEFAULT_SOLAR_WINDOW;

  return (
    <section 
      aria-label="Thermal Inversion Alert and Boundary Layer Analysis"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              analysis.isTrappingActive
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {analysis.isTrappingActive ? (
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Sun className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                Tropospheric Thermal Inversion &amp; Smog Trapping Engine
              </h2>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  analysis.trappingRiskLevel === 'Extreme'
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : analysis.trappingRiskLevel === 'High'
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : analysis.trappingRiskLevel === 'Moderate'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                {analysis.trappingRiskLevel} Inversion Risk
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical boundary-layer dynamics governing urban particulate concentration
            </p>
          </div>
        </div>

        {/* Optimal Window Banner */}
        <div 
          aria-label={`Solar clearance ventilation window: ${windowStr}`}
          className="flex items-center space-x-3 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs"
        >
          <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="text-slate-400">Solar Clearance Window: </span>
            <strong className="text-emerald-300 font-mono">{windowStr}</strong>
          </div>
        </div>
      </div>

      {/* Physics explanation & Action Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        <div 
          aria-label={`Boundary Layer Height: ${atmosphere.boundaryLayerHeight} meters`}
          className="p-4 rounded-xl bg-slate-950 border border-slate-800/80"
        >
          <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
            <Layers className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Boundary Layer Height (PBL)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {atmosphere.boundaryLayerHeight} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {atmosphere.boundaryLayerHeight < ATMOSPHERE_THRESHOLDS.CRITICAL_MIXING_HEIGHT_METERS
              ? 'Severe vertical compression: emissions cannot escape and pool at ground breathing level.'
              : 'Vertical convection active: solar heating lofts particulates away from street level.'}
          </p>
        </div>

        <div 
          aria-label={`Ventilation Coefficient: ${analysis.ventilationCoefficient} square meters per second`}
          className="p-4 rounded-xl bg-slate-950 border border-slate-800/80"
        >
          <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
            <ArrowUpRight className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <span>Ventilation Coefficient</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analysis.ventilationCoefficient} <span className="text-xs font-normal text-slate-400">m²/s</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {analysis.ventilationCoefficient < ATMOSPHERE_THRESHOLDS.VENTILATION_COEF_HAZARD_M2_S
              ? 'Hazardous stagnation: low dispersion rate traps vehicle exhaust and biomass smoke.'
              : 'Adequate atmospheric transport: wind and convection dilute ground concentrations.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 mb-1.5">
            Recommended Action Protocol
          </div>
          <p className="text-xs font-medium text-emerald-300 leading-relaxed">
            {analysis.recommendedOutdoorAction}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            {analysis.scientificExplanation}
          </p>
        </div>
      </div>
    </section>
  );
};
