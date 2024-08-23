/**
 * 
 * Ce fichier contient le code de l'écran des volets.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, View } from 'react-native';
import { useState , useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { loadDomoticzDevices } from '@/app/controllers/devices.controller';
import { ViewDomoticzDevice } from '@/app/components/device.component'; 
import DomoticzEquipement from '@/app/models/domoticzDevice.model'; // Importe le type domoticzDevice
import { DomoticzType } from '@/app/constants/DomoticzEnum';
import { tabStyles } from '.';

/**
 * Composant de l'écran des volets.
 * 
 * Ce composant affiche une liste de volets récupérés depuis Domoticz.
 */
export default function TabDomoticzVolets() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [voletsData, storeVoletsData] = useState<DomoticzEquipement[]>([]); // État pour stocker les données de réponse

  // Lance la connexion à Domoticz pour récupérer les volets
  useEffect(() => {
    loadDomoticzDevices(setIsLoaded, storeVoletsData, DomoticzType.BLIND);  
  }, [])


  return (
    <View>
      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
        <>
          <View style={tabStyles.titleContainer}>
            <Ionicons size={310} name="reorder-four" style={tabStyles.headerImage} />
          </View>
          <FlatList data={voletsData} 
                      renderItem={({item}) => (<ViewDomoticzDevice device={item} storeDeviceData={storeVoletsData}/>)} 
                      keyExtractor={(item, index) => index.toString()} 
                      style={tabStyles.list} />
        </>
      )}
    </View>
  );
}


