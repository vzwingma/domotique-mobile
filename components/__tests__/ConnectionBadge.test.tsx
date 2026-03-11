import React from 'react';
import { render } from '@testing-library/react-native';
import {
  ConnectionBadge,
  getConnectionBadgeColor,
  getConnectionBadgeLabel,
  mapDomoticzStatusToConnectionBadgeState,
  type ConnectionBadgeState,
} from '../ConnectionBadge';

describe('ConnectionBadge - affichage des 4 états', () => {
  const states: Array<{ state: ConnectionBadgeState; label: string }> = [
    { state: 'connecte', label: 'Connecté' },
    { state: 'synchronisation', label: 'Synchronisation' },
    { state: 'deconnecte', label: 'Déconnecté' },
    { state: 'erreur', label: 'Erreur' },
  ];

  it.each(states)('rend "$label" pour state="$state"', ({ state, label }) => {
    const { getByText, getByLabelText } = render(<ConnectionBadge state={state} />);
    expect(getByText(label)).toBeTruthy();
    expect(getByLabelText(`Statut de connexion : ${label}`)).toBeTruthy();
  });

  it.each(states)('snapshot state="$state"', ({ state }) => {
    const { toJSON } = render(<ConnectionBadge state={state} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('ConnectionBadge - mapping statut Domoticz', () => {
  it('mappe hasError vers "erreur"', () => {
    expect(mapDomoticzStatusToConnectionBadgeState({ status: 'OK', hasError: true })).toBe('erreur');
  });

  it('mappe isLoading vers "synchronisation"', () => {
    expect(mapDomoticzStatusToConnectionBadgeState({ status: 'OK', isLoading: true })).toBe('synchronisation');
  });

  it('mappe status=OK vers "connecte"', () => {
    expect(mapDomoticzStatusToConnectionBadgeState({ status: 'OK' })).toBe('connecte');
  });

  it('mappe un status texte non vide vers "deconnecte"', () => {
    expect(mapDomoticzStatusToConnectionBadgeState({ status: 'Timeout' })).toBe('deconnecte');
  });

  it('mappe status absent vers "erreur" (fallback explicite)', () => {
    expect(mapDomoticzStatusToConnectionBadgeState({ status: undefined })).toBe('erreur');
  });
});

describe('ConnectionBadge - label utilitaire', () => {
  it.each([
    ['connecte', 'Connecté'],
    ['synchronisation', 'Synchronisation'],
    ['deconnecte', 'Déconnecté'],
    ['erreur', 'Erreur'],
  ] as Array<[ConnectionBadgeState, string]>)('retourne %s -> %s', (state, expectedLabel) => {
    expect(getConnectionBadgeLabel(state)).toBe(expectedLabel);
  });
});

describe('ConnectionBadge - couleur utilitaire', () => {
  it.each([
    ['connecte', '#4caf50'],
    ['synchronisation', '#f5c727'],
    ['deconnecte', '#f44336'],
    ['erreur', '#ff8a65'],
  ] as Array<[ConnectionBadgeState, string]>)('retourne %s -> %s', (state, expectedColor) => {
    expect(getConnectionBadgeColor(state)).toBe(expectedColor);
  });
});

