/**
 * TextOverlay Component
 * Animated text overlay with configurable styling
 */

import React from 'react';
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { MODERN_COLORS, MODERN_FONTS } from '../templates/ModernTemplate';

interface TextOverlayProps {
  text: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  position?: 'top' | 'center' | 'bottom';
  alignment?: 'left' | 'center' | 'right';
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  delay?: number; // Frames to delay animation
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  fontSize = 32,
  fontWeight = 600,
  color = MODERN_COLORS.text,
  position = 'center',
  alignment = 'center',
  animation = 'fade',
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Apply delay
  const adjustedFrame = Math.max(0, frame - delay);

  // Animation progress
  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  // Fade out near end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Calculate transform based on animation type
  let transform = '';
  let opacity = progress;

  switch (animation) {
    case 'slide-up':
      transform = `translateY(${(1 - progress) * 30}px)`;
      break;
    case 'slide-down':
      transform = `translateY(${(progress - 1) * 30}px)`;
      break;
    case 'scale':
      transform = `scale(${0.8 + progress * 0.2})`;
      break;
    case 'fade':
    default:
      break;
  }

  // Position styles
  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: '0 48px',
    textAlign: alignment,
  };

  switch (position) {
    case 'top':
      positionStyles.top = 48;
      break;
    case 'bottom':
      positionStyles.bottom = 48;
      break;
    case 'center':
    default:
      positionStyles.top = '50%';
      positionStyles.transform = 'translateY(-50%)';
      break;
  }

  return (
    <div style={positionStyles}>
      <span
        style={{
          display: 'inline-block',
          fontSize,
          fontWeight,
          color,
          fontFamily: MODERN_FONTS.heading,
          opacity: opacity * fadeOut,
          transform,
          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {text}
      </span>
    </div>
  );
};
