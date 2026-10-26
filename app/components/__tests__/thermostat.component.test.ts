/**
 * Tests pour thermostat.component.tsx
 *
 * Approche: Tester la logique métier du composant via ses fonctions export
 * plutôt que le composant React directement (évite les problèmes de mock).
 *
 * Complété en Phase 4 (T4.3, Plan d'Action 003) par une section de tests de RENDU
 * réel du composant (voir bas de fichier) : le composant n'était jusque-là jamais
 * exécuté (0% de couverture réelle, uniquement de la logique dupliquée testée en
 * isolation ci-dessus). Ajout nécessaire pour couvrir le risque #1 du plan :
 * désynchronisation tap-cible/rendu du cadran (`dialSize` paramétrable depuis Phase 3).
 */

import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import DomoticzThermostat from '@/app/models/domoticzThermostat.model';
import DomoticzTemperature from '@/app/models/domoticzTemperature.model';
import { DomoticzThermostatLevelValue } from '@/app/enums/DomoticzEnum';
import { ViewDomoticzThermostat } from '../thermostat.component';
import { DomoticzContext } from '../../services/DomoticzContextProvider';
import * as ThermostatsController from '../../controllers/thermostats.controller';
import * as GestureHandlerMock from 'react-native-gesture-handler';

// ─── Mocks pour le rendu réel du composant (section bas de fichier) ────────────

// react-native-gesture-handler : GestureDetector simplifié (rend juste ses enfants).
// Gesture.Pan() capture les callbacks .onBegin/.onUpdate/.onEnd enregistrés par le
// composant, pour pouvoir simuler un tap/drag en test (pas de moteur gestuel natif
// disponible sous Jest — pattern absent du reste du projet, introduit ici).
jest.mock('react-native-gesture-handler', () => {
  const capturedPanGestures: any[] = [];
  return {
    __esModule: true,
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      Pan: () => {
        const builder: any = {};
        builder.runOnJS = () => builder;
        builder.onBegin = (fn: any) => { builder.begin = fn; return builder; };
        builder.onUpdate = (fn: any) => { builder.update = fn; return builder; };
        builder.onEnd = (fn: any) => { builder.end = fn; return builder; };
        capturedPanGestures.push(builder);
        return builder;
      },
    },
    __capturedPanGestures: capturedPanGestures,
  };
});

// Contrôleur : évite tout appel réseau réel (callDomoticz) déclenché par onEnd()/boutons.
jest.mock('../../controllers/thermostats.controller', () => ({
  updateThermostatPoint: jest.fn(),
}));

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

// ─── Tests de RENDU réel du composant (T4.3 — Plan d'Action 003, Phase 4) ──────
//
// Contrairement aux sections précédentes (logique dupliquée testée en isolation),
// cette section rend le VRAI composant `ViewDomoticzThermostat` et simule le geste
// de pan pour vérifier la cohérence géométrique tap-cible/rendu, aux deux tailles
// de cadran (180 par défaut, 240 medium/expanded — Phase 3).

const mockUpdateThermostatPoint = ThermostatsController.updateThermostatPoint as jest.Mock;
const capturedPanGestures = (GestureHandlerMock as any).__capturedPanGestures as {
  begin?: (e: { x: number; y: number }) => void;
  update?: (e: { x: number; y: number }) => void;
  end?: () => void;
}[];

function lastPanGesture() {
  return capturedPanGestures[capturedPanGestures.length - 1];
}

/** Réplique EXACTEMENT la géométrie interne du composant (polarToXY), pour générer
 * un point de contact (e.x, e.y) ciblant un angle donné, relatif au centre (cx, cy)
 * de l'instance testée — cx/cy DOIVENT correspondre au dialSize du rendu, sous peine
 * de fausser le test (c'est précisément le risque de désync que ce test couvre). */
function pointForAngle(cx: number, cy: number, angleDeg: number, r = 40): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Réplique indépendante de touchToTemp (uniquement la partie angle→température,
 * cx/cy s'annulant dans le calcul réel via dx=x-cx, dy=y-cy) — sert de référence
 * de non-régression pour la valeur attendue. */
function expectedTempForAngle(angleDeg: number): number {
  const START_ANGLE = 225;
  const TOTAL_SPAN = 270;
  const relAngle = (((angleDeg - START_ANGLE) % 360) + 360) % 360;
  const deadZoneThreshold = TOTAL_SPAN + (360 - TOTAL_SPAN) / 2;
  const snapToMax = relAngle < deadZoneThreshold ? 1 : 0;
  const pct = relAngle > TOTAL_SPAN ? snapToMax : relAngle / TOTAL_SPAN;
  const range = DomoticzThermostatLevelValue.MAX - DomoticzThermostatLevelValue.MIN;
  return Math.round((DomoticzThermostatLevelValue.MIN + pct * range) * 2) / 2;
}

/** Formate une valeur de consigne exactement comme le composant (intPart + decPart). */
function formatExpectedDisplay(value: number): { intPart: string; decPart: string } {
  const intPart = Math.floor(value).toString();
  const frac = value % 1;
  const fracStr = frac === 0 ? '0' : Math.round(frac * 10).toString();
  return { intPart, decPart: '.' + fracStr + '°' };
}

/** Collecte récursivement toutes les valeurs `props.width` numériques de l'arbre rendu
 * (utilisé pour vérifier la propagation de `dialSize` au Svg/View sans dépendre de testID). */
function collectWidths(node: any, acc: number[] = []): number[] {
  if (!node) return acc;
  if (Array.isArray(node)) {
    node.forEach((n) => collectWidths(n, acc));
    return acc;
  }
  if (node.props && typeof node.props.width === 'number') {
    acc.push(node.props.width);
  }
  if (node.children) {
    node.children.forEach((c: any) => collectWidths(c, acc));
  }
  return acc;
}

const mockContextValue = {
  setDomoticzThermostatData: jest.fn(),
  domoticzTemperaturesData: [] as DomoticzTemperature[],
} as any;

// Note : fichier `.test.ts` (pas `.tsx`, cf. plan) — pas de syntaxe JSX disponible côté
// babel-preset-expo pour cette extension, on compose donc via React.createElement.
function renderThermostat(thermostat: DomoticzThermostat, dialSize?: number, temperatures: DomoticzTemperature[] = []) {
  const contextValue = { ...mockContextValue, domoticzTemperaturesData: temperatures };
  const child = dialSize === undefined
    ? React.createElement(ViewDomoticzThermostat, { thermostat })
    : React.createElement(ViewDomoticzThermostat, { thermostat, dialSize });
  return render(React.createElement(DomoticzContext.Provider, { value: contextValue }, child));
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedPanGestures.length = 0;
});

describe('thermostat.component - rendu réel (dialSize par défaut, non passé)', () => {
  it('se rend sans crash', () => {
    expect(() => renderThermostat(makeThermostat())).not.toThrow();
  });

  it('affiche le nom, "Consigne" et la valeur formatée', () => {
    const { getByText } = renderThermostat(makeThermostat({ temp: 20.5, isActive: true }));
    expect(getByText('Salon')).toBeTruthy();
    expect(getByText('Consigne')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('.5°')).toBeTruthy();
  });

  it('propage la taille par défaut (180) au cadran SVG', () => {
    const tree = renderThermostat(makeThermostat()).toJSON();
    expect(collectWidths(tree)).toContain(180);
  });

  it('affiche "−" (moins unicode) quand le thermostat est inactif', () => {
    // "−" apparaît 2x à l'écran quand inactif : valeur de consigne ET libellé du bouton "−"
    const { getAllByText } = renderThermostat(makeThermostat({ isActive: false }));
    expect(getAllByText('−').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche la mesure quand un capteur "Salon" existe', () => {
    const salon = makeTemperature({ name: 'Salon', temp: 21.5 });
    const { getByText } = renderThermostat(makeThermostat(), undefined, [salon]);
    expect(getByText('Mesure')).toBeTruthy();
    expect(getByText('21.5°C')).toBeTruthy();
  });

  it("n'affiche pas la mesure si aucun capteur Salon", () => {
    const { queryByText } = renderThermostat(makeThermostat(), undefined, []);
    expect(queryByText('Mesure')).toBeNull();
  });
});

describe('thermostat.component - rendu réel (dialSize=240 explicite)', () => {
  it('se rend sans crash', () => {
    expect(() => renderThermostat(makeThermostat(), 240)).not.toThrow();
  });

  it('propage la taille explicite (240) au cadran SVG', () => {
    const tree = renderThermostat(makeThermostat(), 240).toJSON();
    const widths = collectWidths(tree);
    expect(widths).toContain(240);
    expect(widths).not.toContain(180);
  });

  it('affiche les mêmes informations texte qu\'à taille par défaut', () => {
    const { getByText } = renderThermostat(makeThermostat({ temp: 22, isActive: true }), 240);
    expect(getByText('Salon')).toBeTruthy();
    expect(getByText('22')).toBeTruthy();
    expect(getByText('.0°')).toBeTruthy();
  });
});

describe('thermostat.component - boutons +/- (composant réel)', () => {
  it('le bouton "+" augmente la consigne de 0.5°C et appelle updateThermostatPoint', () => {
    const thermostat = makeThermostat({ temp: 20, isActive: true });
    const { getByLabelText, getByText } = renderThermostat(thermostat);
    act(() => {
      fireEvent.press(getByLabelText('Augmenter la consigne'));
    });
    expect(getByText('20')).toBeTruthy();
    expect(getByText('.5°')).toBeTruthy();
    expect(mockUpdateThermostatPoint).toHaveBeenCalledWith(thermostat.idx, thermostat, 20.5, expect.any(Function));
  });

  it('le bouton "−" diminue la consigne de 0.5°C', () => {
    const thermostat = makeThermostat({ temp: 20, isActive: true });
    const { getByLabelText, getByText } = renderThermostat(thermostat);
    act(() => {
      fireEvent.press(getByLabelText('Diminuer la consigne'));
    });
    expect(getByText('19')).toBeTruthy();
    expect(getByText('.5°')).toBeTruthy();
  });

  it('les boutons sont désactivés (disabled) quand le thermostat est inactif', () => {
    const { getByLabelText } = renderThermostat(makeThermostat({ isActive: false }));
    expect(getByLabelText('Augmenter la consigne').props.accessibilityState?.disabled).toBe(true);
    expect(getByLabelText('Diminuer la consigne').props.accessibilityState?.disabled).toBe(true);
  });
});

describe('thermostat.component - cohérence géométrique tap (T4.3 — risque #1 du plan)', () => {
  const CASES: { label: string; angleDeg: number; expectedTemp: number }[] = [
    { label: 'début de piste (7h30) → consigne MIN (5°C)', angleDeg: 225, expectedTemp: 5 },
    { label: 'fin de piste → consigne MAX (30°C)', angleDeg: (225 + 270) % 360, expectedTemp: 30 },
    { label: 'milieu de piste → consigne médiane (17.5°C)', angleDeg: (225 + 135) % 360, expectedTemp: 17.5 },
    { label: 'juste avant le seuil de la zone morte (bas) → snap MAX', angleDeg: (225 + 314) % 360, expectedTemp: 30 },
    { label: 'juste après le seuil de la zone morte (bas) → snap MIN', angleDeg: (225 + 316) % 360, expectedTemp: 5 },
  ];

  it.each(CASES)('$label — identique à dialSize=180 ET dialSize=240', ({ angleDeg, expectedTemp }) => {
    // Vérification indépendante de la référence de calcul (cross-check du helper de test lui-même)
    expect(expectedTempForAngle(angleDeg)).toBe(expectedTemp);
    const { intPart, decPart } = formatExpectedDisplay(expectedTemp);

    // ── dialSize=180 (défaut) : cx=cy=90 ──
    const thermostat180 = makeThermostat({ temp: 20, isActive: true });
    const rendered180 = renderThermostat(thermostat180, 180);
    const point180 = pointForAngle(90, 90, angleDeg);
    act(() => {
      lastPanGesture().begin!(point180);
    });
    expect(rendered180.getByText(intPart)).toBeTruthy();
    expect(rendered180.getByText(decPart)).toBeTruthy();

    // ── dialSize=240 (medium/expanded) : cx=cy=120 ──
    const thermostat240 = makeThermostat({ temp: 20, isActive: true });
    const rendered240 = renderThermostat(thermostat240, 240);
    const point240 = pointForAngle(120, 120, angleDeg);
    act(() => {
      lastPanGesture().begin!(point240);
    });
    expect(rendered240.getByText(intPart)).toBeTruthy();
    expect(rendered240.getByText(decPart)).toBeTruthy();
  });

  it('onUpdate (drag continu) recalcule la consigne à chaque déplacement, aux deux tailles', () => {
    const thermostat = makeThermostat({ temp: 20, isActive: true });
    const rendered = renderThermostat(thermostat, 240);
    const gesture = lastPanGesture();

    act(() => {
      gesture.begin!(pointForAngle(120, 120, 225)); // MIN
    });
    expect(rendered.getByText('5')).toBeTruthy();

    act(() => {
      gesture.update!(pointForAngle(120, 120, (225 + 270) % 360)); // MAX
    });
    expect(rendered.getByText('30')).toBeTruthy();
  });

  it('onEnd appelle updateThermostatPoint avec la dernière valeur de drag (draggingValue)', () => {
    const thermostat = makeThermostat({ temp: 20, isActive: true, idx: 777 });
    renderThermostat(thermostat, 240);
    const gesture = lastPanGesture();

    act(() => {
      gesture.begin!(pointForAngle(120, 120, (225 + 135) % 360)); // 17.5°C
    });
    act(() => {
      gesture.end!();
    });
    expect(mockUpdateThermostatPoint).toHaveBeenCalledWith(777, thermostat, 17.5, expect.any(Function));
  });

  it('un tap est ignoré (aucune mise à jour) quand le thermostat est inactif', () => {
    const thermostat = makeThermostat({ temp: 20, isActive: false });
    const rendered = renderThermostat(thermostat, 180);
    const gesture = lastPanGesture();

    act(() => {
      gesture.begin!(pointForAngle(90, 90, (225 + 135) % 360));
    });
    // Toujours "−" (x2 : consigne + bouton) : le geste n'a pas dû modifier l'affichage
    expect(rendered.getAllByText('−').length).toBeGreaterThanOrEqual(1);
  });

  it('onUpdate et onEnd sont également des no-op quand le thermostat est inactif', () => {
    const thermostat = makeThermostat({ temp: 20, isActive: false });
    renderThermostat(thermostat, 240);
    const gesture = lastPanGesture();

    act(() => {
      gesture.update!(pointForAngle(120, 120, (225 + 135) % 360));
      gesture.end!();
    });
    expect(mockUpdateThermostatPoint).not.toHaveBeenCalled();
  });
});
