import { ThemedText } from "../../components/ThemedText";
import { View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { useContext } from "react";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import { stylesListsDevices } from "./device.component";
import DomoticzParameter from "../models/domoticzParameter.model";
import IconDomoticzParametre from "@/components/IconDomoticzParametre";
import { Colors } from "../enums/Colors";
import { updateParameterValue } from "../controllers/parameters.controller";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzParamListProps = {
  parametre: DomoticzParameter;
};



/**
 * Composant pour afficher un équipement Domoticz.
 * @param device équipement Domoticz
 * @param storeDeviceData setter pour les données des équipements
 */
export const ViewDomoticzParamList: React.FC<DomoticzParamListProps> = ({ parametre }: DomoticzParamListProps) => {

  const { setDomoticzParametersData } = useContext(DomoticzContext)!;
  return (
    <View key={parametre.idx} style={stylesListsDevices.viewBox}>
      <View key={parametre.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzParametre parametre={parametre} />
      </View>
      <View style={stylesListsDevices.contentBox}>

        <View style={stylesListsDevices.labelsBox}>
          <View style={stylesListsDevices.libelleBox}>
            <ThemedText style={{ fontSize: 16, color: 'white' }}>{parametre.name}</ThemedText>
          </View>
          
            <Dropdown
              style={stylesListsDevices.dropdown} containerStyle={stylesListsDevices.listStyle} itemContainerStyle={stylesListsDevices.listItemStyle} itemTextStyle={stylesListsDevices.listItemStyle}
              activeColor={Colors.dark.background} placeholderStyle={stylesListsDevices.placeholderStyle} selectedTextStyle={stylesListsDevices.selectedTextStyle}
              backgroundColor={Colors.dark.titlebackground}
              data={Object.values(parametre.levelNames).map((levelName, index) => ({ id: index * 10, libelle: levelName }))}
              labelField="libelle" valueField="id"
              placeholder={'Selectionnez un mode'}
              value={parametre.level}
              onChange={(level) => updateParameterValue(parametre.idx, parametre, level, setDomoticzParametersData)}
            />
        </View>
      </View>
    </View>
  );
};
