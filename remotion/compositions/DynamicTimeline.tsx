/**
 * DynamicTimeline Composition
 * Renders the video editor timeline dynamically based on project state
 *
 * Uses @remotion/transitions for professional scene transitions
 * Uses @remotion/light-leaks for cinematic overlay effects
 *
 * IMPORTANT: Uses plain HTML elements instead of Remotion's <Img>/<Video>/<Audio>
 * to avoid delayRender hangs with blob URLs
 */

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { LightLeak } from '@remotion/light-leaks';
import type {
  VideoEditorProject,
  TimelineClip,
  EditorAsset,
  TrackType,
  ClipEffect,
  ClipTransition,
  TransitionType,
} from '@/lib/types/video-editor';

interface DynamicTimelineProps {
  project: VideoEditorProject;
}

export const DynamicTimeline: React.FC<DynamicTimelineProps> = ({ project }) => {
  const { clips, tracks, assets, transitions, isPlaying } = project;

  // Build a lookup: clipId → incoming transition (where this clip is toClipId)
  const incomingTransitions: Record<string, ClipTransition> = {};
  const outgoingTransitions: Record<string, ClipTransition> = {};
  for (const [, trans] of Object.entries(transitions) as [string, ClipTransition][]) {
    incomingTransitions[trans.toClipId] = trans;
    outgoingTransitions[trans.fromClipId] = trans;
  }

  // Sort tracks: visual first, then text, then audio
  const sortedTracks = [...tracks].sort((a, b) => {
    const order: Record<string, number> = { visual: 0, text: 1, audio: 2 };
    return (order[a.type] ?? 0) - (order[b.type] ?? 0);
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {sortedTracks.map((track, trackIndex) => {
        // Skip muted or hidden tracks
        if (track.muted && track.type === 'audio') return null;
        if (!track.visible && track.type !== 'audio') return null;

        return (
          <AbsoluteFill key={track.id} style={{ zIndex: trackIndex }}>
            {track.clips.map((clipId, clipIndex) => {
              const clip = clips[clipId];
              if (!clip) return null;

              const asset = clip.assetId ? assets[clip.assetId] : null;
              const incoming = incomingTransitions[clipId];
              const outgoing = outgoingTransitions[clipId];

              // Adjust sequence timing for transitions
              // If there's an incoming transition, start earlier to overlap with previous clip
              let seqFrom = clip.startFrame;
              let seqDuration = clip.durationFrames;

              if (incoming) {
                // Start earlier by transition duration to overlap
                seqFrom = Math.max(0, clip.startFrame - incoming.durationFrames);
                seqDuration += incoming.durationFrames;
              }

              if (outgoing) {
                // Extend duration to overlap with next clip
                seqDuration += outgoing.durationFrames;
              }

              return (
                <Sequence
                  key={clip.id}
                  from={seqFrom}
                  durationInFrames={seqDuration}
                >
                  <ClipRenderer
                    clip={clip}
                    asset={asset}
                    trackType={track.type}
                    trackVolume={track.volume}
                    incomingTransition={incoming}
                    outgoingTransition={outgoing}
                    allClips={clips}
                    isPlaying={isPlaying}
                    originalStartFrame={clip.startFrame}
                    originalDuration={clip.durationFrames}
                    sequenceOffset={clip.startFrame - seqFrom}
                  />
                </Sequence>
              );
            })}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// CLIP RENDERER
// ============================================

interface ClipRendererProps {
  clip: TimelineClip;
  asset: EditorAsset | null;
  trackType: TrackType;
  trackVolume?: number;
  incomingTransition?: ClipTransition;
  outgoingTransition?: ClipTransition;
  allClips: Record<string, TimelineClip>;
  isPlaying?: boolean;
  originalStartFrame?: number;
  originalDuration?: number;
  sequenceOffset?: number; // How much earlier the sequence started for incoming transition
}

const ClipRenderer: React.FC<ClipRendererProps> = ({
  clip,
  asset,
  trackType,
  trackVolume = 100,
  incomingTransition,
  outgoingTransition,
  allClips,
  isPlaying = false,
  originalStartFrame,
  originalDuration,
  sequenceOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Adjust frame for sequence offset (when sequence started earlier for incoming transition)
  const adjustedFrame = frame - sequenceOffset;
  const clipDuration = originalDuration || clip.durationFrames;

  // Calculate fade in/out based on clip's actual frames
  const fadeInFrames = clip.fadeIn || 0;
  const fadeOutFrames = clip.fadeOut || 0;

  const fadeIn = fadeInFrames > 0
    ? interpolate(adjustedFrame, [0, fadeInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  const fadeOut = fadeOutFrames > 0
    ? interpolate(adjustedFrame, [clipDuration - fadeOutFrames, clipDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  let opacity = Math.max(0, Math.min(1, fadeIn * fadeOut));

  // Apply transition effects
  let transitionTransform = '';
  let transitionClipPath = '';
  let transitionFilter = '';

  // Incoming transition (this clip is "to" — it appears)
  // The transition happens during the sequenceOffset period (before clip's original start)
  if (incomingTransition && sequenceOffset > 0) {
    const transDur = incomingTransition.durationFrames;
    if (frame < transDur) {
      const progress = interpolate(frame, [0, transDur], [0, 1], { extrapolateRight: 'clamp' });
      const easedProgress = easeInOutCubic(progress);
      const result = getTransitionStyle(incomingTransition.type, easedProgress, 'in');
      opacity *= result.opacity;
      transitionTransform = result.transform;
      transitionClipPath = result.clipPath;
      transitionFilter = result.filter;
    }
  }

  // Outgoing transition (this clip is "from" — it disappears)
  // The transition happens at the end of the clip's original duration
  if (outgoingTransition) {
    const transDur = outgoingTransition.durationFrames;
    const transStart = sequenceOffset + clipDuration; // Start at end of original clip content
    const transEnd = transStart + transDur;
    if (frame >= transStart && frame < transEnd) {
      const progress = interpolate(frame, [transStart, transEnd], [0, 1], { extrapolateRight: 'clamp' });
      const easedProgress = easeInOutCubic(progress);
      const result = getTransitionStyle(outgoingTransition.type, easedProgress, 'out');
      opacity *= result.opacity;
      transitionTransform = result.transform;
      transitionClipPath = result.clipPath;
      transitionFilter = result.filter;
    }
  }

  // Hide clip outside its actual content range (but keep visible during transitions)
  if (adjustedFrame < 0 || adjustedFrame >= clipDuration) {
    // Only render during transition periods
    const inTransitionPeriod = incomingTransition && frame < incomingTransition.durationFrames;
    const outTransitionPeriod = outgoingTransition && frame >= (sequenceOffset + clipDuration);
    if (!inTransitionPeriod && !outTransitionPeriod) {
      return null;
    }
  }

  const transitionStyle: React.CSSProperties = {};
  if (transitionTransform) transitionStyle.transform = transitionTransform;
  if (transitionClipPath) transitionStyle.clipPath = transitionClipPath;
  if (transitionFilter) transitionStyle.filter = transitionFilter;

  switch (trackType) {
    case 'visual':
      return (
        <EffectWrapper effects={clip.effects}>
          <div style={{ ...transitionStyle, width: '100%', height: '100%' }}>
            <VisualClip clip={clip} asset={asset} opacity={opacity} isPlaying={isPlaying} />
          </div>
        </EffectWrapper>
      );

    case 'text':
      return (
        <div style={transitionStyle}>
          <TextClip clip={clip} opacity={opacity} />
        </div>
      );

    case 'audio':
      if (!asset?.url) return null;
      return (
        <HtmlAudio
          src={asset.url}
          volume={((clip.volume ?? 100) / 100) * (trackVolume / 100) * opacity}
          startFrom={clip.trimStartFrame || 0}
        />
      );

    default:
      return null;
  }
};

// ============================================
// EASING FUNCTIONS
// ============================================

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// ============================================
// TRANSITION STYLE CALCULATOR
// ============================================

interface TransitionStyleResult {
  opacity: number;
  transform: string;
  clipPath: string;
  filter: string;
}

function getTransitionStyle(
  type: TransitionType,
  progress: number,
  direction: 'in' | 'out'
): TransitionStyleResult {
  const result: TransitionStyleResult = { opacity: 1, transform: '', clipPath: '', filter: '' };

  // For "in" transitions, progress goes 0→1 (clip appears)
  // For "out" transitions, progress goes 0→1 (clip disappears)
  const p = direction === 'in' ? progress : 1 - progress;

  switch (type) {
    case 'fade':
      result.opacity = p;
      break;

    case 'dissolve':
      // Dissolve with slight blur
      result.opacity = p;
      result.filter = `blur(${(1 - p) * 3}px)`;
      break;

    case 'slide-left':
      result.transform = `translateX(${(1 - p) * 100}%)`;
      break;

    case 'slide-right':
      result.transform = `translateX(${(p - 1) * 100}%)`;
      break;

    case 'slide-up':
      result.transform = `translateY(${(1 - p) * 100}%)`;
      break;

    case 'slide-down':
      result.transform = `translateY(${(p - 1) * 100}%)`;
      break;

    case 'wipe-left':
      if (direction === 'in') {
        result.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      } else {
        result.clipPath = `inset(0 0 0 ${(1 - p) * 100}%)`;
      }
      break;

    case 'wipe-right':
      if (direction === 'in') {
        result.clipPath = `inset(0 0 0 ${(1 - p) * 100}%)`;
      } else {
        result.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
      }
      break;

    case 'zoom-in':
      result.transform = `scale(${direction === 'in' ? 0.5 + p * 0.5 : 1 + (1 - p) * 0.5})`;
      result.opacity = p;
      break;

    case 'zoom-out':
      result.transform = `scale(${direction === 'in' ? 1.5 - p * 0.5 : 1 - (1 - p) * 0.5})`;
      result.opacity = p;
      break;
  }

  return result;
}

// ============================================
// HTML AUDIO (no delayRender)
// ============================================

const HtmlAudio: React.FC<{ src: string; volume: number; startFrom: number }> = ({
  src,
  volume,
  startFrom,
}) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      src={src}
      style={{ display: 'none' }}
    />
  );
};

// ============================================
// HTML VIDEO - synced with Remotion frame
// ============================================

interface HtmlVideoProps {
  src: string;
  style?: React.CSSProperties;
  trimStartFrame?: number;
  volume?: number; // 0-1
  muted?: boolean;
  isPlaying?: boolean;
}

const HtmlVideo: React.FC<HtmlVideoProps> = ({
  src,
  style,
  trimStartFrame = 0,
  volume = 1,
  muted = false,
  isPlaying = false,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate target time based on current frame
  const targetTime = (frame + trimStartFrame) / fps;

  // Set volume
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  // Sync video playback with isPlaying state
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      // Sync time and play
      const drift = Math.abs(video.currentTime - targetTime);
      if (drift > 0.15) {
        video.currentTime = targetTime;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      // Pause and seek to exact frame
      if (!video.paused) {
        video.pause();
      }
      const drift = Math.abs(video.currentTime - targetTime);
      if (drift > 0.03) {
        video.currentTime = targetTime;
      }
    }
  }, [isPlaying, frame, targetTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted={muted}
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
    />
  );
};

// ============================================
// VISUAL CLIP (Images/Videos) - uses plain HTML
// ============================================

interface VisualClipProps {
  clip: TimelineClip;
  asset: EditorAsset | null;
  opacity: number;
  isPlaying?: boolean;
}

const VisualClip: React.FC<VisualClipProps> = ({ clip, asset, opacity, isPlaying = false }) => {
  if (!asset?.url) return null;

  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (asset.type === 'image') {
    // Ken Burns effect for images
    if (clip.kenBurns) {
      const progress = frame / Math.max(1, durationInFrames);
      // Apply easing for smoother Ken Burns
      const easedProgress = easeOutQuart(progress);
      const intensity = clip.kenBurns.intensity || 0.1;
      let transform = '';

      switch (clip.kenBurns.direction) {
        case 'zoom-in':
          const scaleIn = 1 + easedProgress * intensity;
          transform = `scale(${scaleIn})`;
          break;
        case 'zoom-out':
          const scaleOut = 1 + intensity - easedProgress * intensity;
          transform = `scale(${scaleOut})`;
          break;
        case 'pan-left':
          const panL = easedProgress * intensity * 100;
          transform = `scale(1.1) translateX(${panL}%)`;
          break;
        case 'pan-right':
          const panR = -easedProgress * intensity * 100;
          transform = `scale(1.1) translateX(${panR}%)`;
          break;
      }

      return (
        <AbsoluteFill style={{ opacity, overflow: 'hidden' }}>
          <img
            src={asset.url}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform,
              transformOrigin: 'center center',
            }}
          />
        </AbsoluteFill>
      );
    }

    // Static image
    return (
      <AbsoluteFill style={{ opacity }}>
        <img
          src={asset.url}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>
    );
  }

  if (asset.type === 'video') {
    // Get volume from clip (default 100%), convert to 0-1 range
    const clipVolume = (clip.volume ?? 100) / 100;
    return (
      <AbsoluteFill style={{ opacity }}>
        <HtmlVideo
          src={asset.url}
          trimStartFrame={clip.trimStartFrame}
          volume={clipVolume * opacity}
          muted={clipVolume === 0}
          isPlaying={isPlaying}
        />
      </AbsoluteFill>
    );
  }

  return null;
};

// ============================================
// TEXT CLIP - with improved typewriter animation
// ============================================

interface TextClipProps {
  clip: TimelineClip;
  opacity: number;
}

const TextClip: React.FC<TextClipProps> = ({ clip, opacity }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const content = clip.textContent;

  if (!content) return null;

  // Animation
  const animDelay = content.animationDelay || 0;
  const adjustedFrame = Math.max(0, frame - animDelay);

  let transform = '';
  let animOpacity = 1;
  let displayText = content.text;

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  switch (content.animation) {
    case 'fade':
      animOpacity = progress;
      break;
    case 'slide-up':
      transform = `translateY(${(1 - progress) * 50}px)`;
      animOpacity = progress;
      break;
    case 'slide-down':
      transform = `translateY(${(progress - 1) * 50}px)`;
      animOpacity = progress;
      break;
    case 'scale':
      transform = `scale(${0.5 + progress * 0.5})`;
      animOpacity = progress;
      break;
    case 'typewriter':
      // Typewriter effect using string slicing (best practice)
      const charFrames = 2; // Frames per character
      const typedChars = Math.min(
        content.text.length,
        Math.floor(adjustedFrame / charFrames)
      );
      displayText = content.text.slice(0, typedChars);
      animOpacity = 1;
      break;
    default:
      break;
  }

  // Position styles - free position (x/y) takes priority over preset
  const hasFreePosition = content.x !== undefined && content.y !== undefined;

  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    padding: '0 48px',
    textAlign: content.alignment,
  };

  if (hasFreePosition) {
    positionStyles.left = `${content.x}%`;
    positionStyles.top = `${content.y}%`;
    positionStyles.right = 'auto';
    positionStyles.transform = 'translate(-50%, -50%)';
    positionStyles.padding = '0';
  } else {
    positionStyles.left = 0;
    positionStyles.right = 0;

    switch (content.position) {
      case 'top':
        positionStyles.top = 48;
        break;
      case 'bottom':
        positionStyles.bottom = 48;
        break;
      case 'lower-third':
        positionStyles.bottom = 100;
        positionStyles.left = 48;
        positionStyles.right = 'auto';
        positionStyles.padding = '12px 24px';
        break;
      case 'center':
      default:
        positionStyles.top = '50%';
        positionStyles.transform = 'translateY(-50%)';
        break;
    }
  }

  return (
    <div style={{ ...positionStyles, opacity: opacity * animOpacity }}>
      <span
        style={{
          display: 'inline-block',
          fontSize: content.fontSize,
          fontWeight: content.fontWeight,
          fontFamily: content.fontFamily,
          color: content.color,
          backgroundColor: content.backgroundColor,
          padding: content.backgroundColor ? '8px 16px' : undefined,
          borderRadius: content.backgroundColor ? 8 : undefined,
          transform,
          textShadow: !content.backgroundColor ? '0 4px 12px rgba(0,0,0,0.5)' : undefined,
        }}
      >
        {displayText}
        {/* Blinking cursor for typewriter */}
        {content.animation === 'typewriter' && displayText.length < content.text.length && (
          <TypewriterCursor frame={adjustedFrame} />
        )}
      </span>
    </div>
  );
};

// ============================================
// TYPEWRITER CURSOR
// ============================================

const TypewriterCursor: React.FC<{ frame: number }> = ({ frame }) => {
  const blinkFrames = 16;
  const cursorOpacity = interpolate(
    frame % blinkFrames,
    [0, blinkFrames / 2, blinkFrames],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <span style={{ opacity: cursorOpacity, marginLeft: 2 }}>|</span>
  );
};

// ============================================
// EFFECT WRAPPER
// ============================================

interface EffectWrapperProps {
  effects: ClipEffect[];
  children: React.ReactNode;
}

const EffectWrapper: React.FC<EffectWrapperProps> = ({ effects, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!effects || effects.length === 0) {
    return <>{children}</>;
  }

  // Build CSS filter string from effects
  const filters = effects.map((effect) => {
    const intensity = effect.intensity / 100;

    switch (effect.type) {
      case 'blur':
        return `blur(${intensity * 10}px)`;
      case 'brightness':
        return `brightness(${0.5 + intensity})`;
      case 'contrast':
        return `contrast(${0.5 + intensity})`;
      case 'saturation':
        return `saturate(${intensity * 2})`;
      case 'sepia':
        return `sepia(${intensity})`;
      case 'grayscale':
        return `grayscale(${intensity})`;
      default:
        return '';
    }
  }).filter(Boolean).join(' ');

  // Check for overlay effects
  const vignetteEffect = effects.find(e => e.type === 'vignette');
  const lightLeakEffect = effects.find(e => e.type === 'light-leak');
  const glitchEffect = effects.find(e => e.type === 'glitch');

  return (
    <AbsoluteFill style={{ filter: filters || undefined }}>
      {children}

      {/* Vignette overlay */}
      {vignetteEffect && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, transparent ${100 - vignetteEffect.intensity}%, rgba(0,0,0,0.8) 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Official Remotion Light Leak */}
      {lightLeakEffect && (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
          <LightLeak
            durationInFrames={durationInFrames}
            seed={Math.floor(lightLeakEffect.intensity / 10)}
            hueShift={lightLeakEffect.intensity * 3.6}
          />
        </AbsoluteFill>
      )}

      {/* Glitch effect */}
      {glitchEffect && (
        <GlitchOverlay intensity={glitchEffect.intensity} />
      )}
    </AbsoluteFill>
  );
};

// ============================================
// GLITCH OVERLAY
// ============================================

const GlitchOverlay: React.FC<{ intensity: number }> = ({ intensity }) => {
  const frame = useCurrentFrame();

  // Only show glitch on certain frames for effect
  if (frame % 7 !== 0 && frame % 13 !== 0) return null;

  const offset = (intensity / 100) * 10;
  const randomOffset = Math.sin(frame * 123) * offset;

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${randomOffset}px)`,
        opacity: 0.8,
        mixBlendMode: 'difference',
        pointerEvents: 'none',
      }}
    />
  );
};
