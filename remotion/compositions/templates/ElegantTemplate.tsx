/**
 * ElegantTemplate - Sophisticated serif fonts with navy tones
 * Best for classic homes, family properties, traditional listings
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ExportFormat } from '../../../lib/types/video-project';

interface ElegantTemplateProps {
  children: React.ReactNode;
  format: ExportFormat;
}

// Elegant template colors
export const ELEGANT_COLORS = {
  primary: '#1e3a5f',     // navy
  secondary: '#2c4a6e',
  accent: '#f5f0e1',      // cream
  background: '#0f172a',  // slate-900
  text: '#f8fafc',        // slate-50
  textMuted: '#94a3b8',   // slate-400
};

// Elegant template fonts
export const ELEGANT_FONTS = {
  heading: "'Playfair Display', Georgia, serif",
  body: 'Inter, system-ui, sans-serif',
};

export const ElegantTemplate: React.FC<ElegantTemplateProps> = ({ children, format }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: ELEGANT_COLORS.background,
        fontFamily: ELEGANT_FONTS.body,
      }}
    >
      {/* Subtle navy gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${ELEGANT_COLORS.primary}40 0%, transparent 50%, ${ELEGANT_COLORS.secondary}40 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      {children}

      {/* Elegant vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(15, 23, 42, 0.4) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Cream accent line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${ELEGANT_COLORS.accent}80, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Export colors and fonts for use in sequences
export { ELEGANT_COLORS as colors, ELEGANT_FONTS as fonts };
