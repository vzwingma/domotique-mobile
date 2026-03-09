/**
 * Tests pour le composant ThemedText
 *
 * Utilise @testing-library/react-native + StyleSheet.flatten pour inspecter
 * les styles réels (react-test-renderer.toJSON() retourne null avec React 19
 * dans ce projet, cf. ThemedText-test.tsx.snap).
 *
 * Couvre :
 *  - Vérification des styles pour chaque type (fontSize, fontWeight, lineHeight…)
 *  - Couleur du thème dark injectée par useThemeColor
 *  - Rendu sans crash pour tous les types et props supplémentaires
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';

// ─── Utilitaire ────────────────────────────────────────────────────────────────

/** Résout les IDs StyleSheet et aplatit un tableau de styles en objet plat */
function getStyle(element: { props: { style?: any } }): Record<string, any> {
  return StyleSheet.flatten(element.props.style) ?? {};
}

// ─── Vérification des styles par type ─────────────────────────────────────────

describe('ThemedText - styles par type', () => {

  it('type default (implicite) → fontSize=16, lineHeight=24', () => {
    render(<ThemedText>Texte default</ThemedText>);
    const style = getStyle(screen.getByText('Texte default'));
    expect(style.fontSize).toBe(16);
    expect(style.lineHeight).toBe(24);
  });

  it('type title → fontSize=32, fontWeight=bold, lineHeight=32', () => {
    render(<ThemedText type="title">Titre</ThemedText>);
    const style = getStyle(screen.getByText('Titre'));
    expect(style.fontSize).toBe(32);
    expect(style.fontWeight).toBe('bold');
    expect(style.lineHeight).toBe(32);
  });

  it('type defaultSemiBold → fontSize=16, fontWeight=600, lineHeight=24', () => {
    render(<ThemedText type="defaultSemiBold">SemiBold</ThemedText>);
    const style = getStyle(screen.getByText('SemiBold'));
    expect(style.fontSize).toBe(16);
    expect(style.fontWeight).toBe('600');
    expect(style.lineHeight).toBe(24);
  });

  it('type subtitle → fontSize=20, fontWeight=bold', () => {
    render(<ThemedText type="subtitle">Sous-titre</ThemedText>);
    const style = getStyle(screen.getByText('Sous-titre'));
    expect(style.fontSize).toBe(20);
    expect(style.fontWeight).toBe('bold');
  });

  it('type link → fontSize=16, lineHeight=30', () => {
    render(<ThemedText type="link">Lien</ThemedText>);
    const style = getStyle(screen.getByText('Lien'));
    expect(style.fontSize).toBe(16);
    expect(style.lineHeight).toBe(30);
  });

  it('type tab → fontSize=10, lineHeight=30', () => {
    render(<ThemedText type="tab">Tab</ThemedText>);
    const style = getStyle(screen.getByText('Tab'));
    expect(style.fontSize).toBe(10);
    expect(style.lineHeight).toBe(30);
  });

  it('type italic → fontStyle=italic, fontSize=12', () => {
    render(<ThemedText type="italic">Italique</ThemedText>);
    const style = getStyle(screen.getByText('Italique'));
    expect(style.fontStyle).toBe('italic');
    expect(style.fontSize).toBe(12);
  });
});

// ─── Couleur du thème ─────────────────────────────────────────────────────────

describe('ThemedText - couleur du thème', () => {
  it('injecte la couleur dark (#ECEDEE) via useThemeColor', () => {
    // useThemeColor('text') renvoie Colors.dark.text = '#ECEDEE'
    render(<ThemedText>Couleur test</ThemedText>);
    const style = getStyle(screen.getByText('Couleur test'));
    expect(style.color).toBe('#ECEDEE');
  });
});

// ─── Rendu sans crash ──────────────────────────────────────────────────────────

describe('ThemedText - rendu sans crash', () => {
  const types: Array<'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'italic' | 'tab'> = [
    'default', 'title', 'defaultSemiBold', 'subtitle', 'link', 'italic', 'tab',
  ];

  types.forEach((type) => {
    it(`ne crash pas pour le type "${type}"`, () => {
      expect(() =>
        render(<ThemedText type={type}>Contenu {type}</ThemedText>)
      ).not.toThrow();
    });
  });

  it('accepte des props supplémentaires (testID, numberOfLines)', () => {
    expect(() =>
      render(<ThemedText testID="my-text" numberOfLines={2}>Extra props</ThemedText>)
    ).not.toThrow();
  });

  it('affiche le texte enfant correctement', () => {
    render(<ThemedText>Hello Domoticz</ThemedText>);
    expect(screen.getByText('Hello Domoticz')).toBeTruthy();
  });
});
