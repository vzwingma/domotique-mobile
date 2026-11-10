import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../enums/Colors';
import { BLIND_SCALE_TICKS, levelToPosition, positionToLevel } from '../services/BlindLevelScale.service';
import { stylesListsDevices } from './deviceRow.styles';

const TRACK_INSET = 10;

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
    <View>
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
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.ticks, disabled && styles.ticksDisabled]}>
        {BLIND_SCALE_TICKS.map((tick, index) => (
          <View
            key={tick.label}
            style={[
              styles.tick,
              { left: `${tick.position * 100}%` },
              index === 0 && styles.firstTick,
              index === BLIND_SCALE_TICKS.length - 1 && styles.lastTick,
            ]}>
            <View style={styles.tickMark} />
            <Text style={styles.tickLabel}>{tick.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ticks: {
    height: 14,
    marginHorizontal: TRACK_INSET,
    position: 'relative',
  },
  ticksDisabled: {
    opacity: 0,
  },
  tick: {
    alignItems: 'center',
    position: 'absolute',
    transform: [{ translateX: -16 }],
    width: 32,
  },
  firstTick: {
    alignItems: 'flex-start',
    transform: [{ translateX: 0 }],
  },
  lastTick: {
    alignItems: 'flex-end',
    transform: [{ translateX: -32 }],
  },
  tickMark: {
    backgroundColor: Colors.dark.labelSecondary,
    height: 4,
    width: StyleSheet.hairlineWidth,
  },
  tickLabel: {
    color: Colors.dark.labelSecondary,
    fontSize: 9,
    lineHeight: 10,
    textAlign: 'center',
  },
});
