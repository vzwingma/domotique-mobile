import React from 'react';
import { render } from '@testing-library/react-native';
import { DisconnectedState } from '../disconnectedState.component';

describe('DisconnectedState', () => {
  it('affiche un état "Déconnecté" lisible en mode standard', () => {
    const { getByText, root } = render(<DisconnectedState />);

    expect(getByText('Déconnecté')).toBeTruthy();

    const icon = root.findByType('MaterialCommunityIcons');
    expect(icon.props.name).toBe('wifi-off');
    expect(icon.props.size).toBe(18);
  });

  it('affiche l\'icône wifi-off avec la taille standard', () => {
    const { root } = render(<DisconnectedState />);

    const icon = root.findByType('MaterialCommunityIcons');
    expect(icon.props.name).toBe('wifi-off');
    expect(icon.props.size).toBe(18);
  });

  it('snapshot du composant', () => {
    const { toJSON } = render(<DisconnectedState />);

    expect(toJSON()).toMatchSnapshot();
  });
});

