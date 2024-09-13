
import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DomoticzConfig from '../models/domoticzConfig.model';
import { Colors, PROFILE, PROFILES_ENV } from '../constants/Colors';

/**
 * Ecran d'accueil
 */
export default function HomeScreen() {

  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<DomoticzConfig | null>(null); // State to store the response data
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Lance la connexion à Domoticz
  useEffect(() => {

  }, [refreshing])


  return (
      <ThemedView style={tabStyles.titleContainer}>
          (<ThemedText type="subtitle" style={{ color: responseData?.status === "OK" ? 'green' : 'red', marginTop: 50 }}>
            {responseData?.status === "OK" ? "Connecté" : "Non connecté :"} {(error !== null ? error.message : "")}
          </ThemedText>)
      </ThemedView>
  );
}


export const tabStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 8
  },
  headerImage: {
    color: '#808080',
    position: 'absolute',
    bottom: -10,
    backgroundColor: Colors.dark.titlebackground,
  },
  domoticzLogo: {
    width: 100,
    height: 100,
    position: 'absolute',
    backgroundColor: Colors.dark.titlebackground,
  },
  versionTabRow: {
    flex: 1,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    width: 250
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
