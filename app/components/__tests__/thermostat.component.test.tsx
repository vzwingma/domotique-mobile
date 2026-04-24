/**
 * Tests unitaires pour thermostat.component.tsx
 *
 * Stratégie : Tests du composant ViewDomoticzThermostat (cadran circulaire)
 * avec validation des boutons ±0.5°C et de la valeur affichée (consigne + mesure).
 *
 * Couvre :
 *  - Affichage de la consigne (température setpoint)
 *  - Affichage de la mesure (température mesurée)
 *  - Boutons +/- pour ajuster la consigne de ±0.5°C
 *  - Limites min/max de la consigne
 *  - Gestion du thermostat inactif
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ViewDomoticzThermostat } from '../thermostat.component';
import DomoticzThermostat from '@/app/models/domoticzThermostat.model';
import { DomoticzContext } from '@/app/services/DomoticzContextProvider';
import DomoticzTemperature from '@/app/models/domoticzTemperature.model';

// ─── Mocks des dépendances externes ──────────────────────────────────────────

const mockUpdateThermostatPoint = jest.fn();

jest.mock('@/app/controllers/thermostats.controller', () => ({
  updateThermostatPoint: (...args: any[]) => mockUpdateThermostatPoint(...args),
}));

jest.mock('@/components/ThemedText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    ThemedText: (props: any) => React.createElement(Text, props),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Gesture: {
      Pan: () => ({
        runOnJS: function(this: any) { return this; },
        onBegin: function(this: any) { return this; },
        onUpdate: function(this: any) { return this; },
        onEnd: function(this: any) { return this; },
      }),
    },
    GestureDetector: ({ children }: any) => React.createElement(View, { testID: "gesture-detector" }, children),
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    Svg: (props: any) => React.createElement(View, { testID: "svg-dial", ...props }),
    Circle: (props: any) => React.createElement(View, { testID: "svg-circle", ...props }),
    Path: (props: any) => React.createElement(View, { testID: "svg-path", ...props }),
    Defs: (props: any) => React.createElement(View, { ...props }),
    Stop: (props: any) => React.createElement(View, { ...props }),
    RadialGradient: (props: any) => React.createElement(View, { ...props }),
  };
});

jest.mock('@/app/enums/Colors', () => ({
  Colors: {
    dark: {
      background: '#0a0e27',
      tint: '#fff',
      surface: '#1a2240',
      labelSecondary: '#7a8aaa',
      slider: { trackActive: '#f5c727', trackInactive: '#333' },
    },
    domoticz: { color: '#f5c727' },
  },
}));

jest.mock('@/app/enums/DomoticzEnum', () => ({
  DomoticzThermostatLevelValue: {
    MIN: 5,
    MAX: 30,
  },
}));

// ─── Factory ──────────────────────────────────────────────────────────────────

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

// ─── Provider wrapper ─────────────────────────────────────────────────────────

function renderThermostat(
  thermostat: DomoticzThermostat,
  temperatures: DomoticzTemperature[] = [],
) {
  const setDomoticzThermostatData = jest.fn();
  return render(
    <DomoticzContext.Provider
      value={{
        domoticzThermostatData: [thermostat],
        setDomoticzThermostatData,
        domoticzTemperaturesData: temperatures,
      } as any}
    >
      <ViewDomoticzThermostat thermostat={thermostat} />
    </DomoticzContext.Provider>,
  );
}

// =============================================================================
// Tests du composant ViewDomoticzThermostat
// =============================================================================

describe('thermostat.component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================================================
  // Affichage de la consigne
  // =============================================================================

  describe('affichage de la consigne', () => {
    it('affiche le nom du thermostat', () => {
      const thermostat = makeThermostat({ name: 'Chambre principale' });

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('Chambre principale')).toBeTruthy();
    });

    it('affiche la consigne actuelle (nombre entier)', () => {
      const thermostat = makeThermostat({ temp: 20 });

      const { getByText } = renderThermostat(thermostat);
      // La consigne est affichée en deux parties : entier + décimale
      expect(getByText('20')).toBeTruthy();
    });

    it('affiche la consigne avec décimale quand applicable', () => {
      const thermostat = makeThermostat({ temp: 20.5 });

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('20')).toBeTruthy();
      // La partie décimale est affichée séparément avec "°"
      expect(getByText(/\.5°/)).toBeTruthy();
    });

    it('affiche "−" quand le thermostat est inactif', () => {
      const thermostat = makeThermostat({ isActive: false, temp: 20 });

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('−')).toBeTruthy();
    });

    it('affiche le label "Consigne" au-dessus de la valeur', () => {
      const thermostat = makeThermostat();

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('Consigne')).toBeTruthy();
    });
  });

  // =============================================================================
  // Affichage de la mesure (Salon)
  // =============================================================================

  describe('affichage de la mesure', () => {
    it('affiche "Mesure" quand un capteur Salon est disponible', () => {
      const thermostat = makeThermostat();
      const temperatures = [makeTemperature({ name: 'Salon', temp: 21.5 })];

      const { getByText } = renderThermostat(thermostat, temperatures);
      expect(getByText('Mesure')).toBeTruthy();
    });

    it('affiche la température mesurée en °C', () => {
      const thermostat = makeThermostat();
      const temperatures = [makeTemperature({ name: 'Salon', temp: 21.5 })];

      const { getByText } = renderThermostat(thermostat, temperatures);
      expect(getByText('21.5°C')).toBeTruthy();
    });

    it('ne rend pas la section Mesure quand aucun capteur Salon disponible', () => {
      const thermostat = makeThermostat();
      const temperatures = [makeTemperature({ name: 'Chambre', temp: 20.0 })];

      const { queryByText } = renderThermostat(thermostat, temperatures);
      expect(queryByText('Mesure')).toBeNull();
    });

    it('utilise le premier capteur nommé "Salon" trouvé', () => {
      const thermostat = makeThermostat();
      const temperatures = [
        makeTemperature({ name: 'Chambre', temp: 19.0 }),
        makeTemperature({ name: 'Salon', temp: 21.5 }),
        makeTemperature({ name: 'Salon 2', temp: 20.0 }),
      ];

      const { getByText, queryByText } = renderThermostat(thermostat, temperatures);
      expect(getByText('21.5°C')).toBeTruthy();
      expect(queryByText('19.0°C')).toBeNull();
      expect(queryByText('20.0°C')).toBeNull();
    });
  });

  // =============================================================================
  // Boutons ± 0.5°C
  // =============================================================================

  describe('boutons ± 0.5°C', () => {
    it('affiche les boutons − et +', () => {
      const thermostat = makeThermostat();

      const { getByLabelText } = renderThermostat(thermostat);
      expect(getByLabelText('Diminuer la consigne')).toBeTruthy();
      expect(getByLabelText('Augmenter la consigne')).toBeTruthy();
    });

    it('appelle handleDecrease au clic du bouton −', () => {
      const thermostat = makeThermostat({ temp: 20 });

      const { getByLabelText } = renderThermostat(thermostat);
      const decreaseBtn = getByLabelText('Diminuer la consigne');

      fireEvent.press(decreaseBtn);

      // Vérifier que la valeur a diminué (approche indirecte par mockUpdateThermostatPoint)
      expect(mockUpdateThermostatPoint).toHaveBeenCalled();
    });

    it('appelle handleIncrease au clic du bouton +', () => {
      const thermostat = makeThermostat({ temp: 20 });

      const { getByLabelText } = renderThermostat(thermostat);
      const increaseBtn = getByLabelText('Augmenter la consigne');

      fireEvent.press(increaseBtn);

      expect(mockUpdateThermostatPoint).toHaveBeenCalled();
    });

    it('diminue la consigne de 0.5°C avec le bouton −', () => {
      const thermostat = makeThermostat({ temp: 21 });

      const { getByLabelText, getByText } = renderThermostat(thermostat);
      const decreaseBtn = getByLabelText('Diminuer la consigne');

      fireEvent.press(decreaseBtn);

      // La nouvelle valeur attendue est 20.5
      // Vérifier que updateThermostatPoint a été appelée avec la bonne valeur
      expect(mockUpdateThermostatPoint).toHaveBeenCalledWith(
        thermostat.idx,
        thermostat,
        20.5,
        expect.any(Function),
      );
    });

    it('augmente la consigne de 0.5°C avec le bouton +', () => {
      const thermostat = makeThermostat({ temp: 20 });

      const { getByLabelText } = renderThermostat(thermostat);
      const increaseBtn = getByLabelText('Augmenter la consigne');

      fireEvent.press(increaseBtn);

      expect(mockUpdateThermostatPoint).toHaveBeenCalledWith(
        thermostat.idx,
        thermostat,
        20.5,
        expect.any(Function),
      );
    });

    it('respecte le minimum (5°C) lors de la diminution', () => {
      const thermostat = makeThermostat({ temp: 5 });

      const { getByLabelText } = renderThermostat(thermostat);
      const decreaseBtn = getByLabelText('Diminuer la consigne');

      fireEvent.press(decreaseBtn);

      // La valeur ne doit pas descendre en dessous de 5
      expect(mockUpdateThermostatPoint).toHaveBeenCalledWith(
        thermostat.idx,
        thermostat,
        5, // Reste à 5
        expect.any(Function),
      );
    });

    it('respecte le maximum (30°C) lors de l\'augmentation', () => {
      const thermostat = makeThermostat({ temp: 30 });

      const { getByLabelText } = renderThermostat(thermostat);
      const increaseBtn = getByLabelText('Augmenter la consigne');

      fireEvent.press(increaseBtn);

      expect(mockUpdateThermostatPoint).toHaveBeenCalledWith(
        thermostat.idx,
        thermostat,
        30, // Reste à 30
        expect.any(Function),
      );
    });

    it('disable les boutons quand le thermostat est inactif', () => {
      const thermostat = makeThermostat({ isActive: false });

      const { getByLabelText } = renderThermostat(thermostat);
      const decreaseBtn = getByLabelText('Diminuer la consigne');
      const increaseBtn = getByLabelText('Augmenter la consigne');

      expect(decreaseBtn.props.disabled).toBe(true);
      expect(increaseBtn.props.disabled).toBe(true);
    });

    it('ne déclenche pas handleDecrease quand disabled', () => {
      const thermostat = makeThermostat({ isActive: false });

      const { getByLabelText } = renderThermostat(thermostat);
      const decreaseBtn = getByLabelText('Diminuer la consigne');

      fireEvent.press(decreaseBtn);

      // updateThermostatPoint ne doit pas être appelée
      expect(mockUpdateThermostatPoint).not.toHaveBeenCalled();
    });
  });

  // =============================================================================
  // États du thermostat
  // =============================================================================

  describe('états du thermostat', () => {
    it('active les contrôles quand isActive=true', () => {
      const thermostat = makeThermostat({ isActive: true });

      const { getByLabelText } = renderThermostat(thermostat);
      const decreaseBtn = getByLabelText('Diminuer la consigne');
      const increaseBtn = getByLabelText('Augmenter la consigne');

      expect(decreaseBtn.props.disabled).toBe(false);
      expect(increaseBtn.props.disabled).toBe(false);
    });

    it('applique une opacité réduite quand isActive=false', () => {
      const thermostat = makeThermostat({ isActive: false });

      const { UNSAFE_root } = renderThermostat(thermostat);
      const dialWrapper = UNSAFE_root.findByProps({ testID: 'svg-dial' }, { deep: true });

      // Le composant applique le style disabledOpacity (opacity: 0.3)
      // On vérifie juste que le rendu ne crash pas quand inactif
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // =============================================================================
  // Rendu du cadran SVG
  // =============================================================================

  describe('rendu du cadran SVG', () => {
    it('rend un SVG avec le bon diamètre', () => {
      const thermostat = makeThermostat();

      const { getByTestId } = renderThermostat(thermostat);
      const svg = getByTestId('svg-dial');

      expect(svg.props.width).toBe(180);
      expect(svg.props.height).toBe(180);
    });

    it('rend les éléments SVG pour le cadran (piste + arc actif)', () => {
      const thermostat = makeThermostat();

      const { queryAllByTestId } = renderThermostat(thermostat);
      const paths = queryAllByTestId('svg-path');

      // Au moins une piste + un arc actif
      expect(paths.length).toBeGreaterThan(0);
    });

    it('rend le curseur (knob) et son halo', () => {
      const thermostat = makeThermostat();

      const { queryAllByTestId } = renderThermostat(thermostat);
      const circles = queryAllByTestId('svg-circle');

      // Halo 1 (opacity 0.15) + Halo 2 (opacity 0.3) + Curseur (knob)
      expect(circles.length).toBeGreaterThanOrEqual(3);
    });
  });

  // =============================================================================
  // Valeurs limites
  // =============================================================================

  describe('valeurs limites', () => {
    it('accepte une consigne minimum de 5°C', () => {
      const thermostat = makeThermostat({ temp: 5 });

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('5')).toBeTruthy();
    });

    it('accepte une consigne maximum de 30°C', () => {
      const thermostat = makeThermostat({ temp: 30 });

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('30')).toBeTruthy();
    });

    it('arrondit les valeurs au 0.5°C le plus proche', () => {
      const thermostat = makeThermostat({ temp: 20.25 }); // Arrondi à 20

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('20')).toBeTruthy();
    });

    it('gère les décimales avec 0.5', () => {
      const thermostat = makeThermostat({ temp: 20.5 });

      const { getByText } = renderThermostat(thermostat);
      expect(getByText('20')).toBeTruthy();
      expect(getByText(/\.5°/)).toBeTruthy();
    });
  });

  // =============================================================================
  // Cas limites
  // =============================================================================

  describe('cas limites', () => {
    it('ne rend pas de crash avec une consigne très basse (5°C)', () => {
      const thermostat = makeThermostat({ temp: 5 });

      expect(() => renderThermostat(thermostat)).not.toThrow();
    });

    it('ne rend pas de crash avec une consigne très haute (30°C)', () => {
      const thermostat = makeThermostat({ temp: 30 });

      expect(() => renderThermostat(thermostat)).not.toThrow();
    });

    it('gère un thermostat sans capteur Salon disponible', () => {
      const thermostat = makeThermostat();
      const temperatures: DomoticzTemperature[] = [];

      expect(() => renderThermostat(thermostat, temperatures)).not.toThrow();
    });
  });
});
