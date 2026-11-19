import React from 'react';
import { ShieldAlert, Sun, Clock, Layers, ArrowUpRight } from 'lucide-react';
import { AtmosphericDynamics, HourlyForecastPoint } from '../types';
import { evaluateInversionSafety } from '../core/symbolic/thermal_inversion';

interface InversionAlertProps {
  atmosphere: AtmosphericDynamics;
  hourly: HourlyForecastPoint[];
}

export const InversionAlert: React.FC<InversionAlertProps> = ({ atmosphere, hourly }) => {
  const analysis = evaluateInversionSafety(atmosphere);

  // Identify optimal outdoor window from hourly data
  const optimalHours = hourly.filter((h) => h.isRecommendedOutdoorWindow);
  const windowStr =
    optimalHours.length > 0
      ? `${String(optimalHours[0].hour).padStart(2, '0')}:00 - ${String(
          optimalHours[optimalHours.length - 1].hour + 1
        ).padStart(2, '0')}:00`
      : '12:30 - 14:30 (Solar Peak)';

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
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                Tropospheric Thermal Inversion & Smog Trapping Engine
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
        <div className="flex items-center space-x-3 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs">
          <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400">Solar Clearance Window: </span>
            <strong className="text-emerald-300 font-mono">{windowStr}</strong>
          </div>
        </div>
      </div>

      {/* Physics explanation & Action Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Boundary Layer Height (PBL)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {atmosphere.boundaryLayerHeight} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {atmosphere.boundaryLayerHeight < 300
              ? 'Severe vertical compression: emissions cannot escape and pool at ground breathing level.'
              : 'Vertical convection active: solar heating lofts particulates away from street level.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
            <ArrowUpRight className="w-4 h-4 text-teal-400" />
            <span>Ventilation Coefficient</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analysis.ventilationCoefficient} <span className="text-xs font-normal text-slate-400">m²/s</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {analysis.ventilationCoefficient < 2000
              ? 'Critical stagnation (VC < 2,000 m²/s): wind shear is insufficient to disperse localized plumes.'
              : 'Adequate ventilation: wind speed aids rapid cross-basin flushing.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Recommended Protocol</span>
          </div>
          <p className="text-xs font-medium text-slate-200 mt-1 leading-relaxed">
            {analysis.recommendedOutdoorAction}
          </p>
        </div>
      </div>

      {/* Hourly 24-Hour Inversion & Smog Bar Timeline */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            24-Hour Diurnal Smog & Inversion Forecast
          </span>
          <span className="text-[11px] text-slate-500">Green highlight denotes optimal outdoor window</span>
        </div>

        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 overflow-x-auto pb-1">
          {hourly.slice(0, 24).map((h) => {
            const isHighlight = h.isRecommendedOutdoorWindow;
            const heightPercent = Math.min(100, Math.max(15, (h.aqiUs / 350) * 100));

            return (
              <div
                key={h.time}
                className={`flex flex-col items-center justify-end p-1 rounded-md text-[10px] transition-all ${
                  isHighlight
                    ? 'bg-emerald-950/60 border border-emerald-500/40'
                    : 'bg-slate-950/60 border border-slate-800/60'
                }`}
                title={`Hour ${String(h.hour).padStart(2, '0')}:00 | AQI: ${h.aqiUs} | PM2.5: ${
                  h.pm25
                } µg/m³ | Inversion: ${h.inversionRisk}`}
              >
                {/* Visual Smog Column Bar */}
                <div className="w-full bg-slate-800/60 h-16 rounded flex items-end overflow-hidden mb-1">
                  <div
                    className={`w-full rounded-t transition-all ${
                      h.aqiUs > 200
                        ? 'bg-rose-500'
                        : h.aqiUs > 100
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="font-mono font-bold text-slate-200">{h.hour}h</span>
                <span className="font-mono text-[9px] text-slate-400">{h.aqiUs}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
