/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */

import Ionicons from '@expo/vector-icons/Ionicons';

import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';

import DomoticzTemperature from '@/app/models/domoticzTemperature.model'; // Importe le type domoticzDevice
import { tabStyles } from '.';
import { loadDomoticzDevices as loadDomoticzTemperatures } from '../controllers/temperatures.controller';
import { FlatList } from 'react-native-gesture-handler';
import { ViewDomoticzTemperature } from '../components/temperature.component';

/**
 * Composant de l'écran des mesures de températures.
 * 
 * Ce composant affiche une liste de mesures de températeures récupérées depuis Domoticz.
 */
export default function TabDomoticzTemperatures() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [temperaturesData, storeTemperaturesData] = useState<DomoticzTemperature[]>([]); // État pour stocker les données de réponse

  // Lance la connexion à Domoticz pour récupérer les volets
  useEffect(() => {
     loadDomoticzTemperatures(setIsLoaded, storeTemperaturesData);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="thermometer-sharp" style={tabStyles.headerImage} />}>

{!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
          <FlatList data={temperaturesData} 
                    renderItem={({item}) => (<ViewDomoticzTemperature temperature={item}/>)}
                    keyExtractor={(item, index) => index.toString()} />
      )}
    </ParallaxScrollView>
  );
}