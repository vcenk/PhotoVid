/**
 * PreviewPanel - Center panel with Remotion player and playback controls
 *
 * Uses Web Audio API for stutter-free playback during heavy rendering
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Player, PlayerRef } from '@remotion/player';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
  spring,
} from 'remotion';
import { useQuickVideoV2 } from '../QuickVideoV2Context';
import { getTemplateV2 } from '@/lib/data/video-templates-v2';
import { VIDEO_V2_CONFIG, secondsToFrames } from '@/lib/types/quick-video-v2';
import { FORMAT_DIMENSIONS } from '@/lib/types/video-project';
import type { TemplateV2Config, ScriptSegment, WordTiming } from '@/lib/types/quick-video-v2';
import type { VideoImage } from '@/lib/types/video-project';

// ============================================================================
// Web Audio API Hook - Stutter-free audio playback
// ============================================================================

interface UseWebAudioResult {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;  // Real-time current time (not React state)
}

function useWebAudio(audioUrl: string | null | undefined): UseWebAudioResult {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load and decode audio
  useEffect(() => {
    if (!audioUrl) {
      setIsReady(false);
      return;
    }

    setIsReady(false);
    setCurrentTime(0);
    pausedAtRef.current = 0;

    const loadAudio = async () => {
      try {
        // Create or resume AudioContext
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;

        // Create gain node for volume control
        if (!gainNodeRef.current) {
          gainNodeRef.current = ctx.createGain();
          gainNodeRef.current.connect(ctx.destination);
        }

        console.log('Web Audio: Fetching audio...');
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        console.log('Web Audio: Decoding audio...');
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        audioBufferRef.current = audioBuffer;
        setDuration(audioBuffer.duration);
        setIsReady(true);
        console.log('Web Audio: Ready! Duration:', audioBuffer.duration);
      } catch (error) {
        console.error('Web Audio: Failed to load audio:', error);
      }
    };

    loadAudio();

    return () => {
      // Cleanup on unmount or URL change
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {}
        sourceNodeRef.current = null;
      }
    };
  }, [audioUrl]);

  // Update current time while playing
  useEffect(() => {
    if (!isPlaying || !audioContextRef.current) return;

    const interval = setInterval(() => {
      const ctx = audioContextRef.current;
      if (ctx && isPlaying) {
        const elapsed = ctx.currentTime - startTimeRef.current + pausedAtRef.current;
        setCurrentTime(Math.min(elapsed, duration));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const play = useCallback(() => {
    const ctx = audioContextRef.current;
    const buffer = audioBufferRef.current;
    const gainNode = gainNodeRef.current;

    if (!ctx || !buffer || !gainNode) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop any existing source
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
    }

    // Create new source node
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);

    // Start from paused position
    const offset = pausedAtRef.current;
    source.start(0, offset);

    startTimeRef.current = ctx.currentTime;
    sourceNodeRef.current = source;
    setIsPlaying(true);

    // Handle end of audio
    source.onended = () => {
      if (sourceNodeRef.current === source) {
        setIsPlaying(false);
        pausedAtRef.current = 0;
        setCurrentTime(0);
      }
    };
  }, []);

  const pause = useCallback(() => {
    const ctx = audioContextRef.current;

    if (ctx && sourceNodeRef.current && isPlaying) {
      // Calculate current position
      const elapsed = ctx.currentTime - startTimeRef.current + pausedAtRef.current;
      pausedAtRef.current = elapsed;

      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }

    setIsPlaying(false);
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    pausedAtRef.current = Math.max(0, Math.min(time, duration));
    setCurrentTime(pausedAtRef.current);

    // If playing, restart from new position
    if (isPlaying) {
      pause();
      setTimeout(play, 10);
    }
  }, [duration, isPlaying, pause, play]);

  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Get current time directly from AudioContext (real-time, not React state)
  const getCurrentTime = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlaying) {
      return pausedAtRef.current;
    }
    const elapsed = ctx.currentTime - startTimeRef.current + pausedAtRef.current;
    return Math.min(elapsed, duration);
  }, [isPlaying, duration]);

  return { isReady, isPlaying, currentTime, duration, play, pause, seek, setVolume, getCurrentTime };
}

// ============================================================================
// Placeholder when no content
// ============================================================================

function EmptyPreview() {
  const { project } = useQuickVideoV2();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
        <ImageIcon size={32} className="text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {project.images.length === 0
          ? 'Upload property images'
          : 'Generate your script'}
      </h3>
      <p className="text-sm text-zinc-500 max-w-xs">
        {project.images.length === 0
          ? 'Add at least 3 images to get started with your AI-powered property video.'
          : 'Click "Generate AI Script" to create your narration and see the preview.'}
      </p>

      {project.images.length > 0 && project.images.length < 3 && (
        <div className="mt-4 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-400">
            Add {3 - project.images.length} more image{3 - project.images.length > 1 ? 's' : ''} to continue
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simple Preview (Images only, no script yet)
// ============================================================================

function SimplePreview() {
  const { project, isPlaying, currentTime, seekTo, play, pause, togglePlayback } = useQuickVideoV2();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);

  // Cycle through images when playing with smooth transitions
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPreviousIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % project.images.length);
    }, 4000); // Slower for smoother feel

    return () => clearInterval(interval);
  }, [isPlaying, project.images.length, currentIndex]);

  // Clear previous index after transition completes
  useEffect(() => {
    if (previousIndex !== null) {
      const timeout = setTimeout(() => setPreviousIndex(null), 1200);
      return () => clearTimeout(timeout);
    }
  }, [previousIndex]);

  const template = getTemplateV2(project.templateId);
  const dimensions = FORMAT_DIMENSIONS[project.format];
  const aspectRatio = dimensions.width / dimensions.height;

  // Get Ken Burns direction based on index
  const getKenBurnsVariants = (index: number) => {
    const directions = [
      { scale: [1, 1.12], x: [0, 0] },      // zoom-in
      { scale: [1.05, 1.05], x: ['0%', '3%'] },  // pan-right
      { scale: [1.12, 1], x: [0, 0] },      // zoom-out
      { scale: [1.05, 1.05], x: ['0%', '-3%'] }, // pan-left
    ];
    return directions[index % directions.length];
  };

  const currentKenBurns = getKenBurnsVariants(currentIndex);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
          style={{
            aspectRatio,
            backgroundColor: template.colors.background,
            width: aspectRatio > 1 ? '100%' : 'auto',
            height: aspectRatio <= 1 ? '100%' : 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* Previous Image (fading out) */}
          {previousIndex !== null && project.images[previousIndex] && (
            <motion.div
              key={`prev-${previousIndex}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-0"
              style={{ zIndex: 1 }}
            >
              <img
                src={project.images[previousIndex].url}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Current Image with Ken Burns effect */}
          {project.images[currentIndex] && (
            <motion.div
              key={`curr-${currentIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{
                opacity: 1,
                scale: currentKenBurns.scale,
                x: currentKenBurns.x,
              }}
              transition={{
                opacity: { duration: 0.8, ease: 'easeOut' },
                scale: { duration: 4, ease: 'linear' },
                x: { duration: 4, ease: 'linear' },
              }}
              className="absolute inset-0"
              style={{ zIndex: 2 }}
            >
              <img
                src={project.images[currentIndex].url}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

          {/* Vignette effect */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
            }}
          />

          {/* Preview indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full z-20">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-white">Preview Mode</span>
          </div>

          {/* Image counter with progress */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
            {/* Progress dots */}
            <div className="flex gap-1">
              {project.images.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'bg-violet-500 w-4' : 'bg-white/30 w-1.5'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-white/70 ml-2">
              {currentIndex + 1}/{project.images.length}
            </span>
          </div>
        </div>
      </div>

      {/* Simple Controls */}
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="flex items-center justify-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
          <button
            onClick={togglePlayback}
            className="p-3 bg-violet-600 hover:bg-violet-500 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause size={20} className="text-white" />
            ) : (
              <Play size={20} className="text-white ml-0.5" />
            )}
          </button>

          <p className="text-sm text-zinc-400">
            Generate a script to see the full preview with voice narration
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Full Preview with Remotion Player + Web Audio API
// ============================================================================

function FullPreview() {
  const {
    project,
    isPlaying,
    pause,
    play,
    togglePlayback,
    setTotalDuration,
    getVideoProps,
  } = useQuickVideoV2();

  const playerRef = useRef<PlayerRef>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [displayTime, setDisplayTime] = useState(0);

  // Use Web Audio API for stutter-free playback
  const webAudio = useWebAudio(project.synthesizedVoice?.audioUrl);

  const videoProps = getVideoProps();
  const dimensions = FORMAT_DIMENSIONS[project.format];
  const aspectRatio = dimensions.width / dimensions.height;

  // Use actual audio duration from Web Audio API
  const actualAudioDuration = webAudio.duration || project.synthesizedVoice?.duration || project.duration;
  const durationInFrames = Math.max(secondsToFrames(actualAudioDuration), 30);

  // Calculate time scale factor - script segment durations are estimates
  // We need to scale them to match the actual audio duration
  const scriptTotalDuration = project.script?.segments.reduce((sum, s) => sum + s.duration, 0) || project.duration;
  const timeScaleFactor = webAudio.duration > 0 ? webAudio.duration / scriptTotalDuration : 1;

  // Debug log to help diagnose sync issues
  useEffect(() => {
    if (webAudio.duration > 0 && project.script) {
      console.log('Timing sync:', {
        actualAudioDuration: webAudio.duration,
        scriptTotalDuration,
        timeScaleFactor,
        segmentCount: project.script.segments.length,
      });
    }
  }, [webAudio.duration, scriptTotalDuration, timeScaleFactor, project.script]);

  // Set total duration when voice is synthesized
  useEffect(() => {
    if (webAudio.duration > 0) {
      setTotalDuration(webAudio.duration);
    } else if (project.synthesizedVoice?.duration) {
      setTotalDuration(project.synthesizedVoice.duration);
    }
  }, [webAudio.duration, project.synthesizedVoice?.duration, setTotalDuration]);

  // Sync play/pause - Audio drives everything, player just renders frames
  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying && webAudio.isReady) {
      // Don't use player.play() - we'll manually control frames
      // This prevents Remotion from running its own timeline
      webAudio.play();
    } else {
      playerRef.current.pause();
      webAudio.pause();
    }
  }, [isPlaying, webAudio.isReady]);

  // Sync volume with Web Audio
  useEffect(() => {
    webAudio.setVolume(isMuted ? 0 : volume);
  }, [isMuted, volume, webAudio.setVolume]);

  // Use requestAnimationFrame for frame-perfect sync
  // Audio is the master clock, player just shows the corresponding frame
  useEffect(() => {
    if (!isPlaying || !webAudio.isReady) return;

    let animationFrameId: number;

    const syncFrame = () => {
      if (webAudio.isPlaying && playerRef.current) {
        // Get real-time audio position (not stale React state)
        const audioTime = webAudio.getCurrentTime();
        setDisplayTime(audioTime);

        // Calculate target frame from audio time
        const targetFrame = Math.round(audioTime * VIDEO_V2_CONFIG.fps);

        // Always seek to match audio - this makes player follow audio exactly
        playerRef.current.seekTo(targetFrame);
      }

      animationFrameId = requestAnimationFrame(syncFrame);
    };

    animationFrameId = requestAnimationFrame(syncFrame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, webAudio.isReady, webAudio.isPlaying, webAudio.getCurrentTime]);

  // Handle audio end
  useEffect(() => {
    if (webAudio.currentTime >= actualAudioDuration - 0.1 && !webAudio.isPlaying && displayTime > 0) {
      pause();
      setDisplayTime(0);
      playerRef.current?.seekTo(0);
    }
  }, [webAudio.isPlaying, webAudio.currentTime, actualAudioDuration, pause, displayTime]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setDisplayTime(time);
    playerRef.current?.seekTo(secondsToFrames(time));
    webAudio.seek(time);
  };

  // Handle restart
  const handleRestart = () => {
    setDisplayTime(0);
    playerRef.current?.seekTo(0);
    webAudio.seek(0);
  };

  const isAudioReady = webAudio.isReady;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Web Audio API handles audio playback - no HTML element needed */}

      {/* Audio Loading Status */}
      {project.synthesizedVoice?.audioUrl && !isAudioReady && (
        <div className="flex-shrink-0 px-4 pt-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg">
            <div className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-xs text-violet-400">
              Loading audio with Web Audio API...
            </span>
          </div>
        </div>
      )}

      {/* Audio Ready Indicator */}
      {project.synthesizedVoice?.audioUrl && isAudioReady && (
        <div className="flex-shrink-0 px-4 pt-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-400">
              Web Audio API ready - stutter-free playback
            </span>
          </div>
        </div>
      )}

      {/* Player Container */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-zinc-900"
          style={{
            aspectRatio,
            // Landscape (16:9): constrain by width
            // Square (1:1) and Portrait (9:16): constrain by height
            width: aspectRatio > 1 ? '100%' : 'auto',
            height: aspectRatio <= 1 ? '100%' : 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* Remotion Player - renders frames, audio plays via Web Audio API */}
          {/* Player frame is driven by audio time via seekTo in requestAnimationFrame */}
          <Player
            ref={playerRef}
            component={PreviewComposition}
            inputProps={{ ...videoProps, timeScaleFactor }}
            durationInFrames={durationInFrames}
            fps={VIDEO_V2_CONFIG.fps}
            compositionWidth={dimensions.width}
            compositionHeight={dimensions.height}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls={false}
            loop={false}
            allowFullscreen
            volume={0}
          />
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={actualAudioDuration}
              step={0.1}
              value={displayTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500
                [&::-webkit-slider-thumb]:hover:bg-violet-400 [&::-webkit-slider-thumb]:transition-colors"
              style={{
                background: `linear-gradient(to right, #8b5cf6 ${(displayTime / actualAudioDuration) * 100}%, rgba(255,255,255,0.1) ${(displayTime / actualAudioDuration) * 100}%)`,
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left: Time */}
            <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
              <span>{formatTime(displayTime)}</span>
              <span>/</span>
              <span>{formatTime(actualAudioDuration)}</span>
            </div>

            {/* Center: Playback */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw size={18} className="text-zinc-400" />
              </button>

              <button
                onClick={togglePlayback}
                disabled={project.synthesizedVoice?.audioUrl && !isAudioReady}
                className={`p-3 rounded-full transition-colors ${
                  project.synthesizedVoice?.audioUrl && !isAudioReady
                    ? 'bg-zinc-600 cursor-wait'
                    : 'bg-violet-600 hover:bg-violet-500'
                }`}
                title={project.synthesizedVoice?.audioUrl && !isAudioReady ? 'Loading audio...' : undefined}
              >
                {project.synthesizedVoice?.audioUrl && !isAudioReady ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={20} className="text-white" />
                ) : (
                  <Play size={20} className="text-white ml-0.5" />
                )}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-zinc-400" />
                ) : (
                  <Volume2 size={18} className="text-zinc-400" />
                )}
              </button>
            </div>

            {/* Right: Volume & Fullscreen */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />

              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Maximize2 size={18} className="text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Ken Burns Image Component - Smooth subtle zoom only
// ============================================================================

interface KenBurnsImageProps {
  src: string;
  durationInFrames: number;
  index: number;
}

function KenBurnsImage({ src, durationInFrames, index }: KenBurnsImageProps) {
  const frame = useCurrentFrame();

  // Clamp progress to 0-1 range
  const progress = Math.min(Math.max(frame / Math.max(durationInFrames, 1), 0), 1);

  // Subtle zoom: alternate between zoom-in and zoom-out
  const isZoomIn = index % 2 === 0;
  const intensity = 0.08; // Subtle 8% zoom

  const scale = isZoomIn
    ? 1 + progress * intensity
    : 1 + intensity - progress * intensity;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
}

// ============================================================================
// Simple Image Display - No complex transitions, just Ken Burns
// ============================================================================

interface ImageDisplayProps {
  currentImage: VideoImage;
  currentIndex: number;
  durationInFrames: number;
}

function ImageDisplay({
  currentImage,
  currentIndex,
  durationInFrames,
}: ImageDisplayProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <KenBurnsImage
        src={currentImage.url}
        durationInFrames={durationInFrames}
        index={currentIndex}
      />
    </div>
  );
}

// ============================================================================
// Segment Captions - Shows full segment text with current word highlighted
// ============================================================================

interface SegmentCaptionsProps {
  segmentText: string;
  wordTimings: WordTiming[];
  segmentStartTime: number;
  segmentEndTime: number;
  template: TemplateV2Config;
}

function SegmentCaptions({ segmentText, wordTimings, segmentStartTime, segmentEndTime, template }: SegmentCaptionsProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Frame is synced to audio via seekTo, so frame/fps is accurate
  const currentTimeSeconds = frame / fps;

  // Split segment text into words for display
  const textWords = segmentText.split(/\s+/).filter(Boolean);

  if (textWords.length === 0) return null;

  // Calculate progress through the segment for word highlighting
  const segmentDuration = segmentEndTime - segmentStartTime;
  const segmentProgress = segmentDuration > 0
    ? (currentTimeSeconds - segmentStartTime) / segmentDuration
    : 0;

  // Estimate which word should be highlighted based on progress
  const estimatedWordIndex = Math.floor(segmentProgress * textWords.length);
  const currentWordIndex = Math.min(Math.max(estimatedWordIndex, 0), textWords.length - 1);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          padding: '12px 20px',
          borderRadius: 8,
          maxWidth: '90%',
        }}
      >
        <p
          style={{
            fontSize: 18,
            fontFamily: template.fonts.body,
            color: '#ffffff',
            lineHeight: 1.4,
            textAlign: 'center',
            margin: 0,
          }}
        >
          {textWords.map((word, i) => {
            // Highlight current word and words already spoken
            const isCurrentWord = i === currentWordIndex;
            const isSpoken = i < currentWordIndex;

            return (
              <span
                key={`${word}-${i}`}
                style={{
                  color: isCurrentWord ? '#a78bfa' : isSpoken ? '#ffffff' : '#9ca3af',
                  fontWeight: isCurrentWord ? 700 : 400,
                  marginRight: 6,
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Preview Composition (Full working version)
// ============================================================================

interface PreviewCompositionProps {
  images: VideoImage[];
  script: { segments: ScriptSegment[] } | null;
  template: TemplateV2Config;
  wordTimings: WordTiming[];
  showCaptions: boolean;
  timeScaleFactor?: number;   // Scale factor for word timings (actual/estimated duration)
}

function PreviewComposition(props: PreviewCompositionProps) {
  const { images, template, script, wordTimings, showCaptions, timeScaleFactor = 1 } = props;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // Frame is now synced to audio via seekTo, so frame/fps gives accurate audio time
  const currentTimeSeconds = frame / fps;

  // Scale word timings to match actual audio duration
  const scaledWordTimings = useMemo(() => {
    if (timeScaleFactor === 1) return wordTimings;
    return wordTimings.map(w => ({
      ...w,
      start: w.start * timeScaleFactor,
      end: w.end * timeScaleFactor,
    }));
  }, [wordTimings, timeScaleFactor]);

  // Calculate which image to show based on script segments
  const segments = script?.segments || [];

  const { currentIndex, segmentProgress, segmentDurationFrames, currentSegment, segmentStartTime, segmentEndTime } = useMemo(() => {
    if (segments.length === 0) {
      // No script - distribute images evenly
      const framesPerImage = durationInFrames / Math.max(images.length, 1);
      const idx = Math.min(Math.floor(frame / framesPerImage), images.length - 1);
      return {
        currentIndex: idx,
        segmentProgress: (frame % framesPerImage) / framesPerImage,
        segmentDurationFrames: framesPerImage,
        currentSegment: null,
        segmentStartTime: 0,
        segmentEndTime: 0,
      };
    }

    // Find current segment based on time (scaled by timeScaleFactor for actual audio duration)
    let accumulatedTime = 0;
    for (let i = 0; i < segments.length; i++) {
      const scaledSegmentDuration = segments[i].duration * timeScaleFactor;
      const segmentEnd = accumulatedTime + scaledSegmentDuration;
      if (currentTimeSeconds < segmentEnd) {
        const segmentStart = accumulatedTime;
        const progress = (currentTimeSeconds - segmentStart) / scaledSegmentDuration;
        return {
          currentIndex: Math.min(i, images.length - 1),
          segmentProgress: progress,
          segmentDurationFrames: Math.round(scaledSegmentDuration * fps),
          currentSegment: segments[i],
          segmentStartTime: segmentStart,
          segmentEndTime: segmentEnd,
        };
      }
      accumulatedTime = segmentEnd;
    }

    const lastSegment = segments[segments.length - 1];
    const totalTime = segments.reduce((sum, s) => sum + s.duration * timeScaleFactor, 0);
    return {
      currentIndex: images.length - 1,
      segmentProgress: 1,
      segmentDurationFrames: 90,
      currentSegment: lastSegment,
      segmentStartTime: totalTime - lastSegment.duration * timeScaleFactor,
      segmentEndTime: totalTime,
    };
  }, [frame, fps, durationInFrames, segments, images.length, currentTimeSeconds, timeScaleFactor]);

  const currentImage = images[currentIndex];

  return (
    <AbsoluteFill style={{ backgroundColor: template.colors.background }}>
      {/* Image with Ken Burns effect */}
      {currentImage && (
        <ImageDisplay
          currentImage={currentImage}
          currentIndex={currentIndex}
          durationInFrames={segmentDurationFrames}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      {template.useVignette && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
            zIndex: 11,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Segment Captions - show full text with word highlighting */}
      {showCaptions && currentSegment && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
          <SegmentCaptions
            segmentText={currentSegment.text}
            wordTimings={scaledWordTimings}
            segmentStartTime={segmentStartTime}
            segmentEndTime={segmentEndTime}
            template={template}
          />
        </div>
      )}

      {/* Note: Audio is played via Web Audio API in FullPreview for stutter-free playback */}
    </AbsoluteFill>
  );
}

// ============================================================================
// Main Preview Panel
// ============================================================================

export function PreviewPanel() {
  const { project } = useQuickVideoV2();

  // No images - show empty state
  if (project.images.length === 0) {
    return <EmptyPreview />;
  }

  // Images but no script - show simple preview
  if (!project.script) {
    return <SimplePreview />;
  }

  // Full preview with Remotion player
  return <FullPreview />;
}

export default PreviewPanel;
