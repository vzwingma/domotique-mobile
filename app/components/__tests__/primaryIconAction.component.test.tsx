import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryIconAction } from '../primaryIconAction.component';

describe('PrimaryIconAction', () => {
  it('expose une accessibilité minimale (role/label/state)', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <PrimaryIconAction
        accessibilityLabel="Action rapide lumière salon"
        active
        onPress={onPress}>
        <Text>💡</Text>
      </PrimaryIconAction>,
    );

    const action = getByLabelText('Action rapide lumière salon');
    expect(action.props.accessibilityRole).toBe('button');
    expect(action.props.accessibilityState).toEqual({ disabled: false, selected: true });
  });

  it('appelle onPress quand actif et non disabled', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <PrimaryIconAction accessibilityLabel="Action principale" active onPress={onPress}>
        <Text>icône</Text>
      </PrimaryIconAction>,
    );

    fireEvent.press(getByLabelText('Action principale'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('n’appelle pas onPress quand disabled=true', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <PrimaryIconAction accessibilityLabel="Action désactivée" active disabled onPress={onPress}>
        <Text>icône</Text>
      </PrimaryIconAction>,
    );

    fireEvent.press(getByLabelText('Action désactivée'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applique le style disabled (opacité) quand disabled=true', () => {
    const { UNSAFE_root } = render(
      <PrimaryIconAction accessibilityLabel="Action disabled style" active disabled onPress={jest.fn()}>
        <Text>icône</Text>
      </PrimaryIconAction>,
    );

    const pressable = UNSAFE_root.findAll((node) => typeof node.props?.style === 'function')[0];
    const styleWhenNotPressed = pressable.props.style({ pressed: false });
    const flatStyle = StyleSheet.flatten(styleWhenNotPressed);
    expect(flatStyle.opacity).toBe(0.45);
  });

  it('snapshot actif vs disabled', () => {
    const { toJSON: toJSONActive } = render(
      <PrimaryIconAction accessibilityLabel="Action snapshot active" active onPress={jest.fn()}>
        <Text>icône</Text>
      </PrimaryIconAction>,
    );
    const { toJSON: toJSONDisabled } = render(
      <PrimaryIconAction accessibilityLabel="Action snapshot disabled" active disabled onPress={jest.fn()}>
        <Text>icône</Text>
      </PrimaryIconAction>,
    );

    expect(toJSONActive()).toMatchSnapshot();
    expect(toJSONDisabled()).toMatchSnapshot();
  });
});

