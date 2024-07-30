import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import { useState , useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import loadEquipements from '../controllers/blinds.controller';

export default function TabDomoticzVolets() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [voletsData, setVoletsData] = useState<DomoticzEquipement[]>([]); // State to store the response data

  // Lance la connexion à Domoticz
  useEffect(() => {
    loadEquipements(setIsLoaded, setVoletsData);  
  }, [])


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="storefront" style={styles.headerImage} />}>

      {!isLoaded ? (
        <ThemedText>Chargement...</ThemedText>
      ) : (
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">{ voletsData.length } volets</ThemedText>
        </ThemedView>
      )}
      {isLoaded && voletsData.map((equipement: any, index: number) => (
          <ThemedView key={index}>
            <ThemedText>{equipement.idx} | {equipement.Name}</ThemedText>
          </ThemedView>
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
