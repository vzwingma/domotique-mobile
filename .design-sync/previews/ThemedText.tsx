import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../app/enums/Colors';

const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ backgroundColor: Colors.dark.background, padding: 16 }}>{children}</View>
);

export const Default = () => (
  <Dark>
    <ThemedText>Mesure de température reçue avec succès.</ThemedText>
  </Dark>
);

export const Title = () => (
  <Dark>
    <ThemedText type="title">Favoris</ThemedText>
  </Dark>
);

export const DefaultSemiBold = () => (
  <Dark>
    <ThemedText type="defaultSemiBold">Lumières Salon</ThemedText>
  </Dark>
);

export const Subtitle = () => (
  <Dark>
    <ThemedText type="subtitle">Volets Chambres</ThemedText>
  </Dark>
);

export const Link = () => (
  <Dark>
    <ThemedText type="link">Voir tous les équipements</ThemedText>
  </Dark>
);

export const Italic = () => (
  <Dark>
    <ThemedText type="italic">État : Mixte</ThemedText>
  </Dark>
);

export const Tab = () => (
  <Dark>
    <ThemedText type="tab">Températures</ThemedText>
  </Dark>
);
