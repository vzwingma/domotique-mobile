import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Colors } from '@/app/enums/Colors';

export type ConnectionBadgeState = 'connecte' | 'synchronisation' | 'deconnecte' | 'erreur';

type ConnectionBadgeProps = {
  state: ConnectionBadgeState;
};

type BadgeVisual = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  color: string;
};

/**
 * Mapping canonique des états de connexion UI.
 * Fallback explicite : tout état non reconnu doit être mappé sur "erreur".
 */
const BADGE_VISUALS: Record<ConnectionBadgeState, BadgeVisual> = {
  connecte: { icon: 'check-circle-outline', label: 'Connecté', color: '#4caf50' },
  synchronisation: { icon: 'sync', label: 'Synchronisation', color: '#f5c727' },
  deconnecte: { icon: 'wifi-off', label: 'Déconnecté', color: '#f44336' },
  erreur: { icon: 'alert-circle-outline', label: 'Erreur', color: '#ff8a65' },
};

export function getConnectionBadgeLabel(state: ConnectionBadgeState): string {
  return BADGE_VISUALS[state].label;
}

export function mapDomoticzStatusToConnectionBadgeState({
  status,
  isLoading = false,
  hasError = false,
}: {
  status?: string;
  isLoading?: boolean;
  hasError?: boolean;
}): ConnectionBadgeState {
  if (hasError) return 'erreur';
  if (isLoading) return 'synchronisation';
  if (status === 'OK') return 'connecte';
  if (typeof status === 'string' && status.length > 0) return 'deconnecte';
  // Fallback explicite documenté : impossible de déterminer l'état -> "erreur"
  return 'erreur';
}

export function ConnectionBadge({ state }: ConnectionBadgeProps) {
  const visual = BADGE_VISUALS[state];

  return (
    <View
      style={styles.badge}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Statut de connexion : ${visual.label}`}>
      <MaterialCommunityIcons name={visual.icon} size={15} color={visual.color} />
      <ThemedText style={styles.label}>{visual.label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.dark.background,
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
    color: Colors.dark.text,
  },
});
