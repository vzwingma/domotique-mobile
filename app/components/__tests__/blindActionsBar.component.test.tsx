/**
 * Tests unitaires pour BlindActionsBar
 * app/components/blindActionsBar.component.tsx
 *
 * Couvre :
 *  - Rendu sans crash (isActive=true et isActive=false)
 *  - Présence des 3 boutons (Ouvrir, Stop, Fermer)
 *  - Callbacks onOpen/onStop/onClose appelés quand isActive=true
 *  - Boutons désactivés (accessibilityState.disabled) quand isActive=false
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { describe, expect, jest , it} from '@jest/globals';
import { BlindActionsBar } from '../blindActionsBar.component';

// Ionicons est importé via '@expo/vector-icons' — déjà mocké dans jest.setup.ts
// On ajoute aussi le mock direct du module Ionicons pour la compatibilité
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// ─── Helper : callbacks de base ───────────────────────────────────────────────
function makeCallbacks() {
  return {
    onOpen: jest.fn(),
    onStop: jest.fn(),
    onClose: jest.fn(),
  };
}

// =============================================================================
// QA02-1 : Rendu sans crash
// =============================================================================
describe('BlindActionsBar — rendu sans crash', () => {
  it('se rend sans crash quand isActive=true', () => {
    const cbs = makeCallbacks();
    expect(() =>
      render(<BlindActionsBar isActive={true} {...cbs} />)
    ).not.toThrow();
  });

  it('se rend sans crash quand isActive=false', () => {
    const cbs = makeCallbacks();
    expect(() =>
      render(<BlindActionsBar isActive={false} {...cbs} />)
    ).not.toThrow();
  });
});

// =============================================================================
// QA02-2 : Présence des 3 boutons
// =============================================================================
describe('BlindActionsBar — présence des 3 boutons', () => {
  it('affiche le bouton "Ouvrir le volet"', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    expect(getByLabelText('Ouvrir le volet')).toBeTruthy();
  });

  it('affiche le bouton "Stopper le volet"', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    expect(getByLabelText('Stopper le volet')).toBeTruthy();
  });

  it('affiche le bouton "Fermer le volet"', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    expect(getByLabelText('Fermer le volet')).toBeTruthy();
  });

  it('affiche les textes Ouvrir, Stop, Fermer', () => {
    const cbs = makeCallbacks();
    const { getByText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    expect(getByText('Ouvrir')).toBeTruthy();
    expect(getByText('Stop')).toBeTruthy();
    expect(getByText('Fermer')).toBeTruthy();
  });
});

// =============================================================================
// QA02-3 : Callbacks appelés quand isActive=true
// =============================================================================
describe('BlindActionsBar — callbacks quand isActive=true', () => {
  it('onOpen est appelé au press du bouton Ouvrir', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    fireEvent.press(getByLabelText('Ouvrir le volet'));
    expect(cbs.onOpen).toHaveBeenCalledTimes(1);
    expect(cbs.onStop).not.toHaveBeenCalled();
    expect(cbs.onClose).not.toHaveBeenCalled();
  });

  it('onStop est appelé au press du bouton Stop', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    fireEvent.press(getByLabelText('Stopper le volet'));
    expect(cbs.onStop).toHaveBeenCalledTimes(1);
    expect(cbs.onOpen).not.toHaveBeenCalled();
    expect(cbs.onClose).not.toHaveBeenCalled();
  });

  it('onClose est appelé au press du bouton Fermer', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    fireEvent.press(getByLabelText('Fermer le volet'));
    expect(cbs.onClose).toHaveBeenCalledTimes(1);
    expect(cbs.onOpen).not.toHaveBeenCalled();
    expect(cbs.onStop).not.toHaveBeenCalled();
  });
});

// =============================================================================
// QA02-4 : Boutons désactivés quand isActive=false
// =============================================================================
describe('BlindActionsBar — état disabled quand isActive=false', () => {
  it('le bouton Ouvrir a accessibilityState.disabled=true', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={false} {...cbs} />);
    const btn = getByLabelText('Ouvrir le volet');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('le bouton Stop a accessibilityState.disabled=true', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={false} {...cbs} />);
    const btn = getByLabelText('Stopper le volet');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('le bouton Fermer a accessibilityState.disabled=true', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={false} {...cbs} />);
    const btn = getByLabelText('Fermer le volet');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it("aucun callback n'est appele au press quand isActive=false", () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={false} {...cbs} />);
    // fireEvent.press tentera quand même le press — mais onPress est undefined → pas d'appel
    fireEvent.press(getByLabelText('Ouvrir le volet'));
    fireEvent.press(getByLabelText('Stopper le volet'));
    fireEvent.press(getByLabelText('Fermer le volet'));
    expect(cbs.onOpen).not.toHaveBeenCalled();
    expect(cbs.onStop).not.toHaveBeenCalled();
    expect(cbs.onClose).not.toHaveBeenCalled();
  });
});

// =============================================================================
// QA02-5 : Boutons actifs quand isActive=true
// =============================================================================
describe('BlindActionsBar — état enabled quand isActive=true', () => {
  it('le bouton Ouvrir a accessibilityState.disabled=false', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    const btn = getByLabelText('Ouvrir le volet');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });

  it('le bouton Stop a accessibilityState.disabled=false', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    const btn = getByLabelText('Stopper le volet');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });

  it('le bouton Fermer a accessibilityState.disabled=false', () => {
    const cbs = makeCallbacks();
    const { getByLabelText } = render(<BlindActionsBar isActive={true} {...cbs} />);
    const btn = getByLabelText('Fermer le volet');
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });
});
