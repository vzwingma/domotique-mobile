import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/app/constants/Colors';

/**
 * Composant de mise en page des onglets.
 * 
 * Ce composant utilise `Tabs` de `expo-router` pour créer une mise en page avec plusieurs onglets.
 * Chaque onglet a une icône et un titre spécifiques.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors['dark'].tint, // Couleur de l'onglet actif
        headerShown: false, // Masquer l'en-tête
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil', // Titre de l'onglet
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} /> // Icône de l'onglet
          ),
        }}
      />
      <Tabs.Screen
        name="lights.tab"
        options={{
          title: 'Lumères', // Titre de l'onglet
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bulb' : 'bulb-outline'} color={color} /> // Icône de l'onglet
          ),
        }}
      />
      <Tabs.Screen
        name="blinds.tab"
        options={{
          title: 'Volets',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'storefront' : 'storefront-outline'} color={color} />
          ),
        }}
      />      
    </Tabs>
  );
}
