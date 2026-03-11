import React, { useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import Slider from '@react-native-community/slider';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { ThemedText } from '@/components/ThemedText';
import { getLevel, getStatusLabel, overrideNextValue, updateDeviceLevel } from '../controllers/devices.controller';
import { Colors, getGroupColor } from '../enums/Colors';
import { DomoticzDeviceStatus, DomoticzLightsGroups } from '../enums/DomoticzEnum';
import { DomoticzSwitchType } from '../enums/DomoticzEnum';
import IconDomoticzDevice, { performDevicePrimaryAction } from '@/components/IconDomoticzDevice';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { PrimaryIconAction } from './primaryIconAction.component';
import { GroupCard } from './groupCard.component';
import { DisconnectedState } from './disconnectedState.component';
import { stylesListsDevices } from './deviceRow.styles';

type ViewLightDeviceProps = {
  device: DomoticzDevice;
  enhancedUi?: boolean;
};

/**
 * Composant pour afficher une lumière Domoticz (individuelle ou groupe).
 */
export const ViewLightDevice: React.FC<ViewLightDeviceProps> = ({ device, enhancedUi = false }) => {
  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));
  const { domoticzDevicesData, setDomoticzDevicesData } = useContext(DomoticzContext)!;

  const isDimmable = device.switchType === DomoticzSwitchType.SLIDER;
  const sliderVisible = enhancedUi ? isDimmable : true;
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

  const sliderComponent = sliderVisible
    ? isDimmable
      ? (
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
      )
      : <Slider disabled style={stylesListsDevices.sliderDisabled} />
    : null;

  if (enhancedUi && device.isGroup) {
    const summary = getLightGroupSummary(device, domoticzDevicesData);
    const commands = (
      <View style={stylesListsDevices.groupCommandsRow}>
        <Pressable
          style={({ pressed }) => [
            stylesListsDevices.groupCommandButton,
            device.isActive ? undefined : stylesListsDevices.groupCommandButtonDisabled,
            pressed && device.isActive ? stylesListsDevices.groupCommandButtonPressed : undefined,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Tout allumer le groupe ${device.name}`}
          accessibilityState={{ disabled: !device.isActive }}
          disabled={!device.isActive}
          onPress={() => updateDeviceLevel(device.idx, device, 100, setDomoticzDevicesData)}>
          <ThemedText style={stylesListsDevices.groupCommandText}>Tout allumer</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            stylesListsDevices.groupCommandButton,
            device.isActive ? undefined : stylesListsDevices.groupCommandButtonDisabled,
            pressed && device.isActive ? stylesListsDevices.groupCommandButtonPressed : undefined,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Tout éteindre le groupe ${device.name}`}
          accessibilityState={{ disabled: !device.isActive }}
          disabled={!device.isActive}
          onPress={() => updateDeviceLevel(device.idx, device, 0, setDomoticzDevicesData)}>
          <ThemedText style={stylesListsDevices.groupCommandText}>Tout éteindre</ThemedText>
        </Pressable>
      </View>
    );

    return (
      <GroupCard
        title={device.name}
        accentColor={getGroupColor(device)}
        statusLabel={statusLabel}
        unit={device.unit}
        summary={summary}
        isActive={device.isActive}
        primaryAction={primaryAction}
        commands={commands}
        secondaryControl={sliderComponent}
      />
    );
  }

  const viewBoxStyle = enhancedUi && !device.isActive
    ? stylesListsDevices.viewBoxDisconnected
    : device.isActive ? stylesListsDevices.viewBox : stylesListsDevices.viewBoxDisabled;

  return (
    <View key={device.idx} style={viewBoxStyle}>
      <View key={device.idx} style={stylesListsDevices.iconBox}>
        {enhancedUi ? primaryAction : <IconDomoticzDevice device={device} />}
      </View>
      <View style={stylesListsDevices.contentBox}>
        <View style={device.consistantLevel ? stylesListsDevices.labelsBox : stylesListsDevices.labelsBoxUnconsistent}>
          <View style={stylesListsDevices.libelleBox}>
            <ThemedText style={{ fontSize: 16, color: getGroupColor(device) }}>{device.name}</ThemedText>
          </View>
          <View style={device.isActive ? stylesListsDevices.valueBox : stylesListsDevices.valueBoxDisconnected}>
            {!device.isActive && enhancedUi
              ? <DisconnectedState compact />
              : <ThemedText numberOfLines={1} style={stylesListsDevices.textLevel}>{statusLabel}</ThemedText>
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
  const disconnectedSuffix = disconnectedCount > 0
    ? ` • ${disconnectedCount} déconnectée${disconnectedCount > 1 ? 's' : ''}`
    : '';

  if (connectedCount === 0) {
    return `${mixtePrefix}0/${members.length} allumées • ${disconnectedCount} déconnectée${disconnectedCount > 1 ? 's' : ''}`;
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
