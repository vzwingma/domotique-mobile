import DomoticzDevice from "../models/domoticzDevice.model";
/**
 * Ci-dessous se trouvent les couleurs utilisées dans l'application. Les couleurs sont définies en mode clair et sombre.
 * Il existe de nombreuses autres façons de styliser votre application. Par exemple, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
export const PROFILE = process.env.MY_ENVIRONMENT ?? process.env.EXPO_PUBLIC_MY_ENVIRONMENT;

export const enum PROFILES_ENV {
    C = "previewC",
    V = "previewV",
}
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
    color: PROFILE === PROFILES_ENV.C ? '#339a9a' : '#f5c727',
  }
};



/**
 * Renvoie la couleur du groupe en fonction de l'équipement Domoticz spécifié.
 * @param volet - L'équipement Domoticz.
 * @returns La couleur du groupe.
 */
export function getGroupColor(volet: DomoticzDevice) : string {
  if(volet.isGroup) {
    switch(volet.idx) {
      case 85: return "#5FACD3"; // tous les volets 85 
      case 84: return "#B19CD9"; // volets salon 84
      case 86: return "#BDFCC9";// volets chambre 86
      case 122: return "#FFDAB9";// toutes les lumières 122
      case 117: return "#4AA3A2";  // lumières salon 117
      default: return "white";
    }
  }
  else{
    return "white";
  }
}