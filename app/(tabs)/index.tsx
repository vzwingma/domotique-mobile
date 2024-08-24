import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { connectToDomoticz } from '@/app/controllers/index.controller';
import DomoticzConfig from '../models/domoticzConfig.model';
import { API_URL } from '../constants/APIconstants';
import {getNetworkStateAsync, NetworkState} from 'expo-network';
import { Colors } from '../constants/Colors';
/**
 * Ecran d'accueil
 */
export default function HomeScreen() {

  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<DomoticzConfig | null>(null); // State to store the response data
  const [error, setError] = useState(null);
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);

  // Lance la connexion à Domoticz
  useEffect(() => {
    connectToDomoticz(setIsLoading, setResponseData, setError);

    getNetworkStateAsync().then((network) => {
      setNetworkState(network);
    })

  }, [])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Colors.dark.titlebackground, dark: Colors.dark.titlebackground }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-dlogo.png')}
          style={tabStyles.domoticzLogo}
        />
      }>

      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="title" style={tabStyles.domoticzColor}>Domoticz mobile</ThemedText>
      </ThemedView>
      <ThemedView style={{alignItems: 'flex-end'}}>
        { responseData?.status === "OK" ? <ThemedText>{responseData?.version} r{responseData?.revision}</ThemedText> : <></> }
      </ThemedView>
      <ThemedView style={tabStyles.titleContainer}>
            {isLoading ? 
              ( <ActivityIndicator size={'large'} color={Colors.domoticz.text}/> )
              : 
              ( 
                <ThemedText type="title" style={ {color: responseData?.status === "OK" ? 'green' : 'red', marginTop: 50} }>
                    {responseData?.status === "OK" ? "Connecté" : "Non connecté" } {(error ? + error : "")}
                </ThemedText> 
              )
            }
      </ThemedView>

        { networkState ? 
        <ThemedView style={{alignItems: 'flex-end'}}>
          <ThemedText style={{fontStyle: 'italic', marginTop: 70, color:'#808080'}}>[{API_URL}]</ThemedText>
          <ThemedText style={{fontStyle: 'italic', color:'#808080'}}>Type             : {networkState?.type}</ThemedText>
          <ThemedText style={{fontStyle: 'italic', color:'#808080'}}>Connexion active ? {networkState?.isConnected ? "OUI" : "NON"}</ThemedText>
          <ThemedText style={{fontStyle: 'italic', color:'#808080'}}>Accès à Internet ? {networkState?.isInternetReachable ? "OUI" : "NON"}</ThemedText>          
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
    backgroundColor: Colors.dark.titlebackground,
  },
  domoticzLogo: {
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    backgroundColor: Colors.dark.titlebackground,
  },
  domoticzColor: {
    color: Colors.domoticz.text
  }
});
