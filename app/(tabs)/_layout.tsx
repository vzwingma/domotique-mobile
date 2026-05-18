import React, { JSX, Suspense, useContext, useEffect, useRef, useState } from 'react';

import { Colors } from '@/app/enums/Colors';
import connectToDomoticz from '../controllers/index.controller';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { Tabs } from '../enums/TabsEnums';
import { TabBarItems } from '@/components/navigation/TabBarItem';
import DomoticzConfig from '../models/domoticzConfig.model';
import { ThemedText } from '@/components/ThemedText';
import { DomoticzDeviceType } from '../enums/DomoticzEnum';

// T4.3 - Lazy-load screens for better performance
const HomeScreen = React.lazy(() => import('.'));
const TabDomoticzTemperatures = React.lazy(() => import('./temperatures.tab'));
const TabDomoticzDevices = React.lazy(() => import('./devices.tabs'));
const TabDomoticzParametres = React.lazy(() => import('./parametrages.tab'));

import { loadDomoticzDevices } from '../controllers/devices.controller';
import { loadDomoticzTemperatures } from '../controllers/temperatures.controller';
import { getHeaderIcon } from '@/components/navigation/TabHeaderIcon';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { loadDomoticzThermostats } from '../controllers/thermostats.controller';
import { loadDomoticzParameters } from '../controllers/parameters.controller';
import { mapDomoticzStatusToConnectionBadgeState } from '@/components/ConnectionBadge';

/**
 * Composant racine de l'application avec Profiler (T4.5).
 * Il contient les onglets de navigation.
 */
export default function TabLayout() {

  // État pour vérifier si l'utilisateur est connecté à Domoticz
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { domoticzConnexionData, setDomoticzConnexionData, setDomoticzDevicesData, setDomoticzTemperaturesData, setDomoticzThermostatData, setDomoticzParametersData  } = useContext(DomoticzContext)!;

  const [error, setError] = useState<Error | null>(null);
  const [tab, setTab] = useState(Tabs.INDEX);
  const appState = useRef(AppState.currentState);


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
    setRefreshing(prev => !prev);
    setTab(newTab);
  }

  /**
   *  A l'initialisation, lance la connexion à Domoticz
   * et à changement d'onglet
   * */
  useEffect(() => {
    console.log("(Re)Chargement de l'application...");
    connectToDomoticz({ setIsLoading, storeConnexionData, setError });
  }, [refreshing])

  /**
   * Rafraîchissement automatique au retour en foreground (AppState)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[AppState] Application revenue au premier plan — rafraîchissement des données');
        setRefreshing(prev => !prev);
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [])

  /**
   * Fonction de callback pour stocker les données de connexion et charger les appareils
   * @param data Les données de connexion à Domoticz
   */
  function storeConnexionData(data: DomoticzConfig) {
    setDomoticzConnexionData(data);
    loadDomoticzDevices(setDomoticzDevicesData);
    loadDomoticzThermostats(setDomoticzThermostatData);
    loadDomoticzTemperatures(setDomoticzTemperaturesData);
    loadDomoticzParameters(setDomoticzParametersData);
    setIsLoading(false);
  }


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
          setRefreshing={setRefreshing}>

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
