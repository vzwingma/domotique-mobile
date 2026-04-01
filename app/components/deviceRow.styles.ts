import { StyleSheet } from 'react-native';
import { Colors } from '../enums/Colors';

/**
 * Styles partagés pour les lignes d'équipements (lumières, volets, paramètres, thermostats).
 * Exporté ici pour éviter les dépendances circulaires entre composants.
 */
export const stylesListsDevices = StyleSheet.create({
  viewBox: {
    flexDirection: 'row',
    height: 84,
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: Colors.dark.border,
    borderWidth: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8
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
    borderColor: Colors.dark.disconnected.border,
    borderWidth: 1,
    backgroundColor: Colors.dark.disconnected.background,
    opacity: 0.5,
  },
  iconBox: {
    marginRight: 10,
    height: 60,
    width: 60,
  },

  labelsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    width: '100%',
  },
  labelsBoxUnconsistent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    opacity: 0.5,
    width: '100%',
  },
  libelleBox: {
    flex: 1,
    minWidth: 0,
  },
  valueBox: {
    flexDirection: 'column',
    marginLeft: 0,
    width: 80,
    alignItems: 'flex-end',
  },
  valueBoxDisconnected: {
    flexDirection: 'column',
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
    height: 30,
  },
  sliderDisabled: {
    height: 30,
    opacity: 0,
  },
  textLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.domoticz.color,
    paddingBottom: 7,
    textAlign: 'right',
  },
  textName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 200,
  },
  // DROPDOWN
  dropdown: {
    flexDirection: 'column',
    marginLeft: -150,
    borderColor: Colors.dark.label,
    borderWidth: 0.5,
    borderRadius: 8,
    width: 150,
    backgroundColor: Colors.dark.background,
    color: Colors.domoticz.color,
  },
  listStyle: {
    backgroundColor: Colors.dark.background,
  },
  listItemStyle: {
    margin: 0,
    padding: 0,
    height: 'auto',
    color: Colors.domoticz.color,
    fontFamily: 'BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
  },
  placeholderStyle: {
    fontWeight: 'normal',
    paddingLeft: 10,
    color: Colors.dark.label,
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
    borderColor: Colors.dark.label,
    borderWidth: 0.5,
    borderRadius: 8,
    width: 180,
    backgroundColor: Colors.dark.background,
    color: Colors.domoticz.color,
  },
});
