/**
 * MinimalTemplate - Ultra-clean with maximum whitespace
 * Best for modern listings with clean photography
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ExportFormat } from '../../../lib/types/video-project';

interface MinimalTemplateProps {
  children: React.ReactNode;
  format: ExportFormat;
}

// Minimal template colors
export const MINIMAL_COLORS = {
  primary: '#ffffff',
  secondary: '#f4f4f5',   // zinc-100
  accent: '#18181b',      // zinc-900
  background: '#ffffff',
  text: '#18181b',        // zinc-900
  textMuted: '#71717a',   // zinc-500
};

// Minimal template fonts
export const MINIMAL_FONTS = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
};

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ children, format }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: MINIMAL_COLORS.background,
        fontFamily: MINIMAL_FONTS.body,
      }}
    >
      {/* Content */}
      {children}

      {/* Subtle shadow at edges for depth */}
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.03)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// Export colors and fonts for use in sequences
export { MINIMAL_COLORS as colors, MINIMAL_FONTS as fonts };
