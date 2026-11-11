import React, { useEffect, useRef, useState } from 'react';
import Slider from '@react-native-community/slider';
import { Colors } from '../enums/Colors';
import { levelToPosition, positionToLevel } from '../services/BlindLevelScale.service';
import { stylesListsDevices } from './deviceRow.styles';

export type SegmentedBlindSliderProps = {
  level: number;
  disabled: boolean;
  onLevelChange: (level: number) => void;
  onSlideStart: () => void;
  onSlideEnd: () => void;
  accessibilityLabel: string;
};

export const SegmentedBlindSlider: React.FC<SegmentedBlindSliderProps> = ({
  level,
  disabled,
  onLevelChange,
  onSlideStart,
  onSlideEnd,
  accessibilityLabel,
}) => {
  const normalizedLevel = positionToLevel(levelToPosition(level));
  const [sliderState, setSliderState] = useState({
    propLevel: normalizedLevel,
    accessibleLevel: normalizedLevel,
  });
  const lastEmittedLevel = useRef(normalizedLevel);

  if (sliderState.propLevel !== normalizedLevel) {
    setSliderState({ propLevel: normalizedLevel, accessibleLevel: normalizedLevel });
  }

  useEffect(() => {
    lastEmittedLevel.current = normalizedLevel;
  }, [normalizedLevel]);

  const handleValueChange = (position: number) => {
    const nextLevel = positionToLevel(position);
    setSliderState(current => ({ ...current, accessibleLevel: nextLevel }));
    if (nextLevel !== lastEmittedLevel.current) {
      lastEmittedLevel.current = nextLevel;
      onLevelChange(nextLevel);
    }
  };

  return (
      <Slider
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: sliderState.accessibleLevel,
          text: `${sliderState.accessibleLevel}\u00a0%`,
        }}
        disabled={disabled}
        style={disabled ? stylesListsDevices.sliderDisabled : stylesListsDevices.slider}
        minimumValue={0}
        maximumValue={1}
        value={levelToPosition(level)}
        step={0}
        minimumTrackTintColor={Colors.dark.slider.trackActive}
        maximumTrackTintColor={Colors.dark.slider.trackInactive}
        thumbTintColor={Colors.domoticz.color}
        onValueChange={handleValueChange}
        onResponderStart={onSlideStart}
        onResponderEnd={onSlideEnd}
      />
  );
};
