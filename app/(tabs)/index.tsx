import { Image, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { connectToDomoticz } from '@/app/controllers/index.controller';
import DomoticzConfig from '../models/domoticzConfig.model';

/**
 * Ecran d'accueil
 */
export default function HomeScreen() {

  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<DomoticzConfig | null>(null); // State to store the response data


  // Lance la connexion à Domoticz
  useEffect(() => {
    connectToDomoticz(setIsLoading, setResponseData);
    }, [])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1D3D47', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={tabStyles.reactLogo}
        />
      }>

      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="title">Mobile Domoticz App</ThemedText>
      </ThemedView>
      <ThemedView>
        { responseData?.status === "OK" ? <ThemedText>{responseData?.version} r{responseData?.revision}</ThemedText> : <></> }
      </ThemedView>
      <ThemedView style={tabStyles.titleContainer}>
            {isLoading ? 
              ( <ThemedText  type="defaultSemiBold">Chargement...</ThemedText> ) : 
              ( <>
                  <ThemedText type="defaultSemiBold">Connecté à Domoticz : </ThemedText>
                  <ThemedText type="default" style={responseData?.status === "OK" ? {color: 'green'} : {color: 'red'}}>{responseData?.status}</ThemedText>
                </> )
            }
      </ThemedView>            
    </ParallaxScrollView>
  );
}


export const tabStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 8,
    height: 190,
    backgroundColor: '#353636',
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
    height: 350,
    backgroundColor: '#353636',
  },
  list: {
    backgroundColor: '#000000',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  }
});
