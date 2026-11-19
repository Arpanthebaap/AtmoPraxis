import React from 'react';
import { Wind, Key, FileDown } from 'lucide-react';
import { AqiStandard } from '../types';

interface HeaderProps {
  aqiStandard: AqiStandard;
  onStandardChange: (std: AqiStandard) => void;
  onOpenApiKeyModal: () => void;
  onOpenDossierModal: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  aqiStandard,
  onStandardChange,
  onOpenApiKeyModal,
  onOpenDossierModal,
  hasApiKey,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <Wind className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white">AtmoPraxis</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Neuro-Symbolic Urban Air Quality Co-Pilot
            </p>
          </div>
        </div>

        {/* Action Controls & Standards Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* AQI Standard Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => onStandardChange('US_EPA')}
              className={`px-2.5 py-1 rounded transition-all ${
                aqiStandard === 'US_EPA'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Switch to US EPA AQI standard"
            >
              US EPA
            </button>
            <button
              type="button"
              onClick={() => onStandardChange('INDIA_NAQI')}
              className={`px-2.5 py-1 rounded transition-all ${
                aqiStandard === 'INDIA_NAQI'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Switch to India National Air Quality Index CPCB standard"
            >
              India NAQI
            </button>
          </div>

          {/* Dossier Export Button */}
          <button
            type="button"
            onClick={onOpenDossierModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Export Clean Air Daily Dossier (Print/PDF/ICS)"
          >
            <FileDown className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="hidden md:inline">Daily Dossier</span>
          </button>

          {/* API Key Modal Button */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {hasApiKey ? 'Gemini 2.5 Active' : 'Offline Heuristic'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
