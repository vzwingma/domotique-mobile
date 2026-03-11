import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/app/enums/Colors';

export type BlindActionsBarProps = {
  isActive: boolean;
  onOpen: () => void;
  onStop: () => void;
  onClose: () => void;
};

export const BlindActionsBar: React.FC<BlindActionsBarProps> = ({ isActive, onOpen, onStop, onClose }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !isActive && styles.buttonDisabled]}
        onPress={isActive ? onOpen : undefined}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir le volet"
        accessibilityState={{ disabled: !isActive }}
      >
        <Ionicons name="chevron-up" size={22} color={isActive ? Colors.domoticz.color : '#555'} />
        <ThemedText style={[styles.label, !isActive && styles.labelDisabled]}>Ouvrir</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !isActive && styles.buttonDisabled]}
        onPress={isActive ? onStop : undefined}
        accessibilityRole="button"
        accessibilityLabel="Stopper le volet"
        accessibilityState={{ disabled: !isActive }}
      >
        <Ionicons name="stop" size={22} color={isActive ? '#fff' : '#555'} />
        <ThemedText style={[styles.label, !isActive && styles.labelDisabled]}>Stop</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !isActive && styles.buttonDisabled]}
        onPress={isActive ? onClose : undefined}
        accessibilityRole="button"
        accessibilityLabel="Fermer le volet"
        accessibilityState={{ disabled: !isActive }}
      >
        <Ionicons name="chevron-down" size={22} color={isActive ? Colors.domoticz.color : '#555'} />
        <ThemedText style={[styles.label, !isActive && styles.labelDisabled]}>Fermer</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 4,
  },
  button: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 2,
  },
  labelDisabled: {
    color: '#555',
  },
});
