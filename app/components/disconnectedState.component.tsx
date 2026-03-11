import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';


/**
 * Variante visuelle standard de l'état "Déconnecté".
 * Lisible et distincte d'un simple état disabled.
 */
export const DisconnectedState: React.FC = () => {
  return (
    <View style={[styles.container]}>
      <MaterialCommunityIcons name="wifi-off" size={18} color="#ff8a80" />
      <ThemedText style={[styles.label]}>Déconnecté</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f2b2b',
    backgroundColor: '#2a1414',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  label: {
    color: '#ffd7d7',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
});

