import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/app/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors['dark'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lights"
        options={{
          title: 'Lumères',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bulb' : 'bulb-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="blinds"
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
