import React, { useState } from 'react';
import { Fan, Check, DollarSign, Wrench, Sparkles } from 'lucide-react';
import { CorsiRosenthalConfig } from '../types';
import {
  calculateCorsiRosenthalMetrics,
  getDefaultCorsiRosenthalConfig,
} from '../core/symbolic/corsi_rosenthal';

/**
 * Interactive Corsi-Rosenthal Box Purifier Studio.
 * Allows users to model DIY hospital-grade air filtration fluid dynamics,
 * Clean Air Delivery Rate (CADR), and room clearance half-lives.
 */
export const CorsiRosenthalStudio: React.FC = () => {
  const [config, setConfig] = useState<CorsiRosenthalConfig>(getDefaultCorsiRosenthalConfig());
  const metrics = calculateCorsiRosenthalMetrics(config);

  return (
    <section 
      aria-label="Corsi-Rosenthal DIY Air Purifier CADR Studio"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl space-y-6"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Fan className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span>Corsi-Rosenthal Box Purifier Studio (Indoor Air Bio-Hack)</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold font-mono">
              Fluid Dynamics CADR Solver
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Engineer a high-CADR, hospital-grade DIY air purifier for less than $85 using a 20&quot; box fan &amp; MERV-13 filters
          </p>
        </div>

        {/* Cost Comparison Badge */}
        <div className="bg-slate-950 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span className="text-slate-300">
            DIY Build Cost:{' '}
            <strong className="text-emerald-400 font-mono text-sm">
              ${metrics.estimatedBuildCostUsd}
            </strong>{' '}
            <span className="text-slate-500 line-through ml-1">$650 Commercial HEPA</span>
          </span>
        </div>
      </div>

      {/* Interactive Sliders & Configurations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Parameters */}
        <div className="space-y-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800/80">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Room Sizing &amp; Geometry
          </h3>

          {/* Length */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <label htmlFor="room-length-input" className="cursor-pointer">Room Length:</label>
              <span className="font-mono font-bold text-emerald-400">{config.roomLengthFt} ft</span>
            </div>
            <input
              id="room-length-input"
              type="range"
              min={8}
              max={35}
              value={config.roomLengthFt}
              aria-label="Room Length in feet"
              aria-valuemin={8}
              aria-valuemax={35}
              aria-valuenow={config.roomLengthFt}
              aria-valuetext={`${config.roomLengthFt} feet`}
              onChange={(e) => setConfig({ ...config, roomLengthFt: Number(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Width */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <label htmlFor="room-width-input" className="cursor-pointer">Room Width:</label>
              <span className="font-mono font-bold text-emerald-400">{config.roomWidthFt} ft</span>
            </div>
            <input
              id="room-width-input"
              type="range"
              min={8}
              max={30}
              value={config.roomWidthFt}
              aria-label="Room Width in feet"
              aria-valuemin={8}
              aria-valuemax={30}
              aria-valuenow={config.roomWidthFt}
              aria-valuetext={`${config.roomWidthFt} feet`}
              onChange={(e) => setConfig({ ...config, roomWidthFt: Number(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Height */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <label htmlFor="room-height-input" className="cursor-pointer">Ceiling Height:</label>
              <span className="font-mono font-bold text-emerald-400">{config.roomHeightFt} ft</span>
            </div>
            <input
              id="room-height-input"
              type="range"
              min={7}
              max={16}
              value={config.roomHeightFt}
              aria-label="Room Ceiling Height in feet"
              aria-valuemin={7}
              aria-valuemax={16}
              aria-valuenow={config.roomHeightFt}
              aria-valuetext={`${config.roomHeightFt} feet`}
              onChange={(e) => setConfig({ ...config, roomHeightFt: Number(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Box Fan &amp; Filter Engineering Specification
            </h3>

            {/* Filter Count & MERV Selection */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span id="plenum-label" className="block text-slate-400 mb-1 font-medium">Plenum Geometry</span>
                <div 
                  role="group" 
                  aria-labelledby="plenum-label"
                  className="flex bg-slate-900 p-1 rounded-lg border border-slate-800"
                >
                  <button
                    type="button"
                    aria-pressed={config.filterCount === 4}
                    onClick={() => setConfig({ ...config, filterCount: 4 })}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                      config.filterCount === 4
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    4-Filter Cube
                  </button>
                  <button
                    type="button"
                    aria-pressed={config.filterCount === 5}
                    onClick={() => setConfig({ ...config, filterCount: 5 })}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                      config.filterCount === 5
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    5-Filter Compactor
                  </button>
                </div>
              </div>

              <div>
                <span id="efficiency-label" className="block text-slate-400 mb-1 font-medium">Filter Efficiency</span>
                <div 
                  role="group"
                  aria-labelledby="efficiency-label"
                  className="flex bg-slate-900 p-1 rounded-lg border border-slate-800"
                >
                  <button
                    type="button"
                    aria-pressed={config.filterMerv === 13}
                    onClick={() => setConfig({ ...config, filterMerv: 13 })}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                      config.filterMerv === 13
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    MERV-13 (82%)
                  </button>
                  <button
                    type="button"
                    aria-pressed={config.filterMerv === 14}
                    onClick={() => setConfig({ ...config, filterMerv: 14 })}
                    className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                      config.filterMerv === 14
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    MERV-14 (90%)
                  </button>
                </div>
              </div>
            </div>

            {/* Fan Speed & Carbon Pad */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span id="speed-label" className="block text-slate-400 mb-1 font-medium">Fan Speed Mode</span>
                <div 
                  role="group"
                  aria-labelledby="speed-label"
                  className="flex bg-slate-900 p-1 rounded-lg border border-slate-800"
                >
                  {(['Low', 'Medium', 'High'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      aria-pressed={config.fanSpeedSetting === spd}
                      onClick={() => setConfig({ ...config, fanSpeedSetting: spd })}
                      className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                        config.fanSpeedSetting === spd
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  aria-pressed={config.hasCarbonLayer}
                  onClick={() => setConfig({ ...config, hasCarbonLayer: !config.hasCarbonLayer })}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
                    config.hasCarbonLayer
                      ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>Activated Carbon Pad (VOCs)</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border ${
                      config.hasCarbonLayer
                        ? 'bg-teal-500 border-teal-400 text-slate-950'
                        : 'border-slate-700'
                    }`}
                  >
                    {config.hasCarbonLayer && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calculated Metrics & Performance Dashboard */}
        <div className="space-y-4" aria-live="polite">
          <div className="grid grid-cols-2 gap-3">
            {/* Effective CADR */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Effective Clean Air Delivery (CADR)</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                {metrics.effectiveCadrCfm}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">CFM</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Room Volume: {metrics.roomVolumeCuFt.toLocaleString()} cu ft ({metrics.roomVolumeM3} m³)
              </div>
            </div>

            {/* Air Changes Per Hour (ACH) */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Air Changes Per Hour (ACH)</div>
              <div className="text-3xl font-extrabold font-mono text-teal-300 mt-1">
                {metrics.airChangesPerHour}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">ACH</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-1">
                Rating: {metrics.achRating}
              </div>
            </div>
          </div>

          {/* Particulate Decay & Clearance Timeline */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Particulate Aerosol Exponential Clearance Physics
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase">50% Half-Life (t½)</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">
                  {metrics.pm25HalfLifeMinutes} min
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase">90% Clearance</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {metrics.timeToClean90PctMinutes} min
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase">99% Hospital Cleared</div>
                <div className="text-lg font-bold font-mono text-teal-300 mt-0.5">
                  {metrics.timeToClean99PctMinutes} min
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Crucial DIY Bio-Hack: </strong> Always attach a 15-inch circular cardboard{' '}
                <strong className="text-emerald-300">fan shroud</strong> to the front exhaust face of
                the box fan. This prevents backward eddy vortex recirculation around blade tips,
                boosting effective airflow efficiency by up to <strong>+40%</strong>!
              </span>
            </div>
          </div>

          {/* Assembly Checklist Accordion Snippet */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs font-semibold text-white flex items-center space-x-1.5 mb-2">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Bill of Materials &amp; Assembly Steps</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>1x Standard 20&quot; x 20&quot; Box Fan ($22)</li>
              <li>{config.filterCount}x MERV-{config.filterMerv} 20&quot;x20&quot;x2&quot; Furnace Filters (${config.filterMerv === 14 ? 16 : 12} ea)</li>
              <li>1x Roll Heavy Duty Duct Tape or Gaffers Tape ($6)</li>
              <li>1x Cardboard shroud with 15&quot; circular opening taped on front grille</li>
              {config.hasCarbonLayer && <li>1x Activated Carbon Pre-Filter sheet for VOC &amp; smoke neutralization ($15)</li>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
