import React, { useState } from 'react';
import { Calendar, Fan, Leaf, HeartPulse, RefreshCw } from 'lucide-react';
import { AqiStandard } from './types';
import { defaultGeminiClient } from './core/agents/gemini_client';
import { useAirQuality } from './hooks/useAirQuality';
import {
  Header,
  LocationSelector,
  AqiHeroDisplay,
  InversionAlert,
  RoutinePlanner,
  CorsiRosenthalStudio,
  SustainableHabits,
  ImpactExplainer,
  ExportDossierModal,
  ApiKeyModal,
  ErrorBoundary,
} from './components';

type ActiveTab = 'routine' | 'purifier' | 'habits' | 'impact';

export const AppContent: React.FC = () => {
  const [aqiStandard, setAqiStandard] = useState<AqiStandard>('US_EPA');
  const [activeTab, setActiveTab] = useState<ActiveTab>('routine');
  const [hasApiKey, setHasApiKey] = useState<boolean>(defaultGeminiClient.hasApiKey());

  // Modals
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);

  // Managed Air Quality Telemetry via Custom Hook
  const {
    location,
    setLocation,
    aqiState,
    isLoading,
    isRefreshing,
    refresh,
  } = useAirQuality();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Skip to Main Content Link for WCAG 2.1 AA Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold focus:text-xs"
      >
        Skip to main content
      </a>

      {/* Accessible Header */}
      <Header
        aqiStandard={aqiStandard}
        onStandardChange={setAqiStandard}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
        onOpenDossierModal={() => setIsDossierOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 focus:outline-none"
      >
        {/* City & Corridors Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <LocationSelector
              currentLocation={location}
              onSelectLocation={setLocation}
              isLoading={isLoading}
            />
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh live atmospheric telemetry"
            aria-label="Refresh atmospheric data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Live AQI Hero Gauge & Speciation Spectrum */}
        <AqiHeroDisplay state={aqiState} aqiStandard={aqiStandard} />

        {/* Feature Navigation Tabs */}
        <div
          role="tablist"
          aria-label="AtmoPraxis Core Features"
          className="border-b border-slate-800 flex items-center space-x-1 sm:space-x-4 overflow-x-auto pb-px"
        >
          <button
            id="tab-routine"
            role="tab"
            aria-selected={activeTab === 'routine'}
            aria-controls="panel-routine"
            tabIndex={activeTab === 'routine' ? 0 : -1}
            type="button"
            onClick={() => setActiveTab('routine')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'routine'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Low-Emission Routines</span>
          </button>

          <button
            id="tab-purifier"
            role="tab"
            aria-selected={activeTab === 'purifier'}
            aria-controls="panel-purifier"
            tabIndex={activeTab === 'purifier' ? 0 : -1}
            type="button"
            onClick={() => setActiveTab('purifier')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'purifier'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fan className="w-4 h-4" aria-hidden="true" />
            <span>DIY Purifier Studio (C-R Box)</span>
          </button>

          <button
            id="tab-habits"
            role="tab"
            aria-selected={activeTab === 'habits'}
            aria-controls="panel-habits"
            tabIndex={activeTab === 'habits' ? 0 : -1}
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'habits'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Leaf className="w-4 h-4" aria-hidden="true" />
            <span>Sustainable Alternatives</span>
          </button>

          <button
            id="tab-impact"
            role="tab"
            aria-selected={activeTab === 'impact'}
            aria-controls="panel-impact"
            tabIndex={activeTab === 'impact' ? 0 : -1}
            type="button"
            onClick={() => setActiveTab('impact')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'impact'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" aria-hidden="true" />
            <span>Physiological Impact</span>
          </button>
        </div>

        {/* Tab Views */}
        <div className="pt-2">
          {activeTab === 'routine' && (
            <div id="panel-routine" role="tabpanel" aria-labelledby="tab-routine" className="space-y-6">
              <InversionAlert atmosphere={aqiState.atmosphere} hourly={aqiState.hourly} />
              <RoutinePlanner state={aqiState} hasApiKey={hasApiKey} />
            </div>
          )}

          {activeTab === 'purifier' && (
            <div id="panel-purifier" role="tabpanel" aria-labelledby="tab-purifier">
              <CorsiRosenthalStudio />
            </div>
          )}

          {activeTab === 'habits' && (
            <div id="panel-habits" role="tabpanel" aria-labelledby="tab-habits">
              <SustainableHabits />
            </div>
          )}

          {activeTab === 'impact' && (
            <div id="panel-impact" role="tabpanel" aria-labelledby="tab-impact">
              <ImpactExplainer state={aqiState} />
            </div>
          )}
        </div>
      </main>

      {/* Accessible Footer */}
      <footer role="contentinfo" className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-400">AtmoPraxis</span> • Neuro-Symbolic Urban Air Quality Assistant
          </div>
          <div>
            Zero-cloud offline edge inference enabled • Open-Meteo API • MIT Licensed
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExportDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        state={aqiState}
        aqiStandard={aqiStandard}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onKeyUpdated={() => setHasApiKey(defaultGeminiClient.hasApiKey())}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
