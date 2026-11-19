import React from 'react';
import { Activity } from 'lucide-react';
import { AirQualityState, AqiStandard } from '../types';
import { getAqiColorCode } from '../core/symbolic/aqi_calculator';

interface AqiHeroDisplayProps {
  state: AirQualityState;
  aqiStandard: AqiStandard;
}

export const AqiHeroDisplay: React.FC<AqiHeroDisplayProps> = ({ state, aqiStandard }) => {
  const currentAqi = aqiStandard === 'US_EPA' ? state.aqiUs : state.aqiIndia;
  const currentCategory = aqiStandard === 'US_EPA' ? state.categoryUs : state.categoryIndia;
  const color = getAqiColorCode(currentCategory);

  return (
    <section 
      aria-label="Current Air Quality Status"
      className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient radial glow */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: color.hex }}
      />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Main AQI Number & Headline */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
              Live Tropospheric Reading • {state.location.city}, {state.location.country}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-baseline space-x-4">
            <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight font-mono text-white">
              {currentAqi}
            </h1>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {aqiStandard === 'US_EPA' ? 'US EPA Index' : 'India NAQI Index'}
              </div>
              <div 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border mt-1 shadow-sm ${color.bg} ${color.text} ${color.border}`}
                role="status"
                aria-live="polite"
              >
                {currentCategory}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Dominant pollutant is <strong className="text-white font-mono">{state.dominantPollutant}</strong> at{' '}
            <strong className="text-emerald-400 font-mono">{state.pollutants.pm25} µg/m³</strong>.
            {currentAqi > 150
              ? ' Active winter smog alert: vulnerable groups should avoid all outdoor exertion and run indoor filtration.'
              : ' Air quality is currently within manageable thresholds; follow recommended ventilation windows.'}
          </p>
        </div>

        {/* Right: Quick Inversion & Meteorological Mini-HUD */}
        <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-400">Boundary Layer</div>
            <div className="text-lg font-bold font-mono text-slate-100">
              {state.atmosphere.boundaryLayerHeight} m
            </div>
            <div className="text-[10px] text-slate-500">Mixing Depth</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] font-medium text-slate-400">Ambient Temp</div>
            <div className="text-lg font-bold font-mono text-slate-100">
              {state.atmosphere.temperature2m}°C
            </div>
            <div className="text-[10px] text-slate-500">{state.atmosphere.relativeHumidity}% Humidity</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-medium text-slate-400">Surface Wind</div>
            <div className="text-lg font-bold font-mono text-slate-100">
              {state.atmosphere.windSpeed10m} km/h
            </div>
            <div className="text-[10px] text-slate-500">
              {state.atmosphere.windSpeed10m < 6 ? 'Stagnant Air' : 'Moderate Flow'}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Pollutant Spectrum Cards */}
      <div className="mt-8 pt-6 border-t border-slate-800/80">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Atmospheric Pollutant Breakdown (Continuous Speciation)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* PM2.5 */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>PM2.5</span>
              <span className="text-[10px] text-slate-500">Fine</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {state.pollutants.pm25} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">WHO Cap: 15 µg/m³</div>
          </div>

          {/* PM10 */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>PM10</span>
              <span className="text-[10px] text-slate-500">Coarse</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {state.pollutants.pm10} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">WHO Cap: 45 µg/m³</div>
          </div>

          {/* NO2 */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>NO₂</span>
              <span className="text-[10px] text-slate-500">Exhaust</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {state.pollutants.no2} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">WHO Cap: 25 µg/m³</div>
          </div>

          {/* SO2 */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>SO₂</span>
              <span className="text-[10px] text-slate-500">Sulfur</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {state.pollutants.so2} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">WHO Cap: 40 µg/m³</div>
          </div>

          {/* CO */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>CO</span>
              <span className="text-[10px] text-slate-500">Combustion</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {state.pollutants.co} <span className="text-xs font-normal text-slate-400">mg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">WHO Cap: 4 mg/m³</div>
          </div>

          {/* O3 */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>O₃</span>
              <span className="text-[10px] text-slate-500">Ozone</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {state.pollutants.o3} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">WHO Cap: 100 µg/m³</div>
          </div>
        </div>
      </div>
    </section>
  );
};
