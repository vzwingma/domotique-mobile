/**
 * Tests unitaires pour paramList.component.tsx
 *
 * Couvre :
 *  - Paramètre PARAMETRE → chips visibles (pas de Dropdown)
 *  - Paramètre nommé "Phase" → affiche "Moment" dans le titre
 *  - Paramètre Présence avec levelName "Présent" → affiche "Maison occupée"
 *  - Paramètre Présence avec levelName "Absent" → affiche "Maison vide"
 *  - Click sur un chip appelle updateParameterValue
 *  - Paramètre PARAMETRE_RO → affiche les données en lecture seule
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ViewDomoticzParamList } from '../paramList.component';
import DomoticzParameter from '@/app/models/domoticzParameter.model';
import { DomoticzDeviceType, DomoticzSwitchType } from '@/app/enums/DomoticzEnum';

// ─── Mocks des dépendances externes ──────────────────────────────────────────

// Contrôleur paramètres
const mockUpdateParameterValue = jest.fn();
jest.mock('@/app/controllers/parameters.controller', () => ({
  updateParameterValue: (...args: any[]) => mockUpdateParameterValue(...args),
}));

// Icône paramètre
jest.mock('@/components/IconDomoticzParametre', () => {
  const React = require('react');
  const { View } = require('react-native');
  const IconDomoticzParametre = (props: any) => <View testID="icon-parametre" />;
  IconDomoticzParametre.getIconDomoticzParametre = () => 'home-outline';
  return {
    __esModule: true,
    default: IconDomoticzParametre,
    getIconDomoticzParametre: () => 'home-outline',
  };
});

// Contexte Domoticz — fournit setDomoticzParametersData
jest.mock('@/app/services/DomoticzContextProvider', () => {
  const React = require('react');
  const MockCtx = React.createContext({ setDomoticzParametersData: jest.fn() });
  return { DomoticzContext: MockCtx };
});

// device.component (pour stylesListsDevices importé par paramList)
jest.mock('../device.component', () => ({
  stylesListsDevices: {
    viewBox: {},
    iconBox: {},
    contentBox: {},
    labelsBox: {},
    libelleBox: {},
    infovalue: {},
  },
}));

// ─── Factory : crée un DomoticzParameter minimal ──────────────────────────────
function makeParameter(overrides: Partial<DomoticzParameter> & { levelNames?: string[] }): DomoticzParameter {
  const base: any = {
    idx: 1,
    name: 'TestParam',
    lastUpdate: '2024-01-01',
    type: DomoticzDeviceType.PARAMETRE,
    level: 0,
    levelNames: ['Option A', 'Option B'],
    switchType: DomoticzSwitchType.ONOFF,
    status: 'On',
    data: 'data-value',
  };
  const merged: any = { ...base, ...overrides };
  const param = new DomoticzParameter(merged);
  // levelNames n'est pas dans le constructeur — on l'affecte manuellement
  param.levelNames = merged.levelNames;
  return param;
}

function renderParam(param: DomoticzParameter) {
  return render(<ViewDomoticzParamList parametre={param} />);
}

// =============================================================================
// QA05-1 : Paramètre PARAMETRE → chips visibles
// =============================================================================
describe('paramList.component — chips pour PARAMETRE', () => {
  it('affiche les chips pour un paramètre de type PARAMETRE', () => {
    const param = makeParameter({
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Nuit', 'Jour', 'Soirée'],
    });
    const { getByText } = renderParam(param);
    expect(getByText('Nuit')).toBeTruthy();
    expect(getByText('Jour')).toBeTruthy();
    expect(getByText('Soirée')).toBeTruthy();
  });

  it('n'affiche pas de chips pour un paramètre PARAMETRE_RO', () => {
    const param = makeParameter({
      type: DomoticzDeviceType.PARAMETRE_RO,
      levelNames: ['Nuit', 'Jour'],
    });
    const { queryByText } = renderParam(param);
    // Les chips ne sont pas rendus pour PARAMETRE_RO
    expect(queryByText('Nuit')).toBeNull();
    expect(queryByText('Jour')).toBeNull();
  });
});

// =============================================================================
// QA05-2 : Paramètre nommé "Phase" → affiche "Moment"
// =============================================================================
describe('paramList.component — renommage Phase → Moment (T16)', () => {
  it('affiche "Moment" comme titre pour un paramètre nommé "Phase"', () => {
    const param = makeParameter({ name: 'Phase' });
    const { getByText } = renderParam(param);
    expect(getByText('Moment')).toBeTruthy();
  });

  it('n'affiche pas "Phase" quand le nom est "Phase"', () => {
    const param = makeParameter({ name: 'Phase' });
    const { queryByText } = renderParam(param);
    expect(queryByText('Phase')).toBeNull();
  });

  it('affiche le nom original pour un paramètre non renommé', () => {
    const param = makeParameter({ name: 'Alarme' });
    const { getByText } = renderParam(param);
    expect(getByText('Alarme')).toBeTruthy();
  });
});

// =============================================================================
// QA05-3 : Labels Présence (T17)
// =============================================================================
describe('paramList.component — labels Présence (T17)', () => {
  it('affiche "Maison occupée" pour levelName "Présent" d\'un paramètre Présence', () => {
    const param = makeParameter({
      name: 'Présence',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Présent', 'Absent'],
      level: 0,
    });
    const { getByText } = renderParam(param);
    expect(getByText('Maison occupée')).toBeTruthy();
  });

  it('affiche "Maison vide" pour levelName "Absent" d\'un paramètre Présence', () => {
    const param = makeParameter({
      name: 'Présence',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Présent', 'Absent'],
      level: 0,
    });
    const { getByText } = renderParam(param);
    expect(getByText('Maison vide')).toBeTruthy();
  });

  it('n'affiche pas "Présent" brut pour un paramètre Présence', () => {
    const param = makeParameter({
      name: 'Présence',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Présent', 'Absent'],
      level: 0,
    });
    const { queryByText } = renderParam(param);
    expect(queryByText('Présent')).toBeNull();
    expect(queryByText('Absent')).toBeNull();
  });

  it('affiche le levelName original pour un paramètre non Présence', () => {
    const param = makeParameter({
      name: 'Confort',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Présent', 'Absent'],
      level: 0,
    });
    const { getByText } = renderParam(param);
    // Pour un paramètre non "Présence", les noms sont affichés tels quels
    expect(getByText('Présent')).toBeTruthy();
    expect(getByText('Absent')).toBeTruthy();
  });
});

// =============================================================================
// QA05-4 : Click sur un chip appelle updateParameterValue
// =============================================================================
describe('paramList.component — click chip appelle updateParameterValue', () => {
  beforeEach(() => {
    mockUpdateParameterValue.mockClear();
  });

  it('appelle updateParameterValue au click sur le premier chip', () => {
    const param = makeParameter({
      name: 'Mode',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Nuit', 'Jour'],
      level: 0,
      idx: 42,
    });
    const { getByText } = renderParam(param);
    fireEvent.press(getByText('Nuit'));
    expect(mockUpdateParameterValue).toHaveBeenCalledTimes(1);
    expect(mockUpdateParameterValue).toHaveBeenCalledWith(
      42,
      param,
      { id: 0, libelle: 'Nuit' },
      expect.any(Function)
    );
  });

  it('appelle updateParameterValue avec les bons arguments pour le 2e chip (level=10)', () => {
    const param = makeParameter({
      name: 'Mode',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Nuit', 'Jour'],
      level: 0,
      idx: 42,
    });
    const { getByText } = renderParam(param);
    fireEvent.press(getByText('Jour'));
    expect(mockUpdateParameterValue).toHaveBeenCalledWith(
      42,
      param,
      { id: 10, libelle: 'Jour' },
      expect.any(Function)
    );
  });

  it('n'appelle pas updateParameterValue pour un PARAMETRE_RO', () => {
    const param = makeParameter({
      name: 'Lecture',
      type: DomoticzDeviceType.PARAMETRE_RO,
      levelNames: ['Valeur'],
      data: 'info',
    });
    renderParam(param);
    expect(mockUpdateParameterValue).not.toHaveBeenCalled();
  });
});

// =============================================================================
// QA05-5 : Paramètre PARAMETRE_RO → lecture seule
// =============================================================================
describe('paramList.component — PARAMETRE_RO lecture seule', () => {
  it('affiche les données data du paramètre en lecture seule', () => {
    const param = makeParameter({
      name: 'Info',
      type: DomoticzDeviceType.PARAMETRE_RO,
      data: 'Valeur affichée',
    });
    const { getByText } = renderParam(param);
    expect(getByText('Valeur affichée')).toBeTruthy();
  });

  it('affiche le nom du paramètre PARAMETRE_RO', () => {
    const param = makeParameter({
      name: 'Statut réseau',
      type: DomoticzDeviceType.PARAMETRE_RO,
      data: 'Connecté',
    });
    const { getByText } = renderParam(param);
    expect(getByText('Statut réseau')).toBeTruthy();
  });
});

// =============================================================================
// QA05-6 : Chip sélectionné
// =============================================================================
describe('paramList.component — chip sélectionné', () => {
  it('le chip correspondant au level courant a accessibilityState.selected=true', () => {
    const param = makeParameter({
      name: 'Mode',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Nuit', 'Jour'],
      level: 10, // Jour = index 1 → levelValue = 10
    });
    const { getByLabelText } = renderParam(param);
    const jourChip = getByLabelText('Jour');
    expect(jourChip.props.accessibilityState?.selected).toBe(true);
  });

  it('les chips non sélectionnés ont accessibilityState.selected=false', () => {
    const param = makeParameter({
      name: 'Mode',
      type: DomoticzDeviceType.PARAMETRE,
      levelNames: ['Nuit', 'Jour'],
      level: 10, // Jour sélectionné
    });
    const { getByLabelText } = renderParam(param);
    const nuitChip = getByLabelText('Nuit');
    expect(nuitChip.props.accessibilityState?.selected).toBe(false);
  });
});
