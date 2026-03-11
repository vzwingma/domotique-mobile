import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

type DisconnectedStateProps = {
  compact?: boolean;
};

/**
 * Variante visuelle standard de l'état "Déconnecté".
 * Lisible et distincte d'un simple état disabled.
 */
export const DisconnectedState: React.FC<DisconnectedStateProps> = ({ compact = false }) => {
  return (
    <View style={[styles.container, compact ? styles.containerCompact : undefined]}>
      <MaterialCommunityIcons name="wifi-off" size={compact ? 13 : 15} color="#ff8a80" />
      <ThemedText style={[styles.label, compact ? styles.labelCompact : undefined]}>Déconnecté</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#7f2b2b',
    backgroundColor: '#2a1414',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  containerCompact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  label: {
    color: '#ffd7d7',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  labelCompact: {
    fontSize: 11,
    lineHeight: 13,
  },
});

