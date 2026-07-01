// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/**
 * Surcharge de l'icone de la barre de navigation pour être paramétrable
 * @param {any} props Propriétés de l'icone
 * @returns {JSX.Element} Icone de la barre de navigation
 */
type TabBarIconProps = ComponentProps<typeof MaterialCommunityIcons>;

export function TabBarIcon({ style, ...rest }: Readonly<TabBarIconProps>) {
    return <MaterialCommunityIcons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}



