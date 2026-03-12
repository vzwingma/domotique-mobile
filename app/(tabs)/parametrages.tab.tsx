/**
 * Écran Maison : liste des paramètres + section À propos
 */
import React, { JSX, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { DomoticzContext } from '../services/DomoticzContextProvider';
import { ViewDomoticzParamList } from '../components/paramList.component';
import { ThemedText } from '@/components/ThemedText';
import Constants from 'expo-constants';
import { Colors } from '../enums/Colors';
import {
  getConnectionBadgeColor,
  getConnectionBadgeLabel,
  mapDomoticzStatusToConnectionBadgeState,
} from '@/components/ConnectionBadge';

/**
 * Composant de l'écran Maison : paramètres + section À propos
 */
export default function TabDomoticzParametres(): JSX.Element {
  const { domoticzParametersData, domoticzConnexionData } = useContext(DomoticzContext)!;
  const appVersion = Constants.expoConfig?.version ?? 'inconnue';
  const connectionState = mapDomoticzStatusToConnectionBadgeState({
    status: domoticzConnexionData?.status,
  });
  const connectionLabel = getConnectionBadgeLabel(connectionState);
  const connectionColor = getConnectionBadgeColor(connectionState);
  const domoticzStatusRaw = domoticzConnexionData?.status ?? 'non disponible';

  return (
    <>
      <View style={sectionStyles.section}>
        {domoticzParametersData.map((item) => (
          <ViewDomoticzParamList key={item.idx} parametre={item} />
        ))}
      </View>

      {/* T03 — Section À propos */}
      <View style={aboutStyles.section}>
        <ThemedText style={aboutStyles.title}>À propos</ThemedText>
        <View style={aboutStyles.row}>
          <ThemedText style={aboutStyles.label}>Version de l'application</ThemedText>
          <ThemedText style={aboutStyles.value}>v{appVersion}</ThemedText>
        </View>
        <View style={aboutStyles.row}>
          <ThemedText style={aboutStyles.label}>Domoticz</ThemedText>
          <ThemedText style={aboutStyles.value}>v{domoticzConnexionData?.version ?? '?'}</ThemedText>
        </View>
        <View style={aboutStyles.row}>
          <ThemedText style={aboutStyles.label}>Statut détaillé</ThemedText>
          <ThemedText style={[aboutStyles.value, { color: connectionColor }]}>
            {connectionLabel} ({domoticzStatusRaw})
          </ThemedText>
        </View>
      </View>
    </>
  );
}

const sectionStyles = StyleSheet.create({
  section: {
    width: '100%',
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 4,
    marginBottom: 6,
  },
});

const aboutStyles = StyleSheet.create({
  section: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1c1d',
    borderRadius: 8,
    borderColor: '#2a2c2d',
    borderWidth: 1,
    width: '100%',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  value: {
    fontSize: 12,
    color: Colors.dark.text,
  },
});
