/**
 * AgentCard Sequence
 * Frames 720-840 (4 seconds): Agent info and contact details
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Img,
} from 'remotion';
import { MODERN_COLORS, MODERN_FONTS } from '../templates/ModernTemplate';
import type { AgentBranding } from '../../../lib/types/video-project';

interface AgentCardProps {
  agentBranding: AgentBranding;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agentBranding }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Card fade in
  const cardOpacity = spring({
    frame,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  // Card scale
  const cardScale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
    },
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Staggered text animations
  const nameOpacity = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const detailsOpacity = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const contactOpacity = spring({
    frame: frame - 30,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

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
          padding: 48,
          backgroundColor: MODERN_COLORS.primary,
          borderRadius: 24,
          opacity: cardOpacity,
          transform: `scale(${0.9 + cardScale * 0.1})`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: width * 0.6,
        }}
      >
        {/* Agent Photo */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `4px solid ${MODERN_COLORS.accent}`,
            backgroundColor: MODERN_COLORS.secondary,
          }}
        >
          {agentBranding.photoUrl ? (
            <Img
              src={agentBranding.photoUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
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
                }}
              >
                {agentBranding.name?.charAt(0) || 'A'}
              </span>
            </div>
          )}
        </div>

        {/* Name and Title */}
        <div
          style={{
            textAlign: 'center',
            opacity: nameOpacity,
          }}
        >
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: MODERN_COLORS.text,
              fontFamily: MODERN_FONTS.heading,
              margin: 0,
            }}
          >
            {agentBranding.name || 'Agent Name'}
          </h2>
          {agentBranding.title && (
            <p
              style={{
                fontSize: 18,
                color: MODERN_COLORS.accent,
                fontFamily: MODERN_FONTS.body,
                margin: '8px 0 0 0',
              }}
            >
              {agentBranding.title}
            </p>
          )}
        </div>

        {/* Brokerage */}
        {agentBranding.brokerageName && (
          <div
            style={{
              opacity: detailsOpacity,
            }}
          >
            <p
              style={{
                fontSize: 16,
                color: MODERN_COLORS.textMuted,
                fontFamily: MODERN_FONTS.body,
                margin: 0,
              }}
            >
              {agentBranding.brokerageName}
            </p>
          </div>
        )}

        {/* Contact Details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'center',
            opacity: contactOpacity,
          }}
        >
          {agentBranding.phone && (
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: MODERN_COLORS.text,
                fontFamily: MODERN_FONTS.body,
              }}
            >
              {agentBranding.phone}
            </span>
          )}
          {agentBranding.email && (
            <span
              style={{
                fontSize: 16,
                color: MODERN_COLORS.textMuted,
                fontFamily: MODERN_FONTS.body,
              }}
            >
              {agentBranding.email}
            </span>
          )}
          {agentBranding.website && (
            <span
              style={{
                fontSize: 16,
                color: MODERN_COLORS.accent,
                fontFamily: MODERN_FONTS.body,
              }}
            >
              {agentBranding.website}
            </span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
