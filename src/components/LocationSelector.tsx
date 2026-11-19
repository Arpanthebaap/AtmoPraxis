import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { LocationData } from '../types';
import { PRESET_LOCATIONS, searchLocations } from '../core/api/geocoding';

interface LocationSelectorProps {
  currentLocation: LocationData;
  onSelectLocation: (location: LocationData) => void;
  isLoading: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onSelectLocation,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await searchLocations(query);
        setResults(found);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationData) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: LocationData = {
            city: 'My Local Position',
            country: 'Detected',
            countryCode: '',
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          };
          onSelectLocation(loc);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          alert('Could not retrieve device location. Please search for your city.');
        }
      );
    }
  };

  return (
    <div className="w-full space-y-3" ref={containerRef}>
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        {/* City Search Bar */}
        <div className="relative flex-1">
          <label htmlFor="city-search" className="sr-only">
            Search city or region
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              id="city-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search global city (e.g. Delhi, London, Lahore, Beijing, New York)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />
            {(isSearching || isLoading) && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto"
            >
              {results.map((loc, idx) => (
                <li
                  key={`${loc.city}-${loc.country}-${idx}`}
                  role="option"
                  aria-selected={loc.city === currentLocation.city}
                  onClick={() => handleSelect(loc)}
                  className="px-4 py-2.5 hover:bg-slate-800 text-sm cursor-pointer flex items-center justify-between transition-colors border-b border-slate-800/50 last:border-b-0"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-slate-100">{loc.city}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{loc.country}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Device GPS button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors shadow-sm"
          title="Use current GPS coordinate"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto GPS</span>
        </button>
      </div>

      {/* Preset Location Quick Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs text-slate-400">
        <span className="text-slate-500 whitespace-nowrap text-[11px] uppercase tracking-wider font-semibold">
          High Smog Corridors:
        </span>
        {PRESET_LOCATIONS.slice(0, 7).map((loc) => {
          const isSelected = loc.city.toLowerCase() === currentLocation.city.toLowerCase();
          return (
            <button
              key={loc.city}
              type="button"
              onClick={() => onSelectLocation(loc)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap border transition-all text-xs font-medium ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {loc.city}
            </button>
          );
        })}
      </div>
    </div>
  );
};
