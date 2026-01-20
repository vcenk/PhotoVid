/**
 * Generation Types for AI Tools
 * Used for tracking and managing AI generations across the platform
 */

// Generation types supported by the platform
export type GenerationType =
  | 'text_to_image'
  | 'image_to_image'
  | 'image_to_video'
  | 'video_to_video';

// Real estate tool identifiers
export type RealEstateToolType =
  // Photo Enhancement
  | 'virtual-staging'
  | 'photo-enhancement'
  | 'photo-relight' // ICLight for bright/hdr presets
  | 'sky-segmentation' // Auto sky mask generation
  | 'sky-replacement'
  | 'twilight'
  | 'item-removal'
  | 'lawn-enhancement'
  | 'declutter'
  // Renovation & Design
  | 'virtual-renovation'
  | 'wall-color'
  | 'floor-replacement'
  // Weather & Lighting
  | 'rain-to-shine'
  | 'night-to-day'
  | 'changing-seasons'
  // Pool & Water
  | 'pool-enhancement'
  // Utility
  | 'watermark-removal'
  | 'headshot-retouching'
  | 'hdr-merge'
  // Video
  | 'room-tour'
  // Advanced
  | 'floor-plan'
  | '360-staging';

// Auto dealership tool identifiers
export type AutoToolType =
  // Photo Enhancement
  | 'background-swap'
  | 'auto-enhance'
  | 'blemish-removal'
  | 'reflection-fix'
  | 'interior-enhance'
  | 'license-blur'
  | 'spot-removal'
  | 'shadow-enhancement'
  | 'number-plate-mask'
  | 'dealer-branding'
  // Customization Preview
  | 'window-tint'
  | 'paint-color'
  | 'wheel-customizer'
  // Video
  | 'vehicle-360'
  | 'vehicle-walkthrough'
  | 'social-clips'
  // Inspection
  | 'damage-detection';

// Combined tool type
export type ToolType = RealEstateToolType | AutoToolType;

// FAL AI model mappings for each tool
export const TOOL_MODEL_MAP: Record<ToolType, string> = {
  // ============ REAL ESTATE TOOLS ============
  // Photo Enhancement Tools
  'virtual-staging': 'fal-ai/flux-2-lora-gallery/apartment-staging',
  'photo-enhancement': 'fal-ai/clarity-upscaler',
  'photo-relight': 'fal-ai/iclight-v2', // ICLight for bright/hdr presets
  'sky-segmentation': 'fal-ai/birefnet', // Background removal for sky mask
  'sky-replacement': 'fal-ai/flux-pro/v1/fill',
  'twilight': 'fal-ai/flux/dev/image-to-image',
  'item-removal': 'fal-ai/bria/eraser',
  'lawn-enhancement': 'fal-ai/flux/dev/image-to-image',
  'declutter': 'fal-ai/bria/eraser',

  // Renovation & Design Tools
  'virtual-renovation': 'fal-ai/flux-pro/v1/fill',
  'wall-color': 'fal-ai/flux-pro/v1/fill',
  'floor-replacement': 'fal-ai/flux-pro/v1/fill',

  // Weather & Lighting Tools
  'rain-to-shine': 'fal-ai/flux/dev/image-to-image',
  'night-to-day': 'fal-ai/flux/dev/image-to-image',
  'changing-seasons': 'fal-ai/flux/dev/image-to-image',

  // Pool & Water Tools
  'pool-enhancement': 'fal-ai/flux-pro/v1/fill',

  // Utility Tools
  'watermark-removal': 'fal-ai/bria/eraser',
  'headshot-retouching': 'fal-ai/flux/dev/image-to-image',
  'hdr-merge': 'fal-ai/clarity-upscaler',

  // Video Tools
  'room-tour': 'fal-ai/kling-video/v1.5/pro/image-to-video',

  // Advanced Tools
  'floor-plan': 'fal-ai/flux/dev',
  '360-staging': 'fal-ai/flux/dev/image-to-image',

  // ============ AUTO DEALERSHIP TOOLS ============
  // Photo Enhancement
  'background-swap': 'fal-ai/flux-pro/v1/fill',
  'auto-enhance': 'fal-ai/clarity-upscaler',
  'blemish-removal': 'fal-ai/bria/eraser',
  'reflection-fix': 'fal-ai/flux/dev/image-to-image',
  'interior-enhance': 'fal-ai/flux/dev/image-to-image',
  'license-blur': 'fal-ai/flux/dev/image-to-image',
  'spot-removal': 'fal-ai/bria/eraser',
  'shadow-enhancement': 'fal-ai/flux/dev/image-to-image',
  'number-plate-mask': 'fal-ai/flux-pro/v1/fill',
  'dealer-branding': 'fal-ai/flux/dev/image-to-image',
  // Video
  'vehicle-360': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  'vehicle-walkthrough': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  'social-clips': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  // Customization
  'window-tint': 'fal-ai/flux/dev/image-to-image',
  'paint-color': 'fal-ai/flux/dev/image-to-image',
  'wheel-customizer': 'fal-ai/flux/dev/image-to-image',
  // Inspection
  'damage-detection': 'fal-ai/flux/dev/image-to-image',
};

// Credits cost per tool
export const TOOL_CREDITS_MAP: Record<ToolType, number> = {
  // Photo Enhancement
  'virtual-staging': 2,
  'photo-enhancement': 1,
  'photo-relight': 1, // ICLight step for bright/hdr presets
  'sky-segmentation': 1, // Auto sky mask generation
  'sky-replacement': 2,
  'twilight': 2,
  'item-removal': 2,
  'lawn-enhancement': 2,
  'declutter': 2,

  // Renovation & Design
  'virtual-renovation': 3,
  'wall-color': 2,
  'floor-replacement': 2,

  // Weather & Lighting
  'rain-to-shine': 1,
  'night-to-day': 2,
  'changing-seasons': 2,

  // Pool & Water
  'pool-enhancement': 2,

  // Utility
  'watermark-removal': 1,
  'headshot-retouching': 2,
  'hdr-merge': 1,

  // Video
  'room-tour': 5,

  // Advanced
  'floor-plan': 5,
  '360-staging': 5,

  // ============ AUTO DEALERSHIP ============
  // Photo Enhancement
  'background-swap': 2,
  'auto-enhance': 1,
  'blemish-removal': 2,
  'reflection-fix': 2,
  'interior-enhance': 2,
  'license-blur': 1,
  'spot-removal': 2,
  'shadow-enhancement': 2,
  'number-plate-mask': 1,
  'dealer-branding': 1,
  // Video
  'vehicle-360': 5,
  'vehicle-walkthrough': 5,
  'social-clips': 3,
  // Customization
  'window-tint': 2,
  'paint-color': 2,
  'wheel-customizer': 2,
  // Inspection
  'damage-detection': 3,
};

// Tool display info for UI
export interface ToolInfo {
  id: ToolType;
  name: string;
  description: string;
  category: 'photo' | 'renovation' | 'weather' | 'pool' | 'utility' | 'video' | 'advanced' | 'auto-photo' | 'auto-video' | 'auto-customize' | 'auto-inspect' | 'auto-branding';
  industry?: 'real-estate' | 'auto';
  isPremium?: boolean;
  isNew?: boolean;
}

export const TOOL_INFO: ToolInfo[] = [
  // Photo Enhancement
  { id: 'virtual-staging', name: 'Virtual Staging', description: 'Fill empty rooms with designer furniture', category: 'photo' },
  { id: 'photo-enhancement', name: 'Photo Enhancement', description: 'One-click HDR, lighting & color correction', category: 'photo' },
  { id: 'sky-replacement', name: 'Sky Replacement', description: 'Replace gray skies with perfect blue', category: 'photo' },
  { id: 'twilight', name: 'Day to Twilight', description: 'Transform daytime shots into stunning dusk photos', category: 'photo', isPremium: true },
  { id: 'item-removal', name: 'Item Removal', description: 'Remove clutter, cars & unwanted objects', category: 'photo' },
  { id: 'lawn-enhancement', name: 'Lawn Enhancement', description: 'Make grass greener & landscaping vibrant', category: 'photo' },
  { id: 'declutter', name: 'One-Click Declutter', description: 'Auto-remove clutter without masking', category: 'photo', isNew: true },

  // Renovation & Design
  { id: 'virtual-renovation', name: 'Virtual Renovation', description: 'Visualize kitchen/bathroom remodels', category: 'renovation', isPremium: true, isNew: true },
  { id: 'wall-color', name: 'Wall Color Changer', description: 'Preview different paint colors', category: 'renovation', isNew: true },
  { id: 'floor-replacement', name: 'Floor Replacement', description: 'Swap hardwood, tile, or carpet styles', category: 'renovation', isNew: true },

  // Weather & Lighting
  { id: 'rain-to-shine', name: 'Rain to Shine', description: 'Convert cloudy/rainy to sunny weather', category: 'weather', isNew: true },
  { id: 'night-to-day', name: 'Night to Day', description: 'Convert nighttime exteriors to daylight', category: 'weather', isNew: true },
  { id: 'changing-seasons', name: 'Changing Seasons', description: 'Add spring blooms, fall leaves, or snow', category: 'weather', isNew: true },

  // Pool & Water
  { id: 'pool-enhancement', name: 'Pool Enhancement', description: 'Add water to empty pools, clarify murky water', category: 'pool', isNew: true },

  // Utility
  { id: 'watermark-removal', name: 'Watermark Removal', description: 'Remove watermarks from images', category: 'utility', isNew: true },
  { id: 'headshot-retouching', name: 'Headshot Retouching', description: 'Professional portrait enhancement', category: 'utility', isNew: true },
  { id: 'hdr-merge', name: 'HDR Auto-Merge', description: 'Merge bracketed exposures automatically', category: 'utility', isNew: true },

  // Video
  { id: 'room-tour', name: 'Room Tour Video', description: 'Generate cinematic video from a single photo', category: 'video', isPremium: true },

  // Advanced
  { id: 'floor-plan', name: 'Floor Plan Generator', description: 'Create 2D floor plans from photos', category: 'advanced', isPremium: true },
  { id: '360-staging', name: '360° Virtual Staging', description: 'Stage panoramic VR photos', category: 'advanced', isPremium: true, isNew: true },

  // ============ AUTO DEALERSHIP TOOLS ============
  // Photo Enhancement
  { id: 'background-swap', name: 'Background Swap', description: 'Replace backgrounds with showroom or outdoor settings', category: 'auto-photo', industry: 'auto', isNew: true },
  { id: 'auto-enhance', name: 'Auto Enhance', description: 'One-click color correction and polish', category: 'auto-photo', industry: 'auto' },
  { id: 'blemish-removal', name: 'Blemish Removal', description: 'Remove scratches, dents, and imperfections', category: 'auto-photo', industry: 'auto', isNew: true },
  { id: 'reflection-fix', name: 'Reflection Fix', description: 'Remove unwanted reflections from paint and glass', category: 'auto-photo', industry: 'auto', isNew: true },
  { id: 'interior-enhance', name: 'Interior Enhance', description: 'Brighten and enhance vehicle interior shots', category: 'auto-photo', industry: 'auto', isNew: true },
  { id: 'license-blur', name: 'License Plate Blur', description: 'Automatically blur license plates for privacy', category: 'auto-photo', industry: 'auto' },

  // Video
  { id: 'vehicle-360', name: '360° Spin Video', description: 'Generate rotating vehicle showcase video', category: 'auto-video', industry: 'auto', isPremium: true, isNew: true },

  // Customization Preview
  { id: 'window-tint', name: 'Window Tint Preview', description: 'Preview different window tint levels', category: 'auto-customize', industry: 'auto', isNew: true },
  { id: 'paint-color', name: 'Paint Color Changer', description: 'Preview different paint colors on vehicles', category: 'auto-customize', industry: 'auto', isNew: true },
  { id: 'wheel-customizer', name: 'Wheel Customizer', description: 'Preview different wheel and rim styles', category: 'auto-customize', industry: 'auto', isNew: true },

  // Additional Photo Enhancement
  { id: 'spot-removal', name: 'Spot Removal', description: 'Remove dirt spots and minor blemishes', category: 'auto-photo', industry: 'auto', isNew: true },
  { id: 'shadow-enhancement', name: 'Shadow Enhancement', description: 'Add professional shadows for depth', category: 'auto-photo', industry: 'auto', isNew: true },
  { id: 'number-plate-mask', name: 'Number Plate Mask', description: 'Replace plates with dealer branding', category: 'auto-photo', industry: 'auto', isNew: true },

  // Branding
  { id: 'dealer-branding', name: 'Dealer Branding', description: 'Add custom dealer logos and overlays', category: 'auto-branding', industry: 'auto', isNew: true },

  // Additional Video
  { id: 'vehicle-walkthrough', name: 'Vehicle Walkthrough', description: 'Generate interior walkthrough video', category: 'auto-video', industry: 'auto', isPremium: true, isNew: true },
  { id: 'social-clips', name: 'Social Media Clips', description: 'Generate short-form social video content', category: 'auto-video', industry: 'auto', isNew: true },

  // Inspection
  { id: 'damage-detection', name: 'Damage Detection', description: 'AI-powered damage assessment and highlighting', category: 'auto-inspect', industry: 'auto', isPremium: true, isNew: true },
];

// Input configuration for a generation request
export interface GenerationInput {
  imageUrl?: string;
  maskUrl?: string;
  prompt?: string;
  negativePrompt?: string;
  options: Record<string, unknown>;
}

// Output from a completed generation
export interface GenerationOutput {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // for video outputs
  metadata?: Record<string, unknown>;
}

// Full generation record (for database storage)
export interface Generation {
  id: string;
  userId: string;
  projectId?: string;
  type: GenerationType;
  tool: ToolType;
  model: string;
  input: GenerationInput;
  output?: GenerationOutput;
  creditsUsed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  falRequestId?: string;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

// ============ TOOL-SPECIFIC OPTIONS ============

export interface VirtualStagingOptions {
  roomType: 'living-room' | 'bedroom' | 'kitchen' | 'dining' | 'bathroom' | 'office';
  style: 'modern' | 'scandinavian' | 'coastal' | 'luxury' | 'industrial' | 'farmhouse';
  removeExisting: boolean;
}

export interface PhotoEnhancementOptions {
  preset: 'auto' | 'bright' | 'vivid' | 'hdr';
  upscaleFactor?: 2 | 4;
}

export interface SkyReplacementOptions {
  skyType: 'blue-clear' | 'blue-clouds' | 'golden-hour' | 'dramatic' | 'sunset' | 'overcast';
}

export interface TwilightOptions {
  style: 'blue-hour' | 'golden-dusk' | 'purple-twilight' | 'dramatic';
  glowIntensity: 30 | 60 | 100;
}

export interface ItemRemovalOptions {
  maskDataUrl: string;
}

export interface LawnEnhancementOptions {
  greenerLawn: boolean;
  addFlowers: boolean;
  freshDewy: boolean;
  intensity: 'natural' | 'enhanced' | 'vibrant';
}

export interface DeclutterOptions {
  mode: 'auto' | 'manual';
  maskDataUrl?: string;
}

export interface VirtualRenovationOptions {
  renovationType: 'kitchen' | 'bathroom' | 'full-room';
  style: 'modern' | 'traditional' | 'contemporary' | 'farmhouse' | 'luxury';
  elements: ('cabinets' | 'countertops' | 'backsplash' | 'fixtures' | 'appliances')[];
  maskDataUrl?: string;
}

export interface WallColorOptions {
  color: string; // Hex color code
  finish: 'matte' | 'eggshell' | 'satin' | 'semi-gloss';
  maskDataUrl?: string;
}

export interface FloorReplacementOptions {
  floorType: 'hardwood' | 'tile' | 'carpet' | 'laminate' | 'vinyl' | 'concrete';
  style: string; // e.g., "oak", "marble", "gray carpet"
  maskDataUrl?: string;
}

export interface RainToShineOptions {
  skyType: 'clear-blue' | 'partly-cloudy' | 'golden-hour';
  brightness: 'natural' | 'bright' | 'very-bright';
}

export interface NightToDayOptions {
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'golden-hour';
  skyType: 'clear' | 'cloudy' | 'dramatic';
}

export interface ChangingSeasonsOptions {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  intensity: 'subtle' | 'moderate' | 'dramatic';
}

export interface PoolEnhancementOptions {
  mode: 'add-water' | 'clarify' | 'enhance-color';
  waterColor: 'crystal-blue' | 'turquoise' | 'natural';
  maskDataUrl?: string;
}

export interface WatermarkRemovalOptions {
  maskDataUrl?: string;
  autoDetect: boolean;
}

export interface HeadshotRetouchingOptions {
  smoothSkin: boolean;
  brightenEyes: boolean;
  whitenTeeth: boolean;
  removeBackground: boolean;
  backgroundType?: 'white' | 'gray' | 'blur' | 'office';
}

export interface HDRMergeOptions {
  images: string[]; // Array of image URLs for bracketed exposures
  style: 'natural' | 'enhanced' | 'dramatic';
}

export interface RoomTourOptions {
  motionStyle: 'smooth-pan' | 'zoom-in' | 'orbit' | 'cinematic';
  duration: 3 | 5 | 8 | 10;
}

export interface FloorPlanOptions {
  style: '2d-basic' | '2d-detailed' | '3d-isometric';
  includeLabels: boolean;
  includeDimensions: boolean;
}

export interface Staging360Options {
  style: 'modern' | 'scandinavian' | 'luxury' | 'farmhouse';
  roomType: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom';
}

// ============ AUTO DEALERSHIP TOOL OPTIONS ============

export interface BackgroundSwapOptions {
  backgroundType: 'showroom' | 'outdoor' | 'studio' | 'dealership' | 'custom';
  customPrompt?: string;
  maskDataUrl?: string;
}

export interface AutoEnhanceOptions {
  preset: 'auto' | 'showroom' | 'outdoor' | 'dramatic';
  upscaleFactor?: 2 | 4;
}

export interface BlemishRemovalOptions {
  maskDataUrl: string;
  autoDetect?: boolean;
}

export interface ReflectionFixOptions {
  mode: 'auto' | 'manual';
  intensity: 'light' | 'medium' | 'heavy';
  maskDataUrl?: string;
}

export interface InteriorEnhanceOptions {
  brighten: boolean;
  cleanupClutter: boolean;
  enhanceDetails: boolean;
  preset: 'natural' | 'bright' | 'showroom';
}

export interface LicenseBlurOptions {
  autoDetect: boolean;
  maskDataUrl?: string;
  blurIntensity: 'light' | 'medium' | 'heavy';
}

export interface Vehicle360Options {
  rotationDirection: 'clockwise' | 'counter-clockwise';
  duration: 5 | 10 | 15;
  motionStyle: 'smooth' | 'stop-motion' | 'cinematic';
}

export interface WindowTintOptions {
  tintLevel: 5 | 15 | 25 | 35 | 50; // VLT percentage
  tintColor: 'charcoal' | 'bronze' | 'blue' | 'green';
  applyTo: 'all' | 'rear-only' | 'front-only';
}

export interface SpotRemovalOptions {
  maskDataUrl: string;
  autoDetect?: boolean;
}

export interface ShadowEnhancementOptions {
  shadowType: 'natural' | 'studio' | 'dramatic';
  intensity: 'light' | 'medium' | 'strong';
  direction: 'left' | 'right' | 'center';
}

export interface NumberPlateMaskOptions {
  maskType: 'blur' | 'dealer-logo' | 'custom-text';
  dealerLogo?: string; // URL to logo
  customText?: string;
  autoDetect: boolean;
}

export interface DealerBrandingOptions {
  logoUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0-100
  addWatermark: boolean;
  watermarkText?: string;
}

export interface PaintColorOptions {
  color: string; // Hex color code
  finish: 'gloss' | 'matte' | 'metallic' | 'pearl';
  preserveReflections: boolean;
}

export interface WheelCustomizerOptions {
  wheelStyle: 'stock' | 'sport' | 'luxury' | 'offroad' | 'custom';
  wheelColor: string; // Hex color code
  finish: 'chrome' | 'matte-black' | 'gloss-black' | 'gunmetal' | 'custom';
}

export interface VehicleWalkthroughOptions {
  startPoint: 'exterior-front' | 'exterior-rear' | 'driver-door' | 'interior';
  duration: 10 | 15 | 20 | 30;
  highlights: ('dashboard' | 'seats' | 'trunk' | 'engine' | 'wheels')[];
  motionStyle: 'smooth' | 'cinematic' | 'dynamic';
}

export interface SocialClipsOptions {
  platform: 'instagram' | 'tiktok' | 'youtube-shorts' | 'facebook';
  duration: 15 | 30 | 60;
  style: 'fast-cuts' | 'smooth' | 'dramatic';
  addMusic: boolean;
  addText: boolean;
  textOverlay?: string;
}

export interface DamageDetectionOptions {
  highlightDamage: boolean;
  damageTypes: ('scratches' | 'dents' | 'rust' | 'paint-chips' | 'cracks')[];
  generateReport: boolean;
  overlayStyle: 'circles' | 'arrows' | 'highlights';
}

// Union type for all tool options
export type ToolOptions =
  // Real Estate Tools
  | VirtualStagingOptions
  | PhotoEnhancementOptions
  | SkyReplacementOptions
  | TwilightOptions
  | ItemRemovalOptions
  | LawnEnhancementOptions
  | DeclutterOptions
  | VirtualRenovationOptions
  | WallColorOptions
  | FloorReplacementOptions
  | RainToShineOptions
  | NightToDayOptions
  | ChangingSeasonsOptions
  | PoolEnhancementOptions
  | WatermarkRemovalOptions
  | HeadshotRetouchingOptions
  | HDRMergeOptions
  | RoomTourOptions
  | FloorPlanOptions
  | Staging360Options
  // Auto Dealership Tools
  | BackgroundSwapOptions
  | AutoEnhanceOptions
  | BlemishRemovalOptions
  | ReflectionFixOptions
  | InteriorEnhanceOptions
  | LicenseBlurOptions
  | Vehicle360Options
  | WindowTintOptions
  | SpotRemovalOptions
  | ShadowEnhancementOptions
  | NumberPlateMaskOptions
  | DealerBrandingOptions
  | PaintColorOptions
  | WheelCustomizerOptions
  | VehicleWalkthroughOptions
  | SocialClipsOptions
  | DamageDetectionOptions;

// Generation request sent to the tool generation API
export interface ToolGenerationRequest {
  tool: ToolType;
  imageUrl: string;
  maskUrl?: string;
  options: ToolOptions;
}

// Response from the tool generation API
export interface ToolGenerationResponse {
  success: boolean;
  data?: {
    generationId: string;
    url: string;
    thumbnailUrl?: string;
    creditsUsed: number;
    processingTime: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Progress callback for tracking generation status
export type GenerationProgressCallback = (progress: number, status: string) => void;
