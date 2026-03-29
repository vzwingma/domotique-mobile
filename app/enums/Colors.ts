import DomoticzDevice from "../models/domoticzDevice.model";

export const PROFILE = process.env.MY_ENVIRONMENT ?? process.env.EXPO_PUBLIC_MY_ENVIRONMENT;

export const enum PROFILES_ENV {
    C = "previewC",
    V = "previewV",
}

export const Colors = {
  dark: {
    // ── Textes ───────────────────────────────────────────────────────────
    /** Texte principal */
    text: '#ECEDEE',
    /** Label secondaire (descriptions, meta-données) */
    label: '#9BA1A6',
    /** Label tertiaire (valeurs mesurées, résumés, statuts) */
    labelSecondary: '#d5d5d5',

    // ── Arrière-plans ────────────────────────────────────────────────────
    /** Fond de l'application */
    background: '#0b1326',
    /** Fond de la barre de titre / onglets */
    titlebackground: '#182033',
    /** Fond des cartes et lignes d'équipement */
    surface: '#222a3d',
    /** Fond des sections (panneaux Maison, À propos) */
    surfaceAlt: '#0b1326',

    // ── Bordures ─────────────────────────────────────────────────────────
    /** Bordure des cartes et lignes d'équipement */
    border: '#3A3A3A',
    /** Bordure des sections (panneaux Maison, À propos) */
    borderAlt: '#2a2c2d',

    // ── Icônes et navigation ─────────────────────────────────────────────
    /** Couleur blanche (tint, icônes sélectionnées) */
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',

    // ── État : déconnecté ─────────────────────────────────────────────────
    disconnected: {
      /** Fond de la ligne déconnectée */
      background: '#382132',
      /** Bordure de la ligne déconnectée */
      border: '#7f2b2b',
      /** Fond du badge déconnecté (DisconnectedState) */
      containerBackground: '#2a1414',
      /** Icône wifi-off */
      icon: '#ff8a80',
      /** Texte du badge déconnecté */
      label: '#ffd7d7',
    },

    // ── État : erreur / danger ────────────────────────────────────────────
    error: {
      background: '#3a1c1c',
      backgroundPressed: '#382132',
      border: '#7a2c2c',
      text: '#ff6b6b',
    },

    // ── Emphasis : boutons d'action ───────────────────────────────────────
    emphasis: {
      /** Fond de base (PrimaryIconAction) */
      base: '#222a3d',
      /** Fond bouton actif / sélectionné */
      active: '#060e20',
      /** Fond bouton actif pressé */
      activePressed: '#2d3449',
      /** Fond bouton inactif */
      inactive: '#111111',
      /** Fond bouton inactif pressé */
      inactivePressed: '#141c2e',
      /** Bordure bouton inactif */
      inactiveBorder: '#4f4f4f',
    },

    // ── Chips segmentés ───────────────────────────────────────────────────
    chip: {
      border: '#555',
      text: '#ccc',
      /** Texte chip sélectionné (sur couleur accent) */
      textSelected: '#000',
    },

    // ── Slider ────────────────────────────────────────────────────────────
    slider: {
      trackActive: '#FFFFFF',
      trackInactive: '#606060',
    },

    // ── Séparateur ────────────────────────────────────────────────────────
    separator: '#cc2200',
  },
  domoticz: {
    /** Couleur accent principale (teal en previewC, jaune en previewV) */
    color: PROFILE === PROFILES_ENV.C ? '#339a9a' : '#f5c727',
  },
};

/**
 * Renvoie la couleur d'accentuation du groupe Domoticz spécifié.
 */
export function getGroupColor(volet: DomoticzDevice): string {
  if (volet.isGroup) {
    switch (volet.idx) {
      case 85:  return '#5FACD3'; // tous les volets
      case 84:  return '#B19CD9'; // volets salon
      case 86:  return '#BDFCC9'; // volets chambre
      case 122: return '#FFDAB9'; // toutes les lumières
      case 117: return '#4AA3A2'; // lumières salon
      default:  return Colors.dark.tint;
    }
  }
  return Colors.dark.tint;
}