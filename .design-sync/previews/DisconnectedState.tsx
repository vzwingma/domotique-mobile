import React from 'react';
import { View } from 'react-native';
import { DisconnectedState } from '../../app/components/disconnectedState.component';
import { Colors } from '../../app/enums/Colors';

export const Default = () => (
  <View style={{ backgroundColor: Colors.dark.background, padding: 16, alignItems: 'flex-start' }}>
    <DisconnectedState />
  </View>
);
