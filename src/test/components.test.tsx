import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  Header,
  AqiHeroDisplay,
  InversionAlert,
  CorsiRosenthalStudio,
  SustainableHabits,
  ImpactExplainer,
  RoutinePlanner,
  ErrorBoundary,
  ApiKeyModal,
  ExportDossierModal,
  LocationSelector,
} from '../components';
import { App } from '../App';
import { generateSyntheticWinterSmogState } from '../core/api/open_meteo';
import { PRESET_LOCATIONS } from '../core/api/geocoding';

describe('Accessible UI Components & Layout Tests', () => {
  const dummyState = generateSyntheticWinterSmogState(PRESET_LOCATIONS[0]);

  it('renders Header with WCAG banner landmark and standard switchers', () => {
    const html = renderToString(
      <Header
        aqiStandard="US_EPA"
        onStandardChange={() => {}}
        onOpenApiKeyModal={() => {}}
        onOpenDossierModal={() => {}}
        hasApiKey={false}
      />
    );

    expect(html).toContain('AtmoPraxis');
    expect(html).toContain('role="banner"');
    expect(html).toContain('US EPA');
    expect(html).toContain('India NAQI');
    expect(html).toContain('Daily Dossier');
    expect(html).toContain('Offline Heuristic');
  });

  it('renders AqiHeroDisplay with accessible ARIA labels and 6-pollutant speciation', () => {
    const html = renderToString(
      <AqiHeroDisplay state={dummyState} aqiStandard="US_EPA" />
    );

    expect(html).toContain(`Air Quality Index: ${dummyState.aqiUs}`);
    expect(html).toContain('PM2.5');
    expect(html).toContain('PM10');
    expect(html).toContain('NO₂');
    expect(html).toContain('SO₂');
    expect(html).toContain('CO');
    expect(html).toContain('O₃');
    expect(html).toContain('WHO Cap:');
  });

  it('renders InversionAlert with boundary layer height and ventilation coefficient', () => {
    const html = renderToString(
      <InversionAlert atmosphere={dummyState.atmosphere} hourly={dummyState.hourly} />
    );

    expect(html).toContain('Tropospheric Thermal Inversion &amp; Smog Trapping Engine');
    expect(html).toContain('Boundary Layer Height (PBL)');
    expect(html).toContain('Ventilation Coefficient');
    expect(html).toContain('Solar Clearance Window');
  });

  it('renders CorsiRosenthalStudio with fully labeled accessible range sliders and fluid dynamics', () => {
    const html = renderToString(<CorsiRosenthalStudio />);

    expect(html).toContain('Room Length:');
    expect(html).toContain('Room Width:');
    expect(html).toContain('Ceiling Height:');
    expect(html).toContain('aria-label="Room Length in feet"');
    expect(html).toContain('aria-label="Room Width in feet"');
    expect(html).toContain('aria-label="Room Ceiling Height in feet"');
    expect(html).toContain('Effective Clean Air Delivery (CADR)');
    expect(html).toContain('Air Changes Per Hour (ACH)');
    expect(html).toContain('Bill of Materials &amp; Assembly Steps');
  });

  it('renders SustainableHabits with category navigation and quantifiable metrics', () => {
    const html = renderToString(<SustainableHabits />);

    expect(html).toContain('Sustainable Habits &amp; Emission Abatement Engine');
    expect(html).toContain('Daily PM2.5 Abated');
    expect(html).toContain('Daily Carbon (CO₂e) Saved');
    expect(html).toContain('Neighborhood Impact');
    expect(html).toContain('Commute');
    expect(html).toContain('Home Heating');
  });

  it('renders ImpactExplainer with Berkeley Earth cigarette equivalency', () => {
    const html = renderToString(<ImpactExplainer state={dummyState} />);

    expect(html).toContain('Direct Physiological Impact &amp; Health Risk Translation');
    expect(html).toContain('Cigarettes / Day Prevented');
    expect(html).toContain('Inhalation Dose Shield');
    expect(html).toContain('Deep Lung Penetration');
  });

  it('renders RoutinePlanner with all 4 target personas', () => {
    const html = renderToString(
      <RoutinePlanner state={dummyState} hasApiKey={false} />
    );

    expect(html).toContain('Low-Emission Daily Routine Studio');
    expect(html).toContain('Family with Children');
    expect(html).toContain('Working Commuters');
    expect(html).toContain('Elderly / Vulnerable');
    expect(html).toContain('Active Fitness');
    expect(html).toContain('Toxic Dose Reduction');
  });

  it('renders LocationSelector with combobox accessibility attributes', () => {
    const html = renderToString(
      <LocationSelector
        currentLocation={PRESET_LOCATIONS[0]}
        onSelectLocation={() => {}}
        isLoading={false}
      />
    );

    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-autocomplete="list"');
    expect(html).toContain('Auto GPS');
    expect(html).toContain('High Smog Corridors:');
  });

  it('renders ApiKeyModal with accessible dialog attributes when open', () => {
    const html = renderToString(
      <ApiKeyModal
        isOpen={true}
        onClose={() => {}}
        onKeyUpdated={() => {}}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('Google Gemini 2.5 Flash Configuration');
    expect(html).toContain('Gemini API Key (Optional)');
  });

  it('returns null when ApiKeyModal or ExportDossierModal are closed', () => {
    const keyModalHtml = renderToString(
      <ApiKeyModal isOpen={false} onClose={() => {}} onKeyUpdated={() => {}} />
    );
    expect(keyModalHtml).toBe('');

    const dossierModalHtml = renderToString(
      <ExportDossierModal
        isOpen={false}
        onClose={() => {}}
        state={dummyState}
        aqiStandard="US_EPA"
      />
    );
    expect(dossierModalHtml).toBe('');
  });

  it('renders ExportDossierModal with action buttons when open', () => {
    const html = renderToString(
      <ExportDossierModal
        isOpen={true}
        onClose={() => {}}
        state={dummyState}
        aqiStandard="US_EPA"
      />
    );

    expect(html).toContain('Clean Air Daily Dossier &amp; Calendar Export');
    expect(html).toContain('Download .ICS Calendar Schedule');
    expect(html).toContain('Print / Save Dossier PDF');
  });

  it('renders ErrorBoundary children safely under normal operation', () => {
    const html = renderToString(
      <ErrorBoundary>
        <div data-testid="child-content">Safe Child Content</div>
      </ErrorBoundary>
    );

    expect(html).toContain('Safe Child Content');
  });

  it('renders full App root layout without crashing', () => {
    const html = renderToString(<App />);

    expect(html).toContain('AtmoPraxis');
    expect(html).toContain('Skip to main content');
    expect(html).toContain('id="main-content"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('Low-Emission Routines');
    expect(html).toContain('DIY Purifier Studio (C-R Box)');
    expect(html).toContain('Sustainable Alternatives');
    expect(html).toContain('Physiological Impact');
  });
});
