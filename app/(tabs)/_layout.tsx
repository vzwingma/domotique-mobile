import React, { useContext, useEffect, useState } from 'react';

import { Colors } from '@/app/enums/Colors';
import connectToDomoticz from '../controllers/index.controller';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Tabs } from '../enums/TabsEnums';
import { TabBarItems } from '@/components/navigation/TabBarItem';
import DomoticzConfig from '../models/domoticzConfig.model';
import { ThemedText } from '@/components/ThemedText';
import { DOMOTICZ_MOBILE_VERSION, DomoticzStatus, DomoticzType } from '../enums/DomoticzEnum';
import HomeScreen from '.';
import TabDomoticzTemperatures from './temperatures.tab';
import DomoticzDevice from '../models/domoticzDevice.model';
import { loadDomoticzDevices } from '../controllers/devices.controller';
import TabDomoticzDevices from './devices.tabs';
import { loadDomoticzTemperatures } from '../controllers/temperatures.controller';
import { getHeaderIcon } from '@/components/navigation/TabHeaderIcon';
import { DomoticzContext, DomoticzContextProvider } from '../services/DomoticzContextProvider';

/**
 * Composant racine de l'application.
 * Il contient les onglets de navigation.
 */
export default function TabLayout() {

  // État pour vérifier si l'utilisateur est connecté à Domoticz
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { domoticzConnexionData, setDomoticzConnexionData, setDomoticzDevicesData, setDomoticzTemperaturesData } = useContext(DomoticzContext)!;

  const [error, setError] = useState<Error | null>(null);
  const [tab, setTab] = useState(Tabs.INDEX);


  /**
   * Fonction pour changer d'onglet
   * @param newTab Le nouvel onglet sélectionné
   */
  function selectNewTab(newTab: Tabs) {
    setRefreshing(!refreshing);
    setTab(newTab);
  }

  /**
   *  A l'initialisation, lance la connexion à Domoticz
   * et à changement d'onglet
   * */
  useEffect(() => {
    console.log("(Re)Chargement de l'application...");
    connectToDomoticz({setIsLoading, storeConnexionData, setError});
  }, [refreshing])

  /**
   * Fonction de callback pour stocker les données de connexion et charger les appareils
   * @param data Les données de connexion à Domoticz
   */
  function storeConnexionData(data: DomoticzConfig) {
    setDomoticzConnexionData(data);
    loadDomoticzDevices(storeAllDevicesData);
    loadDomoticzTemperatures(setDomoticzTemperaturesData);
  }

  /**
   * Fonction de callback pour stocker les données des appareils
   * @param voletsData Les données des volets 
   * @param lumieresData Les données des lumières
   **/
  function storeAllDevicesData(domoticzDevicesData: DomoticzDevice[]) {
    setDomoticzDevicesData(domoticzDevicesData);
    setIsLoading(false);
  }


  /**
   * Récupère le statut de connexion à Domoticz
   * 
   * @returns Le statut de connexion suivant l'énumération DomoticzStatus
   */
  function getDomoticzStatus(): DomoticzStatus {
    if(isLoading) return DomoticzStatus.INCONNU;
    return domoticzConnexionData?.status === "OK" ? DomoticzStatus.CONNECTE : DomoticzStatus.DECONNECTE;
  }


  function getDomoticzSubtitle() {
    if (isLoading) {
      return "Chargement...";
    } else {
      return "v " + DOMOTICZ_MOBILE_VERSION + " - Domoticz " + domoticzConnexionData?.version;
    }
  }

  /**
   * Récupère le contenu du panneau, suivant l'état de chargement et les erreurs
   */
  function getPanelContent() {
    if (isLoading) {
      return <ActivityIndicator size={'large'} color={Colors.domoticz.color} />
    } else if (error !== null) {
      return <ThemedText type="subtitle" style={{ color: 'red', marginTop: 50 }}>Erreur : {error.message}</ThemedText>
    } else {
      return showPanel(tab)
    }
  }


  return (
    <DomoticzContextProvider>
      <ParallaxScrollView
        headerImage={getHeaderIcon(tab)}
        headerTitle="Domoticz Mobile"
        headerSubtitle={getDomoticzSubtitle()}
        connexionStatus={getDomoticzStatus()}
        setRefreshing={setRefreshing}>

        <ThemedView style={tabStyles.titleContainer}>
          {getPanelContent()}
        </ThemedView>

      </ParallaxScrollView>
      <View style={tabStyles.tabsViewbox}>
        {
          (!isLoading && error === null) ?
            <>
              <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.INDEX} />
              <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.LUMIERES} />
              <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.VOLETS} />
              <TabBarItems activeTab={tab} selectNewTab={selectNewTab} thisTab={Tabs.TEMPERATURES} />
            </> : <></>
        }
      </View>
    </DomoticzContextProvider>
  );
}


/**
 * Affiche le panneau de l'onglet sélectionné
 * 
 * @param tab L'onglet sélectionné
 * @param devicesData Les données des appareils
 * @param storeDevicesData Setter pour les données des appareils
 * @param domoticzTemperaturesData Les données des températures
 */
function showPanel(tab: Tabs): JSX.Element {

  switch (tab) {
    case Tabs.INDEX:
      return <HomeScreen/>
    case Tabs.LUMIERES:
      return <TabDomoticzDevices dataType={DomoticzType.LUMIERE} />
    case Tabs.VOLETS:
      return <TabDomoticzDevices dataType={DomoticzType.VOLET}/>
    case Tabs.TEMPERATURES:
      return <TabDomoticzTemperatures />
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
    height: 70,
    padding: 10,
    margin: 1,
  }
});