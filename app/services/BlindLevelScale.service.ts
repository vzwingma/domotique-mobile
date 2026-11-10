export type BlindScaleTick = {
  position: number;
  label: string;
};

const LEVEL_MIN = 0;
const LEVEL_FINE_MAX = 10;
const LEVEL_MID_MAX = 50;
const LEVEL_MAX = 100;
const POSITION_FINE_MAX = 1 / 3;
const POSITION_MID_MAX = 2 / 3;

export const BLIND_SCALE_TICKS: BlindScaleTick[] = [
  { position: 0, label: '0\u00a0%' },
  { position: POSITION_FINE_MAX, label: '10\u00a0%' },
  { position: POSITION_MID_MAX, label: '50\u00a0%' },
  { position: 1, label: '100\u00a0%' },
];

/**
 * Converts a blind percentage to its normalized position on three equal slider segments.
 * The segments map 0–10%, 10–50%, and 50–100% to equal thirds of the slider.
 */
export function levelToPosition(level: number): number {
  if (!Number.isFinite(level) || level <= 0.1) return 0;

  const clampedLevel = Math.min(Math.max(level, LEVEL_MIN), LEVEL_MAX);
  if (clampedLevel <= LEVEL_FINE_MAX) {
    return clampedLevel / 30;
  }
  if (clampedLevel <= LEVEL_MID_MAX) {
    return POSITION_FINE_MAX + (clampedLevel - LEVEL_FINE_MAX) / 120;
  }
  return POSITION_MID_MAX + (clampedLevel - LEVEL_MID_MAX) / 150;
}

/**
 * Converts a normalized slider position to the nearest integer blind percentage.
 */
export function positionToLevel(position: number): number {
  if (!Number.isFinite(position)) return LEVEL_MIN;

  const clampedPosition = Math.min(Math.max(position, 0), 1);
  let level: number;
  if (clampedPosition <= POSITION_FINE_MAX) {
    level = clampedPosition * 30;
  } else if (clampedPosition <= POSITION_MID_MAX) {
    level = LEVEL_FINE_MAX + (clampedPosition - POSITION_FINE_MAX) * 120;
  } else {
    level = LEVEL_MID_MAX + (clampedPosition - POSITION_MID_MAX) * 150;
  }

  return Math.min(Math.max(Math.round(level), LEVEL_MIN), LEVEL_MAX);
}
