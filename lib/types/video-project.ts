/**
 * Video Project Types for Remotion Video Builder
 * Used in the Real Estate Video Builder tool
 */

// Video project containing all data needed to render a property video
export interface VideoProject {
  id: string;
  userId?: string;
  name: string;
  images: VideoImage[];
  propertyData: VideoPropertyData;
  agentBranding: AgentBranding;
  templateId: VideoTemplate;
  musicTrackId: string | null;
  musicVolume: number;
  createdAt: Date;
  updatedAt: Date;
}

// Individual image in the video sequence
export interface VideoImage {
  id: string;
  order: number;
  url: string;           // Image URL (R2 or local blob)
  thumbnailUrl?: string; // Resized thumbnail for UI
  label?: string;        // Optional label like "Kitchen", "Living Room"
  duration: number;      // Seconds this image appears (default 3)
}

// Property details displayed in the video
export interface VideoPropertyData {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: string;
  yearBuilt?: number;
  features: string[];    // e.g., ["Pool", "Updated Kitchen", "3-Car Garage"]
}

// Agent branding displayed in the video
export interface AgentBranding {
  name: string;
  title?: string;         // "Senior Agent", "Broker"
  phone?: string;
  email?: string;
  website?: string;
  photoUrl?: string;      // Agent headshot
  logoUrl?: string;       // Brokerage logo
  brokerageName?: string;
}

// Available video templates
export type VideoTemplate = 'modern' | 'luxury' | 'minimal' | 'bold' | 'elegant';

// Export format options
export type ExportFormat = 'landscape' | 'square' | 'vertical';

// Format dimensions
export const FORMAT_DIMENSIONS: Record<ExportFormat, { width: number; height: number }> = {
  landscape: { width: 1920, height: 1080 },  // 16:9
  square: { width: 1080, height: 1080 },     // 1:1
  vertical: { width: 1080, height: 1920 },   // 9:16
};

// Video render status
export interface VideoRender {
  id: string;
  projectId: string;
  format: ExportFormat;
  status: RenderStatus;
  progress: number;       // 0-100
  outputUrl?: string;     // Final video URL when completed
  error?: string;         // Error message if failed
  creditsCharged: number;
  startedAt: Date;
  completedAt?: Date;
}

export type RenderStatus = 'pending' | 'rendering' | 'completed' | 'failed';

// Template configuration
export interface TemplateConfig {
  id: VideoTemplate;
  name: string;
  description: string;
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// Default values for new projects
export const DEFAULT_VIDEO_PROJECT: Omit<VideoProject, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'Untitled Video',
  images: [],
  propertyData: {
    address: '',
    features: [],
  },
  agentBranding: {
    name: '',
  },
  templateId: 'modern',
  musicTrackId: null,
  musicVolume: 50,
};

// Default image duration in seconds
export const DEFAULT_IMAGE_DURATION = 3;

// Video composition settings
export const VIDEO_CONFIG = {
  fps: 30,
  durationInSeconds: 30,
  durationInFrames: 900, // 30 * 30
  sequences: {
    logoIntro: { start: 0, end: 60 },           // 2 seconds
    heroSlide: { start: 60, end: 120 },         // 2 seconds
    imageSlideshow: { start: 120, end: 720 },   // 20 seconds
    agentCard: { start: 720, end: 840 },        // 4 seconds
    ctaOutro: { start: 840, end: 900 },         // 2 seconds
  },
};

// Credit costs for video export
export const VIDEO_EXPORT_CREDITS = {
  single: 5,       // Single format export
  bundle: 12,      // All 3 formats
} as const;
