import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, View } from 'react-native';
import { useState , useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { loadDomoticzDevices } from '../controllers/devices.controller';
import DomoticzEquipement from '../models/domoticzDevice.model';
import { DomoticzType } from '../constants/DomoticzEnum';
import { ViewDomoticzDevice } from '@/app/components/device.component'; 
import { tabStyles } from '.';
/**
 * Ecran des lumières
 */
export default function TabDomoticzLumieres() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [lightsData, storeLumieresData] = useState<DomoticzEquipement[]>([]); // State to store the response data

  // Lance la connexion à Domoticz pour récupérer les lumières
  useEffect(() => {
    loadDomoticzDevices(setIsLoaded, storeLumieresData, DomoticzType.LIGHT);  
  }, [])

  return (
    <View>
      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
        <>
          <View style={tabStyles.titleContainer}>
            <Ionicons size={310} name="bulb" style={tabStyles.headerImage} />
          </View>
          <FlatList data={lightsData} 
                    renderItem={({item}) => (<ViewDomoticzDevice device={item} storeDeviceData={storeLumieresData}/>)}
                    keyExtractor={(item, index) => index.toString()} 
                    style={tabStyles.list} />
        </>
      )}
    </View>
  );
}