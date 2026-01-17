/**
 * Storyboard Types for Property Video Generation
 */

export interface PropertyData {
  address: string;
  propertyType: 'house' | 'condo' | 'apartment' | 'townhouse' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt?: number;
  features: string[];                    // pool, garage, fireplace, etc.
  style: string;                         // modern, traditional, craftsman, etc.
  description: string;                   // MLS description or custom
  price?: number;
  mlsNumber?: string;
}

export type SceneType = 'exterior' | 'interior' | 'aerial' | 'detail' | 'neighborhood';

export type MotionStyle =
  | 'pan-left'
  | 'pan-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'dolly-forward'
  | 'dolly-back'
  | 'orbit'
  | 'tilt-up'
  | 'tilt-down'
  | 'parallax'
  | 'ken-burns';

export type TransitionType = 'fade' | 'dissolve' | 'cut' | 'slide' | 'wipe';

export type SceneStatus = 'pending' | 'uploading' | 'generating' | 'completed' | 'failed';

export interface TextOverlay {
  text: string;
  position: 'top' | 'bottom' | 'center';
  style: 'minimal' | 'bold' | 'elegant';
}

export interface Scene {
  id: string;
  order: number;
  type: SceneType;
  room?: string;                         // living-room, kitchen, master-bedroom, etc.
  imageUrl: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;                      // seconds
  motionStyle: MotionStyle;
  prompt: string;
  textOverlay?: TextOverlay;
  transition: TransitionType;
  status: SceneStatus;
  errorMessage?: string;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type OutputQuality = '720p' | '1080p' | '4k';

export interface StoryboardSettings {
  aspectRatio: AspectRatio;
  musicTrack?: string;
  musicVolume: number;                   // 0-100
  transitionDuration: number;            // ms
  includeIntro: boolean;
  includeOutro: boolean;
  watermark: boolean;
  outputQuality: OutputQuality;
}

export type StoryboardStatus = 'draft' | 'generating' | 'completed' | 'failed';

export interface Storyboard {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  propertyData: PropertyData;
  scenes: Scene[];
  settings: StoryboardSettings;
  totalDuration: number;                 // calculated
  status: StoryboardStatus;
  outputUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room types for scene suggestions
export const ROOM_TYPES = [
  { id: 'exterior-front', label: 'Front Exterior', type: 'exterior' as SceneType },
  { id: 'exterior-back', label: 'Backyard', type: 'exterior' as SceneType },
  { id: 'living-room', label: 'Living Room', type: 'interior' as SceneType },
  { id: 'kitchen', label: 'Kitchen', type: 'interior' as SceneType },
  { id: 'master-bedroom', label: 'Master Bedroom', type: 'interior' as SceneType },
  { id: 'master-bathroom', label: 'Master Bathroom', type: 'interior' as SceneType },
  { id: 'dining-room', label: 'Dining Room', type: 'interior' as SceneType },
  { id: 'family-room', label: 'Family Room', type: 'interior' as SceneType },
  { id: 'bedroom-2', label: 'Bedroom 2', type: 'interior' as SceneType },
  { id: 'bedroom-3', label: 'Bedroom 3', type: 'interior' as SceneType },
  { id: 'bathroom-2', label: 'Bathroom 2', type: 'interior' as SceneType },
  { id: 'office', label: 'Home Office', type: 'interior' as SceneType },
  { id: 'garage', label: 'Garage', type: 'interior' as SceneType },
  { id: 'pool', label: 'Pool', type: 'exterior' as SceneType },
  { id: 'patio', label: 'Patio/Deck', type: 'exterior' as SceneType },
  { id: 'aerial', label: 'Aerial View', type: 'aerial' as SceneType },
  { id: 'neighborhood', label: 'Neighborhood', type: 'neighborhood' as SceneType },
] as const;

// Motion style options
export const MOTION_STYLES: { id: MotionStyle; label: string; description: string }[] = [
  { id: 'pan-left', label: 'Pan Left', description: 'Smooth horizontal sweep to the left' },
  { id: 'pan-right', label: 'Pan Right', description: 'Smooth horizontal sweep to the right' },
  { id: 'zoom-in', label: 'Zoom In', description: 'Slow zoom into the subject' },
  { id: 'zoom-out', label: 'Zoom Out', description: 'Pull back revealing more of the scene' },
  { id: 'dolly-forward', label: 'Dolly Forward', description: 'Move toward the subject' },
  { id: 'dolly-back', label: 'Dolly Back', description: 'Move away from the subject' },
  { id: 'orbit', label: 'Orbit', description: 'Circular movement around the subject' },
  { id: 'tilt-up', label: 'Tilt Up', description: 'Camera tilts upward' },
  { id: 'tilt-down', label: 'Tilt Down', description: 'Camera tilts downward' },
  { id: 'parallax', label: 'Parallax', description: '3D depth effect with layers' },
  { id: 'ken-burns', label: 'Ken Burns', description: 'Classic pan and zoom combination' },
];

// Default duration options
export const DURATION_OPTIONS = [3, 5, 8, 10] as const;

// Default transition options
export const TRANSITION_OPTIONS: { id: TransitionType; label: string }[] = [
  { id: 'fade', label: 'Fade' },
  { id: 'dissolve', label: 'Dissolve' },
  { id: 'cut', label: 'Cut' },
  { id: 'slide', label: 'Slide' },
  { id: 'wipe', label: 'Wipe' },
];

// Default settings
export const DEFAULT_STORYBOARD_SETTINGS: StoryboardSettings = {
  aspectRatio: '16:9',
  musicVolume: 50,
  transitionDuration: 500,
  includeIntro: true,
  includeOutro: true,
  watermark: false,
  outputQuality: '1080p',
};

// Helper to create a new empty scene
export function createEmptyScene(order: number): Scene {
  return {
    id: `scene_${Date.now()}_${order}`,
    order,
    type: 'interior',
    room: undefined,
    imageUrl: null,
    videoUrl: null,
    thumbnailUrl: null,
    duration: 5,
    motionStyle: 'pan-right',
    prompt: '',
    transition: 'dissolve',
    status: 'pending',
  };
}

// Helper to calculate total duration
export function calculateTotalDuration(scenes: Scene[]): number {
  return scenes.reduce((total, scene) => total + scene.duration, 0);
}

// Helper to format duration as MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
