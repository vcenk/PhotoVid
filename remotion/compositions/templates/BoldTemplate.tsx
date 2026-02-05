/**
 * BoldTemplate - High contrast with impactful typography
 * Best for urban condos, new builds, commercial properties
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ExportFormat } from '../../../lib/types/video-project';

interface BoldTemplateProps {
  children: React.ReactNode;
  format: ExportFormat;
}

// Bold template colors
export const BOLD_COLORS = {
  primary: '#000000',
  secondary: '#18181b',
  accent: '#ef4444',      // red-500
  background: '#000000',
  text: '#ffffff',
  textMuted: '#a1a1aa',   // zinc-400
};

// Bold template fonts
export const BOLD_FONTS = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
};

export const BoldTemplate: React.FC<BoldTemplateProps> = ({ children, format }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BOLD_COLORS.background,
        fontFamily: BOLD_FONTS.body,
      }}
    >
      {/* Content */}
      {children}

      {/* Red accent line at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: BOLD_COLORS.accent,
        }}
      />

      {/* High contrast vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// Export colors and fonts for use in sequences
export { BOLD_COLORS as colors, BOLD_FONTS as fonts };
