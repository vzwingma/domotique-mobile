/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */

import Ionicons from '@expo/vector-icons/Ionicons';

import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';

import DomoticzEquipement from '@/app/models/domoticzDevice.model'; // Importe le type domoticzDevice
import { tabStyles } from '.';

/**
 * Composant de l'écran des mesures de températures.
 * 
 * Ce composant affiche une liste de mesures de températeures récupérées depuis Domoticz.
 */
export default function TabDomoticzTemperatures() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [temperaturesData, storeTemperaturesData] = useState<DomoticzEquipement[]>([]); // État pour stocker les données de réponse

  // Lance la connexion à Domoticz pour récupérer les volets
  useEffect(() => {
    // loadDomoticzDevices(setIsLoaded, storeTemperaturesData, DomoticzType.BLIND);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="thermometer-sharp" style={tabStyles.headerImage} />}>

      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
          <></>
      )}
    </ParallaxScrollView>
  );
}