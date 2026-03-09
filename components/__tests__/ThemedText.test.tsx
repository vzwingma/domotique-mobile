/**
 * Tests pour le composant ThemedText
 * Vérifie les snapshots et les styles pour chaque type de texte
 */
import * as React from 'react';
import renderer from 'react-test-renderer';
import { ThemedText } from '../ThemedText';

// ─── Snapshots par type ────────────────────────────────────────────────────────

describe('ThemedText – snapshots par type', () => {
  it('snapshot : type default (implicite)', () => {
    const tree = renderer.create(<ThemedText>Texte par défaut</ThemedText>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('snapshot : type title', () => {
    const tree = renderer.create(<ThemedText type="title">Titre</ThemedText>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('snapshot : type defaultSemiBold', () => {
    const tree = renderer.create(<ThemedText type="defaultSemiBold">Semi-Bold</ThemedText>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('snapshot : type subtitle', () => {
    const tree = renderer.create(<ThemedText type="subtitle">Sous-titre</ThemedText>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('snapshot : type link', () => {
    const tree = renderer.create(<ThemedText type="link">Lien</ThemedText>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('snapshot : type italic', () => {
    const tree = renderer.create(<ThemedText type="italic">Italique</ThemedText>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('snapshot : type tab', () => {
    const tree = renderer.create(<ThemedText type="tab">Onglet</ThemedText>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

// ─── Vérification des styles ───────────────────────────────────────────────────

/**
 * Utilitaire : aplatit un tableau de styles en un objet unique
 */
function flattenStyle(styleArray: any[]): Record<string, any> {
  return styleArray.reduce((acc: Record<string, any>, s: any) => ({ ...acc, ...(s ?? {}) }), {});
}

describe('ThemedText – vérification des styles', () => {
  it('type default → fontSize=16, lineHeight=24', () => {
    const json = renderer.create(<ThemedText>Default</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.fontSize).toBe(16);
    expect(style.lineHeight).toBe(24);
  });

  it('type title → fontSize=32, fontWeight=bold, lineHeight=32', () => {
    const json = renderer.create(<ThemedText type="title">Titre</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.fontSize).toBe(32);
    expect(style.fontWeight).toBe('bold');
    expect(style.lineHeight).toBe(32);
  });

  it('type defaultSemiBold → fontSize=16, fontWeight=600, lineHeight=24', () => {
    const json = renderer.create(<ThemedText type="defaultSemiBold">SemiBold</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.fontSize).toBe(16);
    expect(style.fontWeight).toBe('600');
    expect(style.lineHeight).toBe(24);
  });

  it('type subtitle → fontSize=20, fontWeight=bold', () => {
    const json = renderer.create(<ThemedText type="subtitle">Subtitle</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.fontSize).toBe(20);
    expect(style.fontWeight).toBe('bold');
  });

  it('type link → fontSize=16, lineHeight=30', () => {
    const json = renderer.create(<ThemedText type="link">Lien</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.fontSize).toBe(16);
    expect(style.lineHeight).toBe(30);
  });

  it('type tab → fontSize=10, lineHeight=30', () => {
    const json = renderer.create(<ThemedText type="tab">Tab</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.fontSize).toBe(10);
    expect(style.lineHeight).toBe(30);
  });

  it('type italic → fontStyle=italic, fontSize=12', () => {
    const json = renderer.create(<ThemedText type="italic">Italique</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.fontStyle).toBe('italic');
    expect(style.fontSize).toBe(12);
  });
});

// ─── Rendu sans crash ──────────────────────────────────────────────────────────

describe('ThemedText – rendu sans crash', () => {
  const types: Array<'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'italic' | 'tab'> = [
    'default', 'title', 'defaultSemiBold', 'subtitle', 'link', 'italic', 'tab',
  ];

  types.forEach((type) => {
    it(`ne crash pas pour le type "${type}"`, () => {
      expect(() =>
        renderer.create(<ThemedText type={type}>Contenu test</ThemedText>)
      ).not.toThrow();
    });
  });

  it('accepte des props supplémentaires (testID, numberOfLines)', () => {
    expect(() =>
      renderer.create(
        <ThemedText testID="my-text" numberOfLines={2}>Texte</ThemedText>
      )
    ).not.toThrow();
  });

  it('transmet la couleur du thème dark au composant Text', () => {
    // useThemeColor renvoie Colors.dark.text = '#ECEDEE' en mode dark
    const json = renderer.create(<ThemedText>Texte</ThemedText>).toJSON() as any;
    const style = flattenStyle(json.props.style);
    expect(style.color).toBe('#ECEDEE');
  });
});
