/**
 * Tests du layout des onglets `(tabs)/_layout.tsx` (Plan d'Action 004, T3.4)
 *
 * Couvre :
 *  - téléphone (layout non fusionné) : 1 écran par onglet, 1 seul bouton actif, titre = libellé
 *  - tablette paysage (layout fusionné) : Lumières+Volets / Températures+Maison sur 2 colonnes,
 *    boutons du groupe actifs ensemble, titre fusionné, largeur de colonne transmise aux écrans
 *  - Favoris inchangé en layout fusionné
 *  - affichage de l'erreur de chargement
 *
 * Dépendances lourdes mockées (ParallaxScrollView/reanimated, orchestrateur de refresh, écrans lazy) :
 * seuls la navigation et le choix de panneau sont testés ici.
 */
import React from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import TabLayout from '../_layout';
import { DomoticzContext } from '../../services/DomoticzContextProvider';
import { DomoticzDeviceType } from '../../enums/DomoticzEnum';
import { Tabs } from '../../enums/TabsEnums';

let mockIsMergedLayout = false;
const mockRefreshDomoticzData = jest.fn();

jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return new Proxy(actualReactNative, {
    get(target, prop, receiver) {
      if (prop === 'useWindowDimensions') {
        return () => ({ width: 1280, height: 800, scale: 1, fontScale: 1 });
      }
      return Reflect.get(target, prop, receiver);
    },
  });
});

jest.mock('@/hooks/useTabletLayout', () => ({
  useTabletLayout: () => ({ isTablet: mockIsMergedLayout, isMergedLayout: mockIsMergedLayout }),
}));

jest.mock('@/components/ParallaxScrollView', () => {
  const { Text: RNText, View: RNView } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ children, headerTitle }: { children: React.ReactNode; headerTitle: string }) => (
      <RNView>
        <RNText testID="header-title">{headerTitle}</RNText>
        {children}
      </RNView>
    ),
  };
});

jest.mock('@/components/navigation/TabHeaderIcon', () => ({
  getHeaderIcon: () => null,
}));

jest.mock('@/components/navigation/TabBarItem', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  return {
    TabBarItems: ({ thisTab, isActive, selectNewTab }: any) => (
      <RNText testID={`tab-${thisTab}`} onPress={() => selectNewTab(thisTab)}>
        {isActive ? 'actif' : 'inactif'}
      </RNText>
    ),
  };
});

jest.mock('@/components/ConnectionBadge', () => ({
  mapDomoticzStatusToConnectionBadgeState: () => 'connected',
}));

jest.mock('@/app/services/RefreshOrchestrator.service', () => ({
  refreshDomoticzData: (...args: unknown[]) => mockRefreshDomoticzData(...args),
}));

jest.mock('@/app/services/ClientHTTP.service', () => ({
  runLatencyDiagnostic: jest.fn(),
}));

jest.mock('@/app/services/ErrorHandler.service', () => ({
  generateTraceId: () => 'trace-test',
}));

// `babel-preset-expo` conserve les `import()` dynamiques (lazy-loading Metro, T4.3) : Jest ne peut
// pas les exécuter sans --experimental-vm-modules. `React.lazy` est donc remplacé par un chargeur qui
// extrait le chemin de l'`import('...')` du layout et résout le module (mocké ci-dessous) via require.
// Chemins relatifs à `app/(tabs)/_layout.tsx` → relatifs à ce fichier de test.
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  /* eslint-disable @typescript-eslint/no-require-imports -- factory jest.mock : seul require est disponible (babel-plugin-jest-hoist) */
  const LAZY_MODULES: Record<string, () => unknown> = {
    '.': () => require('../index'),
    './devices.tabs': () => require('../devices.tabs'),
    './temperatures.tab': () => require('../temperatures.tab'),
    './parametrages.tab': () => require('../parametrages.tab'),
  };
  /* eslint-enable @typescript-eslint/no-require-imports */
  return {
    ...actualReact,
    lazy: (factory: () => Promise<unknown>) => {
      const path = /import\(['"](.+?)['"]\)/.exec(factory.toString())?.[1] ?? '';
      return actualReact.lazy(() => Promise.resolve(LAZY_MODULES[path]()));
    },
  };
});

// Écrans (chargés en lazy par le layout) remplacés par des marqueurs exposant leurs props
jest.mock('../index', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <RNText>ecran-favoris</RNText> };
});

jest.mock('../devices.tabs', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ dataType, availableWidth }: { dataType: string; availableWidth?: number }) => (
      <RNText>{`ecran-devices-${dataType}-${availableWidth ?? 'fenetre'}`}</RNText>
    ),
  };
});

jest.mock('../temperatures.tab', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ availableWidth }: { availableWidth?: number }) => (
      <RNText>{`ecran-temperatures-${availableWidth ?? 'fenetre'}`}</RNText>
    ),
  };
});

jest.mock('../parametrages.tab', () => {
  const { Text: RNText } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <RNText>ecran-maison</RNText> };
});

// Largeur de colonne attendue sur fenêtre 1280dp : (1280 − 2×10 − 10) / 2
const COLUMN_WIDTH = 625;

function renderLayout() {
  const contextValue: any = {
    domoticzConnexionData: undefined,
    setDomoticzConnexionData: jest.fn(),
    domoticzDevicesData: [],
    setDomoticzDevicesData: jest.fn(),
    domoticzTemperaturesData: [],
    setDomoticzTemperaturesData: jest.fn(),
    domoticzThermostatData: [],
    setDomoticzThermostatData: jest.fn(),
    domoticzParametersData: [],
    setDomoticzParametersData: jest.fn(),
  };
  return render(
    <DomoticzContext.Provider value={contextValue}>
      <View>
        <TabLayout />
      </View>
    </DomoticzContext.Provider>
  );
}

function activeTabs(): Tabs[] {
  return (Object.values(Tabs) as Tabs[]).filter(tab =>
    screen.getByTestId(`tab-${tab}`).props.children === 'actif'
  );
}

async function selectTab(tab: Tabs) {
  fireEvent.press(await screen.findByTestId(`tab-${tab}`));
}

describe('TabLayout (onglets)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsMergedLayout = false;
    mockRefreshDomoticzData.mockImplementation(() => Promise.resolve());
  });

  describe('téléphone — layout non fusionné (inchangé)', () => {
    it('démarre sur Favoris, seul bouton actif', async () => {
      renderLayout();
      expect(await screen.findByText('ecran-favoris')).toBeTruthy();
      expect(screen.getByTestId('header-title').props.children).toBe(Tabs.INDEX);
      expect(activeTabs()).toEqual([Tabs.INDEX]);
    });

    it('Lumières : écran seul en largeur fenêtre, titre simple, 1 bouton actif', async () => {
      renderLayout();
      await selectTab(Tabs.LUMIERES);

      expect(await screen.findByText(`ecran-devices-${DomoticzDeviceType.LUMIERE}-fenetre`)).toBeTruthy();
      expect(screen.queryByText(`ecran-devices-${DomoticzDeviceType.VOLET}-fenetre`)).toBeNull();
      expect(screen.getByTestId('header-title').props.children).toBe(Tabs.LUMIERES);
      expect(activeTabs()).toEqual([Tabs.LUMIERES]);
    });

    it.each([
      [Tabs.VOLETS, `ecran-devices-${DomoticzDeviceType.VOLET}-fenetre`],
      [Tabs.TEMPERATURES, 'ecran-temperatures-fenetre'],
      [Tabs.MAISON, 'ecran-maison'],
    ])('%s : écran seul', async (tab, expectedScreen) => {
      renderLayout();
      await selectTab(tab);
      expect(await screen.findByText(expectedScreen)).toBeTruthy();
      expect(screen.queryByTestId(/^merged-column-/)).toBeNull();
      expect(activeTabs()).toEqual([tab]);
    });
  });

  describe('tablette paysage — layout fusionné', () => {
    beforeEach(() => {
      mockIsMergedLayout = true;
    });

    it.each([Tabs.LUMIERES, Tabs.VOLETS])('%s → Lumières | Volets sur 2 colonnes', async (tab) => {
      renderLayout();
      await selectTab(tab);

      expect(await screen.findByText(`ecran-devices-${DomoticzDeviceType.LUMIERE}-${COLUMN_WIDTH}`)).toBeTruthy();
      expect(screen.getByText(`ecran-devices-${DomoticzDeviceType.VOLET}-${COLUMN_WIDTH}`)).toBeTruthy();
      expect(screen.getByTestId(`merged-column-${Tabs.LUMIERES}`)).toBeTruthy();
      expect(screen.getByTestId(`merged-column-${Tabs.VOLETS}`)).toBeTruthy();
      expect(screen.getByTestId('header-title').props.children).toBe('Lumières & Volets');
      expect(activeTabs()).toEqual([Tabs.LUMIERES, Tabs.VOLETS]);
    });

    it.each([Tabs.TEMPERATURES, Tabs.MAISON])('%s → Températures | Maison sur 2 colonnes', async (tab) => {
      renderLayout();
      await selectTab(tab);

      expect(await screen.findByText(`ecran-temperatures-${COLUMN_WIDTH}`)).toBeTruthy();
      expect(screen.getByText('ecran-maison')).toBeTruthy();
      expect(screen.getByTestId('header-title').props.children).toBe('Températures & Maison');
      expect(activeTabs()).toEqual([Tabs.TEMPERATURES, Tabs.MAISON]);
    });

    it('Favoris inchangé : écran seul, seul bouton actif', async () => {
      renderLayout();
      expect(await screen.findByText('ecran-favoris')).toBeTruthy();
      expect(screen.queryByTestId(/^merged-column-/)).toBeNull();
      expect(screen.getByTestId('header-title').props.children).toBe(Tabs.INDEX);
      expect(activeTabs()).toEqual([Tabs.INDEX]);
    });
  });

  it('erreur de chargement → message affiché, barre d\'onglets masquée', async () => {
    mockRefreshDomoticzData.mockImplementation(() => Promise.reject(new Error('serveur injoignable')));
    renderLayout();

    expect(await screen.findByText(/serveur injoignable/)).toBeTruthy();
    expect(screen.queryByTestId(`tab-${Tabs.INDEX}`)).toBeNull();
    expect(screen.queryByText('ecran-favoris')).toBeNull();
  });
});
