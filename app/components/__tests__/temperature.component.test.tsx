/**
 * Tests unitaires pour temperature.component.tsx
 *
 * Couvre (T06, T13, T14) :
 *  - Rendu sans crash pour un capteur actif (température seule)
 *  - Rendu sans crash pour un capteur actif (température + humidité)
 *  - Affichage "Déconnecté" quand isActive=false
 *  - Affichage "Inconnu" quand isActive=true mais temp=null/undefined
 *  - Non-affichage de l'humidité quand elle est absente
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { ViewDomoticzTemperature } from '../temperature.component';
import DomoticzTemperature from '@/app/models/domoticzTemperature.model';

// ─── Mocks des dépendances ─────────────────────────────────────────────────────

// Icône température (étend MaterialCommunityIcons, déjà mocké dans jest.setup.ts)
jest.mock('@/components/IconDomoticzTemperature', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props: any) => <View testID="temperature-icon" />;
  return {
    __esModule: true,
    default: MockIcon,
    getTemperatureIcon: jest.fn(() => 'thermometer'),
  };
});

// ─── Factory ──────────────────────────────────────────────────────────────────
// Le constructeur de DomoticzTemperature ne gère pas `isActive` (readonly avec default false).
// On utilise un objet littéral casté pour pouvoir tester tous les cas.

function makeTemperature(overrides: Partial<DomoticzTemperature> = {}): DomoticzTemperature {
  return {
    idx: '1',
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
    data: '21.5 C',
    ...overrides,
  } as unknown as DomoticzTemperature;
}

// =============================================================================
// QA14-1 : Rendu capteur actif — température seule
// =============================================================================
describe('temperature.component — capteur actif (temp seule)', () => {
  it('se rend sans crash', () => {
    const temp = makeTemperature({ isActive: true, temp: 21.5, humidity: null as any });
    expect(() => render(<ViewDomoticzTemperature temperature={temp} />)).not.toThrow();
  });

  it('affiche la valeur de température en °C', () => {
    const temp = makeTemperature({ isActive: true, temp: 21.5, humidity: null as any });
    const { getByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(getByText('21.5°C')).toBeTruthy();
  });

  it('affiche le nom du capteur', () => {
    const temp = makeTemperature({ name: 'Chambre', isActive: true, temp: 18.0, humidity: null as any });
    const { getByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(getByText('Chambre')).toBeTruthy();
  });

  it("n'affiche pas de valeur d'humidité quand humidity est null", () => {
    const temp = makeTemperature({ isActive: true, temp: 21.5, humidity: null as any });
    const { queryByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    // Aucun texte se terminant par "%" ne devrait être présent
    expect(queryByText(/^\d+%$/)).toBeNull();
  });
});

// =============================================================================
// QA14-2 : Rendu capteur actif — température + humidité
// =============================================================================
describe('temperature.component — capteur actif (temp + humidity)', () => {
  it('se rend sans crash avec humidité', () => {
    const temp = makeTemperature({ isActive: true, temp: 22.0, humidity: 65 });
    expect(() => render(<ViewDomoticzTemperature temperature={temp} />)).not.toThrow();
  });

  it('affiche température ET humidité', () => {
    const temp = makeTemperature({ isActive: true, temp: 22.0, humidity: 65 });
    const { getByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(getByText('22°C')).toBeTruthy();
    expect(getByText('65%')).toBeTruthy();
  });
});

// =============================================================================
// QA14-3 : T06 — capteur inactif → "Déconnecté"
// =============================================================================
describe('temperature.component — capteur inactif (T06)', () => {
  it('affiche "Déconnecté" quand isActive=false', () => {
    const temp = makeTemperature({ isActive: false, temp: 21.5 });
    const { getByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(getByText('Déconnecté')).toBeTruthy();
  });

  it("n'affiche pas la température quand isActive=false", () => {
    const temp = makeTemperature({ isActive: false, temp: 21.5 });
    const { queryByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(queryByText('21.5°C')).toBeNull();
  });
});

// =============================================================================
// QA14-4 : T14 — capteur actif mais temp=null → "Inconnu"
// =============================================================================
describe('temperature.component — temp null/undefined (T14)', () => {
  it('affiche "Inconnu" quand isActive=true mais temp=null', () => {
    const temp = makeTemperature({ isActive: true, temp: null as any });
    const { getByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(getByText('Inconnu')).toBeTruthy();
  });

  it('affiche "Inconnu" quand isActive=true mais temp=undefined', () => {
    const temp = makeTemperature({ isActive: true, temp: undefined as any });
    const { getByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(getByText('Inconnu')).toBeTruthy();
  });

  it("n'affiche pas '°C' quand la valeur est nulle", () => {
    const temp = makeTemperature({ isActive: true, temp: null as any });
    const { queryByText } = render(<ViewDomoticzTemperature temperature={temp} />);
    expect(queryByText(/°C/)).toBeNull();
  });
});
