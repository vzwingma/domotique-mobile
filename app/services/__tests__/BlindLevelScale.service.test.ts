import { levelToPosition, positionToLevel } from '../BlindLevelScale.service';

describe('BlindLevelScale', () => {
  it.each([
    [0, 0],
    [5, 1 / 6],
    [10, 1 / 3],
    [30, 1 / 2],
    [50, 2 / 3],
    [60, 11 / 15],
    [75, 5 / 6],
    [99, 149 / 150],
    [100, 1],
  ])('convertit %s %% en position %s et inversement', (level, position) => {
    expect(levelToPosition(level)).toBeCloseTo(position, 12);
    expect(positionToLevel(position)).toBe(level);
  });

  it('conserve les 101 niveaux entiers et leur ordre strict', () => {
    for (let level = 0; level <= 100; level++) {
      const position = levelToPosition(level);
      expect(positionToLevel(position)).toBe(level);
      if (level > 0) expect(position).toBeGreaterThan(levelToPosition(level - 1));
    }
  });

  it('arrondit au pourcentage entier dans chaque segment', () => {
    expect(positionToLevel(levelToPosition(4.4))).toBe(4);
    expect(positionToLevel(levelToPosition(4.6))).toBe(5);
    expect(positionToLevel(levelToPosition(30.4))).toBe(30);
    expect(positionToLevel(levelToPosition(30.6))).toBe(31);
    expect(positionToLevel(levelToPosition(70.4))).toBe(70);
    expect(positionToLevel(levelToPosition(70.6))).toBe(71);
  });

  it.each([-10, 0, 0.1])('traite %s comme un volet ferme', level => {
    expect(levelToPosition(level)).toBe(0);
  });

  it('borne les valeurs finies hors echelle', () => {
    expect(levelToPosition(120)).toBe(1);
    expect(positionToLevel(-1)).toBe(0);
    expect(positionToLevel(2)).toBe(100);
  });

  it.each([NaN, Infinity, -Infinity])('ramene la valeur non finie %s a zero', value => {
    expect(levelToPosition(value)).toBe(0);
    expect(positionToLevel(value)).toBe(0);
  });

});
