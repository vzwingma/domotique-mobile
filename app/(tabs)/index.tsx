import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { connectToDomoticz } from '@/app/controllers/index.controller';
import DomoticzConfig from '../models/domoticzConfig.model';
import { Colors, PROFILE, PROFILES_ENV } from '../constants/Colors';
import { stylesLists } from '../components/device.component';
import { version } from 'uuid';
/**
 * Ecran d'accueil
 */
export default function HomeScreen() {

  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<DomoticzConfig | null>(null); // State to store the response data
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const logoImage = PROFILE === PROFILES_ENV.C ? require('@/assets/images/c/partial-dlogo.png') : require('@/assets/images/v/partial-dlogo.png')
  // Lance la connexion à Domoticz
  useEffect(() => {
    connectToDomoticz(setIsLoading, setResponseData, setError);
  }, [refreshing])


  // Retourne la version de l'application et de Domoticz sous forme de JSX
  const getTabVersion = () => {
    return <ThemedView style={{marginTop: 300}}>
    <ThemedView style={tabStyles.versionTabRow}>
      <ThemedView style={tabStyles.versionTabCell} ><ThemedText type='italic'>Domoticz App</ThemedText></ThemedView>
      <ThemedView style={tabStyles.versionTabCell} >{ responseData?.status === "OK" ? <ThemedText type='italic'>{responseData?.version}</ThemedText> : <></> }</ThemedView>
    </ThemedView>
    <ThemedView style={tabStyles.versionTabRow}>
        <ThemedView style={tabStyles.versionTabCell} ><ThemedText type='italic'>Domoticz Mobile</ThemedText></ThemedView>
        <ThemedView style={tabStyles.versionTabCell} ><ThemedText type='italic'>1.0</ThemedText></ThemedView>
    </ThemedView>
  </ThemedView>
  }


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
      

      <ThemedView style={tabStyles.titleContainer}>
            {isLoading ? 
              ( <ActivityIndicator size={'large'} color={Colors.domoticz.color}/> )
              : 
              ( 
                <ThemedText type="subtitle" style={ {color: responseData?.status === "OK" ? 'green' : 'red', marginTop: 50} }>
                    {responseData?.status === "OK" ? "Connecté" : "Non connecté :" } {(error !== null ? error.message : "")}
                </ThemedText> 
              )
            }
      </ThemedView>

      {getTabVersion()}

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
  versionTabRow: {
    flex: 1, 
    alignSelf: 'flex-end', 
    flexDirection: 'row', 
    width:220
  },
  versionTabCell: {
    flex: 1, 
    alignSelf: 'stretch',
    fontStyle: 'italic',
  },
  domoticzColor: {
    color: Colors.domoticz.color
  }
});
