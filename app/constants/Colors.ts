import DomoticzEquipement from "../models/domoticzEquipement.model";
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */



const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};



export function getGroupColor(volet: DomoticzEquipement) : string {
  if(volet.isGroup) {
    switch(volet.rang) {
      case 0: return "#5FACD3";
      case 1: return "#4AA3A2";
      case 2: return "#BDFCC9";
      case 3: return "#FFDAB9";
      case 4: return "#B19CD9";
      default: return "white";
    }
  }
  else{
    return "white";
  }
}