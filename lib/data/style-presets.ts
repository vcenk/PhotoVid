import { Palette, Home, UtensilsCrossed, ShoppingCart, Sparkles, Sun, Moon, Camera, Film } from 'lucide-react';

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  industry: 'real-estate' | 'hospitality' | 'retail' | 'all';
  category: 'lighting' | 'composition' | 'color-grading' | 'style' | 'motion';
  thumbnail?: string;
  icon: any;
  prompt_modifier: string;
  parameters: {
    strength?: number;
    guidance_scale?: number;
    steps?: number;
    motion_intensity?: number;
  };
}

// REAL ESTATE PRESETS
export const REAL_ESTATE_PRESETS: StylePreset[] = [
  {
    id: 're-twilight-magic',
    name: 'Twilight Magic',
    description: 'Golden hour exterior with warm ambient lighting',
    industry: 'real-estate',
    category: 'lighting',
    icon: Sun,
    prompt_modifier: 'golden hour twilight, warm ambient lighting, blue hour sky, exterior lights on, dusk atmosphere, professional real estate photography',
    parameters: { strength: 0.8, guidance_scale: 7.5, steps: 30 },
  },
  {
    id: 're-hdr-enhance',
    name: 'HDR Enhancement',
    description: 'Balanced exposure with rich detail in shadows and highlights',
    industry: 'real-estate',
    category: 'lighting',
    icon: Camera,
    prompt_modifier: 'HDR photography, balanced exposure, rich details, professional lighting, wide dynamic range, crisp and clear',
    parameters: { strength: 0.7, guidance_scale: 8.0, steps: 35 },
  },
  {
    id: 're-virtual-staging',
    name: 'Virtual Staging',
    description: 'Modern furniture and decor in empty rooms',
    industry: 'real-estate',
    category: 'style',
    icon: Home,
    prompt_modifier: 'modern furniture, tasteful decor, contemporary interior design, staged home, warm and inviting, professional staging',
    parameters: { strength: 0.9, guidance_scale: 9.0, steps: 40 },
  },
  {
    id: 're-wide-angle',
    name: 'Wide Angle Pro',
    description: 'Spacious room perspective with architectural detail',
    industry: 'real-estate',
    category: 'composition',
    icon: Camera,
    prompt_modifier: 'wide angle lens, spacious perspective, architectural photography, room depth, professional real estate photo',
    parameters: { strength: 0.6, guidance_scale: 7.0, steps: 25 },
  },
  {
    id: 're-luxury-estate',
    name: 'Luxury Estate',
    description: 'High-end finishes with sophisticated color grading',
    industry: 'real-estate',
    category: 'color-grading',
    icon: Sparkles,
    prompt_modifier: 'luxury property, high-end finishes, sophisticated color grade, premium materials, elegant atmosphere, architectural digest style',
    parameters: { strength: 0.75, guidance_scale: 8.5, steps: 35 },
  },
  {
    id: 're-aerial-glide',
    name: 'Aerial Glide',
    description: 'Smooth drone-style exterior walkthrough',
    industry: 'real-estate',
    category: 'motion',
    icon: Film,
    prompt_modifier: 'aerial drone shot, smooth gliding motion, exterior property view, cinematic movement, professional real estate video',
    parameters: { strength: 0.8, guidance_scale: 7.5, steps: 30, motion_intensity: 0.7 },
  },
  {
    id: 're-room-flow',
    name: 'Room Flow',
    description: 'Seamless room-to-room transition',
    industry: 'real-estate',
    category: 'motion',
    icon: Film,
    prompt_modifier: 'smooth walkthrough, room to room transition, steady camera movement, interior tour, flowing motion',
    parameters: { strength: 0.7, guidance_scale: 7.0, steps: 30, motion_intensity: 0.6 },
  },
];

// HOSPITALITY PRESETS
export const HOSPITALITY_PRESETS: StylePreset[] = [
  {
    id: 'hosp-food-styling',
    name: 'Food Styling Pro',
    description: 'Restaurant-quality plating with perfect lighting',
    industry: 'hospitality',
    category: 'lighting',
    icon: UtensilsCrossed,
    prompt_modifier: 'professional food photography, perfect plating, studio lighting, appetizing, high-end restaurant presentation, garnished beautifully',
    parameters: { strength: 0.85, guidance_scale: 8.5, steps: 35 },
  },
  {
    id: 'hosp-ambient-dining',
    name: 'Ambient Dining',
    description: 'Warm restaurant atmosphere with soft bokeh',
    industry: 'hospitality',
    category: 'lighting',
    icon: Moon,
    prompt_modifier: 'warm ambient lighting, restaurant atmosphere, soft bokeh background, candlelit, cozy dining environment, romantic mood',
    parameters: { strength: 0.75, guidance_scale: 7.5, steps: 30 },
  },
  {
    id: 'hosp-overhead-flat',
    name: 'Overhead Flatlay',
    description: 'Top-down composition for menu photography',
    industry: 'hospitality',
    category: 'composition',
    icon: Camera,
    prompt_modifier: 'overhead shot, flat lay photography, top-down view, menu photography, symmetrical composition, food styling',
    parameters: { strength: 0.7, guidance_scale: 7.0, steps: 25 },
  },
  {
    id: 'hosp-rustic-charm',
    name: 'Rustic Charm',
    description: 'Natural textures with earthy color palette',
    industry: 'hospitality',
    category: 'style',
    icon: Palette,
    prompt_modifier: 'rustic presentation, natural textures, earthy color palette, organic feel, farm-to-table aesthetic, artisanal',
    parameters: { strength: 0.8, guidance_scale: 8.0, steps: 30 },
  },
  {
    id: 'hosp-fine-dining',
    name: 'Fine Dining',
    description: 'Elegant presentation with refined color grading',
    industry: 'hospitality',
    category: 'color-grading',
    icon: Sparkles,
    prompt_modifier: 'fine dining, elegant presentation, refined color grade, michelin star quality, sophisticated plating, luxury restaurant',
    parameters: { strength: 0.85, guidance_scale: 9.0, steps: 40 },
  },
  {
    id: 'hosp-action-pour',
    name: 'Action Pour',
    description: 'Dynamic drink or sauce pouring moment',
    industry: 'hospitality',
    category: 'motion',
    icon: Film,
    prompt_modifier: 'action shot, liquid pouring, dynamic movement, slow motion effect, splash photography, professional food video',
    parameters: { strength: 0.8, guidance_scale: 8.0, steps: 35, motion_intensity: 0.8 },
  },
  {
    id: 'hosp-kitchen-reveal',
    name: 'Kitchen Reveal',
    description: 'Chef preparation with slow reveal',
    industry: 'hospitality',
    category: 'motion',
    icon: Film,
    prompt_modifier: 'chef preparation, kitchen reveal, slow cinematic movement, cooking process, behind the scenes, culinary artistry',
    parameters: { strength: 0.75, guidance_scale: 7.5, steps: 30, motion_intensity: 0.5 },
  },
];

// RETAIL PRESETS
export const RETAIL_PRESETS: StylePreset[] = [
  {
    id: 'retail-clean-white',
    name: 'Clean White Studio',
    description: 'Bright studio lighting on pure white background',
    industry: 'retail',
    category: 'lighting',
    icon: Camera,
    prompt_modifier: 'studio lighting, pure white background, clean product photography, e-commerce ready, professional lighting, crisp shadows',
    parameters: { strength: 0.7, guidance_scale: 7.0, steps: 25 },
  },
  {
    id: 'retail-lifestyle-context',
    name: 'Lifestyle Context',
    description: 'Product in real-world setting with natural light',
    industry: 'retail',
    category: 'composition',
    icon: ShoppingCart,
    prompt_modifier: 'lifestyle photography, product in context, natural setting, everyday use, relatable scene, authentic moment',
    parameters: { strength: 0.8, guidance_scale: 8.0, steps: 30 },
  },
  {
    id: 'retail-hero-shot',
    name: 'Hero Product Shot',
    description: 'Dramatic lighting with focus on product details',
    industry: 'retail',
    category: 'lighting',
    icon: Sparkles,
    prompt_modifier: 'hero product shot, dramatic lighting, focus on details, premium feel, eye-catching, professional product photography',
    parameters: { strength: 0.85, guidance_scale: 8.5, steps: 35 },
  },
  {
    id: 'retail-flat-lay',
    name: 'Flat Lay Collection',
    description: 'Organized overhead arrangement of products',
    industry: 'retail',
    category: 'composition',
    icon: Camera,
    prompt_modifier: 'flat lay photography, organized arrangement, overhead view, product collection, styled composition, social media ready',
    parameters: { strength: 0.75, guidance_scale: 7.5, steps: 30 },
  },
  {
    id: 'retail-moody-dark',
    name: 'Moody & Dark',
    description: 'Low-key lighting with rich shadows',
    industry: 'retail',
    category: 'color-grading',
    icon: Moon,
    prompt_modifier: 'moody lighting, dark background, low key photography, rich shadows, dramatic atmosphere, luxury product feel',
    parameters: { strength: 0.8, guidance_scale: 8.0, steps: 35 },
  },
  {
    id: 'retail-vibrant-pop',
    name: 'Vibrant Pop',
    description: 'Bold colors with high contrast and saturation',
    industry: 'retail',
    category: 'color-grading',
    icon: Palette,
    prompt_modifier: 'vibrant colors, bold saturation, high contrast, eye-catching, energetic, modern e-commerce style',
    parameters: { strength: 0.75, guidance_scale: 7.5, steps: 30 },
  },
  {
    id: 'retail-360-spin',
    name: '360° Product Spin',
    description: 'Smooth rotation showcasing all angles',
    industry: 'retail',
    category: 'motion',
    icon: Film,
    prompt_modifier: '360 degree rotation, product spin, smooth circular motion, all angles view, e-commerce video, turntable effect',
    parameters: { strength: 0.8, guidance_scale: 7.5, steps: 30, motion_intensity: 0.6 },
  },
  {
    id: 'retail-unbox-reveal',
    name: 'Unboxing Reveal',
    description: 'Product reveal with dynamic unboxing motion',
    industry: 'retail',
    category: 'motion',
    icon: Film,
    prompt_modifier: 'unboxing video, product reveal, smooth motion, packaging opening, satisfying reveal, professional product video',
    parameters: { strength: 0.75, guidance_scale: 7.5, steps: 30, motion_intensity: 0.7 },
  },
];

// UNIVERSAL PRESETS (work across all industries)
export const UNIVERSAL_PRESETS: StylePreset[] = [
  {
    id: 'uni-natural-light',
    name: 'Natural Light',
    description: 'Soft window light with natural shadows',
    industry: 'all',
    category: 'lighting',
    icon: Sun,
    prompt_modifier: 'natural window light, soft shadows, daylight, organic lighting, natural atmosphere',
    parameters: { strength: 0.7, guidance_scale: 7.0, steps: 25 },
  },
  {
    id: 'uni-golden-glow',
    name: 'Golden Glow',
    description: 'Warm golden hour lighting',
    industry: 'all',
    category: 'lighting',
    icon: Sun,
    prompt_modifier: 'golden hour, warm glow, sunset lighting, soft and warm, magical hour',
    parameters: { strength: 0.75, guidance_scale: 7.5, steps: 30 },
  },
  {
    id: 'uni-cinematic',
    name: 'Cinematic Film',
    description: 'Film-like color grading with depth',
    industry: 'all',
    category: 'color-grading',
    icon: Film,
    prompt_modifier: 'cinematic color grade, film look, depth and dimension, movie-like quality, professional color correction',
    parameters: { strength: 0.8, guidance_scale: 8.0, steps: 35 },
  },
  {
    id: 'uni-minimalist',
    name: 'Minimalist Clean',
    description: 'Simple composition with negative space',
    industry: 'all',
    category: 'style',
    icon: Sparkles,
    prompt_modifier: 'minimalist style, clean composition, negative space, simple and elegant, less is more',
    parameters: { strength: 0.7, guidance_scale: 7.0, steps: 25 },
  },
  {
    id: 'uni-slow-pan',
    name: 'Slow Pan',
    description: 'Gentle horizontal camera movement',
    industry: 'all',
    category: 'motion',
    icon: Film,
    prompt_modifier: 'slow pan motion, gentle horizontal movement, smooth camera slide, cinematic panning',
    parameters: { strength: 0.7, guidance_scale: 7.0, steps: 30, motion_intensity: 0.5 },
  },
  {
    id: 'uni-dolly-zoom',
    name: 'Dolly Zoom',
    description: 'Forward tracking shot with depth',
    industry: 'all',
    category: 'motion',
    icon: Film,
    prompt_modifier: 'dolly zoom, forward tracking, smooth approach, cinematic push in, professional camera movement',
    parameters: { strength: 0.75, guidance_scale: 7.5, steps: 30, motion_intensity: 0.6 },
  },
];

// Combined export
export const ALL_STYLE_PRESETS = [
  ...REAL_ESTATE_PRESETS,
  ...HOSPITALITY_PRESETS,
  ...RETAIL_PRESETS,
  ...UNIVERSAL_PRESETS,
];

// Helper to get presets by industry
export function getPresetsByIndustry(industry: 'real-estate' | 'hospitality' | 'retail' | 'all') {
  if (industry === 'all') {
    return ALL_STYLE_PRESETS;
  }
  return ALL_STYLE_PRESETS.filter(p => p.industry === industry || p.industry === 'all');
}

// Helper to get presets by category
export function getPresetsByCategory(category: StylePreset['category']) {
  return ALL_STYLE_PRESETS.filter(p => p.category === category);
}
