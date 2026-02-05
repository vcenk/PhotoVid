/**
 * LottieAnimation Component
 * Wrapper for @remotion/lottie that handles loading and rendering
 * following Remotion best practices
 */

import React, { useEffect, useState } from 'react';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { AbsoluteFill, cancelRender, continueRender, delayRender } from 'remotion';

interface LottieAnimationProps {
  /** URL to the Lottie JSON file */
  src: string;
  /** Optional style overrides */
  style?: React.CSSProperties;
  /** Play direction */
  direction?: 'forward' | 'backward';
  /** Whether to loop the animation */
  loop?: boolean;
  /** Playback speed multiplier */
  playbackRate?: number;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  style,
  direction = 'forward',
  loop = false,
  playbackRate = 1,
}) => {
  const [handle] = useState(() => delayRender(`Loading Lottie: ${src}`));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch Lottie: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        setError(err.message);
        // Don't cancel render, just show fallback
        continueRender(handle);
      });
  }, [src, handle]);

  if (error) {
    // Fallback for failed load
    return (
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          ...style,
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          Animation unavailable
        </div>
      </AbsoluteFill>
    );
  }

  if (!animationData) {
    return null;
  }

  return (
    <Lottie
      animationData={animationData}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
      direction={direction === 'forward' ? 1 : -1}
      loop={loop}
      playbackRate={playbackRate}
    />
  );
};

/**
 * LottieOverlay - A Lottie animation positioned as an overlay
 * Perfect for transitions and effects
 */
export const LottieOverlay: React.FC<LottieAnimationProps & {
  opacity?: number;
  blendMode?: React.CSSProperties['mixBlendMode'];
}> = ({
  opacity = 1,
  blendMode = 'normal',
  ...props
}) => {
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: 'none',
      }}
    >
      <LottieAnimation {...props} />
    </AbsoluteFill>
  );
};
