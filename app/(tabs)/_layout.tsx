import React, { useEffect, useState } from 'react';

import { Colors, PROFILE, PROFILES_ENV } from '@/app/constants/Colors';
import connectToDomoticz from '../controllers/index.controller';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Tabs } from '../constants/TabsEnums';
import { TabBarItems } from '@/components/navigation/TabBarItem';
import DomoticzConfig from '../models/domoticzConfig.model';
import { ThemedText } from '@/components/ThemedText';
import { DomoticzStatus } from '../constants/DomoticzEnum';
import HomeScreen from '.';
import TabDomoticzTemperatures from './temperatures.tab';
import TabDomoticzLumieres from './lights.tab';
import TabDomoticzVolets from './blinds.tab';
import { Ionicons } from '@expo/vector-icons';

/**
 * Composant racine de l'application.
 * Il contient les onglets de navigation.
 */
export default function TabLayout() {

  // État pour vérifier si l'utilisateur est connecté à Domoticz
  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<DomoticzConfig | null>(null); // State to store the response data
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, selectTab] = useState(Tabs.INDEX);

  // A l'initialisation, lance la connexion à Domoticz
  useEffect(() => {
    connectToDomoticz(setIsLoading, setResponseData, setError);
  }, [refreshing])


  return (
    <>
      <ParallaxScrollView
        headerImage={showLogoImage(tab)}
        headerTitle="Domoticz Mobile"
        connexionStatus={!isLoading ? responseData?.status === "OK" ? DomoticzStatus.CONNECTE : DomoticzStatus.DECONNECTE : DomoticzStatus.INCONNU}
        setRefreshing={setRefreshing}>

        <ThemedView style={tabStyles.titleContainer}>
          {isLoading ?
            (<ActivityIndicator size={'large'} color={Colors.domoticz.color} />)
            :
            (showPanel(tab, error))
          }
        </ThemedView>

      </ParallaxScrollView>
      <View style={tabStyles.tabsViewbox}>
        <TabBarItems activeTab={tab} setTab={selectTab} thisTab={Tabs.INDEX} />
        {
          // TODO : Désactiver les onglets si l'utilisateur n'est pas connecté
          !isLoading ? // && error === null ?
            <>
              <TabBarItems activeTab={tab} setTab={selectTab} thisTab={Tabs.LUMIERES} />
              <TabBarItems activeTab={tab} setTab={selectTab} thisTab={Tabs.VOLETS} />
              <TabBarItems activeTab={tab} setTab={selectTab} thisTab={Tabs.TEMPERATURES} />
            </> : <></>
        }
      </View>
    </>
  );
}

/**
 * Affiche l'image du logo de l'application suivant l'onglet sélectionné
 */
function showLogoImage(tab: Tabs) {
  switch (tab) {
    case Tabs.INDEX:
      return <Image source={PROFILE === PROFILES_ENV.C ? require('@/assets/images/c/partial-dlogo.png') : require('@/assets/images/v/partial-dlogo.png')} style={tabStyles.domoticzLogo} />
    case Tabs.LUMIERES:
      return <Ionicons size={100} name="bulb" style={tabStyles.headerImage} />
    case Tabs.VOLETS:
      return <Ionicons size={100} name="reorder-four" style={tabStyles.headerImage} />
    case Tabs.TEMPERATURES:
      return <Ionicons size={100} name="thermometer-sharp" style={tabStyles.headerImage} />
    default:
      return <></>;
  }
}


/**
 * Affiche le panneau de l'onglet sélectionné
 * 
 * @param tab L'onglet sélectionné
 * @param error L'erreur éventuelle
 */
function showPanel(tab: Tabs, error: Error | null) {
  if (error !== null) {
    //   return <ThemedText type="subtitle" style={{ color: 'red', marginTop: 50 }}>Erreur : {error.message}</ThemedText>
  }
  switch (tab) {
    case Tabs.INDEX:
      return <HomeScreen />
    case Tabs.LUMIERES:
      return <TabDomoticzLumieres />
    case Tabs.VOLETS:
      return <TabDomoticzVolets />
    case Tabs.TEMPERATURES:
      return <TabDomoticzTemperatures />
    default:
      return <ThemedText type="title">404 - Page non définie</ThemedText>
  }
}

export const tabStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 8
  },
  headerImage: {
    color: '#808080',
    position: 'absolute',
    bottom: -10,
    backgroundColor: Colors.dark.titlebackground,
  },
  domoticzLogo: {
    width: 100,
    height: 100,
    position: 'absolute',
    backgroundColor: Colors.dark.titlebackground,
  },
  tabsViewbox: {
    position: 'absolute',
    bottom: -20,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.dark.titlebackground,
    height: 84,
    padding: 10,
    margin: 1,
  }
});