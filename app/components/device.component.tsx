import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { getLevel, getStatusLabel, overrideNextValue, updateDeviceLevel } from "../controllers/devices.controller";
import { Colors, getGroupColor } from "../enums/Colors";
import { DomoticzSwitchType } from "../enums/DomoticzEnum";
import { useContext, useState } from "react";
import IconDomoticzDevice from "@/components/IconDomoticzDevice";
import { DomoticzContext } from "../services/DomoticzContextProvider";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzDeviceProps = {
  device: DomoticzDevice;
};



/**
 * Composant pour afficher un équipement Domoticz.
 * @param device équipement Domoticz
 * @param storeDeviceData setter pour les données des équipements
 */
export const ViewDomoticzDevice: React.FC<DomoticzDeviceProps> = ({ device }: DomoticzDeviceProps) => {

  const [flagLabel, setFlagLabel] = useState<boolean>(false);
  const [nextValue, setNextValue] = useState<number>(getLevel(device));
  const { setDomoticzDevicesData } = useContext(DomoticzContext)!;

  /**
   * 
   * @returns composant Slider
   */
  const getSliderComponent = () => {
    if (device.switchType === DomoticzSwitchType.SLIDER) {
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
    return device.isActive ? stylesListsDevices.viewBox : stylesListsDevices.viewBoxDisabled;
  };

  return (
    <View key={device.idx} style={getViewBoxStyle()}>
      <View key={device.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzDevice device={device} />
      </View>
      <View style={stylesListsDevices.contentBox}>
        <View style={device.consistantLevel ? stylesListsDevices.labelsBox : stylesListsDevices.labelsBoxUnconsistent}>
          <View style={stylesListsDevices.libelleBox}>
            <ThemedText style={{ fontSize: 16, color: getGroupColor(device) }}>{device.name}</ThemedText>
          </View>
          <View style={stylesListsDevices.valueBox}>
            <ThemedText style={stylesListsDevices.textLevel}>{getStatusLabel(device, nextValue, flagLabel)}</ThemedText>
          </View>
          <View style={stylesListsDevices.unitBox}>
            <ThemedText style={stylesListsDevices.textLevel}>{device.unit}</ThemedText>
          </View>
        </View>
        {getSliderComponent()}
      </View>
    </View>
  );
};


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
    width: "100%",
  },   
  valueBox: {
    flexDirection: "column",
    marginLeft: -80,
    width: 60
  },  
  unitBox: {
    width: 20
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
  // DROPDOWN
      // Dropdown de sélection
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
        flexDirection: "column",
        marginLeft: -150,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        width: 150,
        backgroundColor: Colors.dark.background,
        color: Colors.domoticz.color,
    },    
});
