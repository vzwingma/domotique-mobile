/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/app/enums/Colors';

type ThemeColorName = {
  [K in keyof typeof Colors.dark]: (typeof Colors.dark)[K] extends string ? K : never;
}[keyof typeof Colors.dark];

export function useThemeColor(
  colorName: ThemeColorName
): string {
  const theme = 'dark';
  return Colors[theme][colorName];
}
