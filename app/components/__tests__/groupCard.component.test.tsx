import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { GroupCard } from '../groupCard.component';

function renderGroupCard(overrides: Partial<React.ComponentProps<typeof GroupCard>> = {}) {
  return render(
    <GroupCard
      title="Salon"
      accentColor="#f5c727"
      statusLabel="Allumées"
      unit="%"
      summary="3 lumières allumées"
      isActive
      primaryAction={<View testID="primary-action" />}
      commands={<View testID="commands-row" />}
      secondaryControl={<View testID="secondary-control" />}
      {...overrides}
    />,
  );
}

describe('GroupCard', () => {
  it('affiche statut + unité quand le groupe est actif', () => {
    const { getByText, queryByText } = renderGroupCard();
    expect(getByText('Allumées')).toBeTruthy();
    expect(getByText('%')).toBeTruthy();
    expect(queryByText('Déconnecté')).toBeNull();
  });

  it('affiche un état déconnecté lisible quand isActive=false', () => {
    const { getByText, queryByText } = renderGroupCard({ isActive: false });
    expect(getByText('Déconnecté')).toBeTruthy();
    expect(queryByText('Allumées')).toBeNull();
  });

  it('rend les zones primary/commands/secondary', () => {
    const { getByTestId } = renderGroupCard();
    expect(getByTestId('primary-action')).toBeTruthy();
    expect(getByTestId('commands-row')).toBeTruthy();
    expect(getByTestId('secondary-control')).toBeTruthy();
  });

  it('snapshot actif et déconnecté', () => {
    const { toJSON: toJSONActive } = render(
      <GroupCard
        title="Salon"
        accentColor="#f5c727"
        statusLabel="Allumées"
        unit="%"
        summary="3 lumières allumées"
        isActive
        primaryAction={<View testID="primary-action" />}
        commands={<View testID="commands-row" />}
      />,
    );

    const { toJSON: toJSONDisconnected } = render(
      <GroupCard
        title="Salon"
        accentColor="#f5c727"
        statusLabel="Allumées"
        unit="%"
        summary="3 lumières allumées"
        isActive={false}
        primaryAction={<View testID="primary-action" />}
        commands={<View testID="commands-row" />}
      />,
    );

    expect(toJSONActive()).toMatchSnapshot();
    expect(toJSONDisconnected()).toMatchSnapshot();
  });
});

