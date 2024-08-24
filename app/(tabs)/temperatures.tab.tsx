/**
 * 
 * Ce fichier contient le code de l'écran des mesures de températures.
 */

import Ionicons from '@expo/vector-icons/Ionicons';

import { useState , useEffect } from 'react';

import DomoticzTemperature from '@/app/models/domoticzTemperature.model'; // Importe le type domoticzDevice
import { tabStyles } from '.';
import { loadDomoticzDevices as loadDomoticzTemperatures } from '../controllers/temperatures.controller';
import { ViewDomoticzTemperature } from '../components/temperature.component';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Colors } from '../constants/Colors';
import { ActivityIndicator } from 'react-native';

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
      headerBackgroundColor={{ light: Colors.dark.titlebackground, dark: Colors.dark.titlebackground }}
      headerImage={<Ionicons size={310} name="thermometer-sharp" style={tabStyles.headerImage} />}>

      {!isLoaded ? (
        <ActivityIndicator size={'large'} color={Colors.domoticz.color}/>
      ) : (
        buildDeviceList(temperaturesData)
      )}
    </ParallaxScrollView>
);
}


/**
 * Construit la liste des mesures de températures.
 * 
 * @param voletsData Les données des mesures de températures
 */
function buildDeviceList(voletsData: DomoticzTemperature[]) {
  let items: JSX.Element[] = [];
  voletsData.forEach(item => {
    items.push(<ViewDomoticzTemperature key={item.idx} temperature={item}/>);          
  });
  return items;
}
