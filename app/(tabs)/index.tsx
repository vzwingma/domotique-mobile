import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { connectToDomoticz } from '@/app/controllers/index.controller';
import DomoticzConfig from '../models/domoticzConfig.model';
import { Colors, PROFILE, PROFILES_ENV } from '../constants/Colors';
/**
 * Ecran d'accueil
 */
export default function HomeScreen() {

  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<DomoticzConfig | null>(null); // State to store the response data
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const logoImage = PROFILE === PROFILES_ENV.C ? require('@/assets/images/c/partial-dlogo.png') : require('@/assets/images/v/partial-dlogo.png')
  // Lance la connexion à Domoticz
  useEffect(() => {
    connectToDomoticz(setIsLoading, setResponseData, setError);
  }, [refreshing])

  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={logoImage}
          style={tabStyles.domoticzLogo}
        />
      }
      setRefreshing={setRefreshing}>

      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="title" style={tabStyles.domoticzColor}>Domoticz Mobile</ThemedText>
      </ThemedView>
      <ThemedView style={{alignItems: 'flex-end'}}>
        { responseData?.status === "OK" ? <ThemedText>Domoticz : {responseData?.version} r{responseData?.revision}</ThemedText> : <></> }
      </ThemedView>
      <ThemedView style={tabStyles.titleContainer}>
            {isLoading ? 
              ( <ActivityIndicator size={'large'} color={Colors.domoticz.color}/> )
              : 
              ( 
                <ThemedText type="subtitle" style={ {color: responseData?.status === "OK" ? 'green' : 'red', marginTop: 50} }>
                    {responseData?.status === "OK" ? "Connecté" : "Non connecté" } {(error ? + error : "")}
                </ThemedText> 
              )
            }
      </ThemedView>
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
    color: Colors.domoticz.color
  }
});
