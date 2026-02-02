/**
 * Editor Presets
 * Pre-defined transitions, effects, and text templates for the video editor
 */

import type {
  TransitionPreset,
  EffectPreset,
  TextPreset,
  TextClipContent,
} from '@/lib/types/video-editor';

// ============================================
// TRANSITION PRESETS
// ============================================

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: 'fade',
    type: 'fade',
    name: 'Fade',
    description: 'Smooth crossfade between clips',
    defaultDuration: 15, // 0.5 sec at 30fps
  },
  {
    id: 'dissolve',
    type: 'dissolve',
    name: 'Dissolve',
    description: 'Gradual dissolve transition',
    defaultDuration: 20,
  },
  {
    id: 'slide-left',
    type: 'slide-left',
    name: 'Slide Left',
    description: 'New clip slides in from the right',
    defaultDuration: 15,
  },
  {
    id: 'slide-right',
    type: 'slide-right',
    name: 'Slide Right',
    description: 'New clip slides in from the left',
    defaultDuration: 15,
  },
  {
    id: 'slide-up',
    type: 'slide-up',
    name: 'Slide Up',
    description: 'New clip slides in from the bottom',
    defaultDuration: 15,
  },
  {
    id: 'slide-down',
    type: 'slide-down',
    name: 'Slide Down',
    description: 'New clip slides in from the top',
    defaultDuration: 15,
  },
  {
    id: 'wipe-left',
    type: 'wipe-left',
    name: 'Wipe Left',
    description: 'Horizontal wipe from right to left',
    defaultDuration: 20,
  },
  {
    id: 'wipe-right',
    type: 'wipe-right',
    name: 'Wipe Right',
    description: 'Horizontal wipe from left to right',
    defaultDuration: 20,
  },
  {
    id: 'zoom-in',
    type: 'zoom-in',
    name: 'Zoom In',
    description: 'Zoom into the next clip',
    defaultDuration: 20,
  },
  {
    id: 'zoom-out',
    type: 'zoom-out',
    name: 'Zoom Out',
    description: 'Zoom out to reveal the next clip',
    defaultDuration: 20,
  },
];

// ============================================
// EFFECT PRESETS
// ============================================

export const EFFECT_PRESETS: EffectPreset[] = [
  // Color effects
  {
    id: 'brightness',
    type: 'brightness',
    name: 'Brightness',
    description: 'Adjust overall brightness',
    defaultIntensity: 50,
    category: 'color',
  },
  {
    id: 'contrast',
    type: 'contrast',
    name: 'Contrast',
    description: 'Adjust color contrast',
    defaultIntensity: 50,
    category: 'color',
  },
  {
    id: 'saturation',
    type: 'saturation',
    name: 'Saturation',
    description: 'Adjust color saturation',
    defaultIntensity: 50,
    category: 'color',
  },
  {
    id: 'sepia',
    type: 'sepia',
    name: 'Sepia',
    description: 'Vintage sepia tone',
    defaultIntensity: 70,
    category: 'color',
  },
  {
    id: 'grayscale',
    type: 'grayscale',
    name: 'Grayscale',
    description: 'Black and white effect',
    defaultIntensity: 100,
    category: 'color',
  },
  // Blur effects
  {
    id: 'blur',
    type: 'blur',
    name: 'Blur',
    description: 'Gaussian blur effect',
    defaultIntensity: 30,
    category: 'blur',
  },
  // Stylize effects
  {
    id: 'glitch',
    type: 'glitch',
    name: 'Glitch',
    description: 'Digital glitch distortion',
    defaultIntensity: 40,
    category: 'stylize',
  },
  {
    id: 'vignette',
    type: 'vignette',
    name: 'Vignette',
    description: 'Dark edges around frame',
    defaultIntensity: 50,
    category: 'stylize',
  },
  // Overlay effects
  {
    id: 'light-leak',
    type: 'light-leak',
    name: 'Light Leak',
    description: 'Cinematic light leak overlay',
    defaultIntensity: 60,
    category: 'overlay',
  },
];

// ============================================
// TEXT PRESETS
// ============================================

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'title',
    name: 'Title',
    description: 'Large centered title text',
    content: {
      fontSize: 72,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 700,
      color: '#FFFFFF',
      position: 'center',
      alignment: 'center',
      animation: 'fade',
    },
  },
  {
    id: 'subtitle',
    name: 'Subtitle',
    description: 'Medium centered subtitle',
    content: {
      fontSize: 36,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      color: '#FFFFFF',
      position: 'center',
      alignment: 'center',
      animation: 'slide-up',
    },
  },
  {
    id: 'lower-third',
    name: 'Lower Third',
    description: 'Name/title at bottom',
    content: {
      fontSize: 28,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      position: 'lower-third',
      alignment: 'left',
      animation: 'slide-up',
    },
  },
  {
    id: 'caption',
    name: 'Caption',
    description: 'Small bottom text',
    content: {
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      color: '#FFFFFF',
      position: 'bottom',
      alignment: 'center',
      animation: 'fade',
    },
  },
  {
    id: 'heading-top',
    name: 'Top Heading',
    description: 'Large text at top',
    content: {
      fontSize: 48,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 700,
      color: '#FFFFFF',
      position: 'top',
      alignment: 'center',
      animation: 'slide-down',
    },
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Italic quote text',
    content: {
      fontSize: 32,
      fontFamily: 'Georgia, serif',
      fontWeight: 400,
      color: '#FFFFFF',
      position: 'center',
      alignment: 'center',
      animation: 'scale',
    },
  },
  {
    id: 'price-tag',
    name: 'Price Tag',
    description: 'Large price display',
    content: {
      fontSize: 56,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 800,
      color: '#10B981',
      position: 'center',
      alignment: 'center',
      animation: 'scale',
    },
  },
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'Action button style',
    content: {
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 700,
      color: '#FFFFFF',
      backgroundColor: '#8B5CF6',
      position: 'bottom',
      alignment: 'center',
      animation: 'slide-up',
    },
  },
];

// ============================================
// KEN BURNS PRESETS
// ============================================

export const KEN_BURNS_PRESETS = [
  { id: 'zoom-in', name: 'Zoom In', direction: 'zoom-in' as const, intensity: 0.1 },
  { id: 'zoom-out', name: 'Zoom Out', direction: 'zoom-out' as const, intensity: 0.1 },
  { id: 'pan-left', name: 'Pan Left', direction: 'pan-left' as const, intensity: 0.1 },
  { id: 'pan-right', name: 'Pan Right', direction: 'pan-right' as const, intensity: 0.1 },
  { id: 'zoom-in-slow', name: 'Slow Zoom In', direction: 'zoom-in' as const, intensity: 0.05 },
  { id: 'zoom-in-fast', name: 'Fast Zoom In', direction: 'zoom-in' as const, intensity: 0.2 },
];

// ============================================
// DEFAULT TEXT CONTENT
// ============================================

export function createDefaultTextContent(presetId?: string): TextClipContent {
  const preset = TEXT_PRESETS.find(p => p.id === presetId);

  return {
    text: 'New Text',
    fontSize: preset?.content.fontSize || 48,
    fontFamily: preset?.content.fontFamily || 'Inter, sans-serif',
    fontWeight: preset?.content.fontWeight || 600,
    color: preset?.content.color || '#FFFFFF',
    backgroundColor: preset?.content.backgroundColor,
    position: preset?.content.position || 'center',
    alignment: preset?.content.alignment || 'center',
    animation: preset?.content.animation || 'fade',
  };
}

// ============================================
// FONT OPTIONS
// ============================================

export const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', value: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', value: 'Roboto, sans-serif' },
  { id: 'poppins', name: 'Poppins', value: 'Poppins, sans-serif' },
  { id: 'playfair', name: 'Playfair Display', value: 'Playfair Display, serif' },
  { id: 'georgia', name: 'Georgia', value: 'Georgia, serif' },
  { id: 'monaco', name: 'Monaco', value: 'Monaco, monospace' },
];

// ============================================
// COLOR OPTIONS
// ============================================

export const COLOR_OPTIONS = [
  { id: 'white', name: 'White', value: '#FFFFFF' },
  { id: 'black', name: 'Black', value: '#000000' },
  { id: 'gray', name: 'Gray', value: '#9CA3AF' },
  { id: 'purple', name: 'Purple', value: '#8B5CF6' },
  { id: 'blue', name: 'Blue', value: '#3B82F6' },
  { id: 'green', name: 'Green', value: '#10B981' },
  { id: 'yellow', name: 'Yellow', value: '#F59E0B' },
  { id: 'red', name: 'Red', value: '#EF4444' },
  { id: 'pink', name: 'Pink', value: '#EC4899' },
];
