import React, { useState, useEffect } from 'react';
import { Calendar, Fan, Leaf, HeartPulse, RefreshCw } from 'lucide-react';
import { AirQualityState, AqiStandard, LocationData } from './types';
import { PRESET_LOCATIONS } from './core/api/geocoding';
import { fetchLiveAirQuality, generateSyntheticWinterSmogState } from './core/api/open_meteo';
import { defaultGeminiClient } from './core/agents/gemini_client';
import { Header } from './components/Header';
import { LocationSelector } from './components/LocationSelector';
import { AqiHeroDisplay } from './components/AqiHeroDisplay';
import { InversionAlert } from './components/InversionAlert';
import { RoutinePlanner } from './components/RoutinePlanner';
import { CorsiRosenthalStudio } from './components/CorsiRosenthalStudio';
import { SustainableHabits } from './components/SustainableHabits';
import { ImpactExplainer } from './components/ImpactExplainer';
import { ExportDossierModal } from './components/ExportDossierModal';
import { ApiKeyModal } from './components/ApiKeyModal';

type ActiveTab = 'routine' | 'purifier' | 'habits' | 'impact';

export const App: React.FC = () => {
  const [location, setLocation] = useState<LocationData>(PRESET_LOCATIONS[0]); // Default: Delhi
  const [aqiStandard, setAqiStandard] = useState<AqiStandard>('US_EPA');
  const [activeTab, setActiveTab] = useState<ActiveTab>('routine');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(defaultGeminiClient.hasApiKey());

  // Modals
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);

  // Air Quality State
  const [aqiState, setAqiState] = useState<AirQualityState>(() =>
    generateSyntheticWinterSmogState(PRESET_LOCATIONS[0])
  );

  const loadAirQualityData = async (loc: LocationData, refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchLiveAirQuality(loc);
      setAqiState(data);
    } catch (err) {
      console.warn('Failed to fetch live meteorology, using synthetic model:', err);
      setAqiState(generateSyntheticWinterSmogState(loc));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAirQualityData(location);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Accessible Header */}
      <Header
        aqiStandard={aqiStandard}
        onStandardChange={setAqiStandard}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
        onOpenDossierModal={() => setIsDossierOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
            onClick={() => loadAirQualityData(location, true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh live atmospheric telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Live AQI Hero Gauge & Speciation Spectrum */}
        <AqiHeroDisplay state={aqiState} aqiStandard={aqiStandard} />

        {/* Feature Navigation Tabs */}
        <div className="border-b border-slate-800 flex items-center space-x-1 sm:space-x-4 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('routine')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'routine'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Low-Emission Routines</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purifier')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'purifier'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fan className="w-4 h-4" />
            <span>DIY Purifier Studio (C-R Box)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'habits'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Sustainable Alternatives</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('impact')}
            className={`flex items-center space-x-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'impact'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Physiological Impact</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <InversionAlert atmosphere={aqiState.atmosphere} hourly={aqiState.hourly} />
            <RoutinePlanner state={aqiState} hasApiKey={hasApiKey} />
          </div>
        )}

        {activeTab === 'purifier' && <CorsiRosenthalStudio />}

        {activeTab === 'habits' && <SustainableHabits />}

        {activeTab === 'impact' && <ImpactExplainer state={aqiState} />}
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-xs text-slate-500 text-center">
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
