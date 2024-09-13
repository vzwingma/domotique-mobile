
import { StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DomoticzConfig from '../models/domoticzConfig.model';
import { Colors } from '../constants/Colors';

/**
 * Ecran d'accueil
 */
export default function HomeScreen() {


  return (
      <ThemedView style={tabStyles.titleContainer}>
        <ThemedText type="subtitle" style={{ color: 'green' , marginTop: 50 }}>
          Connecté à Domoticz
        </ThemedText>
      </ThemedView>
  );
}


export const tabStyles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 8
  },
});
