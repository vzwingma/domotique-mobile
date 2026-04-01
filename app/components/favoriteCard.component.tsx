import React, { useContext, useState } from 'react';
import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import DomoticzDevice from '../models/domoticzDevice.model';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { DomoticzDeviceStatus, DomoticzDeviceLabel, DomoticzDeviceType, DomoticzSwitchType } from '../enums/DomoticzEnum';
import IconDomoticzDevice, { performDevicePrimaryAction } from '@/components/IconDomoticzDevice';
import { PrimaryIconAction } from './primaryIconAction.component';
import { Colors, getGroupColor, PROFILES_ENV } from '../enums/Colors';
import { getLevel, getStatusLabel, isDeviceOn, overrideNextValue, updateDeviceLevel } from '../controllers/devices.controller';
import { DisconnectedState } from './disconnectedState.component';
import { stylesListsDevices } from './deviceRow.styles';

type FavoriteCardProps = {
  device: DomoticzDevice;
};

/**
 * Carte favori orientée "action rapide" (1 tap).
 * Gère lumières (Allumer/Éteindre) et volets (Ouvrir/Fermer).
 * En mode previewC (EXPO_PUBLIC_MY_ENVIRONMENT=previewC), affiche un slider
 * pour les volets et les lumières dimmables.
 */
export const FavoriteCard: React.FC<FavoriteCardProps> = ({ device }) => {
  const { setDomoticzDevicesData } = useContext(DomoticzContext)!;
  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));

  const hasDimmableSlider = process.env.EXPO_PUBLIC_MY_ENVIRONMENT === PROFILES_ENV.C
    && device.isActive
    && (device.type === DomoticzDeviceType.VOLET || device.switchType === DomoticzSwitchType.SLIDER);

  const deviceOn = isDeviceOn(device);
  const statusLabel = getStatusLabel(device, nextValue, flagLabel);

  const voletActionLabel = deviceOn ? DomoticzDeviceLabel.BLIND_CLOSE_ACTION : DomoticzDeviceLabel.BLIND_OPEN_ACTION;
  const lightActionLabel = deviceOn ? DomoticzDeviceLabel.LIGHT_OFF_ACTION : DomoticzDeviceLabel.LIGHT_ON_ACTION;
  const actionLabel = device.type === DomoticzDeviceType.VOLET ? voletActionLabel : lightActionLabel;

  const isPrimaryActionActive = device.switchType === DomoticzSwitchType.ONOFF
    ? device.status === DomoticzDeviceStatus.ON
    : deviceOn;

  const triggerPrimaryAction = () => performDevicePrimaryAction(device, setDomoticzDevicesData);

  const sliderComponent = hasDimmableSlider ? (
    <Slider
      disabled={!device.isActive}
      style={stylesListsDevices.slider}
      minimumValue={0}
      value={getLevel(device)}
      maximumValue={100}
      step={1}
      minimumTrackTintColor={Colors.dark.slider.trackActive}
      maximumTrackTintColor={Colors.dark.slider.trackInactive}
      thumbTintColor={Colors.domoticz.color}
      onValueChange={(value) => overrideNextValue(value, setNextValue)}
      onResponderStart={() => setFlagLabel(true)}
      onResponderEnd={() => {
        updateDeviceLevel(device.idx, device, nextValue, setDomoticzDevicesData);
        setFlagLabel(false);
      }}
    />
  ) : null;

  return (
    <View style={[styles.card, !device.isActive && styles.cardDisconnected]}>
      <PrimaryIconAction
        accessibilityLabel={`Action rapide ${actionLabel.toLowerCase()} ${device.name}`}
        active={isPrimaryActionActive}
        disabled={!device.isActive}
        onPress={triggerPrimaryAction}>
        <IconDomoticzDevice device={device} interactive={false} />
      </PrimaryIconAction>

      <View style={[styles.content, hasDimmableSlider && styles.contentWithSlider]}>
        <ThemedText style={[styles.title, hasDimmableSlider && styles.titleCompact, { color: getGroupColor(device) }]} numberOfLines={1}>
          {device.name}
        </ThemedText>
        {device.isActive ? (
          <ThemedText style={[styles.status, hasDimmableSlider && styles.statusCompact]} numberOfLines={1}>
            État : {statusLabel} {device.unit}
          </ThemedText>
        ) : (
          <DisconnectedState />
        )}
        {sliderComponent}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 1,
    borderColor: Colors.dark.border,
    borderWidth: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    gap: 10,
  },
  cardDisconnected: {
    borderColor: Colors.dark.disconnected.border,
    backgroundColor: Colors.dark.disconnected.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  contentWithSlider: {
    justifyContent: 'flex-start',
    gap: 0,
  },
  title: {
    fontSize: 16,
    color: Colors.dark.tint,
  },
  titleCompact: {
    lineHeight: 18,
  },
  status: {
    fontSize: 11,
    color: Colors.dark.labelSecondary,
  },
  statusCompact: {
    lineHeight: 13,
  },
  quickActionButton: {
    minWidth: 90,
    minHeight: 44,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.domoticz.color,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.emphasis.active,
  },
  quickActionButtonPressed: {
    backgroundColor: Colors.dark.emphasis.activePressed,
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
