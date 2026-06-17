import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_NAME_MAP: Record<string, string> = {
  'airplane-outline': 'airplane',
  'alarm-outline': 'alarm',
  'bulb-outline': 'lightbulb-outline',
  bulb: 'lightbulb',
  flame: 'fire',
  home: 'home',
  'home-outline': 'home-outline',
  'home-sharp': 'home',
  moon: 'moon-waning-crescent',
  'moon-outline': 'moon-waning-crescent',
  'partly-sunny-outline': 'weather-partly-cloudy',
  'people-circle-outline': 'account-group-outline',
  'reorder-four': 'blinds-horizontal',
  'reorder-four-outline': 'blinds-horizontal',
  'scan-circle-outline': 'account-search-outline',
  star: 'star',
  'star-outline': 'star-outline',
  'sunny-outline': 'weather-sunny',
  thermometer: 'thermometer',
  'thermometer-outline': 'thermometer',
  'thermometer-sharp': 'thermometer',
  'today-outline': 'calendar-today',
  'wine-sharp': 'glass-wine',
};

export function mapAppIconName(name: string): string {
  return ICON_NAME_MAP[name] ?? name;
}

type AppIconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: any;
};

export function AppIcon({ name, ...rest }: AppIconProps & Record<string, any>) {
  return <MaterialCommunityIcons name={mapAppIconName(name)} {...rest} />;
}

export default AppIcon;
