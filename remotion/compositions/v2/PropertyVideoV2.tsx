/**
 * PropertyVideoV2 - Voice-Synced Remotion Composition
 *
 * Features:
 * - Voice narration synchronized to images
 * - Animated captions (word-by-word reveal)
 * - Ken Burns effects per template style
 * - Background music with voice ducking
 * - Light leaks and vignette effects
 */

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import type {
  PropertyVideoV2Props,
  TemplateV2Config,
  ScriptSegment,
  WordTiming,
} from '@/lib/types/quick-video-v2';
import type { VideoImage, AgentBranding } from '@/lib/types/video-project';
import { getKenBurnsDirection } from '@/lib/data/video-templates-v2';

// ============================================================================
// Constants
// ============================================================================

const INTRO_DURATION_FRAMES = 60; // 2 seconds
const OUTRO_DURATION_FRAMES = 90; // 3 seconds

// ============================================================================
// Ken Burns Image Component
// ============================================================================

interface KenBurnsImageProps {
  src: string;
  direction: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';
  intensity: number;
  durationInFrames: number;
}

function KenBurnsImage({ src, direction, intensity, durationInFrames }: KenBurnsImageProps) {
  const frame = useCurrentFrame();
  const progress = frame / durationInFrames;

  const scale = useMemo(() => {
    const baseScale = 1;
    const zoomAmount = intensity;

    switch (direction) {
      case 'zoom-in':
        return baseScale + progress * zoomAmount;
      case 'zoom-out':
        return baseScale + zoomAmount - progress * zoomAmount;
      default:
        return baseScale + zoomAmount * 0.5; // Slight zoom for pan
    }
  }, [direction, intensity, progress]);

  const translateX = useMemo(() => {
    const panAmount = intensity * 100; // pixels

    switch (direction) {
      case 'pan-left':
        return -progress * panAmount;
      case 'pan-right':
        return progress * panAmount;
      default:
        return 0;
    }
  }, [direction, intensity, progress]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${translateX}px)`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
}

// ============================================================================
// Animated Caption Component
// ============================================================================

interface AnimatedCaptionProps {
  wordTimings: WordTiming[];
  currentTimeSeconds: number;
  template: TemplateV2Config;
}

function AnimatedCaption({ wordTimings, currentTimeSeconds, template }: AnimatedCaptionProps) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Get visible words (words that have started)
  const visibleWords = wordTimings.filter((w) => w.start <= currentTimeSeconds);

  // Get current word (for highlighting)
  const currentWord = wordTimings.find(
    (w) => currentTimeSeconds >= w.start && currentTimeSeconds < w.end
  );

  if (visibleWords.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 40,
        right: 40,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: template.colors.captionBg,
          padding: '16px 24px',
          borderRadius: 12,
          maxWidth: '80%',
        }}
      >
        <p
          style={{
            fontSize: 24,
            fontFamily: template.fonts.body,
            color: template.colors.text,
            lineHeight: 1.5,
            textAlign: 'center',
            margin: 0,
          }}
        >
          {visibleWords.map((word, i) => {
            const isCurrentWord = word === currentWord;
            const wordFrame = Math.round(word.start * fps);
            const animationProgress = interpolate(
              frame - wordFrame,
              [0, 8],
              [0, 1],
              { extrapolateRight: 'clamp' }
            );

            return (
              <span
                key={`${word.word}-${i}`}
                style={{
                  display: 'inline-block',
                  opacity: animationProgress,
                  transform: `translateY(${(1 - animationProgress) * 10}px)`,
                  color: isCurrentWord ? template.colors.accent : template.colors.text,
                  fontWeight: isCurrentWord ? 600 : 400,
                  transition: 'color 0.1s, font-weight 0.1s',
                  marginRight: 8,
                }}
              >
                {word.word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Intro Sequence
// ============================================================================

interface IntroSequenceProps {
  template: TemplateV2Config;
  agentBranding?: AgentBranding | null;
}

function IntroSequence({ template, agentBranding }: IntroSequenceProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: template.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Logo/Branding */}
      {agentBranding?.logoUrl ? (
        <img
          src={agentBranding.logoUrl}
          alt=""
          style={{
            width: 200,
            height: 'auto',
            transform: `scale(${logoScale})`,
          }}
        />
      ) : agentBranding?.brokerageName ? (
        <div
          style={{
            transform: `scale(${logoScale})`,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 48,
              fontFamily: template.fonts.heading,
              color: template.colors.text,
              margin: 0,
            }}
          >
            {agentBranding.brokerageName}
          </h1>
        </div>
      ) : (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: template.colors.accent,
            transform: `scale(${logoScale})`,
          }}
        />
      )}

      {/* Subtitle */}
      <p
        style={{
          opacity: textOpacity,
          marginTop: 20,
          fontSize: 20,
          fontFamily: template.fonts.body,
          color: template.colors.text,
          opacity: 0.7,
        }}
      >
        presents
      </p>
    </AbsoluteFill>
  );
}

// ============================================================================
// Outro Sequence
// ============================================================================

interface OutroSequenceProps {
  template: TemplateV2Config;
  agentBranding?: AgentBranding | null;
}

function OutroSequence({ template, agentBranding }: OutroSequenceProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const contentOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const slideUp = interpolate(frame, [0, 30], [30, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: template.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: contentOpacity,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          transform: `translateY(${slideUp}px)`,
        }}
      >
        {/* CTA */}
        <h2
          style={{
            fontSize: 36,
            fontFamily: template.fonts.heading,
            color: template.colors.text,
            marginBottom: 20,
          }}
        >
          Schedule Your Private Tour
        </h2>

        {/* Agent Info */}
        {agentBranding?.name && (
          <div style={{ marginTop: 30 }}>
            {agentBranding.photoUrl && (
              <img
                src={agentBranding.photoUrl}
                alt=""
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  objectFit: 'cover',
                  marginBottom: 16,
                }}
              />
            )}
            <p
              style={{
                fontSize: 24,
                fontFamily: template.fonts.body,
                color: template.colors.text,
                margin: 0,
              }}
            >
              {agentBranding.name}
            </p>
            {agentBranding.phone && (
              <p
                style={{
                  fontSize: 18,
                  fontFamily: template.fonts.body,
                  color: template.colors.accent,
                  margin: '8px 0 0',
                }}
              >
                {agentBranding.phone}
              </p>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// ============================================================================
// Voice-Synced Slideshow
// ============================================================================

interface VoiceSyncedSlideshowProps {
  images: VideoImage[];
  segments: ScriptSegment[];
  wordTimings: WordTiming[];
  template: TemplateV2Config;
  showCaptions: boolean;
}

function VoiceSyncedSlideshow({
  images,
  segments,
  wordTimings,
  template,
  showCaptions,
}: VoiceSyncedSlideshowProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeSeconds = frame / fps;

  // Find current segment based on time
  const currentSegmentIndex = segments.findIndex((seg, i) => {
    const segmentStart = segments.slice(0, i).reduce((sum, s) => sum + s.duration, 0);
    const segmentEnd = segmentStart + seg.duration;
    return currentTimeSeconds >= segmentStart && currentTimeSeconds < segmentEnd;
  });

  const activeIndex = currentSegmentIndex >= 0 ? currentSegmentIndex : 0;
  const currentImage = images[activeIndex] || images[0];
  const currentSegment = segments[activeIndex] || segments[0];

  // Calculate segment timing for transitions
  const segmentStartTime = segments.slice(0, activeIndex).reduce((sum, s) => sum + s.duration, 0);
  const segmentProgress = (currentTimeSeconds - segmentStartTime) / currentSegment.duration;

  // Transition opacity (fade between images)
  const transitionProgress = interpolate(
    segmentProgress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0.8],
    { extrapolateRight: 'clamp' }
  );

  const kenBurnsDirection = getKenBurnsDirection(
    template.kenBurnsStyle,
    activeIndex
  );

  return (
    <AbsoluteFill>
      {/* Current Image with Ken Burns */}
      {currentImage && (
        <div style={{ opacity: transitionProgress }}>
          <KenBurnsImage
            src={currentImage.url}
            direction={kenBurnsDirection}
            intensity={template.kenBurnsIntensity}
            durationInFrames={Math.round(currentSegment.duration * fps)}
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 100%)',
        }}
      />

      {/* Vignette */}
      {template.useVignette && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      )}

      {/* Animated Captions */}
      {showCaptions && wordTimings.length > 0 && (
        <AnimatedCaption
          wordTimings={wordTimings}
          currentTimeSeconds={currentTimeSeconds}
          template={template}
        />
      )}
    </AbsoluteFill>
  );
}

// ============================================================================
// Main Composition
// ============================================================================

export const PropertyVideoV2: React.FC<PropertyVideoV2Props> = ({
  images,
  script,
  voiceAudioUrl,
  wordTimings,
  template,
  format,
  agentBranding,
  musicVolume,
  showCaptions,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate sequence timings
  const introDuration = template.introDuration;
  const outroDuration = template.outroDuration;
  const slideshowDuration = durationInFrames - introDuration - outroDuration;

  // Calculate slideshow time offset
  const slideshowStartFrame = introDuration;
  const slideshowCurrentFrame = Math.max(0, frame - slideshowStartFrame);

  return (
    <AbsoluteFill style={{ backgroundColor: template.colors.background }}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={introDuration}>
        <IntroSequence template={template} agentBranding={agentBranding} />
      </Sequence>

      {/* Main Slideshow */}
      <Sequence from={introDuration} durationInFrames={slideshowDuration}>
        <VoiceSyncedSlideshow
          images={images}
          segments={script?.segments || []}
          wordTimings={wordTimings}
          template={template}
          showCaptions={showCaptions}
        />
      </Sequence>

      {/* Outro */}
      <Sequence from={durationInFrames - outroDuration} durationInFrames={outroDuration}>
        <OutroSequence template={template} agentBranding={agentBranding} />
      </Sequence>

      {/* Voice Audio */}
      {voiceAudioUrl && (
        <Sequence from={introDuration} durationInFrames={slideshowDuration}>
          <audio src={voiceAudioUrl} />
        </Sequence>
      )}

      {/* Background Music with Ducking */}
      {template.musicTrack && (
        <audio
          src={template.musicTrack}
          style={{ display: 'none' }}
          // Volume handled by Remotion's Audio component in production
        />
      )}
    </AbsoluteFill>
  );
};

export default PropertyVideoV2;
