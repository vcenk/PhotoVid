/**
 * PropertyVideoV2 - Enhanced Voice-Synced Remotion Composition
 *
 * Features:
 * - Voice narration synchronized to images
 * - Animated captions (word-by-word reveal)
 * - Multiple transition types (fade, slide, wipe, zoom)
 * - Ken Burns effects per template style
 * - Background music with proper volume control
 * - Music ducking when voice plays
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
  Audio,
} from 'remotion';
import type {
  PropertyVideoV2Props,
  TemplateV2Config,
  ScriptSegment,
  WordTiming,
  TransitionStyle,
} from '@/lib/types/quick-video-v2';
import type { VideoImage, AgentBranding } from '@/lib/types/video-project';
import { getKenBurnsDirection } from '@/lib/data/video-templates-v2';

// ============================================================================
// Light Leak Effect Component
// ============================================================================

interface LightLeakProps {
  intensity?: number;
  color?: string;
}

function LightLeakEffect({ intensity = 0.3, color }: LightLeakProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Animate the light leak position
  const progress = (frame / durationInFrames) * 100;
  const xPos = interpolate(frame, [0, durationInFrames], [-50, 150]);
  const opacity = interpolate(
    Math.sin((frame / 30) * Math.PI),
    [-1, 1],
    [0.1, intensity]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    >
      {/* Primary light leak */}
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '100%',
          left: `${xPos}%`,
          background: `radial-gradient(ellipse at center, ${color || 'rgba(255, 200, 100, 0.4)'} 0%, transparent 70%)`,
          opacity,
          transform: 'rotate(-15deg) scale(1.5)',
        }}
      />
      {/* Secondary subtle leak */}
      <div
        style={{
          position: 'absolute',
          width: '40%',
          height: '80%',
          right: `${100 - xPos * 0.5}%`,
          top: '10%',
          background: `radial-gradient(ellipse at center, ${color || 'rgba(255, 150, 50, 0.3)'} 0%, transparent 60%)`,
          opacity: opacity * 0.5,
          transform: 'rotate(20deg)',
        }}
      />
    </div>
  );
}

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
  const progress = Math.min(frame / durationInFrames, 1);

  const scale = useMemo(() => {
    const baseScale = 1.05; // Start slightly zoomed to avoid edges
    const zoomAmount = intensity;

    switch (direction) {
      case 'zoom-in':
        return baseScale + progress * zoomAmount;
      case 'zoom-out':
        return baseScale + zoomAmount - progress * zoomAmount;
      case 'pan-left':
      case 'pan-right':
        return baseScale + zoomAmount * 0.5;
      default:
        return baseScale;
    }
  }, [direction, intensity, progress]);

  const translateX = useMemo(() => {
    const panAmount = intensity * 80;

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
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
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
// Transition Components
// ============================================================================

interface TransitionProps {
  progress: number; // 0 to 1
  style: TransitionStyle;
  children: React.ReactNode;
}

function TransitionWrapper({ progress, style, children }: TransitionProps) {
  const getTransform = () => {
    switch (style) {
      case 'slide':
        // Slide in from right
        const slideX = interpolate(progress, [0, 1], [100, 0], { extrapolateRight: 'clamp' });
        return `translateX(${slideX}%)`;

      case 'zoom':
        // Zoom in from center
        const zoomScale = interpolate(progress, [0, 1], [0.5, 1], { extrapolateRight: 'clamp' });
        return `scale(${zoomScale})`;

      case 'wipe':
        // No transform for wipe, handled by clip-path
        return 'none';

      case 'fade':
      default:
        return 'none';
    }
  };

  const getOpacity = () => {
    if (style === 'fade') {
      return interpolate(progress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    }
    if (style === 'zoom') {
      return interpolate(progress, [0, 0.3, 1], [0, 1, 1], { extrapolateRight: 'clamp' });
    }
    return 1;
  };

  const getClipPath = () => {
    if (style === 'wipe') {
      const wipeProgress = interpolate(progress, [0, 1], [0, 100], { extrapolateRight: 'clamp' });
      return `inset(0 ${100 - wipeProgress}% 0 0)`;
    }
    return 'none';
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: getOpacity(),
        transform: getTransform(),
        clipPath: getClipPath(),
      }}
    >
      {children}
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
        bottom: 50,
        left: 24,
        right: 24,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '20px 36px',
          borderRadius: 16,
          maxWidth: '94%',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <p
          style={{
            fontSize: 48,
            fontFamily: template.fonts.body,
            color: '#ffffff',
            lineHeight: 1.5,
            textAlign: 'center',
            margin: 0,
            fontWeight: 600,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {visibleWords.map((word, i) => {
            const isCurrentWord = word === currentWord;
            const wordFrame = Math.round(word.start * fps);
            const animationProgress = interpolate(
              frame - wordFrame,
              [0, 10],
              [0, 1],
              { extrapolateRight: 'clamp' }
            );

            return (
              <span
                key={`${word.word}-${i}`}
                style={{
                  display: 'inline',
                  opacity: animationProgress,
                  color: isCurrentWord ? template.colors.accent : '#ffffff',
                  fontWeight: isCurrentWord ? 700 : 600,
                  marginRight: 12,
                  textShadow: '0 4px 12px rgba(0,0,0,0.6)',
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
    config: { damping: 15, stiffness: 100 },
  });

  const textOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const textSlide = interpolate(frame, [20, 45], [20, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: template.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Subtle gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${template.colors.secondary} 0%, ${template.colors.background} 70%)`,
        }}
      />

      {/* Logo/Branding */}
      <div style={{ transform: `scale(${logoScale})`, zIndex: 1 }}>
        {agentBranding?.logoUrl ? (
          <img
            src={agentBranding.logoUrl}
            alt=""
            style={{
              width: 180,
              height: 'auto',
              maxHeight: 120,
              objectFit: 'contain',
            }}
          />
        ) : agentBranding?.brokerageName ? (
          <h1
            style={{
              fontSize: 52,
              fontFamily: template.fonts.heading,
              color: template.colors.text,
              margin: 0,
              textAlign: 'center',
            }}
          >
            {agentBranding.brokerageName}
          </h1>
        ) : (
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 24,
              background: `linear-gradient(135deg, ${template.colors.accent} 0%, ${template.colors.primary} 100%)`,
            }}
          />
        )}
      </div>

      {/* Subtitle */}
      <p
        style={{
          opacity: textOpacity,
          transform: `translateY(${textSlide}px)`,
          marginTop: 24,
          fontSize: 22,
          fontFamily: template.fonts.body,
          color: template.colors.text,
          letterSpacing: 4,
          textTransform: 'uppercase',
          zIndex: 1,
        }}
      >
        presents
      </p>

      {/* Light leak on intro */}
      {template.useLightLeaks && <LightLeakEffect intensity={0.2} />}
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

  const contentOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const slideUp = interpolate(frame, [0, 35], [40, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const ctaScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: template.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${template.colors.secondary} 0%, ${template.colors.background} 80%)`,
        }}
      />

      <div
        style={{
          textAlign: 'center',
          transform: `translateY(${slideUp}px)`,
          opacity: contentOpacity,
          zIndex: 1,
        }}
      >
        {/* CTA */}
        <h2
          style={{
            fontSize: 40,
            fontFamily: template.fonts.heading,
            color: template.colors.text,
            marginBottom: 24,
            transform: `scale(${Math.max(0, ctaScale)})`,
          }}
        >
          Schedule Your Private Tour
        </h2>

        {/* Contact accent line */}
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: template.colors.accent,
            margin: '0 auto 30px',
            borderRadius: 2,
          }}
        />

        {/* Agent Info */}
        {agentBranding?.name && (
          <div style={{ marginTop: 20 }}>
            {agentBranding.photoUrl && (
              <img
                src={agentBranding.photoUrl}
                alt=""
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  objectFit: 'cover',
                  marginBottom: 20,
                  border: `3px solid ${template.colors.accent}`,
                }}
              />
            )}
            <p
              style={{
                fontSize: 26,
                fontFamily: template.fonts.body,
                color: template.colors.text,
                margin: 0,
                fontWeight: 600,
              }}
            >
              {agentBranding.name}
            </p>
            {agentBranding.phone && (
              <p
                style={{
                  fontSize: 22,
                  fontFamily: template.fonts.body,
                  color: template.colors.accent,
                  margin: '12px 0 0',
                  fontWeight: 500,
                }}
              >
                {agentBranding.phone}
              </p>
            )}
            {agentBranding.email && (
              <p
                style={{
                  fontSize: 18,
                  fontFamily: template.fonts.body,
                  color: template.colors.text,
                  opacity: 0.8,
                  margin: '8px 0 0',
                }}
              >
                {agentBranding.email}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Light leak on outro */}
      {template.useLightLeaks && <LightLeakEffect intensity={0.15} />}
    </AbsoluteFill>
  );
}

// ============================================================================
// Voice-Synced Slideshow with Transitions
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

  // Calculate cumulative segment timings
  const segmentTimings = useMemo(() => {
    let cumulative = 0;
    return segments.map((seg) => {
      const start = cumulative;
      cumulative += seg.duration;
      return { start, end: cumulative, segment: seg };
    });
  }, [segments]);

  // Find current and next segment
  const currentSegmentIndex = segmentTimings.findIndex(
    (t) => currentTimeSeconds >= t.start && currentTimeSeconds < t.end
  );
  const activeIndex = currentSegmentIndex >= 0 ? currentSegmentIndex : 0;

  const currentTiming = segmentTimings[activeIndex];
  const currentImage = images[activeIndex] || images[0];
  const currentSegment = segments[activeIndex] || segments[0];

  // Calculate transition progress (for entering the current slide)
  const transitionDurationSeconds = template.transitionDuration / fps;
  const timeIntoSegment = currentTimeSeconds - (currentTiming?.start || 0);
  const transitionProgress = Math.min(timeIntoSegment / transitionDurationSeconds, 1);

  // Ken Burns direction for this image
  const kenBurnsDirection = getKenBurnsDirection(template.kenBurnsStyle, activeIndex);

  // Previous image for crossfade (if in transition period)
  const prevIndex = activeIndex > 0 ? activeIndex - 1 : null;
  const prevImage = prevIndex !== null ? images[prevIndex] : null;
  const showPrevImage = transitionProgress < 1 && prevImage;

  return (
    <AbsoluteFill>
      {/* Previous Image (fading out during transition) */}
      {showPrevImage && template.transitionStyle === 'fade' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 1 - transitionProgress,
          }}
        >
          <KenBurnsImage
            src={prevImage.url}
            direction={getKenBurnsDirection(template.kenBurnsStyle, prevIndex!)}
            intensity={template.kenBurnsIntensity}
            durationInFrames={Math.round((currentSegment?.duration || 5) * fps)}
          />
        </div>
      )}

      {/* Current Image with Transition */}
      {currentImage && (
        <TransitionWrapper
          progress={transitionProgress}
          style={template.transitionStyle}
        >
          <KenBurnsImage
            src={currentImage.url}
            direction={kenBurnsDirection}
            intensity={template.kenBurnsIntensity}
            durationInFrames={Math.round((currentSegment?.duration || 5) * fps)}
          />
        </TransitionWrapper>
      )}

      {/* Gradient overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, transparent 50%, transparent 100%)',
        }}
      />

      {/* Vignette effect */}
      {template.useVignette && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      )}

      {/* Light Leak effect */}
      {template.useLightLeaks && (
        <LightLeakEffect
          intensity={0.25}
          color={`${template.colors.accent}40`}
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
  const slideshowStartFrame = introDuration;

  // Calculate music volume with ducking
  // When voice is playing, reduce music volume
  const currentTimeSeconds = frame / fps;
  const isVoicePlaying = voiceAudioUrl && frame >= slideshowStartFrame && frame < (durationInFrames - outroDuration);

  // Base music volume (0-1 scale)
  const baseMusicVolume = (musicVolume || template.musicVolume) / 100;
  // Ducked volume when voice plays
  const duckedVolume = baseMusicVolume * (1 - template.voiceDuckLevel / 100);
  // Final music volume
  const finalMusicVolume = isVoicePlaying ? duckedVolume : baseMusicVolume;

  // Fade music in/out at start/end
  const musicFadeIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const musicFadeOut = interpolate(
    frame,
    [durationInFrames - 60, durationInFrames - 10],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const musicVolumeWithFade = finalMusicVolume * musicFadeIn * musicFadeOut;

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

      {/* Voice Audio - using Remotion's Audio component */}
      {voiceAudioUrl && (
        <Sequence from={introDuration} durationInFrames={slideshowDuration}>
          <Audio src={voiceAudioUrl} volume={1} />
        </Sequence>
      )}

      {/* Background Music - with ducking and fades */}
      {template.musicTrack && (
        <Audio
          src={template.musicTrack}
          volume={musicVolumeWithFade}
          loop
        />
      )}
    </AbsoluteFill>
  );
};

export default PropertyVideoV2;
