import { useState, useEffect, useCallback } from 'react';
import { AirQualityState, LocationData } from '../types';
import { PRESET_LOCATIONS } from '../core/api/geocoding';
import { fetchLiveAirQuality, generateSyntheticWinterSmogState } from '../core/api/open_meteo';

interface UseAirQualityReturn {
  location: LocationData;
  setLocation: (loc: LocationData) => void;
  aqiState: AirQualityState;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to manage global air quality telemetry, real-time fetching,
 * and deterministic winter smog fallbacks.
 */
export function useAirQuality(initialLocation: LocationData = PRESET_LOCATIONS[0]): UseAirQualityReturn {
  const [location, setLocation] = useState<LocationData>(initialLocation);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [aqiState, setAqiState] = useState<AirQualityState>(() =>
    generateSyntheticWinterSmogState(initialLocation)
  );

  const loadData = useCallback(async (loc: LocationData, refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchLiveAirQuality(loc);
      setAqiState(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown network failure';
      setError(msg);
      console.warn('Air quality telemetry fetch error; reverting to deterministic model:', err);
      setAqiState(generateSyntheticWinterSmogState(loc));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(location, false);
  }, [location, loadData]);

  const refresh = useCallback(async () => {
    await loadData(location, true);
  }, [location, loadData]);

  return {
    location,
    setLocation,
    aqiState,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
