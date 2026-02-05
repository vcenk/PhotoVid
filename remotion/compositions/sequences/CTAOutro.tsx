/**
 * CTAOutro Sequence
 * Frames 840-900 (2 seconds): Call to action + logo fade out
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

interface CTAOutroProps {
  brokerageName?: string;
  logoUrl?: string;
  address?: string;
}

export const CTAOutro: React.FC<CTAOutroProps> = ({
  brokerageName,
  logoUrl,
  address,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in
  const fadeIn = spring({
    frame,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  // Scale up
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
    },
  });

  // Final fade out to black
  const fadeToBlack = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: MODERN_COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          opacity: fadeIn,
          transform: `scale(${0.9 + scale * 0.1})`,
        }}
      >
        {/* CTA Text */}
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 24,
              color: MODERN_COLORS.textMuted,
              fontFamily: MODERN_FONTS.body,
              margin: '0 0 8px 0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Schedule Your Private Tour
          </p>
          {address && (
            <h2
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: MODERN_COLORS.text,
                fontFamily: MODERN_FONTS.heading,
                margin: 0,
              }}
            >
              {address}
            </h2>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: MODERN_COLORS.accent,
            borderRadius: 1,
          }}
        />

        {/* Logo - using plain img for blob URL support */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            style={{
              width: 100,
              height: 100,
              objectFit: 'contain',
            }}
          />
        ) : brokerageName ? (
          <span
            style={{
              fontSize: 20,
              color: MODERN_COLORS.textMuted,
              fontFamily: MODERN_FONTS.body,
            }}
          >
            {brokerageName}
          </span>
        ) : null}
      </div>

      {/* Fade to black overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: '#000',
          opacity: fadeToBlack,
        }}
      />
    </AbsoluteFill>
  );
};
