import DomoticzDevice from "@/app/models/domoticzDevice.model";
import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, View } from "react-native";
import Slider from '@react-native-community/slider';
import { updateDeviceLevel } from "../controllers/devices.controller";
import { Colors, getGroupColor } from "../enums/Colors";
import { DomoticzDeviceStatus, DomoticzDeviceType, DomoticzSwitchType } from "../enums/DomoticzEnum";
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



/**
 * retourrne le niveau de l'équipement
 * @param device  équipement Domoticz
 * @returns niveau de l'équipement :
 */
function getLevel(device: DomoticzDevice): number {
  return device.status === DomoticzDeviceStatus.OFF ? 0.1 : device.level
}


/**
 * Surcharge de la valeur du slider pour la mettre à jour
 * @param value prochain niveau de l'équipement
 * @param setNextValue  fonction pour mettre à jour le prochain niveau de l'équipement
 */
function overrideNextValue(value: number, setNextValue: React.Dispatch<React.SetStateAction<number>>) {
  if (value <= 0) {
    value = 0.1;
  }
  else if (value >= 99) {
    value = 100;
  }
  setNextValue(value);
}

/**
 * Fonction pour le label du statut de l'équipement. Si on est en mode édition, on affiche le prochain état entre parenthèses.
 */
function getStatusLabel(device: DomoticzDevice, nextValue: number, flagLabel: boolean): string {
  // T06 — inactif
  if (!device.isActive) {
    return "Déconnecté";
  }

  // Édition en cours (slider déplacé)
  if (flagLabel) {
    let nextLabel = "(";
    if (nextValue <= 0.1) nextLabel += DomoticzDeviceStatus.OFF;
    else nextLabel += nextValue;
    nextLabel += ")";
    return nextLabel;
  }

  // T07 — volets
  if (device.type === DomoticzDeviceType.VOLET) {
    device.unit = "";
    if (device.status === DomoticzDeviceStatus.OFF) return "Fermé";
    if (device.status === DomoticzDeviceStatus.ON) return "Ouvert";
    return device.status;
  }

  // T04 — groupes de lumières
  if (device.isGroup && device.type === DomoticzDeviceType.LUMIERE) {
    device.unit = "";
    if (!device.consistantLevel) return "Mixte";
    if (device.status === DomoticzDeviceStatus.OFF || device.level === 0) return "Éteintes";
    if (device.level >= 100) return "Allumées";
    device.unit = "%";
    return device.level + "";
  }

  // T05 — lumières individuelles
  if (!device.isGroup && device.type === DomoticzDeviceType.LUMIERE) {
    if (device.switchType === DomoticzSwitchType.ONOFF) {
      device.unit = "";
      if (device.status === DomoticzDeviceStatus.OFF) return "Éteint";
      return "Allumé";
    }
    // Variateur (SLIDER)
    if (device.status === DomoticzDeviceStatus.OFF) {
      device.unit = "";
      return "Éteint";
    }
    if (!device.consistantLevel) {
      device.unit = "";
      return "Mixte";
    }
    device.unit = "%";
    return device.level + "";
  }

  // Comportement par défaut
  if (device.switchType === DomoticzSwitchType.ONOFF) {
    device.unit = "";
    return device.status;
  }
  if (device.status === DomoticzDeviceStatus.OFF) {
    device.unit = "";
    return DomoticzDeviceStatus.OFF;
  }
  if (!device.consistantLevel) {
    device.unit = "";
    return "Mixte";
  }
  device.unit = "%";
  return device.level + "";
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
