/**
 * Video Editor Types
 * TypeScript definitions for the timeline-based video editor
 */

// ============================================
// ENUMS AND UNION TYPES
// ============================================

export type AssetType = 'image' | 'video' | 'audio' | 'text';
export type TrackType = 'visual' | 'audio' | 'text';

export type TransitionType =
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'wipe-left'
  | 'wipe-right'
  | 'dissolve'
  | 'zoom-in'
  | 'zoom-out';

export type EffectType =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'glitch'
  | 'light-leak'
  | 'vignette'
  | 'sepia'
  | 'grayscale';

export type KenBurnsDirection = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';

export type TextAnimation = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'typewriter';

export type TextPosition = 'top' | 'center' | 'bottom' | 'lower-third';

export type ExportFormat = 'landscape' | 'square' | 'vertical';

// ============================================
// ASSET TYPES
// ============================================

/**
 * An asset in the media library (uploaded file)
 */
export interface EditorAsset {
  id: string;
  type: AssetType;
  name: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // In frames, for video/audio assets
  width?: number; // For images/video
  height?: number;
  fileSize?: number; // In bytes
  mimeType?: string;
  createdAt: Date;
}

// ============================================
// CLIP TYPES
// ============================================

/**
 * A clip placed on the timeline
 */
export interface TimelineClip {
  id: string;
  assetId: string; // Reference to EditorAsset (empty for text clips)
  trackId: string; // Which track this clip belongs to
  startFrame: number; // Position on timeline
  durationFrames: number; // Length of clip
  trimStartFrame?: number; // For trimming source media start
  trimEndFrame?: number; // For trimming source media end

  // Visual effects applied to this clip
  effects: ClipEffect[];

  // Ken Burns settings for images
  kenBurns?: {
    direction: KenBurnsDirection;
    intensity: number; // 0.05 to 0.3
  };

  // Text content (for text clips)
  textContent?: TextClipContent;

  // Audio-specific
  volume?: number; // 0-100
  fadeIn?: number; // frames
  fadeOut?: number; // frames
}

/**
 * Text content for text clips
 */
export interface TextClipContent {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  position: TextPosition;
  alignment: 'left' | 'center' | 'right';
  animation: TextAnimation;
  animationDelay?: number; // frames
  // Free-position coordinates (0-100 percentage of canvas)
  // When set, overrides the preset position
  x?: number; // 0 = left, 50 = center, 100 = right
  y?: number; // 0 = top, 50 = center, 100 = bottom
}

/**
 * A transition between two clips
 */
export interface ClipTransition {
  id: string;
  type: TransitionType;
  fromClipId: string;
  toClipId: string;
  durationFrames: number; // Typically 15-30 frames (0.5-1 sec at 30fps)
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * An effect applied to a clip
 */
export interface ClipEffect {
  id: string;
  type: EffectType;
  intensity: number; // 0-100
  startFrame?: number; // Relative to clip start (for keyframed effects)
  endFrame?: number;
}

// ============================================
// TRACK TYPES
// ============================================

/**
 * A track in the timeline (visual, audio, or text)
 */
export interface TimelineTrack {
  id: string;
  type: TrackType;
  name: string;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  volume?: number; // For audio tracks, 0-100
  clips: string[]; // Array of clip IDs in order
}

// ============================================
// PROJECT TYPES
// ============================================

/**
 * Video editor project configuration
 */
export interface VideoEditorConfig {
  fps: number;
  width: number;
  height: number;
}

/**
 * Format dimensions for export
 */
export const FORMAT_CONFIGS: Record<ExportFormat, VideoEditorConfig> = {
  landscape: { fps: 30, width: 1920, height: 1080 },
  square: { fps: 30, width: 1080, height: 1080 },
  vertical: { fps: 30, width: 1080, height: 1920 },
};

/**
 * Main video editor project state
 */
export interface VideoEditorProject {
  id: string;
  name: string;

  // Timeline settings
  fps: number;
  totalDurationFrames: number; // Total project duration
  format: ExportFormat;

  // Asset library
  assets: Record<string, EditorAsset>;

  // Timeline structure
  tracks: TimelineTrack[];
  clips: Record<string, TimelineClip>;
  transitions: Record<string, ClipTransition>;

  // Playback state
  currentFrame: number;
  isPlaying: boolean;

  // UI state
  zoom: number; // Pixels per frame (default ~2)
  selectedClipId: string | null;
  selectedTrackId: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Actions available in the VideoEditorContext
 */
export interface VideoEditorActions {
  // Project management
  createProject: (name?: string) => void;
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<boolean>;
  clearProject: () => void;
  setProjectName: (name: string) => void;

  // Format
  setFormat: (format: ExportFormat) => void;
  setDuration: (frames: number) => void;

  // Assets
  addAsset: (file: File) => Promise<EditorAsset>;
  addAssets: (files: File[]) => Promise<EditorAsset[]>;
  removeAsset: (id: string) => void;

  // Tracks
  addTrack: (type: TrackType, name?: string) => string;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<TimelineTrack>) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;
  toggleTrackMute: (id: string) => void;
  toggleTrackLock: (id: string) => void;
  toggleTrackVisibility: (id: string) => void;

  // Clips
  addClip: (assetId: string, trackId: string, startFrame: number, durationFrames?: number) => string;
  addTextClip: (trackId: string, startFrame: number, content: TextClipContent) => string;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<TimelineClip>) => void;
  moveClip: (id: string, newTrackId: string, newStartFrame: number) => void;
  resizeClip: (id: string, newDuration: number, fromStart?: boolean) => void;
  splitClip: (id: string, atFrame: number) => void;
  duplicateClip: (id: string) => string;

  // Transitions
  addTransition: (fromClipId: string, toClipId: string, type: TransitionType, durationFrames?: number) => string;
  removeTransition: (id: string) => void;
  updateTransition: (id: string, updates: Partial<ClipTransition>) => void;

  // Effects
  addEffect: (clipId: string, type: EffectType, intensity?: number) => string;
  removeEffect: (clipId: string, effectId: string) => void;
  updateEffect: (clipId: string, effectId: string, updates: Partial<ClipEffect>) => void;

  // Ken Burns
  setKenBurns: (clipId: string, direction: KenBurnsDirection, intensity?: number) => void;
  removeKenBurns: (clipId: string) => void;

  // Playback
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (frame: number) => void;
  seekToStart: () => void;
  seekToEnd: () => void;
  stepForward: (frames?: number) => void;
  stepBackward: (frames?: number) => void;

  // UI
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;

  // Selection
  selectClip: (id: string | null) => void;
  selectTrack: (id: string | null) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Computed
  getClipAtFrame: (trackId: string, frame: number) => TimelineClip | null;
  getTrackDuration: (trackId: string) => number;
  recalculateDuration: () => void;
}

/**
 * Full context type combining project state and actions
 */
export interface VideoEditorContextType extends VideoEditorActions {
  project: VideoEditorProject;
  loading: boolean;
  error: string | null;

  // Computed values
  currentTime: number; // Current time in seconds
  totalDuration: number; // Total duration in seconds
  canUndo: boolean;
  canRedo: boolean;
}

// ============================================
// PRESET TYPES
// ============================================

/**
 * Text preset template
 */
export interface TextPreset {
  id: string;
  name: string;
  description: string;
  content: Partial<TextClipContent>;
  thumbnail?: string;
}

/**
 * Transition preset with preview info
 */
export interface TransitionPreset {
  id: string;
  type: TransitionType;
  name: string;
  description: string;
  defaultDuration: number; // frames
  thumbnail?: string;
  previewUrl?: string;
}

/**
 * Effect preset with configuration
 */
export interface EffectPreset {
  id: string;
  type: EffectType;
  name: string;
  description: string;
  defaultIntensity: number;
  icon?: string;
  category: 'color' | 'blur' | 'stylize' | 'overlay';
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Frame to time conversion (at 30fps)
 */
export function framesToSeconds(frames: number, fps: number = 30): number {
  return frames / fps;
}

export function secondsToFrames(seconds: number, fps: number = 30): number {
  return Math.round(seconds * fps);
}

export function formatTime(frames: number, fps: number = 30): string {
  const totalSeconds = frames / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const remainingFrames = frames % fps;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${remainingFrames.toString().padStart(2, '0')}`;
}

export function formatTimeSimple(frames: number, fps: number = 30): string {
  const totalSeconds = frames / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Default project factory
 */
export function createDefaultProject(name: string = 'Untitled Project'): VideoEditorProject {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name,
    fps: 30,
    totalDurationFrames: 900, // 30 seconds default
    format: 'landscape',
    assets: {},
    tracks: [
      {
        id: crypto.randomUUID(),
        type: 'visual',
        name: 'Video',
        muted: false,
        locked: false,
        visible: true,
        clips: [],
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        name: 'Text',
        muted: false,
        locked: false,
        visible: true,
        clips: [],
      },
      {
        id: crypto.randomUUID(),
        type: 'audio',
        name: 'Music',
        muted: false,
        locked: false,
        visible: true,
        volume: 100,
        clips: [],
      },
      {
        id: crypto.randomUUID(),
        type: 'audio',
        name: 'SFX',
        muted: false,
        locked: false,
        visible: true,
        volume: 100,
        clips: [],
      },
    ],
    clips: {},
    transitions: {},
    currentFrame: 0,
    isPlaying: false,
    zoom: 2, // 2 pixels per frame default
    selectedClipId: null,
    selectedTrackId: null,
    createdAt: now,
    updatedAt: now,
  };
}
