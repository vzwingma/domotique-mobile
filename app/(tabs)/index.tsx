import { Image, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { connectToDomoticz } from '@/app/controllers/index.controller';
import DomoticzConfig from '../models/domoticzConfig.model';
import { API_URL } from '../constants/APIconstants';
import {getNetworkStateAsync, NetworkState} from 'expo-network';
/**
 * Ecran d'accueil
 */
export default function HomeScreen() {

  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<DomoticzConfig | null>(null); // State to store the response data
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);

  // Lance la connexion à Domoticz
  useEffect(() => {
    connectToDomoticz(setIsLoading, setResponseData);

    getNetworkStateAsync().then((network) => {
      setNetworkState(network);
    })

  }, [])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-dlogo.png')}
          style={tabStyles.domoticzLogo}
        />
      }>

      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="title" style={{color: '#f5c727'}}>Domoticz mobile</ThemedText>
      </ThemedView>
      <ThemedView style={{alignItems: 'flex-end'}}>
        { responseData?.status === "OK" ? <ThemedText>{responseData?.version} r{responseData?.revision}</ThemedText> : <></> }
      </ThemedView>
      <ThemedView style={tabStyles.titleContainer}>
            {isLoading ? 
              ( <ThemedText  type="defaultSemiBold">Chargement...</ThemedText> )
              : 
              ( 
                <ThemedText type="title" style={ {color: responseData?.status === "OK" ? 'green' : 'red', marginTop: 50} }>
                    {responseData?.status === "OK" ? "Connecté" : "Non connecté : " + JSON.stringify(responseData)  }
                </ThemedText> 
              )
            }
      </ThemedView>

        { networkState ? 
        <ThemedView style={{alignItems: 'flex-end'}}>
          <ThemedText style={{fontStyle: 'italic', marginTop: 50}}>[{API_URL}]</ThemedText>
          <ThemedText style={{fontStyle: 'italic'}}>Type : {networkState?.type}</ThemedText>
          <ThemedText style={{fontStyle: 'italic'}}>Internet ? {networkState?.isInternetReachable ? "OUI" : "NON"}</ThemedText>
          <ThemedText style={{fontStyle: 'italic'}}>Connecté ? {networkState?.isConnected ? "OUI" : "NON"}</ThemedText>
        </ThemedView>
        : <></> }
    </ParallaxScrollView>
  );
}


export const tabStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 8
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
    height: 350,
    backgroundColor: '#353636',
  },
  domoticzLogo: {
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    backgroundColor: '#353636',
  }
});
