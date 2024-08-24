import DomoticzDevice from "../models/domoticzDevice.model";
/**
 * Ci-dessous se trouvent les couleurs utilisées dans l'application. Les couleurs sont définies en mode clair et sombre.
 * Il existe de nombreuses autres façons de styliser votre application. Par exemple, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Couleurs utilisées en mode clair et sombre.
 */
const tintColorDark = '#fff';

export const Colors = {
  dark: {
    /**
     * Couleur du texte en mode sombre.
     */
    text: '#ECEDEE',
    /**
     * Couleur de l'arrière-plan en mode sombre.
     */
    background: '#151718',
    /**
     * Couleur de l'arrière-plan de la barre de titre en mode sombre.
     */
    titlebackground: '#353636',

    /**
     * Couleur de mise en évidence en mode sombre.
     */
    tint: tintColorDark,
    /**
     * Couleur des icônes en mode sombre.
     */
    icon: '#9BA1A6',
    /**
     * Couleur par défaut des icônes de l'onglet en mode sombre.
     */
    tabIconDefault: '#9BA1A6',
    /**
     * Couleur des icônes de l'onglet sélectionné en mode sombre.
     */
    tabIconSelected: tintColorDark,
  },
  domoticz: {
    /**
     * Couleur du texte en mode sombre.
     */
    text: '#f5c727',
  }
};

/**
 * Renvoie la couleur du groupe en fonction de l'équipement Domoticz spécifié.
 * @param volet - L'équipement Domoticz.
 * @returns La couleur du groupe.
 */
export function getGroupColor(volet: DomoticzDevice) : string {
  if(volet.isGroup) {
    switch(volet.rang) {
      case 0: return "#5FACD3";
      case 1: return "#B19CD9";
      case 2: return "#BDFCC9";
      case 3: return "#FFDAB9";
      case 4: return "#4AA3A2";
      default: return "white";
    }
  }
  else{
    return "white";
  }
}