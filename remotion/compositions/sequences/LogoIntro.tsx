/**
 * LogoIntro Sequence
 * Frames 0-60 (2 seconds): Fade in logo/branding animation
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { MODERN_COLORS, MODERN_FONTS } from '../templates/ModernTemplate';

interface LogoIntroProps {
  brokerageName?: string;
  logoUrl?: string;
}

export const LogoIntro: React.FC<LogoIntroProps> = ({
  brokerageName = 'Premier Realty',
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in animation
  const opacity = spring({
    frame,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  // Scale animation
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
    },
  });

  // Fade out near the end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: MODERN_COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          opacity,
          transform: `scale(${0.8 + scale * 0.2})`,
        }}
      >
        {/* Logo - using plain img for blob URL support */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            style={{
              width: 160,
              height: 160,
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              backgroundColor: MODERN_COLORS.accent,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: MODERN_COLORS.text,
                fontFamily: MODERN_FONTS.heading,
              }}
            >
              {brokerageName?.charAt(0) || 'P'}
            </span>
          </div>
        )}

        {/* Brokerage Name */}
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: MODERN_COLORS.text,
            fontFamily: MODERN_FONTS.heading,
            letterSpacing: '0.05em',
          }}
        >
          {brokerageName}
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: 16,
            color: MODERN_COLORS.textMuted,
            fontFamily: MODERN_FONTS.body,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Presents
        </span>
      </div>
    </AbsoluteFill>
  );
};
