/**
 * LuxuryTemplate - Elegant gold accents with refined typography
 * Best for high-end properties
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ExportFormat } from '../../../lib/types/video-project';

interface LuxuryTemplateProps {
  children: React.ReactNode;
  format: ExportFormat;
}

// Luxury template colors
export const LUXURY_COLORS = {
  primary: '#1c1917',     // stone-900
  secondary: '#292524',   // stone-800
  accent: '#d4af37',      // gold
  background: '#0c0a09',  // stone-950
  text: '#fafaf9',        // stone-50
  textMuted: '#a8a29e',   // stone-400
};

// Luxury template fonts
export const LUXURY_FONTS = {
  heading: "'Playfair Display', Georgia, serif",
  body: 'Inter, system-ui, sans-serif',
};

export const LuxuryTemplate: React.FC<LuxuryTemplateProps> = ({ children, format }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: LUXURY_COLORS.background,
        fontFamily: LUXURY_FONTS.body,
      }}
    >
      {/* Subtle gold gradient overlay at top */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${LUXURY_COLORS.accent}15 0%, transparent 20%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      {children}

      {/* Elegant vignette with gold tint */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, ${LUXURY_COLORS.primary}90 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle gold border accent */}
      <AbsoluteFill
        style={{
          border: `1px solid ${LUXURY_COLORS.accent}30`,
          margin: '2%',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// Export colors and fonts for use in sequences
export { LUXURY_COLORS as colors, LUXURY_FONTS as fonts };
