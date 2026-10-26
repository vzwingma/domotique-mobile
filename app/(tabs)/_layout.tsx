import React, { JSX, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Colors } from '@/app/enums/Colors';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Tabs } from '../enums/TabsEnums';
import { TabBarItems } from '@/components/navigation/TabBarItem';
import { ThemedText } from '@/components/ThemedText';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';

import { getHeaderIcon } from '@/components/navigation/TabHeaderIcon';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { mapDomoticzStatusToConnectionBadgeState } from '@/components/ConnectionBadge';
import { refreshDomoticzData } from '@/app/services/RefreshOrchestrator.service';
import { runLatencyDiagnostic } from '@/app/services/ClientHTTP.service';
import { generateTraceId } from '@/app/services/ErrorHandler.service';
import { Logger } from '@/app/services/Logger.service';
import { useTabletLayout } from '@/hooks/useTabletLayout';
import { getMergedTabGroup, getTabTitle, isTabActive } from '@/app/services/TabGroups.service';
import { MergedTabs, getMergedColumnWidth } from '@/app/components/mergedTabs.component';

// T4.3 - Lazy-load screens for better performance
const HomeScreen = React.lazy(() => import('.'));
const TabDomoticzTemperatures = React.lazy(() => import('./temperatures.tab'));
const TabDomoticzDevices = React.lazy(() => import('./devices.tabs'));
const TabDomoticzParametres = React.lazy(() => import('./parametrages.tab'));

const REFRESH_COOLDOWN_MS = 5000;

// Padding horizontal du contenu de page (cf. ParallaxScrollView `styles.content`)
const PAGE_CONTENT_PADDING = 10;

// Ordre des boutons de la barre d'onglets
const TAB_BAR_ORDER: readonly Tabs[] = [Tabs.INDEX, Tabs.LUMIERES, Tabs.VOLETS, Tabs.TEMPERATURES, Tabs.MAISON];

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

  // Tablette paysage : onglets fusionnés deux à deux sur 2 colonnes (téléphone : toujours false)
  const { isMergedLayout } = useTabletLayout();
  const { width: windowWidth } = useWindowDimensions();


  /**
   * T4.5 - Callback pour profiling de performance
   */
  const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
    Logger.debug(`[PROFILER] ${id} (${phase}) - ${actualDuration.toFixed(2)}ms`);
  };

  /**
   * Fonction pour changer d'onglet
   * @param newTab Le nouvel onglet sélectionné
   */
  function selectNewTab(newTab: Tabs) {
    setTab(newTab);
    triggerRefresh('tab-switch');
  }

  // Faux positif isolé (seule occurrence du projet, cf. `npm run lint`) : aucun plugin babel-plugin-react-compiler
  // n'est actif dans ce projet (voir babel.config.js), donc ce diagnostic est purement consultatif (forward-compat)
  // et n'a aucun effet à l'exécution. `useCallback([])` ne ferme que sur des refs et des setters d'état stables ;
  // la mémoïsation manuelle reste correcte. À réévaluer si adoption effective du compilateur React (ADR dédié).
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const triggerRefresh = useCallback((source: 'tab-switch' | 'foreground', force: boolean = false): void => {
    const now = Date.now();
    const elapsed = now - lastRefreshAtMsRef.current;
    if (!force && elapsed < REFRESH_COOLDOWN_MS) {
      Logger.debug(`[RefreshGuard] Skip refresh (${source}) — cooldown ${elapsed}ms/${REFRESH_COOLDOWN_MS}ms`);
      return;
    }

    lastRefreshAtMsRef.current = now;
    setIsLoading(true);
    setRefreshTick(prev => prev + 1);
  }, []);

  /**
   *  A l'initialisation, lance le chargement de toutes les données Domoticz en parallèle.
   *  GET_CONFIG + GET_DEVICES + GET_TEMPS s'exécutent simultanément pour minimiser la latence
   *  sur les connexions lentes (5G ~30-40s par requête).
   * */
  useEffect(() => {
    Logger.debug("(Re)Chargement de l'application...");
    lastRefreshAtMsRef.current = Date.now();
    // Diagnostic de latence au 1er chargement uniquement — aide à identifier
    // la phase réseau lente (DNS, TCP, TLS ou serveur) en 5G
    if (refreshTick === 0) {
      runLatencyDiagnostic(generateTraceId());
    }
    // setIsLoading(true) n'est plus déclenché ici : il l'est en amont, de façon synchrone dans le
    // gestionnaire d'événement `triggerRefresh` (changement d'onglet, retour foreground, pull-to-refresh),
    // avant l'incrément de `refreshTick` qui déclenche cet effet. Pour le chargement initial (refreshTick === 0),
    // `isLoading` vaut déjà `true` via son état initial (`useState(true)`). Évite un setState synchrone en
    // tête d'effet (cascading renders) tout en préservant le comportement visuel (spinner affiché dès l'action).
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
    // Setters issus de useState (DomoticzContextProvider) : identité stable garantie par React,
    // les ajouter aux deps n'entraîne aucun re-déclenchement supplémentaire de l'effet.
  }, [refreshTick, setDomoticzConnexionData, setDomoticzDevicesData, setDomoticzParametersData, setDomoticzTemperaturesData, setDomoticzThermostatData])

  /**
   * Rafraîchissement automatique au retour en foreground (AppState)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        Logger.debug('[AppState] Application revenue au premier plan — rafraîchissement des données');
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
      return showPanel(tab, isMergedLayout, getMergedColumnWidth(windowWidth, PAGE_CONTENT_PADDING))
    } else {
      return <ThemedText type="subtitle" style={{ color: 'red', marginTop: 50 }}>Erreur : {error.message}</ThemedText>
    }
  }


  return (
    <React.Profiler id="TabLayout" onRender={onRenderCallback}>
      <>
        <ParallaxScrollView
          headerImage={getHeaderIcon((isMergedLayout ? getMergedTabGroup(tab)?.[0] : undefined) ?? tab)}
          headerTitle={getTabTitle(tab, isMergedLayout)}
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
                {TAB_BAR_ORDER.map(thisTab => (
                  <TabBarItems key={thisTab} activeTab={tab} selectNewTab={selectNewTab} thisTab={thisTab}
                               isActive={isTabActive(tab, thisTab, isMergedLayout)} />
                ))}
              </> : <></>
          }
        </View>
      </>
    </React.Profiler>
  );
}


/**
 * Affiche le panneau de l'onglet sélectionné avec lazy-loading (T4.3).
 * En layout fusionné (tablette paysage), les onglets groupés sont affichés côte à côte sur 2 colonnes.
 *
 * @param tab L'onglet sélectionné
 * @param isMergedLayout layout fusionné (tablette paysage)
 * @param columnWidth largeur disponible d'une colonne en layout fusionné
 */
function showPanel(tab: Tabs, isMergedLayout: boolean = false, columnWidth?: number): JSX.Element {
  const fallback = <ActivityIndicator size={'large'} color={Colors.domoticz.color} />;
  const group = isMergedLayout ? getMergedTabGroup(tab) : null;

  if (group !== null) {
    return (
      <Suspense fallback={fallback}>
        <MergedTabs columns={[
          { tab: group[0], content: renderTabScreen(group[0], columnWidth) },
          { tab: group[1], content: renderTabScreen(group[1], columnWidth) },
        ]} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={fallback}>
      {renderTabScreen(tab)}
    </Suspense>
  );
}

/**
 * Écran d'un onglet
 *
 * @param tab L'onglet
 * @param availableWidth largeur disponible si l'écran n'occupe pas toute la fenêtre (défaut : largeur fenêtre)
 */
function renderTabScreen(tab: Tabs, availableWidth?: number): JSX.Element {
  switch (tab) {
    case Tabs.INDEX:
      return <HomeScreen />;
    case Tabs.LUMIERES:
      return <TabDomoticzDevices dataType={DomoticzDeviceType.LUMIERE} availableWidth={availableWidth} />;
    case Tabs.VOLETS:
      return <TabDomoticzDevices dataType={DomoticzDeviceType.VOLET} availableWidth={availableWidth} />;
    case Tabs.TEMPERATURES:
      return <TabDomoticzTemperatures availableWidth={availableWidth} />;
    case Tabs.MAISON:
      return <TabDomoticzParametres />;
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
