/**
 * KenBurnsImage Component
 * Applies Ken Burns effect (zoom/pan) to images
 *
 * IMPORTANT: Uses plain <img> instead of Remotion's <Img> to support blob URLs.
 * Remotion's <Img> uses delayRender internally which hangs forever with blob URLs.
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type KenBurnsDirection = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';

interface KenBurnsImageProps {
  src: string;
  direction?: KenBurnsDirection;
  durationInFrames?: number;
  intensity?: number; // 0-1, default 0.1 (10% zoom/pan)
}

export const KenBurnsImage: React.FC<KenBurnsImageProps> = ({
  src,
  direction = 'zoom-in',
  durationInFrames: propDuration,
  intensity = 0.1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: configDuration } = useVideoConfig();

  const duration = propDuration || configDuration;
  const progress = frame / duration;

  // Calculate transform based on direction
  let transform = '';

  switch (direction) {
    case 'zoom-in':
      // Start at 1, zoom to 1 + intensity
      const scaleIn = interpolate(progress, [0, 1], [1, 1 + intensity]);
      transform = `scale(${scaleIn})`;
      break;

    case 'zoom-out':
      // Start at 1 + intensity, zoom to 1
      const scaleOut = interpolate(progress, [0, 1], [1 + intensity, 1]);
      transform = `scale(${scaleOut})`;
      break;

    case 'pan-left':
      // Start at right, pan to left
      const panLeft = interpolate(progress, [0, 1], [intensity * 100, -intensity * 100]);
      transform = `scale(1.1) translateX(${panLeft}%)`;
      break;

    case 'pan-right':
      // Start at left, pan to right
      const panRight = interpolate(progress, [0, 1], [-intensity * 100, intensity * 100]);
      transform = `scale(1.1) translateX(${panRight}%)`;
      break;
  }

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Using plain <img> instead of Remotion's <Img> to support blob URLs */}
      <img
        src={src}
        alt=""
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          maxWidth: 'none',
          transform: `translate(-50%, -50%) ${transform}`,
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
};
