import { ThemedText } from "../../components/ThemedText";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useContext } from "react";
import { DomoticzContext } from "../services/DomoticzContextProvider";
import { stylesListsDevices } from "./device.component";
import DomoticzParameter from "../models/domoticzParameter.model";
import IconDomoticzParametre, { getIconDomoticzParametre } from "@/components/IconDomoticzParametre";
import { Colors } from "../enums/Colors";
import { updateParameterValue } from "../controllers/parameters.controller";
import { DomoticzDeviceType } from "../enums/DomoticzEnum";

// Définition des propriétés d'un équipement Domoticz
export type DomoticzParamListProps = {
  parametre: DomoticzParameter;
};

/**
 * T16 — Renommer certains noms de paramètres pour l'affichage
 */
function getParametreDisplayName(name: string): string {
  if (name === "Phase") return "Moment";
  return name;
}

/**
 * T17 — Labels spéciaux pour le paramètre Présence
 */
function getParametreDisplayLabel(parametreName: string, levelName: string): string {
  if (parametreName.includes("Présence")) {
    if (levelName === "Présent") return "Maison occupée";
    if (levelName === "Absent") return "Maison vide";
  }
  return levelName;
}

/**
 * Composant pour afficher un paramètre Domoticz avec chips de sélection.
 * T15 — Chips segmentés à la place du Dropdown
 */
export const ViewDomoticzParamList: React.FC<DomoticzParamListProps> = ({ parametre }: DomoticzParamListProps) => {

  const { setDomoticzParametersData } = useContext(DomoticzContext)!;
  return (
    <View key={parametre.idx} style={stylesListsDevices.viewBox}>
      <View key={parametre.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzParametre name={getIconDomoticzParametre(parametre)} color={"white"} size={60} />
      </View>
      <View style={stylesListsDevices.contentBox}>
        <View style={stylesListsDevices.labelsBox}>
          <View style={stylesListsDevices.libelleBox}>
            {/* T16 — nom d'affichage */}
            <ThemedText style={{ fontSize: 16, color: 'white' }}>{getParametreDisplayName(parametre.name)}</ThemedText>
          </View>

          {/* T15 — chips segmentés */}
          {parametre.type === DomoticzDeviceType.PARAMETRE &&
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={chipStyles.chipsContainer}>
              {Object.values(parametre.levelNames).map((levelName, index) => {
                const levelValue = index * 10;
                const isSelected = parametre.level === levelValue;
                return (
                  <TouchableOpacity
                    key={levelValue}
                    style={[chipStyles.chip, isSelected && chipStyles.chipSelected]}
                    onPress={() => updateParameterValue(parametre.idx, parametre, { id: levelValue, libelle: levelName }, setDomoticzParametersData)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={getParametreDisplayLabel(parametre.name, levelName)}
                  >
                    <ThemedText style={[chipStyles.chipText, isSelected && chipStyles.chipTextSelected]}>
                      {getParametreDisplayLabel(parametre.name, levelName)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          }

          {parametre.type === DomoticzDeviceType.PARAMETRE_RO &&
            <View style={stylesListsDevices.infovalue}>
              <ThemedText style={{ fontSize: 16, color: Colors.domoticz.color, paddingLeft: 10 }}>{parametre.data}</ThemedText>
            </View>
          }
        </View>
      </View>
    </View>
  );
};

// T15, T18 — styles locaux pour les chips
const chipStyles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    marginLeft: -150,
    maxWidth: 160,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#555',
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.domoticz.color,
    borderColor: Colors.domoticz.color,
  },
  chipText: {
    fontSize: 12,
    color: '#ccc',
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
});
