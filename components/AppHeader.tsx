import type { ReactElement } from 'react';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/app/enums/Colors';
import { ConnectionBadge, type ConnectionBadgeState } from './ConnectionBadge';

export type AppHeaderProps = {
  readonly title: string;
  readonly icon: ReactElement;
  readonly connectionState: ConnectionBadgeState;
};

export function AppHeader({ title, icon, connectionState }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>{icon}</View>
      <ThemedText type="title" style={styles.title} numberOfLines={1}>
        {title}
      </ThemedText>
      <View style={styles.rightSection}>
        <ConnectionBadge state={connectionState} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 26,
    paddingBottom: 8,
    minHeight: 70,
    gap: 8,
  },
  leftSection: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 28,
    lineHeight: 30,
    color: Colors.domoticz.color,
  },
  rightSection: {
    minWidth: 112,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
