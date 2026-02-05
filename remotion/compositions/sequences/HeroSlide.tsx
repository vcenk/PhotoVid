/**
 * HeroSlide Sequence
 * Frames 60-120 (2 seconds): Hero image with address text overlay
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { KenBurnsImage } from '../components/KenBurnsImage';
import { MODERN_COLORS, MODERN_FONTS } from '../templates/ModernTemplate';

interface HeroSlideProps {
  image?: string;
  address?: string;
  city?: string;
  state?: string;
}

export const HeroSlide: React.FC<HeroSlideProps> = ({
  image,
  address = '123 Main Street',
  city,
  state,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Text fade in
  const textOpacity = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  // Text slide up
  const textY = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
    },
  });

  // Format location
  const location = [city, state].filter(Boolean).join(', ');

  return (
    <AbsoluteFill>
      {/* Background Image with Ken Burns */}
      {image ? (
        <KenBurnsImage
          src={image}
          direction="zoom-in"
          durationInFrames={durationInFrames}
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: MODERN_COLORS.secondary }} />
      )}

      {/* Gradient Overlay */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      {/* Address Text */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: height * 0.15,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            opacity: textOpacity,
            transform: `translateY(${(1 - textY) * 40}px)`,
          }}
        >
          {/* Address */}
          <h1
            style={{
              fontSize: Math.min(width * 0.05, 64),
              fontWeight: 700,
              color: MODERN_COLORS.text,
              fontFamily: MODERN_FONTS.heading,
              textAlign: 'center',
              margin: 0,
              textShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {address}
          </h1>

          {/* Location */}
          {location && (
            <span
              style={{
                fontSize: Math.min(width * 0.025, 28),
                color: MODERN_COLORS.textMuted,
                fontFamily: MODERN_FONTS.body,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {location}
            </span>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
