/**
 * Quick Video V2 Types - AI Voice-Powered Property Videos
 *
 * Types for the redesigned Quick Video experience with:
 * - AI script generation (OpenAI)
 * - Voice synthesis (Deepgram Aura TTS)
 * - Voice-synced Remotion compositions
 */

import type { VideoImage, AgentBranding, ExportFormat } from './video-project';
import type { VoiceLanguage } from '@/lib/data/deepgram-voices';

// Re-export VoiceLanguage for convenience
export type { VoiceLanguage } from '@/lib/data/deepgram-voices';

// ============================================================================
// Duration (auto-calculated based on voice synthesis)
// ============================================================================

// Duration is now auto-calculated from voice synthesis
// ~6-7 seconds per image for natural narration pace
export type VideoDuration = number;

// ============================================================================
// Script Generation (OpenAI)
// ============================================================================

/** A single segment of the narration script, tied to one image */
export interface ScriptSegment {
  id: string;
  imageId: string;           // Links to VideoImage.id
  imageIndex: number;        // 0-based index for ordering
  text: string;              // Narration text for this image
  duration: number;          // Duration in seconds
  keywords: string[];        // Key phrases for text overlays
}

/** Complete property narration script */
export interface PropertyScript {
  id: string;
  segments: ScriptSegment[];
  totalDuration: number;     // Total script duration in seconds
  generatedAt: Date;
  templateStyle: VideoTemplateV2;
}

/** Parameters for script generation API */
export interface ScriptGenerationParams {
  imageCount: number;
  imageLabels: string[];        // Room labels from images
  templateStyle: VideoTemplateV2;
  propertyHighlights?: string[];
  targetDuration: VideoDuration;
}

// ============================================================================
// Voice Synthesis (Deepgram Aura TTS)
// ============================================================================

/** Available voice configuration */
export interface VoiceConfig {
  voiceId: string;           // Deepgram voice ID (e.g., 'aura-asteria-en')
  name: string;              // Display name
  gender: 'male' | 'female';
  style: 'professional' | 'warm' | 'energetic' | 'authoritative';
  previewUrl?: string;       // Sample audio URL for preview
}

/** Word-level timing from Deepgram */
export interface WordTiming {
  word: string;
  start: number;             // Start time in seconds
  end: number;               // End time in seconds
}

/** Synthesized voice audio result */
export interface SynthesizedVoice {
  audioUrl: string;          // Generated audio URL (R2)
  duration: number;          // Duration in seconds
  wordTimings: WordTiming[]; // Word-level timing for captions
  voiceId: string;           // Voice used
  generatedAt: Date;
}

/** Available Deepgram Aura voices */
export const AVAILABLE_VOICES: VoiceConfig[] = [
  { voiceId: 'aura-asteria-en', name: 'Asteria', gender: 'female', style: 'professional' },
  { voiceId: 'aura-luna-en', name: 'Luna', gender: 'female', style: 'warm' },
  { voiceId: 'aura-stella-en', name: 'Stella', gender: 'female', style: 'energetic' },
  { voiceId: 'aura-orion-en', name: 'Orion', gender: 'male', style: 'professional' },
  { voiceId: 'aura-arcas-en', name: 'Arcas', gender: 'male', style: 'warm' },
  { voiceId: 'aura-perseus-en', name: 'Perseus', gender: 'male', style: 'authoritative' },
];

// ============================================================================
// Template V2 Configuration
// ============================================================================

export type VideoTemplateV2 =
  | 'luxe-estate'
  | 'modern-living'
  | 'cozy-home'
  | 'urban-loft'
  | 'classic-elegance'
  | 'quick-tour';

export type TransitionStyle = 'fade' | 'slide' | 'wipe' | 'zoom';
export type KenBurnsStyle = 'subtle' | 'dramatic' | 'parallax' | 'gentle' | 'dynamic';

/** Extended template configuration with audio settings */
export interface TemplateV2Config {
  id: VideoTemplateV2;
  name: string;
  description: string;

  // Visual styling
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    captionBg: string;      // Caption backdrop color
  };
  fonts: {
    heading: string;
    body: string;
  };

  // Audio settings
  musicTrack: string;        // Background music file path
  musicVolume: number;       // Default music volume (0-100)
  voiceDuckLevel: number;    // Music duck level when voice plays (0-100)

  // Animation settings
  transitionStyle: TransitionStyle;
  transitionDuration: number; // In frames
  kenBurnsStyle: KenBurnsStyle;
  kenBurnsIntensity: number;  // 0-1 (e.g., 0.1 = 10% zoom)

  // Timing
  introDuration: number;     // Frames
  outroDuration: number;     // Frames

  // Visual effects
  useLightLeaks: boolean;
  useVignette: boolean;
}

// ============================================================================
// Project State
// ============================================================================

export type ProjectStatus = 'draft' | 'generating-script' | 'generating-voice' | 'ready' | 'exporting' | 'completed' | 'error';

/** Complete project state for Quick Video V2 */
export interface QuickVideoV2Project {
  id: string;
  name: string;

  // Media
  images: VideoImage[];

  // Configuration
  templateId: VideoTemplateV2;
  format: ExportFormat;
  duration: VideoDuration;
  language: VoiceLanguage;         // Script and voice language

  // AI-generated content
  script: PropertyScript | null;
  scriptPrompt?: string;      // User-provided hints for script generation

  // Voice
  selectedVoice: VoiceConfig | null;
  synthesizedVoice: SynthesizedVoice | null;

  // Optional data
  propertyHighlights: string[];
  agentBranding: AgentBranding | null;

  // Background music (overrides template default)
  musicTrackOverride?: string;
  musicVolume: number;

  // Status
  status: ProjectStatus;
  error?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/** Request to generate script */
export interface GenerateScriptRequest {
  imageCount: number;
  imageLabels: string[];
  imageUrls?: string[];            // Image URLs for AI vision analysis
  templateStyle: VideoTemplateV2;
  propertyHighlights?: string[];
  targetDuration: VideoDuration;
  language: VoiceLanguage;         // Language for script generation
}

/** Response from script generation */
export interface GenerateScriptResponse {
  success: boolean;
  script?: PropertyScript;
  error?: string;
}

/** Request to synthesize voice */
export interface SynthesizeVoiceRequest {
  script: PropertyScript;
  voiceId: string;
}

/** Response from voice synthesis */
export interface SynthesizeVoiceResponse {
  success: boolean;
  voice?: SynthesizedVoice;
  error?: string;
}

// ============================================================================
// Remotion Composition Props
// ============================================================================

/** Props for PropertyVideoV2 Remotion composition */
export interface PropertyVideoV2Props {
  images: VideoImage[];
  script: PropertyScript;
  voiceAudioUrl: string | null;
  wordTimings: WordTiming[];
  template: TemplateV2Config;
  format: ExportFormat;
  agentBranding?: AgentBranding | null;
  musicVolume: number;
  showCaptions: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const VIDEO_V2_CONFIG = {
  fps: 30,
  minImages: 3,
  maxImages: 15,
  defaultDuration: 30,        // Default, overridden by voice synthesis duration
  defaultTemplate: 'modern-living' as VideoTemplateV2,
  defaultFormat: 'vertical' as ExportFormat,
  defaultMusicVolume: 40,
  voiceDuckLevel: 15,         // Music volume when voice is playing
  captionFadeFrames: 8,       // Frames for caption fade animation
  transitionFrames: 15,       // Default transition duration
};

/** Credit costs for Quick Video V2 */
export const QUICK_VIDEO_V2_CREDITS = {
  scriptGeneration: 1,
  voiceSynthesis: 2,
  exportSingle: 5,
  exportBundle: 12,           // All 3 formats
} as const;

// ============================================================================
// Factory Functions
// ============================================================================

/** Generate unique ID */
export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/** Create default project */
export const createDefaultProject = (): QuickVideoV2Project => ({
  id: generateId(),
  name: 'Untitled Property Video',
  images: [],
  templateId: VIDEO_V2_CONFIG.defaultTemplate,
  format: VIDEO_V2_CONFIG.defaultFormat,
  duration: VIDEO_V2_CONFIG.defaultDuration,
  language: 'en',                  // Default to English
  script: null,
  selectedVoice: AVAILABLE_VOICES[0], // Default to first voice
  synthesizedVoice: null,
  propertyHighlights: [],
  agentBranding: null,
  musicVolume: VIDEO_V2_CONFIG.defaultMusicVolume,
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
});

/** Calculate total duration in frames */
export const calculateDurationInFrames = (
  duration: VideoDuration,
  fps: number = VIDEO_V2_CONFIG.fps
): number => duration * fps;

/** Convert seconds to frames */
export const secondsToFrames = (
  seconds: number,
  fps: number = VIDEO_V2_CONFIG.fps
): number => Math.round(seconds * fps);

/** Convert frames to seconds */
export const framesToSeconds = (
  frames: number,
  fps: number = VIDEO_V2_CONFIG.fps
): number => frames / fps;
