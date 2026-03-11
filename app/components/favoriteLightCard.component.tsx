import React, { useContext } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import DomoticzDevice from '../models/domoticzDevice.model';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { DomoticzDeviceStatus } from '../enums/DomoticzEnum';
import IconDomoticzDevice, { performDevicePrimaryAction } from '@/components/IconDomoticzDevice';
import { PrimaryIconAction } from './primaryIconAction.component';
import { Colors, getGroupColor } from '../enums/Colors';
import { getLevel, getStatusLabel } from '../controllers/devices.controller';
import { DisconnectedState } from './disconnectedState.component';

type FavoriteLightCardProps = {
  device: DomoticzDevice;
};

/**
 * Carte favori pour une lumière : action rapide Allumer / Éteindre.
 */
export const FavoriteLightCard: React.FC<FavoriteLightCardProps> = ({ device }) => {
  const { setDomoticzDevicesData } = useContext(DomoticzContext)!;

  const isOn = device.status !== DomoticzDeviceStatus.OFF && device.level > 0;
  const statusLabel = getStatusLabel(device, getLevel(device), false);
  const actionLabel = isOn ? 'Éteindre' : 'Allumer';

  const triggerPrimaryAction = () => performDevicePrimaryAction(device, setDomoticzDevicesData);

  return (
    <View style={[styles.card, !device.isActive && styles.cardDisconnected]}>
      <View style={styles.topRow}>
        <PrimaryIconAction
          accessibilityLabel={`Action rapide ${actionLabel.toLowerCase()} ${device.name}`}
          active={isOn}
          disabled={!device.isActive}
          onPress={triggerPrimaryAction}>
          <IconDomoticzDevice device={device} interactive={false} />
        </PrimaryIconAction>

        <View style={styles.content}>
          <ThemedText style={[styles.title, { color: getGroupColor(device) }]} numberOfLines={1}>
            {device.name}
          </ThemedText>
          {device.isActive ? (
            <ThemedText style={styles.status} numberOfLines={1}>
              État : {statusLabel}
            </ThemedText>
          ) : (
            <DisconnectedState />
          )}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${device.name}`}
        accessibilityState={{ disabled: !device.isActive }}
        disabled={!device.isActive}
        onPress={triggerPrimaryAction}
        style={({ pressed }) => [
          styles.quickActionButton,
          pressed && device.isActive ? styles.quickActionButtonPressed : undefined,
          device.isActive ? undefined : styles.quickActionButtonDisabled,
        ]}>
        <ThemedText style={styles.quickActionText}>{actionLabel}</ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
    gap: 8,
  },
  cardDisconnected: {
    borderColor: '#7f2b2b',
    backgroundColor: '#1a1212',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    fontSize: 16,
    color: '#fff',
  },
  status: {
    fontSize: 13,
    color: '#d6d6d6',
  },
  quickActionButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.domoticz.color,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1a08',
  },
  quickActionButtonPressed: {
    backgroundColor: '#2b2410',
  },
  quickActionButtonDisabled: {
    opacity: 0.4,
  },
  quickActionText: {
    color: Colors.domoticz.color,
    fontWeight: '700',
    fontSize: 13,
  },
});
