import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { Pressable, StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { getLevel, getStatusLabel, overrideNextValue, updateDeviceLevel } from "../controllers/devices.controller";
import { Colors, getGroupColor } from "../enums/Colors";
import {
  DomoticzBlindsGroups,
  DomoticzDeviceStatus,
  DomoticzDeviceType,
  DomoticzLightsGroups,
  DomoticzSwitchType,
} from "../enums/DomoticzEnum";
import { useContext, useState } from "react";
import IconDomoticzDevice, { performDevicePrimaryAction } from "@/components/IconDomoticzDevice";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import { PrimaryIconAction } from "./primaryIconAction.component";
import { GroupCard } from "./groupCard.component";
import { DisconnectedState } from "./disconnectedState.component";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzDeviceProps = {
  device: DomoticzDevice;
  enhancedUi?: boolean;
};

/**
 * Composant pour afficher un équipement Domoticz.
 */
export const ViewDomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device, enhancedUi = false }: DomoticzDeviceProps) => {

  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));
  const { domoticzDevicesData, setDomoticzDevicesData } = useContext(DomoticzContext)!;

  const isDimmable = device.switchType === DomoticzSwitchType.SLIDER;
  const sliderVisible = enhancedUi ? isDimmable : true;
  const statusLabel = getStatusLabel(device, nextValue, flagLabel);
  const isPrimaryActionActive = device.switchType === DomoticzSwitchType.ONOFF
    ? device.status === DomoticzDeviceStatus.ON
    : device.status !== DomoticzDeviceStatus.OFF && device.level > 0;

  const primaryAction = (
    <PrimaryIconAction
      accessibilityLabel={`Action principale ${device.type.toLowerCase()} ${device.name}`}
      active={isPrimaryActionActive}
      disabled={!device.isActive}
      onPress={() => performDevicePrimaryAction(device, setDomoticzDevicesData)}>
      <IconDomoticzDevice device={device} interactive={false} />
    </PrimaryIconAction>
  );

  /**
   * @returns composant Slider
   */
  const getSliderComponent = () => {
    if (!sliderVisible) {
      return null;
    }

    if (isDimmable) {
      return (
        <Slider
          disabled={!device.isActive}
          style={device.isActive ? stylesListsDevices.slider : stylesListsDevices.sliderDisabled}
          minimumValue={0} value={getLevel(device)} maximumValue={100}
          step={1}
          minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#606060" thumbTintColor={Colors.domoticz.color}
          onValueChange={(value) => { overrideNextValue(value, setNextValue) }}
          onResponderStart={() => { setFlagLabel(true) }}
          onResponderEnd={() => {
            updateDeviceLevel(device.idx, device, nextValue, setDomoticzDevicesData);
            setFlagLabel(false);
          }}
        />
      );
    }

    return <Slider disabled style={stylesListsDevices.sliderDisabled} />;
  };

  const getViewBoxStyle = () => {
    if (enhancedUi && !device.isActive) {
      return stylesListsDevices.viewBoxDisconnected;
    }
    return device.isActive ? stylesListsDevices.viewBox : stylesListsDevices.viewBoxDisabled;
  };

  const getValueBoxStyle = () => {
    return device.isActive ? stylesListsDevices.valueBox : stylesListsDevices.valueBoxDisconnected;
  };

  const renderGroupCommands = () => {
    const isLightGroup = device.type === DomoticzDeviceType.LUMIERE;
    const activateLabel = isLightGroup ? 'Tout allumer' : 'Ouvrir';
    const deactivateLabel = isLightGroup ? 'Tout éteindre' : 'Fermer';

    return (
      <View style={stylesListsDevices.groupCommandsRow}>
        <Pressable
          style={({ pressed }) => [
            stylesListsDevices.groupCommandButton,
            device.isActive ? undefined : stylesListsDevices.groupCommandButtonDisabled,
            pressed && device.isActive ? stylesListsDevices.groupCommandButtonPressed : undefined,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${activateLabel} le groupe ${device.name}`}
          accessibilityState={{ disabled: !device.isActive }}
          disabled={!device.isActive}
          onPress={() => updateDeviceLevel(device.idx, device, 100, setDomoticzDevicesData)}>
          <ThemedText style={stylesListsDevices.groupCommandText}>{activateLabel}</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            stylesListsDevices.groupCommandButton,
            device.isActive ? undefined : stylesListsDevices.groupCommandButtonDisabled,
            pressed && device.isActive ? stylesListsDevices.groupCommandButtonPressed : undefined,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${deactivateLabel} le groupe ${device.name}`}
          accessibilityState={{ disabled: !device.isActive }}
          disabled={!device.isActive}
          onPress={() => updateDeviceLevel(device.idx, device, 0, setDomoticzDevicesData)}>
          <ThemedText style={stylesListsDevices.groupCommandText}>{deactivateLabel}</ThemedText>
        </Pressable>
      </View>
    );
  };

  if (enhancedUi && device.isGroup) {
    const summary = getGroupSummary(device, domoticzDevicesData);
    return (
      <GroupCard
        title={device.name}
        accentColor={getGroupColor(device)}
        statusLabel={statusLabel}
        unit={device.unit}
        summary={summary}
        isActive={device.isActive}
        primaryAction={primaryAction}
        commands={renderGroupCommands()}
        secondaryControl={getSliderComponent()}
      />
    );
  }

  return (
    <View key={device.idx} style={getViewBoxStyle()}>
      <View key={device.idx} style={stylesListsDevices.iconBox}>
        {enhancedUi ? primaryAction : <IconDomoticzDevice device={device} />}
      </View>
      <View style={stylesListsDevices.contentBox}>
        <View style={device.consistantLevel ? stylesListsDevices.labelsBox : stylesListsDevices.labelsBoxUnconsistent}>
          <View style={stylesListsDevices.libelleBox}>
            <ThemedText style={{ fontSize: 16, color: getGroupColor(device) }}>{device.name}</ThemedText>
          </View>
          <View style={getValueBoxStyle()}>
            {
              !device.isActive && enhancedUi
                ? <DisconnectedState compact />
                : <ThemedText numberOfLines={1} style={stylesListsDevices.textLevel}>{statusLabel}</ThemedText>
            }
          </View>
          {
            (device.isActive) &&
            <View style={stylesListsDevices.unitBox}>
              <ThemedText style={stylesListsDevices.textLevel}>{device.unit}</ThemedText>
            </View>
          }
        </View>
        {getSliderComponent()}
      </View>
    </View>
  );
};

function getGroupSummary(device: DomoticzDevice, devices: DomoticzDevice[]): string {
  const members = getGroupMembers(device, devices);
  const connectedMembers = members.filter(member => member.isActive);
  const disconnectedCount = members.length - connectedMembers.length;

  if (members.length === 0) {
    return "Résumé indisponible";
  }

  if (device.type === DomoticzDeviceType.LUMIERE) {
    const activeCount = connectedMembers.filter(
      member => member.status !== DomoticzDeviceStatus.OFF && member.level > 0,
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

  if (device.type === DomoticzDeviceType.VOLET) {
    const openedCount = connectedMembers.filter(
      member => member.status !== DomoticzDeviceStatus.OFF && member.level > 0,
    ).length;
    const connectedCount = connectedMembers.length;
    const mixtePrefix = device.consistantLevel ? '' : 'État mixte — ';
    const disconnectedSuffix = disconnectedCount > 0
      ? ` • ${disconnectedCount} déconnecté${disconnectedCount > 1 ? 's' : ''}`
      : '';
    if (connectedCount === 0) {
      return `${mixtePrefix}0/${members.length} ouverts • ${disconnectedCount} déconnecté${disconnectedCount > 1 ? 's' : ''}`;
    }
    return `${mixtePrefix}${openedCount}/${connectedCount} ouverts${disconnectedSuffix}`;
  }

  return "Résumé indisponible";
}

function getGroupMembers(groupDevice: DomoticzDevice, devices: DomoticzDevice[]): DomoticzDevice[] {
  const mapping = groupDevice.type === DomoticzDeviceType.LUMIERE ? DomoticzLightsGroups : DomoticzBlindsGroups;
  const groupDefinition = mapping.find(group => group[groupDevice.idx] !== undefined);

  if (!groupDefinition) {
    return [];
  }

  const members = groupDefinition[groupDevice.idx];
  if (!members) {
    return [];
  }

  return members
    .map(memberIdx => devices.find(device => device.idx === memberIdx))
    .filter((device): device is DomoticzDevice => device !== undefined);
}

export const stylesListsDevices = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 84,
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
  },
  viewBoxDisabled: {
    flexDirection: 'row',
    height: 84,
    width: '100%',
    padding: 10,
    margin: 1,
    opacity: 0.2,
  },
  viewBoxDisconnected: {
    flexDirection: 'row',
    height: 84,
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#7f2b2b',
    borderWidth: 1,
    backgroundColor: '#1a1212',
  },
  iconBox: {
    marginRight: 10,
    height: 60,
    width: 60
  },
  contentBox: {
    flexDirection: "column",
    width: "100%",
    paddingRight: 75,
    justifyContent: "center",
  },
  labelsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    width: '100%',
  },
  labelsBoxUnconsistent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    opacity: 0.5,
    width: '100%'
  },
  libelleBox: {
    flex: 1,
    minWidth: 0,
  },
  valueBox: {
    flexDirection: "column",
    marginLeft: 0,
    width: 80,
    alignItems: 'flex-end',
  },
  valueBoxDisconnected: {
    flexDirection: "column",
    marginLeft: 0,
    width: 120,
    alignItems: 'flex-end',
  },
  unitBox: {
    width: 20,
    alignItems: 'flex-end',
  },
  // SLIDER
  slider: {
    height: 40,
    marginTop: -10,
  },
  sliderDisabled: {
    height: 40,
    marginTop: -10,
    opacity: 0
  },
  textLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.domoticz.color,
    paddingBottom: 7,
    textAlign: "right",
  },
  textName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 200,
  },
  groupCommandsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  groupCommandButton: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 32,
    backgroundColor: '#141414',
  },
  groupCommandButtonPressed: {
    backgroundColor: '#242424',
  },
  groupCommandButtonDisabled: {
    opacity: 0.45,
  },
  groupCommandText: {
    color: '#e8e8e8',
    fontWeight: '600',
    fontSize: 12,
  },
  // DROPDOWN
  dropdown: {
    flexDirection: "column",
    marginLeft: -150,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    width: 150,
    backgroundColor: Colors.dark.background,
    color: Colors.domoticz.color,
  },

  // Style de la liste déroulante d'un dropdown
  listStyle: {
    backgroundColor: Colors.dark.background,
  },
  // Style des éléments de la liste déroulante d'un dropdown
  listItemStyle: {
    margin: 0,
    padding: 0,
    height: 'auto',
    color: Colors.domoticz.color,
    fontFamily: "BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
  },
  placeholderStyle: {
    fontWeight: 'normal',
    paddingLeft: 10,
    color: 'gray',
  },
  selectedTextStyle: {
    color: Colors.domoticz.color,
    paddingLeft: 10,
    fontWeight: 'bold',
  },

  infovalue: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    width: 180,
    backgroundColor: Colors.dark.background,
    color: Colors.domoticz.color,
  },
});

