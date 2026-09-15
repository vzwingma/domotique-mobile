import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DeviceCard } from '../../app/components/deviceCard.component';
import { PrimaryIconAction } from '../../app/components/primaryIconAction.component';
import { Colors } from '../../app/enums/Colors';

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ backgroundColor: Colors.dark.background, padding: 8, width: 360 }}>{children}</View>
);

export const LumiereAllumee = () => {
  const accent = '#4AA3A2';
  return (
    <Row>
      <DeviceCard
        title="Lumières Salon"
        accentColor={accent}
        statusLabel="Allumées"
        isActive
        primaryAction={
          <PrimaryIconAction accessibilityLabel="Éteindre les lumières du salon" active onPress={() => {}}>
            <MaterialCommunityIcons name="lightbulb-multiple-outline" size={28} color={accent} />
          </PrimaryIconAction>
        }
      />
    </Row>
  );
};

export const VoletsMixte = () => {
  const accent = '#B19CD9';
  return (
    <Row>
      <DeviceCard
        title="Volets Salon"
        accentColor={accent}
        statusLabel="Mixte"
        summary="1/2 ouverts"
        isActive
        primaryAction={
          <PrimaryIconAction accessibilityLabel="Fermer les volets du salon" active={false} onPress={() => {}}>
            <MaterialCommunityIcons name="window-shutter" size={28} color={accent} />
          </PrimaryIconAction>
        }
      />
    </Row>
  );
};

export const Deconnecte = () => (
  <Row>
    <DeviceCard
      title="Lumière Cuisine"
      accentColor={Colors.dark.tint}
      statusLabel=""
      isActive={false}
      primaryAction={
        <PrimaryIconAction accessibilityLabel="Lumière cuisine indisponible" active={false} disabled onPress={() => {}}>
          <MaterialCommunityIcons name="lightbulb-off-outline" size={28} color={Colors.dark.icon} />
        </PrimaryIconAction>
      }
    />
  </Row>
);
