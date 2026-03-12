import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DisconnectedState } from './disconnectedState.component';

type GroupCardProps = {
  title: string;
  accentColor: string;
  statusLabel: string;
  unit?: string;
  summary?: string;
  isActive: boolean;
  primaryAction: React.ReactNode;
  commands?: React.ReactNode;
  secondaryControl?: React.ReactNode;
};

export const GroupCard: React.FC<GroupCardProps> = ({
  title,
  accentColor,
  statusLabel,
  unit = '',
  summary,
  isActive,
  primaryAction,
  commands,
  secondaryControl,
}) => {
  return (
    <View style={[styles.card, isActive ? undefined : styles.cardDisconnected]}>
      <View style={styles.topRow}>
        <View style={styles.primaryBox}>{primaryAction}</View>
        <View style={styles.contentBox}>
          <View style={styles.labelsRow}>
            <ThemedText style={[styles.title, { color: accentColor }]} numberOfLines={1}>
              {title}
            </ThemedText>
            {isActive ? (
              <View style={styles.valueRow}>
                <ThemedText style={styles.status}>{statusLabel}</ThemedText>
                {unit ? <ThemedText style={styles.unit}>{unit}</ThemedText> : null}
              </View>
            ) : (
              <DisconnectedState />
            )}
          </View>
          {summary ? <ThemedText style={styles.summary}>{summary}</ThemedText> : null}
          {secondaryControl}
        </View>
      </View>
      {commands ? <View style={styles.commandsRow}>{commands}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 10,
    margin: 1,
    borderColor: '#3A3A3A',
    borderWidth: 1,
    backgroundColor: '#0b0b0b',
  },
  cardDisconnected: {
    borderColor: '#7f2b2b',
    backgroundColor: '#1a1212',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBox: {
    marginRight: 10,
    width: 60,
  },
  contentBox: {
    flex: 1,
    justifyContent: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 80,
    gap: 4,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5c727',
  },
  unit: {
    fontSize: 14,
    color: '#f5c727',
  },
  summary: {
    marginTop: -8,
    fontSize: 12,
    color: '#c8c8c8',
  },
  commandsRow: {
    marginTop: 8,
  },
});

