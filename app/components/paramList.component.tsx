import { ThemedText } from "../../components/ThemedText";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
/**
 * Normalise une chaîne en retirant les accents et en mettant en majuscules,
 * pour une comparaison robuste indépendante de l'encodage Domoticz.
 */
function normalizeLevelName(s: string): string {
  return s.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').toUpperCase();
}

function getParametreDisplayLabel(parametreName: string, levelName: string): string {
  const normalized = normalizeLevelName(levelName);
  if (parametreName.includes("Présence")) {
    if (normalized === "PRESENT") return "Maison occupée";
    else if (normalized === "ABSENT") return "Maison vide";
  }
  else if (parametreName.includes("Phase")) {
    if (normalized === "JOURNEE") return "Journée";
    else if (normalized === "SOIREE") return "Soirée";
  }
  else if (parametreName.includes("Mode")) {
    if (normalized === "SUMMER") return "Été";
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
    <View key={parametre.idx} style={paramStyles.viewBox}>
      <View key={parametre.idx} style={stylesListsDevices.iconBox}>
        <IconDomoticzParametre name={getIconDomoticzParametre(parametre)} color={"white"} size={60} />
      </View>
      <View style={paramStyles.nameBox}>
        {/* T16 — nom d'affichage */}
        <ThemedText style={{ fontSize: 16, color: 'white' }}>{getParametreDisplayName(parametre.name)}</ThemedText>
      </View>

      {/* T15 — chips segmentés */}
      {parametre.type === DomoticzDeviceType.PARAMETRE &&
        <View style={chipStyles.chipsContainer}>
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
                <ThemedText numberOfLines={2} style={[chipStyles.chipText, isSelected && chipStyles.chipTextSelected]}>
                  {getParametreDisplayLabel(parametre.name, levelName)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      }

      {parametre.type === DomoticzDeviceType.PARAMETRE_RO &&
      <View style={stylesListsDevices.infovalue}>
        <ThemedText style={{ fontSize: 14, color: Colors.domoticz.color }}>{getParametreDisplayLabel(parametre.name, parametre.data)}</ThemedText>
      </View>
      }
    </View>
  );
};

// T15, T18 — styles locaux pour les chips
const paramStyles = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    width: '100%',
    padding: 10,
    margin: 1,
    minHeight: 84,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
    alignItems: 'center',
  },
  nameBox: {
    width: 90,
    justifyContent: 'center',
    paddingLeft: 4,
  },
});

const chipStyles = StyleSheet.create({
  chipsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 4,
  },
  chip: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#555',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.domoticz.color,
    borderColor: Colors.domoticz.color,
  },
  chipText: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'center',
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
});
