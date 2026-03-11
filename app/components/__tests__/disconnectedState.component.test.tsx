import React from 'react';
import { render } from '@testing-library/react-native';
import { DisconnectedState } from '../disconnectedState.component';

describe('DisconnectedState', () => {
  it('affiche un état "Déconnecté" lisible en mode standard', () => {
    const { getByText, root } = render(<DisconnectedState />);

    expect(getByText('Déconnecté')).toBeTruthy();

    const icon = root.findByType('MaterialCommunityIcons');
    expect(icon.props.name).toBe('wifi-off');
    expect(icon.props.size).toBe(15);
  });

  it('affiche un état compact (icône réduite) en mode compact', () => {
    const { getByText, root } = render(<DisconnectedState compact />);

    expect(getByText('Déconnecté')).toBeTruthy();

    const icon = root.findByType('MaterialCommunityIcons');
    expect(icon.props.size).toBe(13);
  });

  it('snapshot standard et compact', () => {
    const { toJSON: toJSONStandard } = render(<DisconnectedState />);
    const { toJSON: toJSONCompact } = render(<DisconnectedState compact />);

    expect(toJSONStandard()).toMatchSnapshot();
    expect(toJSONCompact()).toMatchSnapshot();
  });
});

