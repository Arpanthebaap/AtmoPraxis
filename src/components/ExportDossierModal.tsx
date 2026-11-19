import React from 'react';
import { X, Printer, Calendar, FileText } from 'lucide-react';
import { AirQualityState, AqiStandard } from '../types';

interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AirQualityState;
  aqiStandard: AqiStandard;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen,
  onClose,
  state,
  aqiStandard,
}) => {
  if (!isOpen) return null;

  const currentAqi = aqiStandard === 'US_EPA' ? state.aqiUs : state.aqiIndia;
  const currentCategory = aqiStandard === 'US_EPA' ? state.categoryUs : state.categoryIndia;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadIcs = () => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AtmoPraxis//Clean Air Daily Routine//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:AtmoPraxis: Solar Thermal Window (Natural Air Exchange)
DESCRIPTION:Optimal solar convection window in ${state.location.city}. Open windows for 20 minutes to flush indoor CO2, then re-seal.
DTSTART:${todayStr}T123000Z
DTEND:${todayStr}T131500Z
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:AtmoPraxis: Low-Emission Commute Window
DESCRIPTION:Avoid peak nocturnal thermal inversion in ${state.location.city}. Use electrified transit with N95 respirator.
DTSTART:${todayStr}T171500Z
DTEND:${todayStr}T180000Z
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:AtmoPraxis: Nocturnal Sleep Air Filtration
DESCRIPTION:Activate Corsi-Rosenthal box fan on whisper low speed in bedroom to prevent overnight smog trapping.
DTSTART:${todayStr}T210000Z
DTEND:${todayStr}T230000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `AtmoPraxis_Routine_${state.location.city}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-4">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 id="dossier-title" className="text-lg font-bold text-white">
            Clean Air Daily Dossier &amp; Calendar Export
          </h2>
        </div>

        {/* Dossier Preview Card */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <div className="text-sm font-bold text-white">AtmoPraxis Daily Atmospheric Plan</div>
              <div className="text-slate-400 text-[11px]">
                Target airshed: {state.location.city}, {state.location.country} • Date: {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold font-mono text-emerald-400">AQI {currentAqi}</div>
              <div className="text-[10px] text-slate-400">{currentCategory}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[10px]">
              Critical Spatiotemporal Directives:
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>
                <strong>Morning Peak Shield:</strong> Inversion layer compressed to{' '}
                {state.atmosphere.boundaryLayerHeight}m. No outdoor morning cardio between 06:00 - 09:30.
              </li>
              <li>
                <strong>Solar Cross-Ventilation:</strong> Flush indoor spaces strictly between 12:30 - 14:00.
              </li>
              <li>
                <strong>Indoor Bio-Purification:</strong> Maintain Corsi-Rosenthal filtration at &ge; 5 ACH continuously.
              </li>
              <li>
                <strong>Commute Shift:</strong> Avoid private vehicle idling; switch to electrified transit with fit-tested N95.
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Download .ICS Calendar Reminders</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
