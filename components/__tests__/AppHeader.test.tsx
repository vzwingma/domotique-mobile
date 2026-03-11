import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { AppHeader } from '../AppHeader';

describe('AppHeader', () => {
  it('affiche le titre, l’icône et le badge de connexion', () => {
    const { getByText, getByTestId, getByLabelText } = render(
      <AppHeader
        title="Tableau de bord"
        icon={<View testID="header-icon" />}
        connectionState="connecte"
      />,
    );

    expect(getByText('Tableau de bord')).toBeTruthy();
    expect(getByTestId('header-icon')).toBeTruthy();
    expect(getByLabelText('Statut de connexion : Connecté')).toBeTruthy();
  });

  it('met à jour le badge selon connectionState', () => {
    const { getByLabelText, rerender } = render(
      <AppHeader title="Maison" icon={<View testID="header-icon" />} connectionState="synchronisation" />,
    );
    expect(getByLabelText('Statut de connexion : Synchronisation')).toBeTruthy();

    rerender(<AppHeader title="Maison" icon={<View testID="header-icon" />} connectionState="deconnecte" />);
    expect(getByLabelText('Statut de connexion : Déconnecté')).toBeTruthy();
  });

  it('snapshot du header', () => {
    const { toJSON } = render(
      <AppHeader title="Maison" icon={<View testID="header-icon" />} connectionState="connecte" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

