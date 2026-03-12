import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Colors } from '../enums/Colors';

type PrimaryIconActionProps = {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  active: boolean;
  disabled?: boolean;
};

/**
 * Bouton icône principal pour les cartes Lumières / Volets.
 * États visuels couverts : normal, pressed, active, inactive, disabled.
 */
export const PrimaryIconAction: React.FC<PrimaryIconActionProps> = ({
  onPress,
  children,
  accessibilityLabel,
  active,
  disabled = false,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        pressed && !disabled ? styles.pressed : undefined,
        disabled ? styles.disabled : undefined,
      ]}>
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minWidth: 44,
    minHeight: 44,
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    borderColor: Colors.domoticz.color,
    backgroundColor: '#1f1a08',
  },
  inactive: {
    borderColor: '#4f4f4f',
    backgroundColor: '#111111',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#2a2a2a',
  },
  disabled: {
    opacity: 0.45,
  },
});

