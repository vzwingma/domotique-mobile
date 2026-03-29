import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import DomoticzDevice from '@/app/models/domoticzDevice.model';
import { getGroupColor } from '@/app/enums/Colors';
import { DomoticzDeviceStatus } from '@/app/enums/DomoticzEnum';

// ── Constantes de l'icône ─────────────────────────────────────────────────────
const W = 40;         // largeur du conteneur
const H = 52;         // hauteur (ratio ~2:1)
const BORDER_R = 8;   // arrondi du conteneur
const PADDING = 3;    // marge interne (~8% de W)
const MAX_SLATS = 8;  // nombre de lames à l'état fermé
const SLAT_H = 3;     // hauteur d'une lame
const SLAT_R = 1.5;   // arrondi des lames

const INNER_W = W - 2 * PADDING;            // largeur utile
const INNER_H = H - 2 * PADDING;            // hauteur utile
const SLAT_W = Math.round(INNER_W * 0.85);  // largeur lame (~85% de l'intérieur)
const SLAT_X = (W - SLAT_W) / 2;            // centrage horizontal
const CELL_H = INNER_H / MAX_SLATS;          // hauteur d'une cellule

export type IconVoletSVGProps = {
  device: DomoticzDevice;
};

/**
 * Icône SVG d'un volet roulant représentant visuellement son niveau d'ouverture.
 *
 * États gérés :
 * - Level 0 / status=Off (fermé) → toutes les lames pleines (haut → bas)
 * - Level 50                     → moitié haute pleine, moitié basse vide
 * - Level 100 (ouvert)           → aucune lame
 * - Groupe mixte (!consistantLevel) → lames alternées (zébrure) signalant l'incohérence
 *
 * Des contours fantômes matérialisent les emplacements vides.
 * Les groupes ont un cadre légèrement plus épais.
 */
export const IconVoletSVG: React.FC<IconVoletSVGProps> = ({ device }) => {
  const color = getGroupColor(device);

  // Status "Off" = fermé dans Domoticz, quel que soit le level (ex: level=100 status=Off)
  const effectiveLevel = device.status === DomoticzDeviceStatus.OFF ? 0 : (device.level ?? 0);

  // État mixte : groupe dont les volets ne sont pas tous au même niveau
  const isMixed = device.isGroup && !device.consistantLevel;

  // Nombre de lames pleines depuis le haut (ignoré en mode mixte)
  const slatCount = Math.round(MAX_SLATS * (100 - effectiveLevel) / 100);

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

      {/* Fond sombre du conteneur */}
      <Rect x={0} y={0} width={W} height={H}
            rx={BORDER_R} ry={BORDER_R}
            fill="#0f1a2e" />

      {/* Cadre — plus épais pour les groupes */}
      <Rect x={0.75} y={0.75} width={W - 1.5} height={H - 1.5}
            rx={BORDER_R - 0.5} ry={BORDER_R - 0.5}
            fill="none"
            stroke={color}
            strokeWidth={device.isGroup ? 1.5 : 1} />

      {/* Emplacements fantômes : contours fins pour visualiser la plage totale */}
      {Array.from({ length: MAX_SLATS }, (_, i) => (
        <Rect key={`ghost-${i}`}
              x={SLAT_X}
              y={PADDING + i * CELL_H + (CELL_H - SLAT_H) / 2}
              width={SLAT_W} height={SLAT_H}
              rx={SLAT_R} ry={SLAT_R}
              fill="none"
              stroke={color}
              strokeWidth={0.5}
              opacity={0.2} />
      ))}

      {/* Lames pleines */}
      {Array.from({ length: MAX_SLATS }, (_, i) => {
        // Mode mixte : zébrure — une lame sur deux colorée (positions paires)
        const visible = isMixed ? i % 2 === 0 : i < slatCount;
        if (!visible) return null;
        return (
          <Rect key={`slat-${i}`}
                x={SLAT_X}
                y={PADDING + i * CELL_H + (CELL_H - SLAT_H) / 2}
                width={SLAT_W} height={SLAT_H}
                rx={SLAT_R} ry={SLAT_R}
                fill={color}
                opacity={isMixed ? 0.7 : 1} />
        );
      })}

    </Svg>
  );
};

export default IconVoletSVG;
