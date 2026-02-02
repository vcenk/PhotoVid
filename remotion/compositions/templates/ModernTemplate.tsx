/**
 * ModernTemplate - Clean, minimal design template
 * Provides consistent styling for the property video
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ExportFormat } from '../../../lib/types/video-project';

interface ModernTemplateProps {
  children: React.ReactNode;
  format: ExportFormat;
}

// Modern template colors
export const MODERN_COLORS = {
  primary: '#18181b',     // zinc-900
  secondary: '#27272a',   // zinc-800
  accent: '#8b5cf6',      // violet-500
  background: '#09090b',  // zinc-950
  text: '#fafafa',        // zinc-50
  textMuted: '#a1a1aa',   // zinc-400
};

// Modern template fonts
export const MODERN_FONTS = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
};

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ children, format }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: MODERN_COLORS.background,
        fontFamily: MODERN_FONTS.body,
      }}
    >
      {/* Content */}
      {children}

      {/* Subtle vignette overlay for cinematic feel */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// Export colors and fonts for use in sequences
export { MODERN_COLORS as colors, MODERN_FONTS as fonts };
