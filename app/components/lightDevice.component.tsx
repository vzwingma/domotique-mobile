import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import Slider from '@react-native-community/slider';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { ThemedText } from '@/components/ThemedText';
import { getLevel, getStatusLabel, overrideNextValue, updateDeviceLevel } from '../controllers/devices.controller';
import { Colors, getGroupColor } from '../enums/Colors';
import { DomoticzDeviceStatus, DomoticzLightsGroups, DomoticzSwitchType } from '../enums/DomoticzEnum';
import IconDomoticzDevice, { performDevicePrimaryAction } from '@/components/IconDomoticzDevice';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { PrimaryIconAction } from './primaryIconAction.component';
import { GroupCard } from './groupCard.component';
import { DisconnectedState } from './disconnectedState.component';
import { stylesListsDevices } from './deviceRow.styles';

type ViewLightDeviceProps = {
  device: DomoticzDevice;
};

/**
 * Composant pour afficher une lumière Domoticz (individuelle ou groupe).
 */
export const ViewLightDevice: React.FC<ViewLightDeviceProps> = ({ device }) => {
  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));
  const { domoticzDevicesData, setDomoticzDevicesData } = useContext(DomoticzContext)!;

  const isDimmable = device.switchType === DomoticzSwitchType.SLIDER;
  const sliderVisible = isDimmable;
  const statusLabel = getStatusLabel(device, nextValue, flagLabel);
  const isPrimaryActionActive = device.switchType === DomoticzSwitchType.ONOFF
    ? device.status === 'On'
    : device.status !== 'Off' && device.level > 0;

  const primaryAction = (
    <PrimaryIconAction
      accessibilityLabel={`Action principale lumière ${device.name}`}
      active={isPrimaryActionActive}
      disabled={!device.isActive}
      onPress={() => performDevicePrimaryAction(device, setDomoticzDevicesData)}>
      <IconDomoticzDevice device={device} interactive={false} />
    </PrimaryIconAction>
  );

  const dimmableSlider = (
    <Slider
      disabled={!device.isActive}
      style={device.isActive ? stylesListsDevices.slider : stylesListsDevices.sliderDisabled}
      minimumValue={0} value={getLevel(device)} maximumValue={100}
      step={1}
      minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor={Colors.domoticz.color}
      onValueChange={(value) => overrideNextValue(value, setNextValue)}
      onResponderStart={() => setFlagLabel(true)}
      onResponderEnd={() => {
        updateDeviceLevel(device.idx, device, nextValue, setDomoticzDevicesData);
        setFlagLabel(false);
      }}
    />
  );

  const disabledSlider = <Slider disabled style={stylesListsDevices.sliderDisabled} />;

  const sliderContent = isDimmable ? dimmableSlider : disabledSlider;
  const sliderComponent = sliderVisible ? sliderContent : null;

  if (device.isGroup) {
    const summary = getLightGroupSummary(device, domoticzDevicesData);

    return (
      <GroupCard
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
  }

  const viewBoxStyle = device.isActive
    ? stylesListsDevices.viewBox
    : stylesListsDevices.viewBoxDisconnected;

  return (
    <View key={device.idx} style={viewBoxStyle}>
      <View key={device.idx} style={stylesListsDevices.iconBox}>
        {primaryAction}
      </View>
      <View style={stylesListsDevices.contentBox}>
        <View style={device.consistantLevel ? stylesListsDevices.labelsBox : stylesListsDevices.labelsBoxUnconsistent}>
          <View style={stylesListsDevices.libelleBox}>
            <ThemedText style={{ fontSize: 16, color: getGroupColor(device) }}>{device.name}</ThemedText>
          </View>
          <View style={device.isActive ? stylesListsDevices.valueBox : stylesListsDevices.valueBoxDisconnected}>
            {device.isActive
              ? <ThemedText numberOfLines={1} style={stylesListsDevices.textLevel}>{statusLabel}</ThemedText>
              : <DisconnectedState />
            }
          </View>
          {device.isActive && (
            <View style={stylesListsDevices.unitBox}>
              <ThemedText style={stylesListsDevices.textLevel}>{device.unit}</ThemedText>
            </View>
          )}
        </View>
        {sliderComponent}
      </View>
    </View>
  );
};

function getLightGroupSummary(device: DomoticzDevice, devices: DomoticzDevice[]): string {
  const members = getLightGroupMembers(device, devices);
  const connectedMembers = members.filter(m => m.isActive);
  const disconnectedCount = members.length - connectedMembers.length;

  if (members.length === 0) return 'Résumé indisponible';

  const activeCount = connectedMembers.filter(
    m => m.status !== DomoticzDeviceStatus.OFF && m.level > 0,
  ).length;
  const connectedCount = connectedMembers.length;
  const mixtePrefix = device.consistantLevel ? '' : 'État mixte — ';
  const disconnectedPlural = disconnectedCount > 1 ? 's' : '';
  const disconnectedSuffix = disconnectedCount > 0
    ? ` • ${disconnectedCount} déconnectée${disconnectedPlural}`
    : '';

  if (connectedCount === 0) {
    return `${mixtePrefix}0/${members.length} allumées • ${disconnectedCount} déconnectée${disconnectedPlural}`;
  }
  return `${mixtePrefix}${activeCount}/${connectedCount} allumées${disconnectedSuffix}`;
}

function getLightGroupMembers(groupDevice: DomoticzDevice, devices: DomoticzDevice[]): DomoticzDevice[] {
  const groupDefinition = DomoticzLightsGroups.find(group => group[groupDevice.idx] !== undefined);
  if (!groupDefinition) return [];
  const members = groupDefinition[groupDevice.idx];
  if (!members) return [];
  return members
    .map(idx => devices.find(d => d.idx === idx))
    .filter((d): d is DomoticzDevice => d !== undefined);
}
