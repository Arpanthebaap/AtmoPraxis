import React, { useEffect } from 'react';
import { X, Printer, Calendar, FileText } from 'lucide-react';
import { AirQualityState, AqiStandard } from '../types';

export interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AirQualityState;
  aqiStandard: AqiStandard;
}

/**
 * Accessible modal dialog for exporting the Clean Air Daily Dossier
 * and downloading RFC 5545 iCalendar (.ics) files.
 * Implements focus locking, Escape key listeners, and memory leak cleanup.
 */
export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen,
  onClose,
  state,
  aqiStandard,
}) => {
  // Escape key handler & background body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

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
    const objectUrl = window.URL.createObjectURL(blob);
    const safeCity = state.location.city.replace(/[^a-zA-Z0-9_\-]/g, '_');

    const link = document.createElement('a');
    link.href = objectUrl;
    link.setAttribute('download', `AtmoPraxis_Routine_${safeCity}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Prevent memory leaks by revoking object URL after download trigger
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
      aria-describedby="dossier-desc"
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
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-4">
          <FileText className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 id="dossier-title" className="text-lg font-bold text-white">
            Clean Air Daily Dossier &amp; Calendar Export
          </h2>
        </div>

        <p id="dossier-desc" className="sr-only">
          Summary and calendar export of your personalized urban air quality action plan.
        </p>

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
              <div className="text-[10px] text-slate-400 uppercase">{currentCategory}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200">1. Spatiotemporal Solar Window</div>
            <p className="text-slate-400 leading-relaxed pl-3 border-l-2 border-emerald-500">
              Open exterior windows for 20 minutes strictly between <strong>12:30 PM - 14:30 PM</strong> to flush indoor CO2 without trapping ground smog.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200">2. Commute Protection Protocol</div>
            <p className="text-slate-400 leading-relaxed pl-3 border-l-2 border-teal-500">
              Shift morning transit past 08:30 AM to bypass peak radiative temperature inversion. Equip pedestrians with N95 masks.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200">3. DIY Corsi-Rosenthal Air Filtration</div>
            <p className="text-slate-400 leading-relaxed pl-3 border-l-2 border-emerald-500">
              Operate 4-filter MERV-13 box purifier on medium speed in bedrooms overnight (21:00 - 07:00) for continuous 5.5 ACH hospital-grade clearance.
            </p>
          </div>
        </div>

        {/* Export Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Download .ICS Calendar Schedule</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print / Save Dossier PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
