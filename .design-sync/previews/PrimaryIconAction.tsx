import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryIconAction } from '../../app/components/primaryIconAction.component';
import { Colors } from '../../app/enums/Colors';

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ backgroundColor: Colors.dark.surface, padding: 16, flexDirection: 'row', gap: 12 }}>
    {children}
  </View>
);

export const Active = () => (
  <Wrap>
    <PrimaryIconAction accessibilityLabel="Éteindre la lumière" active onPress={() => {}}>
      <MaterialCommunityIcons name="lightbulb-outline" size={28} color={Colors.domoticz.color} />
    </PrimaryIconAction>
  </Wrap>
);

export const Inactive = () => (
  <Wrap>
    <PrimaryIconAction accessibilityLabel="Allumer la lumière" active={false} onPress={() => {}}>
      <MaterialCommunityIcons name="lightbulb-off-outline" size={28} color={Colors.dark.icon} />
    </PrimaryIconAction>
  </Wrap>
);

export const Disabled = () => (
  <Wrap>
    <PrimaryIconAction accessibilityLabel="Lumière indisponible" active={false} disabled onPress={() => {}}>
      <MaterialCommunityIcons name="lightbulb-off-outline" size={28} color={Colors.dark.icon} />
    </PrimaryIconAction>
  </Wrap>
);
