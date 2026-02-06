/**
 * Video Templates V2 - Premium Templates for Quick Video
 *
 * 6 curated templates with:
 * - Visual styling (colors, fonts)
 * - Background music configuration
 * - Animation settings (transitions, Ken Burns)
 * - Voice integration settings
 */

import type {
  VideoTemplateV2,
  TemplateV2Config,
  TransitionStyle,
  KenBurnsStyle,
} from '@/lib/types/quick-video-v2';

/**
 * Complete template configurations
 */
export const TEMPLATES_V2: Record<VideoTemplateV2, TemplateV2Config> = {
  'luxe-estate': {
    id: 'luxe-estate',
    name: 'Luxe Estate',
    description: 'Slow, elegant movements with piano music and serif fonts. Perfect for luxury properties.',

    colors: {
      primary: '#1c1917',      // stone-900
      secondary: '#292524',    // stone-800
      accent: '#d4af37',       // Gold
      background: '#0c0a09',   // stone-950
      text: '#fafaf9',         // stone-50
      captionBg: 'rgba(12, 10, 9, 0.85)',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },

    musicTrack: '/audio/music/piano-elegant.mp3',
    musicVolume: 35,
    voiceDuckLevel: 12,

    transitionStyle: 'fade',
    transitionDuration: 20,     // Slower, more elegant
    kenBurnsStyle: 'subtle',
    kenBurnsIntensity: 0.08,

    introDuration: 90,          // 3 seconds
    outroDuration: 90,

    useLightLeaks: true,
    useVignette: true,
  },

  'modern-living': {
    id: 'modern-living',
    name: 'Modern Living',
    description: 'Clean, upbeat energy with electronic music. Great for contemporary homes.',

    colors: {
      primary: '#09090b',      // zinc-950
      secondary: '#18181b',    // zinc-900
      accent: '#8b5cf6',       // violet-500
      background: '#09090b',
      text: '#fafafa',
      captionBg: 'rgba(9, 9, 11, 0.85)',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },

    musicTrack: '/audio/music/upbeat-modern.mp3',
    musicVolume: 40,
    voiceDuckLevel: 15,

    transitionStyle: 'slide',
    transitionDuration: 15,
    kenBurnsStyle: 'dramatic',
    kenBurnsIntensity: 0.12,

    introDuration: 60,          // 2 seconds
    outroDuration: 60,

    useLightLeaks: true,
    useVignette: false,
  },

  'cozy-home': {
    id: 'cozy-home',
    name: 'Cozy Home',
    description: 'Warm and inviting with acoustic guitar. Ideal for family homes.',

    colors: {
      primary: '#1c1917',      // stone-900
      secondary: '#292524',
      accent: '#f59e0b',       // amber-500
      background: '#0c0a09',
      text: '#fef3c7',         // amber-100
      captionBg: 'rgba(28, 25, 23, 0.85)',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },

    musicTrack: '/audio/music/acoustic-warm.mp3',
    musicVolume: 38,
    voiceDuckLevel: 14,

    transitionStyle: 'fade',
    transitionDuration: 18,
    kenBurnsStyle: 'gentle',
    kenBurnsIntensity: 0.06,

    introDuration: 75,          // 2.5 seconds
    outroDuration: 75,

    useLightLeaks: false,
    useVignette: true,
  },

  'urban-loft': {
    id: 'urban-loft',
    name: 'Urban Loft',
    description: 'Trendy and fast-paced with electronic beats. Perfect for urban properties.',

    colors: {
      primary: '#0f0f0f',
      secondary: '#171717',    // neutral-900
      accent: '#06b6d4',       // cyan-500
      background: '#0a0a0a',
      text: '#ffffff',
      captionBg: 'rgba(15, 15, 15, 0.9)',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },

    musicTrack: '/audio/music/electronic-trendy.mp3',
    musicVolume: 45,
    voiceDuckLevel: 18,

    transitionStyle: 'wipe',
    transitionDuration: 12,     // Faster transitions
    kenBurnsStyle: 'parallax',
    kenBurnsIntensity: 0.15,

    introDuration: 45,          // 1.5 seconds - quicker
    outroDuration: 45,

    useLightLeaks: true,
    useVignette: false,
  },

  'classic-elegance': {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    description: 'Traditional feel with orchestral music. Suits heritage and estate properties.',

    colors: {
      primary: '#1e1b4b',      // indigo-950
      secondary: '#312e81',    // indigo-900
      accent: '#fbbf24',       // amber-400
      background: '#0f172a',   // slate-900
      text: '#f8fafc',         // slate-50
      captionBg: 'rgba(15, 23, 42, 0.85)',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },

    musicTrack: '/audio/music/orchestral-classic.mp3',
    musicVolume: 32,
    voiceDuckLevel: 10,

    transitionStyle: 'fade',
    transitionDuration: 22,     // Slowest, most stately
    kenBurnsStyle: 'subtle',
    kenBurnsIntensity: 0.05,

    introDuration: 90,          // 3 seconds
    outroDuration: 105,         // 3.5 seconds - longer outro

    useLightLeaks: false,
    useVignette: true,
  },

  'quick-tour': {
    id: 'quick-tour',
    name: 'Quick Tour',
    description: 'Fast-paced with dynamic cuts. Optimized for 15-second social media clips.',

    colors: {
      primary: '#09090b',
      secondary: '#18181b',
      accent: '#ef4444',       // red-500
      background: '#09090b',
      text: '#ffffff',
      captionBg: 'rgba(9, 9, 11, 0.9)',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },

    musicTrack: '/audio/music/upbeat-fast.mp3',
    musicVolume: 50,
    voiceDuckLevel: 20,

    transitionStyle: 'zoom',
    transitionDuration: 8,      // Very fast
    kenBurnsStyle: 'dynamic',
    kenBurnsIntensity: 0.18,

    introDuration: 30,          // 1 second - minimal
    outroDuration: 30,

    useLightLeaks: true,
    useVignette: false,
  },
};

/**
 * Get template configuration by ID
 */
export function getTemplateV2(templateId: VideoTemplateV2): TemplateV2Config {
  return TEMPLATES_V2[templateId];
}

/**
 * Get all template configurations as array
 */
export function getAllTemplatesV2(): TemplateV2Config[] {
  return Object.values(TEMPLATES_V2);
}

/**
 * Template preview data for UI cards
 */
export interface TemplatePreview {
  id: VideoTemplateV2;
  name: string;
  description: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  tags: string[];
}

/**
 * Get template previews for selection UI
 */
export function getTemplatePreviews(): TemplatePreview[] {
  return [
    {
      id: 'luxe-estate',
      name: 'Luxe Estate',
      description: 'Elegant & sophisticated',
      accentColor: '#d4af37',
      backgroundColor: '#0c0a09',
      fontFamily: 'Playfair Display',
      tags: ['Luxury', 'Slow'],
    },
    {
      id: 'modern-living',
      name: 'Modern Living',
      description: 'Clean & contemporary',
      accentColor: '#8b5cf6',
      backgroundColor: '#09090b',
      fontFamily: 'Inter',
      tags: ['Modern', 'Upbeat'],
    },
    {
      id: 'cozy-home',
      name: 'Cozy Home',
      description: 'Warm & inviting',
      accentColor: '#f59e0b',
      backgroundColor: '#0c0a09',
      fontFamily: 'Playfair Display',
      tags: ['Family', 'Warm'],
    },
    {
      id: 'urban-loft',
      name: 'Urban Loft',
      description: 'Trendy & energetic',
      accentColor: '#06b6d4',
      backgroundColor: '#0a0a0a',
      fontFamily: 'Inter',
      tags: ['Urban', 'Fast'],
    },
    {
      id: 'classic-elegance',
      name: 'Classic Elegance',
      description: 'Timeless & refined',
      accentColor: '#fbbf24',
      backgroundColor: '#0f172a',
      fontFamily: 'Playfair Display',
      tags: ['Classic', 'Estate'],
    },
    {
      id: 'quick-tour',
      name: 'Quick Tour',
      description: 'Fast & dynamic',
      accentColor: '#ef4444',
      backgroundColor: '#09090b',
      fontFamily: 'Inter',
      tags: ['Social', '15s'],
    },
  ];
}

/**
 * Recommended template for duration
 */
export function getRecommendedTemplate(duration: 15 | 30 | 60): VideoTemplateV2 {
  if (duration === 15) return 'quick-tour';
  if (duration === 60) return 'luxe-estate';
  return 'modern-living';
}

/**
 * Ken Burns direction patterns for variety
 */
export const KEN_BURNS_PATTERNS: Record<KenBurnsStyle, ('zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right')[]> = {
  subtle: ['zoom-in', 'zoom-out'],
  dramatic: ['zoom-in', 'pan-right', 'zoom-out', 'pan-left'],
  parallax: ['pan-right', 'pan-left', 'zoom-in', 'zoom-out'],
  gentle: ['zoom-in', 'zoom-in', 'zoom-out'],
  dynamic: ['zoom-in', 'pan-right', 'zoom-out', 'pan-left', 'zoom-in', 'pan-left'],
};

/**
 * Get Ken Burns direction for image index
 */
export function getKenBurnsDirection(
  style: KenBurnsStyle,
  imageIndex: number
): 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' {
  const pattern = KEN_BURNS_PATTERNS[style];
  return pattern[imageIndex % pattern.length];
}
