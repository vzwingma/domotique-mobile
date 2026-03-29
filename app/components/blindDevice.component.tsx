import React, { useContext, useState } from 'react';
import Slider from '@react-native-community/slider';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { getLevel, getStatusLabel, isDeviceOn, overrideNextValue, updateDeviceLevel } from '../controllers/devices.controller';
import { Colors, getGroupColor } from '../enums/Colors';
import { DomoticzBlindsGroups , DomoticzSwitchType } from '../enums/DomoticzEnum';
import IconDomoticzDevice, { performDevicePrimaryAction } from '@/components/IconDomoticzDevice';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { PrimaryIconAction } from './primaryIconAction.component';
import { DeviceCard } from './deviceCard.component';
import { stylesListsDevices } from './deviceRow.styles';

type ViewBlindDeviceProps = {
  device: DomoticzDevice;
};

/**
 * Composant pour afficher un volet Domoticz (individuel ou groupe).
 */
export const ViewBlindDevice: React.FC<ViewBlindDeviceProps> = ({ device }) => {
  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));
  const { domoticzDevicesData, setDomoticzDevicesData } = useContext(DomoticzContext)!;

  const isDimmable = device.switchType === DomoticzSwitchType.SLIDER;
  const statusLabel = getStatusLabel(device, nextValue, flagLabel);
  const isPrimaryActionActive = isDeviceOn(device);

  const primaryAction = (
    <PrimaryIconAction
      accessibilityLabel={`Action principale volet ${device.name}`}
      active={isPrimaryActionActive}
      disabled={!device.isActive}
      onPress={() => performDevicePrimaryAction(device, setDomoticzDevicesData)}>
      <IconDomoticzDevice device={device} interactive={false} />
    </PrimaryIconAction>
  );

  const sliderComponent = isDimmable
    ? (
      <Slider
        disabled={!device.isActive}
        style={device.isActive ? stylesListsDevices.slider : stylesListsDevices.sliderDisabled}
        minimumValue={0} value={getLevel(device)} maximumValue={100}
        step={1}
        minimumTrackTintColor={Colors.dark.slider.trackActive} maximumTrackTintColor={Colors.dark.slider.trackInactive} thumbTintColor={Colors.domoticz.color}
        onValueChange={(value) => overrideNextValue(value, setNextValue)}
        onResponderStart={() => setFlagLabel(true)}
        onResponderEnd={() => {
          updateDeviceLevel(device.idx, device, nextValue, setDomoticzDevicesData);
          setFlagLabel(false);
        }}
      />
    )
    : null;

  const summary = device.isGroup
    ? getBlindGroupSummary(device, domoticzDevicesData)
    : undefined;

  return (
    <DeviceCard
      title={device.name}
      accentColor={getGroupColor(device)}
      statusLabel={statusLabel}
      unit={device.unit}
      summary={summary}
      isActive={device.isActive}
      primaryAction={primaryAction}
      secondaryControl={sliderComponent}
    />
  );
};

function getBlindGroupSummary(device: DomoticzDevice, devices: DomoticzDevice[]): string {
  const members = getBlindGroupMembers(device, devices);
  const connectedMembers = members.filter(m => m.isActive);
  const disconnectedCount = members.length - connectedMembers.length;

  if (members.length === 0) return 'Résumé indisponible';

  const openedCount = connectedMembers.filter(
    m => isDeviceOn(m),
  ).length;
  const connectedCount = connectedMembers.length;
  const mixtePrefix = device.consistantLevel ? '' : 'État mixte — ';
  const disconnectedLabel = disconnectedCount > 1 ? 's' : '';
  const disconnectedSuffix = disconnectedCount > 0
    ? ` • ${disconnectedCount} déconnecté${disconnectedLabel}`
    : '';

  if (connectedCount === 0) {
    const zeroStateLabel = disconnectedCount > 1 ? 's' : '';
    return `${mixtePrefix}0/${members.length} ouverts • ${disconnectedCount} déconnecté${zeroStateLabel}`;
  }
  return `${mixtePrefix}${openedCount}/${connectedCount} ouverts${disconnectedSuffix}`;
}

function getBlindGroupMembers(groupDevice: DomoticzDevice, devices: DomoticzDevice[]): DomoticzDevice[] {
  const groupDefinition = DomoticzBlindsGroups.find(group => group[groupDevice.idx] !== undefined);
  if (!groupDefinition) return [];
  const members = groupDefinition[groupDevice.idx];
  if (!members) return [];
  return members
    .map(idx => devices.find(d => d.idx === idx))
    .filter((d): d is DomoticzDevice => d !== undefined);
}
