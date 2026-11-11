/* eslint-disable @typescript-eslint/no-require-imports -- Jest mock factory loads native View locally. */
import React from 'react';
import type { SliderProps } from '@react-native-community/slider';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { SegmentedBlindSlider, SegmentedBlindSliderProps } from '../segmentedBlindSlider.component';

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return function MockSlider(props: SliderProps) {
    return <View testID="slider" {...props} />;
  };
});

function makeProps(overrides: Partial<SegmentedBlindSliderProps> = {}): SegmentedBlindSliderProps {
  return {
    level: 50,
    disabled: false,
    accessibilityLabel: 'Position volet salon',
    onLevelChange: jest.fn(),
    onSlideStart: jest.fn(),
    onSlideEnd: jest.fn(),
    ...overrides,
  };
}

describe('SegmentedBlindSlider', () => {
  it('represente 60 % a 73,33 % de course sur un slider continu', () => {
    const { getByTestId } = render(<SegmentedBlindSlider {...makeProps({ level: 60 })} />);
    const slider = getByTestId('slider');
    expect(slider.props.minimumValue).toBe(0);
    expect(slider.props.maximumValue).toBe(1);
    expect(slider.props.step).toBe(0);
    expect(slider.props.value).toBeCloseTo(11 / 15, 12);
    expect(slider.props.disabled).toBe(false);
    expect(slider.props.accessibilityLabel).toBe('Position volet salon');
    expect(slider.props.accessibilityValue).toEqual({
      min: 0, max: 100, now: 60, text: '60\u00a0%',
    });
  });

  it('ne rend aucun libelle ni graduation sous le slider', () => {
    const { UNSAFE_queryAllByType, getByTestId } = render(<SegmentedBlindSlider {...makeProps()} />);
    expect(UNSAFE_queryAllByType(Text)).toHaveLength(0);
    expect(getByTestId('slider').parent!.children).toHaveLength(1);
  });

  it('emet des pourcentages entiers sans doublon et actualise l accessibilite', () => {
    const props = makeProps();
    const { getByTestId } = render(<SegmentedBlindSlider {...props} />);
    fireEvent(getByTestId('slider'), 'valueChange', 11 / 15);
    fireEvent(getByTestId('slider'), 'valueChange', 11 / 15 + 0.0001);
    expect(props.onLevelChange).toHaveBeenCalledTimes(1);
    expect(props.onLevelChange).toHaveBeenLastCalledWith(60);
    expect(getByTestId('slider').props.accessibilityValue.now).toBe(60);
    fireEvent(getByTestId('slider'), 'valueChange', 0);
    fireEvent(getByTestId('slider'), 'valueChange', 1);
    expect(props.onLevelChange).toHaveBeenNthCalledWith(2, 0);
    expect(props.onLevelChange).toHaveBeenNthCalledWith(3, 100);
  });

  it('resynchronise accessibilite et dedoublonnage apres actualisation distante', () => {
    const props = makeProps({ level: 50 });
    const { getByTestId, rerender } = render(<SegmentedBlindSlider {...props} />);
    rerender(<SegmentedBlindSlider {...props} level={60} />);
    expect(getByTestId('slider').props.accessibilityValue.now).toBe(60);
    expect(getByTestId('slider').props.accessibilityValue.text).toBe('60\u00a0%');
    expect(getByTestId('slider').props.value).toBeCloseTo(11 / 15, 12);
    fireEvent(getByTestId('slider'), 'valueChange', 2 / 3);
    expect(props.onLevelChange).toHaveBeenCalledWith(50);
    expect(getByTestId('slider').props.accessibilityValue.now).toBe(50);
  });

  it('transmet le debut et la fin du geste', () => {
    const props = makeProps();
    const { getByTestId } = render(<SegmentedBlindSlider {...props} />);
    fireEvent(getByTestId('slider'), 'responderStart');
    fireEvent(getByTestId('slider'), 'responderEnd');
    expect(props.onSlideStart).toHaveBeenCalledTimes(1);
    expect(props.onSlideEnd).toHaveBeenCalledTimes(1);
  });

  it('desactive le slider pour un appareil inactif', () => {
    const { getByTestId } = render(
      <SegmentedBlindSlider {...makeProps({ disabled: true, level: 0.1 })} />,
    );
    const slider = getByTestId('slider');
    expect(slider.props.disabled).toBe(true);
    expect(StyleSheet.flatten(slider.props.style).opacity).toBe(0);
    expect(slider.props.value).toBe(0);
    expect(slider.props.accessibilityValue.now).toBe(0);
  });
});
