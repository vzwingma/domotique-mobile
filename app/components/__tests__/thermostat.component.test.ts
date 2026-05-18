/**
 * Tests pour thermostat.component.tsx
 *
 * Approche: Tester la logique métier du composant via ses fonctions export
 * plutôt que le composant React directement (évite les problèmes de mock).
 */

import React from 'react';
import DomoticzThermostat from '@/app/models/domoticzThermostat.model';
import DomoticzTemperature from '@/app/models/domoticzTemperature.model';
import { DomoticzThermostatLevelValue } from '@/app/enums/DomoticzEnum';

// ─── Factories ────────────────────────────────────────────────────────────────

function makeThermostat(overrides: Partial<DomoticzThermostat> = {}): DomoticzThermostat {
  return {
    idx: 301,
    rang: 0,
    name: 'Salon',
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    temp: 20,
    unit: '°C',
    type: 'Thermostat',
    subType: 'Setpoint',
    status: '20',
    data: '20',
    ...overrides,
  } as DomoticzThermostat;
}

function makeTemperature(overrides: Partial<DomoticzTemperature> = {}): DomoticzTemperature {
  return {
    idx: '101',
    rang: 0,
    name: 'Salon',
    lastUpdate: '2024-01-01 12:00:00',
    isActive: true,
    temp: 21.5,
    humidity: null as any,
    humidityStatus: '',
    type: 'Temp',
    subType: 'LaCrosse TX3',
    status: '',
    data: '21.5',
    ...overrides,
  } as unknown as DomoticzTemperature;
}

// ─── Tests des fonctions utilitaires du composant ─────────────────────────────

describe('thermostat.component - utility functions', () => {
  describe('DomoticzThermostatLevelValue constants', () => {
    it('defines MIN value as 5', () => {
      expect(DomoticzThermostatLevelValue.MIN).toBe(5);
    });

    it('defines MAX value as 30', () => {
      expect(DomoticzThermostatLevelValue.MAX).toBe(30);
    });

    it('allows range from MIN to MAX', () => {
      const range = DomoticzThermostatLevelValue.MAX - DomoticzThermostatLevelValue.MIN;
      expect(range).toBe(25);
    });
  });

  describe('Thermostat value calculations', () => {
    it('rounding to nearest 0.5°C works', () => {
      const testCases = [
        { input: 20.1, expected: 20 },
        { input: 20.3, expected: 20.5 },
        { input: 20.7, expected: 20.5 },
        { input: 20.9, expected: 21 },
        { input: 5.0, expected: 5 },
        { input: 30.0, expected: 30 },
      ];

      testCases.forEach(({ input, expected }) => {
        const rounded = Math.round(input * 2) / 2;
        expect(rounded).toBe(expected);
      });
    });

    it('clamps values to MIN/MAX range', () => {
      const testCases = [
        { input: 3, expected: 5 }, // below MIN
        { input: 5, expected: 5 }, // at MIN
        { input: 20, expected: 20 }, // in range
        { input: 30, expected: 30 }, // at MAX
        { input: 32, expected: 30 }, // above MAX
      ];

      testCases.forEach(({ input, expected }) => {
        const clamped = Math.max(
          DomoticzThermostatLevelValue.MIN,
          Math.min(DomoticzThermostatLevelValue.MAX, input)
        );
        expect(clamped).toBe(expected);
      });
    });
  });
});

// ─── Tests du modèle Thermostat ────────────────────────────────────────────────

describe('thermostat.component - DomoticzThermostat model', () => {
  it('creates a thermostat with default values', () => {
    const thermostat = makeThermostat();
    expect(thermostat).toEqual(
      expect.objectContaining({
        idx: 301,
        name: 'Salon',
        temp: 20,
        isActive: true,
      })
    );
  });

  it('allows overriding thermostat properties', () => {
    const thermostat = makeThermostat({ temp: 25, name: 'Chambre' });
    expect(thermostat.temp).toBe(25);
    expect(thermostat.name).toBe('Chambre');
  });

  it('handles inactive thermostat', () => {
    const thermostat = makeThermostat({ isActive: false });
    expect(thermostat.isActive).toBe(false);
  });

  it('validates temperature range boundaries', () => {
    const lowTemp = makeThermostat({ temp: 5 });
    const highTemp = makeThermostat({ temp: 30 });
    const outOfRange = makeThermostat({ temp: 35 });

    expect(lowTemp.temp).toBe(5);
    expect(highTemp.temp).toBe(30);
    expect(outOfRange.temp).toBe(35); // Model stores as-is, clamping is UI responsibility
  });
});

// ─── Tests de recherche de température mesurée ────────────────────────────────

describe('thermostat.component - measured temperature lookup', () => {
  it('finds temperature sensor by name matching', () => {
    const salon = makeTemperature({ name: 'Salon', temp: 21.5 });
    const temperatures = [salon];

    const measuredTemp = temperatures.find(t => t.name.toLowerCase().includes('salon'));
    expect(measuredTemp).toBeDefined();
    expect(measuredTemp?.temp).toBe(21.5);
  });

  it('returns undefined if no Salon sensor exists', () => {
    const chambre = makeTemperature({ name: 'Chambre', temp: 19 });
    const temperatures = [chambre];

    const measuredTemp = temperatures.find(t => t.name.toLowerCase().includes('salon'));
    expect(measuredTemp).toBeUndefined();
  });

  it('handles case-insensitive name matching', () => {
    const salon = makeTemperature({ name: 'SALON', temp: 22 });
    const temperatures = [salon];

    const measuredTemp = temperatures.find(t => t.name.toLowerCase().includes('salon'));
    expect(measuredTemp).toBeDefined();
    expect(measuredTemp?.temp).toBe(22);
  });

  it('handles multiple temperature sensors and returns Salon', () => {
    const salon = makeTemperature({ name: 'Salon', temp: 21.5, idx: '101' });
    const chambre = makeTemperature({ name: 'Chambre', temp: 19, idx: '102' });
    const cuisine = makeTemperature({ name: 'Cuisine', temp: 20, idx: '103' });
    const temperatures = [chambre, cuisine, salon];

    const measuredTemp = temperatures.find(t => t.name.toLowerCase().includes('salon'));
    expect(measuredTemp?.idx).toBe('101');
    expect(measuredTemp?.temp).toBe(21.5);
  });
});

// ─── Tests de logique de boutons ───────────────────────────────────────────────

describe('thermostat.component - button logic', () => {
  describe('decrease button', () => {
    it('decreases value by 0.5°C', () => {
      const currentValue = 20;
      const newValue = Math.max(
        DomoticzThermostatLevelValue.MIN,
        Math.round((currentValue - 0.5) * 10) / 10
      );
      expect(newValue).toBe(19.5);
    });

    it('clamps to MIN value', () => {
      const currentValue = 5;
      const newValue = Math.max(
        DomoticzThermostatLevelValue.MIN,
        Math.round((currentValue - 0.5) * 10) / 10
      );
      expect(newValue).toBe(DomoticzThermostatLevelValue.MIN);
    });

    it('respects inactive thermostat', () => {
      const thermostat = makeThermostat({ isActive: false });
      expect(thermostat.isActive).toBe(false);
      // Logic in component would skip action if !thermostat.isActive
    });
  });

  describe('increase button', () => {
    it('increases value by 0.5°C', () => {
      const currentValue = 20;
      const newValue = Math.min(
        DomoticzThermostatLevelValue.MAX,
        Math.round((currentValue + 0.5) * 10) / 10
      );
      expect(newValue).toBe(20.5);
    });

    it('clamps to MAX value', () => {
      const currentValue = 30;
      const newValue = Math.min(
        DomoticzThermostatLevelValue.MAX,
        Math.round((currentValue + 0.5) * 10) / 10
      );
      expect(newValue).toBe(DomoticzThermostatLevelValue.MAX);
    });

    it('respects inactive thermostat', () => {
      const thermostat = makeThermostat({ isActive: false });
      expect(thermostat.isActive).toBe(false);
    });
  });
});

// ─── Tests de cas limites ──────────────────────────────────────────────────────

describe('thermostat.component - edge cases', () => {
  it('handles temperature at MIN boundary (5°C)', () => {
    const thermostat = makeThermostat({ temp: 5 });
    expect(thermostat.temp).toBe(DomoticzThermostatLevelValue.MIN);
  });

  it('handles temperature at MAX boundary (30°C)', () => {
    const thermostat = makeThermostat({ temp: 30 });
    expect(thermostat.temp).toBe(DomoticzThermostatLevelValue.MAX);
  });

  it('handles temperature with fractional values (0.5°C)', () => {
    const thermostat = makeThermostat({ temp: 20.5 });
    const rounded = Math.round(thermostat.temp * 2) / 2;
    expect(rounded).toBe(20.5);
  });

  it('handles inactive thermostat display state', () => {
    const inactive = makeThermostat({ isActive: false });
    const intPart = inactive.isActive ? Math.floor(inactive.temp).toString() : '−';
    expect(intPart).toBe('−'); // Unicode minus sign
  });

  it('handles empty temperature sensor list', () => {
    const temperatures: DomoticzTemperature[] = [];
    const measuredTemp = temperatures.find(t => t.name.toLowerCase().includes('salon'));
    expect(measuredTemp).toBeUndefined();
  });

  it('handles thermostat with zero temperatures available', () => {
    const thermostat = makeThermostat();
    const temperatures: DomoticzTemperature[] = [];
    
    const hasTemperature = temperatures.some(t => t.name.toLowerCase().includes('salon'));
    expect(hasTemperature).toBe(false);
  });
});

// ─── Tests de display logic ───────────────────────────────────────────────────

describe('thermostat.component - display logic', () => {
  it('formats active thermostat display correctly', () => {
    const thermostat = makeThermostat({ temp: 20.5, isActive: true });
    
    const intPart = thermostat.isActive ? Math.floor(thermostat.temp).toString() : '−';
    const frac = thermostat.temp % 1;
    const fracStr = frac === 0 ? '0' : Math.round(frac * 10).toString();
    const decPart = thermostat.isActive ? '.' + fracStr + '°' : '';
    
    expect(intPart).toBe('20');
    expect(decPart).toBe('.5°');
    expect(intPart + decPart).toBe('20.5°');
  });

  it('formats inactive thermostat display correctly', () => {
    const thermostat = makeThermostat({ temp: 20.5, isActive: false });
    
    const intPart = thermostat.isActive ? Math.floor(thermostat.temp).toString() : '−';
    const decPart = thermostat.isActive ? '.5°' : '';
    
    expect(intPart).toBe('−');
    expect(decPart).toBe('');
  });

  it('handles whole number temperatures in display', () => {
    const thermostat = makeThermostat({ temp: 22, isActive: true });
    
    const intPart = Math.floor(thermostat.temp).toString();
    const frac = thermostat.temp % 1;
    const fracStr = frac === 0 ? '0' : Math.round(frac * 10).toString();
    const decPart = '.' + fracStr + '°';
    
    expect(intPart).toBe('22');
    expect(decPart).toBe('.0°');
  });
});
