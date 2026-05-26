import React, { JSX, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Colors } from '@/app/enums/Colors';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { Tabs } from '../enums/TabsEnums';
import { TabBarItems } from '@/components/navigation/TabBarItem';
import { ThemedText } from '@/components/ThemedText';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';

// T4.3 - Lazy-load screens for better performance
const HomeScreen = React.lazy(() => import('.'));
const TabDomoticzTemperatures = React.lazy(() => import('./temperatures.tab'));
const TabDomoticzDevices = React.lazy(() => import('./devices.tabs'));
const TabDomoticzParametres = React.lazy(() => import('./parametrages.tab'));

import { getHeaderIcon } from '@/components/navigation/TabHeaderIcon';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { mapDomoticzStatusToConnectionBadgeState } from '@/components/ConnectionBadge';
import { refreshDomoticzData } from '@/app/services/RefreshOrchestrator.service';
import { runLatencyDiagnostic } from '@/app/services/ClientHTTP.service';
import { generateTraceId } from '@/app/services/ErrorHandler.service';

const REFRESH_COOLDOWN_MS = 5000;

/**
 * Composant racine de l'application avec Profiler (T4.5).
 * Il contient les onglets de navigation.
 */
export default function TabLayout() {

  // État pour vérifier si l'utilisateur est connecté à Domoticz
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  const { domoticzConnexionData, setDomoticzConnexionData, setDomoticzDevicesData, setDomoticzTemperaturesData, setDomoticzThermostatData, setDomoticzParametersData  } = useContext(DomoticzContext)!;

  const [error, setError] = useState<Error | null>(null);
  const [tab, setTab] = useState(Tabs.INDEX);
  const appState = useRef(AppState.currentState);
  const lastRefreshAtMsRef = useRef<number>(0);


  /**
   * T4.5 - Callback pour profiling de performance
   */
  const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
    console.log(`[PROFILER] ${id} (${phase}) - ${actualDuration.toFixed(2)}ms`);
  };

  /**
   * Fonction pour changer d'onglet
   * @param newTab Le nouvel onglet sélectionné
   */
  function selectNewTab(newTab: Tabs) {
    setTab(newTab);
    triggerRefresh('tab-switch');
  }

  const triggerRefresh = useCallback((source: 'tab-switch' | 'foreground', force: boolean = false): void => {
    const now = Date.now();
    const elapsed = now - lastRefreshAtMsRef.current;
    if (!force && elapsed < REFRESH_COOLDOWN_MS) {
      console.log(`[RefreshGuard] Skip refresh (${source}) — cooldown ${elapsed}ms/${REFRESH_COOLDOWN_MS}ms`);
      return;
    }

    lastRefreshAtMsRef.current = now;
    setRefreshTick(prev => prev + 1);
  }, []);

  /**
   *  A l'initialisation, lance le chargement de toutes les données Domoticz en parallèle.
   *  GET_CONFIG + GET_DEVICES + GET_TEMPS s'exécutent simultanément pour minimiser la latence
   *  sur les connexions lentes (5G ~30-40s par requête).
   * */
  useEffect(() => {
    console.log("(Re)Chargement de l'application...");
    lastRefreshAtMsRef.current = Date.now();
    // Diagnostic de latence au 1er chargement uniquement — aide à identifier
    // la phase réseau lente (DNS, TCP, TLS ou serveur) en 5G
    if (refreshTick === 0) {
      runLatencyDiagnostic(generateTraceId());
    }
    setIsLoading(true);
    refreshDomoticzData({
      setDomoticzConnexionData,
      setDomoticzDevicesData,
      setDomoticzThermostatData,
      setDomoticzParametersData,
      setDomoticzTemperaturesData,
    })
      .then(() => setError(null))
      .catch(e => setError(e as Error))
      .finally(() => setIsLoading(false));
  }, [refreshTick])

  /**
   * Rafraîchissement automatique au retour en foreground (AppState)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[AppState] Application revenue au premier plan — rafraîchissement des données');
        triggerRefresh('foreground');
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [triggerRefresh])

  /**
   * Récupère le statut de connexion à Domoticz
   *
   * @returns Le statut de connexion pour le badge du header
   */
  function getConnectionBadgeState() {
    return mapDomoticzStatusToConnectionBadgeState({
      status: domoticzConnexionData?.status,
      isLoading,
      hasError: error !== null,
    });
  }


  /**
   * Récupère le contenu du panneau, suivant l'état de chargement et les erreurs
   */
  function getPanelContent() : React.JSX.Element{
    if (isLoading) {
      return <ActivityIndicator size={'large'} color={Colors.domoticz.color} />
    } else if (error === null) {
      return showPanel(tab)
    } else {
      return <ThemedText type="subtitle" style={{ color: 'red', marginTop: 50 }}>Erreur : {error.message}</ThemedText>
    }
  }


  return (
    <React.Profiler id="TabLayout" onRender={onRenderCallback}>
      <>
        <ParallaxScrollView
          headerImage={getHeaderIcon(tab)}
          headerTitle={tab.toString()}
          connectionState={getConnectionBadgeState()}
          setRefreshing={() => triggerRefresh('tab-switch')}>

          <View style={tabStyles.titleContainer}>
            {getPanelContent()}
          </View>

        </ParallaxScrollView>
        <View style={tabStyles.tabsViewbox}>
          {
            (!isLoading && error === null) ?
              <>
                <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.INDEX} />
                <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.LUMIERES} />
                <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.VOLETS} />
                <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.TEMPERATURES} />
                <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.MAISON} />
              </> : <></>
          }
        </View>
      </>
    </React.Profiler>
  );
}


/**
 * Affiche le panneau de l'onglet sélectionné avec lazy-loading (T4.3)
 *
 * @param tab L'onglet sélectionné
 */
function showPanel(tab: Tabs): JSX.Element {
  const fallback = <ActivityIndicator size={'large'} color={Colors.domoticz.color} />;

  switch (tab) {
    case Tabs.INDEX:
      return (
        <Suspense fallback={fallback}>
          <HomeScreen />
        </Suspense>
      );
    case Tabs.LUMIERES:
      return (
        <Suspense fallback={fallback}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} />
        </Suspense>
      );
    case Tabs.VOLETS:
      return (
        <Suspense fallback={fallback}>
          <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} />
        </Suspense>
      );
    case Tabs.TEMPERATURES:
      return (
        <Suspense fallback={fallback}>
          <TabDomoticzTemperatures />
        </Suspense>
      );
    case Tabs.MAISON:
      return (
        <Suspense fallback={fallback}>
          <TabDomoticzParametres />
        </Suspense>
      );
    default:
      return <ThemedText type="title" style={{ color: 'red' }}>404 - Page non définie</ThemedText>
  }
}

export const tabStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 8
  },

  tabsViewbox: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.dark.titlebackground,
    height: 120,
    padding: 10,
    margin: 1,
  }
});
