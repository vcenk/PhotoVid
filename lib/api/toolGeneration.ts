/**
 * Unified Tool Generation API
 * Handles all Real Estate AI tool generations through FAL AI
 */

import { fal } from "@fal-ai/client";
import { uploadToR2 } from "./r2";
import {
  ToolType,
  TOOL_MODEL_MAP,
  TOOL_CREDITS_MAP,
  // Real Estate Options
  VirtualStagingOptions,
  PhotoEnhancementOptions,
  SkyReplacementOptions,
  TwilightOptions,
  ItemRemovalOptions,
  LawnEnhancementOptions,
  RoomTourOptions,
  DeclutterOptions,
  VirtualRenovationOptions,
  WallColorOptions,
  FloorReplacementOptions,
  RainToShineOptions,
  NightToDayOptions,
  ChangingSeasonsOptions,
  PoolEnhancementOptions,
  WatermarkRemovalOptions,
  HeadshotRetouchingOptions,
  HDRMergeOptions,
  FloorPlanOptions,
  Staging360Options,
  // Auto Dealership Options
  BackgroundSwapOptions,
  AutoEnhanceOptions,
  BlemishRemovalOptions,
  ReflectionFixOptions,
  InteriorEnhanceOptions,
  LicenseBlurOptions,
  Vehicle360Options,
  WindowTintOptions,
  SpotRemovalOptions,
  ShadowEnhancementOptions,
  NumberPlateMaskOptions,
  DealerBrandingOptions,
  PaintColorOptions,
  WheelCustomizerOptions,
  VehicleWalkthroughOptions,
  SocialClipsOptions,
  DamageDetectionOptions,
  GenerationProgressCallback,
} from "../types/generation";

// Configure FAL client
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

/**
 * Build the prompt for Virtual Staging
 */
function buildVirtualStagingPrompt(options: VirtualStagingOptions): string {
  const stylePrompts: Record<string, string> = {
    'modern': 'modern minimalist interior design, clean lines, contemporary furniture, neutral colors with accent pieces',
    'scandinavian': 'scandinavian interior design, light natural wood furniture, white walls, cozy textiles, hygge atmosphere',
    'coastal': 'coastal beach house interior design, light blue accents, natural rattan and linen materials, airy and bright',
    'luxury': 'luxury high-end interior design, premium furniture, elegant marble and gold finishes, sophisticated textures',
    'industrial': 'industrial loft interior design, exposed brick walls, metal accents, reclaimed wood, urban aesthetic',
    'farmhouse': 'modern farmhouse interior design, rustic charm, shiplap walls, warm wood tones, cozy country style',
  };

  const roomPrompts: Record<string, string> = {
    'living-room': 'spacious living room with comfortable seating, coffee table, entertainment area',
    'bedroom': 'cozy bedroom with bed, nightstands, dresser, ambient lighting',
    'kitchen': 'modern kitchen with island, high-end appliances, dining area',
    'dining': 'elegant dining room with dining table, chairs, chandelier',
    'bathroom': 'spa-like bathroom with vanity, fixtures, elegant tiles',
    'office': 'professional home office with desk, ergonomic chair, bookshelves',
  };

  const basePrompt = options.removeExisting
    ? `Transform this empty room into a beautifully staged ${roomPrompts[options.roomType]}, ${stylePrompts[options.style]}`
    : `Enhance this room with ${stylePrompts[options.style]}, add complementary furniture and decor, ${roomPrompts[options.roomType]}`;

  return `${basePrompt}. Professional real estate photography, high quality, photorealistic, well-lit, inviting atmosphere`;
}

/**
 * Build the prompt for Sky Replacement
 */
function buildSkyPrompt(options: SkyReplacementOptions): string {
  const skyPrompts: Record<string, string> = {
    'blue-clear': 'perfectly clear deep blue sky, no clouds, sunny day',
    'blue-clouds': 'beautiful blue sky with fluffy white cumulus clouds, pleasant weather',
    'golden-hour': 'warm golden hour sky, soft orange and pink tones, magical lighting',
    'dramatic': 'dramatic stormy sky with dark clouds, moody atmosphere, intense lighting',
    'sunset': 'vibrant sunset sky with orange, pink, and purple gradient, breathtaking view',
    'overcast': 'soft overcast sky, even diffused lighting, gentle gray tones',
  };

  return `Replace the sky with ${skyPrompts[options.skyType]}, maintain realistic lighting on the building, seamless blend with horizon`;
}

/**
 * Build the prompt for Twilight Conversion
 */
function buildTwilightPrompt(options: TwilightOptions): string {
  const stylePrompts: Record<string, string> = {
    'blue-hour': 'blue hour twilight sky, deep blue with purple undertones, warm interior lights glowing from windows',
    'golden-dusk': 'golden dusk sky, warm orange fading to purple, cozy warm interior glow',
    'purple-twilight': 'rich purple twilight sky, magical evening atmosphere, soft interior lighting',
    'dramatic': 'dramatic night sky, deep dark blue, bright contrasting interior lights, professional real estate night shot',
  };

  const glowIntensity = options.glowIntensity === 30 ? 'subtle' : options.glowIntensity === 60 ? 'warm' : 'bright';

  return `Transform to ${stylePrompts[options.style]}, ${glowIntensity} window glow effect, professional twilight real estate photography, exterior shot at dusk`;
}

/**
 * Build the prompt for Lawn Enhancement
 */
function buildLawnPrompt(options: LawnEnhancementOptions): string {
  const parts: string[] = [];

  if (options.greenerLawn) {
    const intensityModifier = options.intensity === 'natural' ? 'naturally' : options.intensity === 'enhanced' ? 'lush' : 'vibrant';
    parts.push(`${intensityModifier} green healthy lawn`);
  }

  if (options.addFlowers) {
    parts.push('colorful flower beds and landscaping accents');
  }

  if (options.freshDewy) {
    parts.push('fresh morning dew effect, glistening grass');
  }

  return `Enhance the exterior landscaping with ${parts.join(', ')}. Well-maintained curb appeal, professional real estate photography, inviting property exterior`;
}

/**
 * Build the prompt for Room Tour Video
 */
function buildRoomTourPrompt(options: RoomTourOptions): string {
  const motionPrompts: Record<string, string> = {
    'smooth-pan': 'smooth horizontal panning motion revealing the entire room',
    'zoom-in': 'slow cinematic zoom into the room highlighting key features',
    'orbit': 'gentle orbital camera movement around the room center',
    'cinematic': 'dramatic slow motion cinematic camera movement with depth',
  };

  return `${motionPrompts[options.motionStyle]}, professional real estate video tour, smooth camera motion, high quality 4K, inviting atmosphere`;
}

/**
 * Build the prompt for Virtual Renovation
 */
function buildVirtualRenovationPrompt(options: VirtualRenovationOptions): string {
  const stylePrompts: Record<string, string> = {
    'modern': 'sleek modern design with clean lines, minimalist fixtures, contemporary finishes',
    'traditional': 'classic traditional design with elegant details, warm wood tones, timeless appeal',
    'contemporary': 'contemporary design with bold accents, mixed materials, artistic elements',
    'farmhouse': 'farmhouse style with rustic charm, shiplap details, warm inviting atmosphere',
    'luxury': 'luxury high-end renovation with premium materials, elegant finishes, sophisticated design',
  };

  const elementPrompts = options.elements.map(el => {
    switch (el) {
      case 'cabinets': return 'new designer cabinets';
      case 'countertops': return 'premium countertops';
      case 'backsplash': return 'stylish backsplash';
      case 'fixtures': return 'modern fixtures and hardware';
      case 'appliances': return 'stainless steel appliances';
      default: return el;
    }
  }).join(', ');

  return `Professional ${options.renovationType} renovation with ${stylePrompts[options.style]}, featuring ${elementPrompts}. Photorealistic, professional real estate photography, well-lit, high-end finish`;
}

/**
 * Build the prompt for Wall Color
 */
function buildWallColorPrompt(options: WallColorOptions): string {
  const finishDescriptions: Record<string, string> = {
    'matte': 'matte finish with no shine',
    'eggshell': 'subtle eggshell sheen',
    'satin': 'soft satin luster',
    'semi-gloss': 'semi-gloss reflective finish',
  };

  return `Paint the walls with color ${options.color}, ${finishDescriptions[options.finish]}. Maintain realistic lighting and shadows, keep all furniture and fixtures unchanged, professional interior photography`;
}

/**
 * Build the prompt for Floor Replacement
 */
function buildFloorReplacementPrompt(options: FloorReplacementOptions): string {
  const floorDescriptions: Record<string, string> = {
    'hardwood': 'beautiful hardwood flooring',
    'tile': 'elegant tile flooring',
    'carpet': 'plush wall-to-wall carpet',
    'laminate': 'modern laminate flooring',
    'vinyl': 'luxury vinyl plank flooring',
    'concrete': 'polished concrete flooring',
  };

  return `Replace the floor with ${floorDescriptions[options.floorType]} in ${options.style} style. Maintain realistic perspective and lighting, seamless edge transitions, professional real estate photography`;
}

/**
 * Build the prompt for Rain to Shine
 */
function buildRainToShinePrompt(options: RainToShineOptions): string {
  const skyTypes: Record<string, string> = {
    'clear-blue': 'perfectly clear deep blue sky with bright sunshine',
    'partly-cloudy': 'pleasant partly cloudy sky with some white fluffy clouds',
    'golden-hour': 'warm golden hour lighting with soft orange tones',
  };

  const brightnessLevels: Record<string, string> = {
    'natural': 'natural daylight',
    'bright': 'bright sunny day',
    'very-bright': 'vibrant sun-drenched scene',
  };

  return `Transform to ${skyTypes[options.skyType]}, ${brightnessLevels[options.brightness]}. Remove all rain, puddles, wet surfaces. Add realistic shadows and highlights for sunny weather, professional real estate exterior photography`;
}

/**
 * Build the prompt for Night to Day
 */
function buildNightToDayPrompt(options: NightToDayOptions): string {
  const timeDescriptions: Record<string, string> = {
    'morning': 'soft early morning light with gentle shadows',
    'midday': 'bright midday sun with clear visibility',
    'afternoon': 'warm afternoon sunlight with long shadows',
    'golden-hour': 'magical golden hour glow before sunset',
  };

  const skyDescriptions: Record<string, string> = {
    'clear': 'clear blue sky',
    'cloudy': 'soft clouds in the sky',
    'dramatic': 'dramatic cloud formations',
  };

  return `Convert nighttime exterior to ${timeDescriptions[options.timeOfDay]}, ${skyDescriptions[options.skyType]}. Turn off artificial lights, add natural daylight, realistic daytime atmosphere, professional real estate photography`;
}

/**
 * Build the prompt for Changing Seasons
 */
function buildChangingSeasonsPrompt(options: ChangingSeasonsOptions): string {
  const seasonPrompts: Record<string, string> = {
    'spring': 'beautiful spring with blooming flowers, fresh green leaves, cherry blossoms',
    'summer': 'lush summer with vibrant green foliage, bright sunshine, full leafy trees',
    'fall': 'stunning autumn with colorful fall foliage, orange and red leaves, warm tones',
    'winter': 'picturesque winter with snow-covered landscape, bare trees, cozy atmosphere',
  };

  const intensityModifiers: Record<string, string> = {
    'subtle': 'subtle seasonal touches',
    'moderate': 'clear seasonal atmosphere',
    'dramatic': 'dramatic seasonal transformation',
  };

  return `Transform to ${seasonPrompts[options.season]}, ${intensityModifiers[options.intensity]}. Maintain property structure, adjust landscaping and sky to match season, professional real estate exterior photography`;
}

/**
 * Build the prompt for Pool Enhancement
 */
function buildPoolEnhancementPrompt(options: PoolEnhancementOptions): string {
  const modeDescriptions: Record<string, string> = {
    'add-water': 'fill the empty pool with crystal clear water',
    'clarify': 'clarify murky pool water to pristine clarity',
    'enhance-color': 'enhance pool water color and clarity',
  };

  const colorDescriptions: Record<string, string> = {
    'crystal-blue': 'sparkling crystal blue',
    'turquoise': 'vibrant tropical turquoise',
    'natural': 'natural aqua blue',
  };

  return `${modeDescriptions[options.mode]}, ${colorDescriptions[options.waterColor]} water color. Add realistic reflections and light refraction, inviting pool atmosphere, professional real estate photography`;
}

/**
 * Build the prompt for Headshot Retouching
 */
function buildHeadshotRetouchingPrompt(options: HeadshotRetouchingOptions): string {
  const enhancements: string[] = [];

  if (options.smoothSkin) enhancements.push('subtle skin smoothing while maintaining natural texture');
  if (options.brightenEyes) enhancements.push('brightened eyes with natural catchlight');
  if (options.whitenTeeth) enhancements.push('naturally whitened teeth');

  let backgroundPrompt = '';
  if (options.removeBackground && options.backgroundType) {
    const bgTypes: Record<string, string> = {
      'white': 'clean white studio background',
      'gray': 'professional gray gradient background',
      'blur': 'soft blurred background',
      'office': 'professional office setting background',
    };
    backgroundPrompt = `, ${bgTypes[options.backgroundType]}`;
  }

  return `Professional headshot retouching: ${enhancements.join(', ')}${backgroundPrompt}. Maintain natural appearance, professional business portrait quality, even lighting`;
}

/**
 * Build the prompt for 360 Staging
 */
function build360StagingPrompt(options: Staging360Options): string {
  const stylePrompts: Record<string, string> = {
    'modern': 'modern minimalist design with clean contemporary furniture',
    'scandinavian': 'scandinavian style with light wood and cozy textiles',
    'luxury': 'luxury high-end furnishings with elegant finishes',
    'farmhouse': 'warm farmhouse style with rustic charm',
  };

  const roomPrompts: Record<string, string> = {
    'living-room': 'living room with seating, coffee table, and decor',
    'bedroom': 'bedroom with bed, nightstands, and ambient lighting',
    'kitchen': 'kitchen with modern appliances and dining area',
    'bathroom': 'bathroom with spa-like fixtures and accessories',
  };

  return `Stage this 360° panoramic ${roomPrompts[options.roomType]} in ${stylePrompts[options.style]}. Maintain equirectangular projection, consistent lighting throughout, immersive virtual tour quality`;
}

/**
 * Upload file to R2 storage
 */
async function uploadFile(file: File, folder: string): Promise<string> {
  return await uploadToR2(file, folder);
}

/**
 * Convert canvas mask to PNG Blob for upload
 */
export function canvasMaskToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create a new canvas with black background and white mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const ctx = maskCanvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Fill with black (areas to keep)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Get the original mask data
    const originalCtx = canvas.getContext('2d');
    if (!originalCtx) {
      reject(new Error('Could not get original canvas context'));
      return;
    }

    const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert painted areas (any alpha > 0) to white
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        // If there's any alpha, it was painted - make it white in the mask
        data[i] = 255;     // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = 255; // A
      } else {
        // Not painted - make it black
        data[i] = 0;       // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 255; // A
      }
    }

    ctx.putImageData(imageData, 0, 0);

    maskCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Virtual Staging Generation
 */
export async function generateVirtualStaging(
  imageFile: File,
  options: VirtualStagingOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'virtual-staging');
  onProgress?.(30, 'Processing with AI...');

  const prompt = buildVirtualStagingPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['virtual-staging'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: options.removeExisting ? 0.85 : 0.65,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Generating staged room...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) {
    return data.images[0].url;
  }
  throw new Error('No image returned from generation');
}

/**
 * Photo Enhancement Generation
 */
export async function generatePhotoEnhancement(
  imageFile: File,
  options: PhotoEnhancementOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'photo-enhancement');
  onProgress?.(30, 'Enhancing photo...');

  const result = await fal.subscribe(TOOL_MODEL_MAP['photo-enhancement'], {
    input: {
      image_url: imageUrl,
      scale: options.upscaleFactor || 2,
      overlapping_tiles: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Enhancing details...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { image?: { url: string } };
  if (data?.image?.url) {
    return data.image.url;
  }
  throw new Error('No image returned from enhancement');
}

/**
 * Sky Replacement Generation
 */
export async function generateSkyReplacement(
  imageFile: File,
  options: SkyReplacementOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'sky-replacement');
  onProgress?.(30, 'Analyzing sky area...');

  const prompt = buildSkyPrompt(options);

  // Use flux-pro for inpainting with automatic sky detection
  const result = await fal.subscribe(TOOL_MODEL_MAP['sky-replacement'], {
    input: {
      image_url: imageUrl,
      prompt,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Replacing sky...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) {
    return data.images[0].url;
  }
  throw new Error('No image returned from sky replacement');
}

/**
 * Twilight Conversion Generation
 */
export async function generateTwilight(
  imageFile: File,
  options: TwilightOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'twilight');
  onProgress?.(30, 'Converting to twilight...');

  const prompt = buildTwilightPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['twilight'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.75,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Adding twilight effects...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) {
    return data.images[0].url;
  }
  throw new Error('No image returned from twilight conversion');
}

/**
 * Item Removal Generation
 */
export async function generateItemRemoval(
  imageFile: File,
  maskCanvas: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'item-removal');
  onProgress?.(20, 'Processing mask...');

  // Convert canvas mask to blob and upload
  const maskBlob = await canvasMaskToBlob(maskCanvas);
  const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
  const maskUrl = await uploadFile(maskFile, 'item-removal-masks');

  onProgress?.(40, 'Removing objects...');

  const result = await fal.subscribe(TOOL_MODEL_MAP['item-removal'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Filling removed areas...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { image?: { url: string } };
  if (data?.image?.url) {
    return data.image.url;
  }
  throw new Error('No image returned from item removal');
}

/**
 * Lawn Enhancement Generation
 */
export async function generateLawnEnhancement(
  imageFile: File,
  options: LawnEnhancementOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'lawn-enhancement');
  onProgress?.(30, 'Enhancing landscaping...');

  const prompt = buildLawnPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['lawn-enhancement'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: options.intensity === 'natural' ? 0.5 : options.intensity === 'enhanced' ? 0.65 : 0.8,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Enhancing landscape...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) {
    return data.images[0].url;
  }
  throw new Error('No image returned from lawn enhancement');
}

/**
 * Room Tour Video Generation
 */
export async function generateRoomTourVideo(
  imageFile: File,
  options: RoomTourOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'room-tour');
  onProgress?.(30, 'Generating video...');

  const prompt = buildRoomTourPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['room-tour'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(options.duration),
      aspect_ratio: '16:9',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(40 + Math.random() * 40, 'Creating room tour video...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { video?: { url: string } };
  if (data?.video?.url) {
    return data.video.url;
  }
  throw new Error('No video returned from room tour generation');
}

/**
 * Declutter Generation (auto-detect and remove clutter)
 */
export async function generateDeclutter(
  imageFile: File,
  options: DeclutterOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'declutter');
  onProgress?.(30, 'Analyzing clutter...');

  if (options.mode === 'manual' && maskCanvas) {
    // Manual mode with mask
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    const maskUrl = await uploadFile(maskFile, 'declutter-masks');

    const result = await fal.subscribe(TOOL_MODEL_MAP['declutter'], {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Removing clutter...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { image?: { url: string } };
    if (data?.image?.url) return data.image.url;
    throw new Error('No image returned from declutter');
  } else {
    // Auto mode - use image-to-image with declutter prompt
    const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: {
        image_url: imageUrl,
        prompt: 'Remove all clutter, personal items, and unnecessary objects from this room. Keep furniture and fixtures, remove small items, papers, toys, clothes. Clean and organized space, professional real estate photography',
        strength: 0.4,
        num_inference_steps: 28,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Auto-decluttering...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { images?: Array<{ url: string }> };
    if (data?.images?.[0]?.url) return data.images[0].url;
    throw new Error('No image returned from auto declutter');
  }
}

/**
 * Virtual Renovation Generation
 */
export async function generateVirtualRenovation(
  imageFile: File,
  options: VirtualRenovationOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'virtual-renovation');
  let maskUrl: string | undefined;

  if (maskCanvas) {
    onProgress?.(20, 'Processing renovation area...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    maskUrl = await uploadFile(maskFile, 'renovation-masks');
  }

  onProgress?.(35, 'Generating renovation preview...');

  const prompt = buildVirtualRenovationPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['virtual-renovation'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Applying renovation...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from virtual renovation');
}

/**
 * Wall Color Generation
 */
export async function generateWallColor(
  imageFile: File,
  options: WallColorOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'wall-color');
  let maskUrl: string | undefined;

  if (maskCanvas) {
    onProgress?.(20, 'Processing wall area...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    maskUrl = await uploadFile(maskFile, 'wall-color-masks');
  }

  onProgress?.(35, 'Changing wall color...');

  const prompt = buildWallColorPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['wall-color'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Applying new color...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from wall color change');
}

/**
 * Floor Replacement Generation
 */
export async function generateFloorReplacement(
  imageFile: File,
  options: FloorReplacementOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'floor-replacement');
  let maskUrl: string | undefined;

  if (maskCanvas) {
    onProgress?.(20, 'Processing floor area...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    maskUrl = await uploadFile(maskFile, 'floor-masks');
  }

  onProgress?.(35, 'Replacing floor...');

  const prompt = buildFloorReplacementPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['floor-replacement'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Installing new floor...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from floor replacement');
}

/**
 * Rain to Shine Generation
 */
export async function generateRainToShine(
  imageFile: File,
  options: RainToShineOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'rain-to-shine');
  onProgress?.(30, 'Converting weather...');

  const prompt = buildRainToShinePrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['rain-to-shine'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.7,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Adding sunshine...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from rain to shine conversion');
}

/**
 * Night to Day Generation
 */
export async function generateNightToDay(
  imageFile: File,
  options: NightToDayOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'night-to-day');
  onProgress?.(30, 'Converting to daytime...');

  const prompt = buildNightToDayPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['night-to-day'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.75,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Adding daylight...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from night to day conversion');
}

/**
 * Changing Seasons Generation
 */
export async function generateChangingSeasons(
  imageFile: File,
  options: ChangingSeasonsOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'changing-seasons');
  onProgress?.(30, 'Changing seasons...');

  const prompt = buildChangingSeasonsPrompt(options);
  const strengthMap = { 'subtle': 0.5, 'moderate': 0.65, 'dramatic': 0.8 };

  const result = await fal.subscribe(TOOL_MODEL_MAP['changing-seasons'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: strengthMap[options.intensity],
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, `Applying ${options.season} effects...`);
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from season change');
}

/**
 * Pool Enhancement Generation
 */
export async function generatePoolEnhancement(
  imageFile: File,
  options: PoolEnhancementOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'pool-enhancement');
  let maskUrl: string | undefined;

  if (maskCanvas) {
    onProgress?.(20, 'Processing pool area...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    maskUrl = await uploadFile(maskFile, 'pool-masks');
  }

  onProgress?.(35, 'Enhancing pool...');

  const prompt = buildPoolEnhancementPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['pool-enhancement'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Enhancing pool water...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from pool enhancement');
}

/**
 * Watermark Removal Generation
 */
export async function generateWatermarkRemoval(
  imageFile: File,
  options: WatermarkRemovalOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'watermark-removal');

  if (options.autoDetect && !maskCanvas) {
    // Auto-detect mode - use image-to-image to clean watermarks
    onProgress?.(30, 'Auto-detecting watermarks...');
    const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: {
        image_url: imageUrl,
        prompt: 'Remove all watermarks, logos, and text overlays from this image. Restore the underlying image content, maintain quality, professional photograph',
        strength: 0.3,
        num_inference_steps: 28,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Removing watermarks...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { images?: Array<{ url: string }> };
    if (data?.images?.[0]?.url) return data.images[0].url;
    throw new Error('No image returned from auto watermark removal');
  } else if (maskCanvas) {
    // Manual mode with mask
    onProgress?.(20, 'Processing watermark area...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    const maskUrl = await uploadFile(maskFile, 'watermark-masks');

    onProgress?.(40, 'Removing watermark...');

    const result = await fal.subscribe(TOOL_MODEL_MAP['watermark-removal'], {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Erasing watermark...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { image?: { url: string } };
    if (data?.image?.url) return data.image.url;
    throw new Error('No image returned from watermark removal');
  }

  throw new Error('Either autoDetect or mask must be provided');
}

/**
 * Headshot Retouching Generation
 */
export async function generateHeadshotRetouching(
  imageFile: File,
  options: HeadshotRetouchingOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'headshot-retouching');
  onProgress?.(30, 'Retouching headshot...');

  const prompt = buildHeadshotRetouchingPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['headshot-retouching'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.45,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Enhancing portrait...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from headshot retouching');
}

/**
 * HDR Merge Generation
 */
export async function generateHDRMerge(
  imageFiles: File[],
  options: HDRMergeOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading images...');

  // Upload all bracketed images
  const imageUrls: string[] = [];
  for (let i = 0; i < imageFiles.length; i++) {
    const url = await uploadFile(imageFiles[i], 'hdr-merge');
    imageUrls.push(url);
    onProgress?.(10 + (i + 1) * (20 / imageFiles.length), `Uploading image ${i + 1}/${imageFiles.length}...`);
  }

  // For now, use the middle exposure and upscale with HDR effect
  // In a real implementation, this would use an actual HDR merge algorithm
  const middleIndex = Math.floor(imageUrls.length / 2);
  const baseImageUrl = imageUrls[middleIndex] || imageUrls[0];

  onProgress?.(40, 'Merging HDR...');

  const result = await fal.subscribe(TOOL_MODEL_MAP['hdr-merge'], {
    input: {
      image_url: baseImageUrl,
      scale: 2,
      overlapping_tiles: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Processing HDR...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { image?: { url: string } };
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from HDR merge');
}

/**
 * Floor Plan Generation
 */
export async function generateFloorPlan(
  imageFile: File,
  options: FloorPlanOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'floor-plan');
  onProgress?.(30, 'Analyzing room layout...');

  const styleDescriptions: Record<string, string> = {
    '2d-basic': 'simple 2D floor plan with basic room outlines',
    '2d-detailed': 'detailed 2D floor plan with furniture placement and measurements',
    '3d-isometric': '3D isometric floor plan view with furniture and fixtures',
  };

  let prompt = `Generate a ${styleDescriptions[options.style]} from this room photo.`;
  if (options.includeLabels) prompt += ' Include room labels.';
  if (options.includeDimensions) prompt += ' Include approximate dimensions.';
  prompt += ' Professional architectural drawing style, clean lines, accurate proportions.';

  const result = await fal.subscribe(TOOL_MODEL_MAP['floor-plan'], {
    input: {
      prompt,
      image_url: imageUrl,
      num_inference_steps: 28,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Generating floor plan...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from floor plan generation');
}

/**
 * 360° Virtual Staging Generation
 */
export async function generate360Staging(
  imageFile: File,
  options: Staging360Options,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading panorama...');

  const imageUrl = await uploadFile(imageFile, '360-staging');
  onProgress?.(30, 'Staging 360° room...');

  const prompt = build360StagingPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['360-staging'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.7,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Adding virtual furniture...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from 360 staging');
}

// ============ AUTO DEALERSHIP PROMPT BUILDERS ============

/**
 * Build the prompt for Background Swap (Auto)
 */
function buildBackgroundSwapPrompt(options: BackgroundSwapOptions): string {
  const backgroundPrompts: Record<string, string> = {
    'showroom': 'professional car dealership showroom with polished floor, bright lighting, clean modern interior',
    'outdoor': 'scenic outdoor setting with blue sky, green grass, attractive natural environment',
    'studio': 'professional photography studio with neutral gray background, soft lighting',
    'dealership': 'car dealership lot with other vehicles in background, professional automotive setting',
    'custom': options.customPrompt || 'clean professional background',
  };

  return `Replace the background with ${backgroundPrompts[options.backgroundType]}. Keep the vehicle perfectly intact, maintain original lighting on car, seamless edge blending, professional automotive photography`;
}

/**
 * Build the prompt for Reflection Fix (Auto)
 */
function buildReflectionFixPrompt(options: ReflectionFixOptions): string {
  const intensityDescriptions: Record<string, string> = {
    'light': 'subtle reduction of unwanted reflections',
    'medium': 'moderate reflection removal while maintaining paint shine',
    'heavy': 'significant reflection cleanup for cleaner appearance',
  };

  return `Remove unwanted reflections from vehicle paint and glass surfaces, ${intensityDescriptions[options.intensity]}. Preserve natural car shine and metallic paint appearance, professional automotive photography`;
}

/**
 * Build the prompt for Interior Enhance (Auto)
 */
function buildInteriorEnhancePrompt(options: InteriorEnhanceOptions): string {
  const parts: string[] = [];

  if (options.brighten) parts.push('brighten interior lighting');
  if (options.cleanupClutter) parts.push('remove clutter and personal items');
  if (options.enhanceDetails) parts.push('enhance dashboard and seat textures');

  const presetPrompts: Record<string, string> = {
    'natural': 'natural realistic lighting',
    'bright': 'bright and airy showroom style',
    'showroom': 'professional dealership showroom lighting',
  };

  return `Enhance vehicle interior with ${parts.join(', ')}. Apply ${presetPrompts[options.preset]}, professional automotive interior photography, clean and inviting`;
}

/**
 * Build the prompt for License Blur (Auto)
 */
function buildLicenseBlurPrompt(options: LicenseBlurOptions): string {
  const blurLevels: Record<string, string> = {
    'light': 'subtle blur',
    'medium': 'moderate blur making text unreadable',
    'heavy': 'complete blur for full privacy',
  };

  return `Apply ${blurLevels[options.blurIntensity]} to vehicle license plate for privacy protection. Maintain rest of image quality, natural appearance, professional automotive photography`;
}

/**
 * Build the prompt for Vehicle 360 Video
 */
function buildVehicle360Prompt(options: Vehicle360Options): string {
  const motionPrompts: Record<string, string> = {
    'smooth': 'smooth continuous rotation around the vehicle',
    'stop-motion': 'stop-motion style rotation with slight pauses',
    'cinematic': 'dramatic cinematic rotating shot with depth',
  };

  const direction = options.rotationDirection === 'clockwise' ? 'clockwise' : 'counter-clockwise';

  return `${motionPrompts[options.motionStyle]} ${direction}, professional car showcase video, showroom quality, dramatic lighting, 360 degree vehicle rotation`;
}

/**
 * Build the prompt for Window Tint Preview
 */
function buildWindowTintPrompt(options: WindowTintOptions): string {
  const tintDescriptions: Record<number, string> = {
    5: 'very dark 5% VLT limo tint',
    15: 'dark 15% VLT tint',
    25: 'medium 25% VLT tint',
    35: 'light 35% VLT tint',
    50: 'very light 50% VLT tint',
  };

  const colorDescriptions: Record<string, string> = {
    'charcoal': 'charcoal gray',
    'bronze': 'bronze metallic',
    'blue': 'blue reflective',
    'green': 'green tinted',
  };

  const applyDescriptions: Record<string, string> = {
    'all': 'all windows',
    'rear-only': 'rear windows only',
    'front-only': 'front windows only',
  };

  return `Apply ${tintDescriptions[options.tintLevel]} window film in ${colorDescriptions[options.tintColor]} to ${applyDescriptions[options.applyTo]}. Realistic tint appearance, maintain visibility where appropriate, professional automotive customization preview`;
}

// ============ AUTO DEALERSHIP GENERATION FUNCTIONS ============

/**
 * Background Swap Generation (Auto)
 */
export async function generateBackgroundSwap(
  imageFile: File,
  options: BackgroundSwapOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'background-swap');
  let maskUrl: string | undefined;

  if (maskCanvas) {
    onProgress?.(20, 'Processing vehicle mask...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    maskUrl = await uploadFile(maskFile, 'background-swap-masks');
  }

  onProgress?.(35, 'Swapping background...');

  const prompt = buildBackgroundSwapPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['background-swap'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Applying new background...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from background swap');
}

/**
 * Auto Enhance Generation
 */
export async function generateAutoEnhance(
  imageFile: File,
  options: AutoEnhanceOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'auto-enhance');
  onProgress?.(30, 'Enhancing vehicle photo...');

  const result = await fal.subscribe(TOOL_MODEL_MAP['auto-enhance'], {
    input: {
      image_url: imageUrl,
      scale: options.upscaleFactor || 2,
      overlapping_tiles: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Enhancing details...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { image?: { url: string } };
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from auto enhance');
}

/**
 * Blemish Removal Generation (Auto)
 */
export async function generateBlemishRemoval(
  imageFile: File,
  maskCanvas: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'blemish-removal');
  onProgress?.(20, 'Processing blemish mask...');

  const maskBlob = await canvasMaskToBlob(maskCanvas);
  const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
  const maskUrl = await uploadFile(maskFile, 'blemish-removal-masks');

  onProgress?.(40, 'Removing blemishes...');

  const result = await fal.subscribe(TOOL_MODEL_MAP['blemish-removal'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Repairing surface...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { image?: { url: string } };
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from blemish removal');
}

/**
 * Reflection Fix Generation (Auto)
 */
export async function generateReflectionFix(
  imageFile: File,
  options: ReflectionFixOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'reflection-fix');

  if (options.mode === 'manual' && maskCanvas) {
    onProgress?.(20, 'Processing reflection mask...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    const maskUrl = await uploadFile(maskFile, 'reflection-fix-masks');

    onProgress?.(40, 'Fixing reflections...');

    const result = await fal.subscribe('fal-ai/bria/eraser', {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Removing reflections...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { image?: { url: string } };
    if (data?.image?.url) return data.image.url;
    throw new Error('No image returned from reflection fix');
  } else {
    // Auto mode
    onProgress?.(30, 'Auto-fixing reflections...');
    const prompt = buildReflectionFixPrompt(options);

    const result = await fal.subscribe(TOOL_MODEL_MAP['reflection-fix'], {
      input: {
        image_url: imageUrl,
        prompt,
        strength: options.intensity === 'light' ? 0.3 : options.intensity === 'medium' ? 0.5 : 0.7,
        num_inference_steps: 28,
        guidance_scale: 7.5,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Cleaning reflections...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { images?: Array<{ url: string }> };
    if (data?.images?.[0]?.url) return data.images[0].url;
    throw new Error('No image returned from auto reflection fix');
  }
}

/**
 * Interior Enhance Generation (Auto)
 */
export async function generateInteriorEnhance(
  imageFile: File,
  options: InteriorEnhanceOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'interior-enhance');
  onProgress?.(30, 'Enhancing interior...');

  const prompt = buildInteriorEnhancePrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['interior-enhance'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: options.preset === 'natural' ? 0.4 : options.preset === 'bright' ? 0.55 : 0.7,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Enhancing interior details...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from interior enhance');
}

/**
 * License Plate Blur Generation (Auto)
 */
export async function generateLicenseBlur(
  imageFile: File,
  options: LicenseBlurOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'license-blur');

  if (!options.autoDetect && maskCanvas) {
    // Manual mode with mask - use eraser to blur/fill area
    onProgress?.(20, 'Processing license plate area...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    const maskUrl = await uploadFile(maskFile, 'license-blur-masks');

    onProgress?.(40, 'Blurring license plate...');

    const result = await fal.subscribe('fal-ai/flux-pro/v1/fill', {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
        prompt: 'Blurred license plate, privacy protected, smooth blur effect',
        num_inference_steps: 28,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Applying blur...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { images?: Array<{ url: string }> };
    if (data?.images?.[0]?.url) return data.images[0].url;
    throw new Error('No image returned from license blur');
  } else {
    // Auto detect mode
    onProgress?.(30, 'Auto-detecting license plate...');
    const prompt = buildLicenseBlurPrompt(options);

    const result = await fal.subscribe(TOOL_MODEL_MAP['license-blur'], {
      input: {
        image_url: imageUrl,
        prompt,
        strength: 0.5,
        num_inference_steps: 28,
        guidance_scale: 7.5,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(50 + Math.random() * 30, 'Blurring plate...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { images?: Array<{ url: string }> };
    if (data?.images?.[0]?.url) return data.images[0].url;
    throw new Error('No image returned from auto license blur');
  }
}

/**
 * Vehicle 360° Spin Video Generation
 */
export async function generateVehicle360(
  imageFile: File,
  options: Vehicle360Options,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'vehicle-360');
  onProgress?.(30, 'Generating 360° video...');

  const prompt = buildVehicle360Prompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['vehicle-360'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(options.duration),
      aspect_ratio: '16:9',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(40 + Math.random() * 40, 'Creating 360° spin video...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { video?: { url: string } };
  if (data?.video?.url) return data.video.url;
  throw new Error('No video returned from vehicle 360 generation');
}

/**
 * Window Tint Preview Generation
 */
export async function generateWindowTint(
  imageFile: File,
  options: WindowTintOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'window-tint');
  onProgress?.(30, 'Applying window tint...');

  const prompt = buildWindowTintPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['window-tint'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.6,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Previewing tint...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from window tint preview');
}

// ============ ADDITIONAL AUTO PROMPT BUILDERS ============

/**
 * Build the prompt for Shadow Enhancement (Auto)
 */
function buildShadowEnhancementPrompt(options: ShadowEnhancementOptions): string {
  const shadowTypes: Record<string, string> = {
    'natural': 'natural soft ground shadow for outdoor look',
    'studio': 'clean studio shadow with smooth gradient',
    'dramatic': 'dramatic high-contrast shadow for impact',
  };

  const intensityDescriptions: Record<string, string> = {
    'light': 'subtle and soft',
    'medium': 'balanced and natural',
    'strong': 'prominent and defined',
  };

  const directionDescriptions: Record<string, string> = {
    'left': 'shadow falling to the left',
    'right': 'shadow falling to the right',
    'center': 'shadow directly beneath vehicle',
  };

  return `Add professional ${shadowTypes[options.shadowType]}, ${intensityDescriptions[options.intensity]} intensity, ${directionDescriptions[options.direction]}. Professional automotive photography, showroom quality, realistic shadow`;
}

/**
 * Build the prompt for Number Plate Mask (Auto)
 */
function buildNumberPlateMaskPrompt(options: NumberPlateMaskOptions): string {
  const maskTypes: Record<string, string> = {
    'blur': 'blurred plate for privacy',
    'dealer-logo': 'dealer logo overlay on plate',
    'custom-text': `custom text "${options.customText || 'FOR SALE'}" on plate`,
  };

  return `Replace license plate with ${maskTypes[options.maskType]}. Maintain realistic plate appearance, professional automotive photography, seamless integration`;
}

/**
 * Build the prompt for Dealer Branding (Auto)
 */
function buildDealerBrandingPrompt(options: DealerBrandingOptions): string {
  const positionDescriptions: Record<string, string> = {
    'top-left': 'top left corner',
    'top-right': 'top right corner',
    'bottom-left': 'bottom left corner',
    'bottom-right': 'bottom right corner',
    'center': 'centered',
  };

  let prompt = `Add professional dealer branding overlay in ${positionDescriptions[options.position]}`;
  if (options.addWatermark && options.watermarkText) {
    prompt += `, subtle watermark with "${options.watermarkText}"`;
  }
  prompt += '. Professional automotive marketing image, clean overlay integration';

  return prompt;
}

/**
 * Build the prompt for Paint Color (Auto)
 */
function buildPaintColorPrompt(options: PaintColorOptions): string {
  const finishDescriptions: Record<string, string> = {
    'gloss': 'high gloss shine',
    'matte': 'matte flat finish',
    'metallic': 'metallic sparkle finish',
    'pearl': 'pearlescent iridescent finish',
  };

  return `Change vehicle paint color to ${options.color} with ${finishDescriptions[options.finish]}. ${options.preserveReflections ? 'Maintain natural reflections and highlights' : 'Clean even color application'}. Professional automotive photography, realistic paint appearance`;
}

/**
 * Build the prompt for Wheel Customizer (Auto)
 */
function buildWheelCustomizerPrompt(options: WheelCustomizerOptions): string {
  const wheelStyles: Record<string, string> = {
    'stock': 'original factory style wheels',
    'sport': 'sporty multi-spoke performance wheels',
    'luxury': 'elegant luxury design wheels',
    'offroad': 'rugged off-road style wheels',
    'custom': 'custom aftermarket wheels',
  };

  const finishDescriptions: Record<string, string> = {
    'chrome': 'polished chrome finish',
    'matte-black': 'matte black finish',
    'gloss-black': 'gloss black finish',
    'gunmetal': 'gunmetal gray finish',
    'custom': `custom color ${options.wheelColor}`,
  };

  return `Replace wheels with ${wheelStyles[options.wheelStyle]} in ${finishDescriptions[options.finish]}. Proper fitment and proportions, professional automotive photography, realistic wheel appearance`;
}

/**
 * Build the prompt for Vehicle Walkthrough (Auto)
 */
function buildVehicleWalkthroughPrompt(options: VehicleWalkthroughOptions): string {
  const startPoints: Record<string, string> = {
    'exterior-front': 'starting from front exterior view',
    'exterior-rear': 'starting from rear exterior view',
    'driver-door': 'entering through driver door',
    'interior': 'starting inside the vehicle',
  };

  const motionStyles: Record<string, string> = {
    'smooth': 'smooth flowing camera movement',
    'cinematic': 'dramatic cinematic camera work',
    'dynamic': 'dynamic engaging motion',
  };

  const highlights = options.highlights.join(', ');

  return `Vehicle interior walkthrough video ${startPoints[options.startPoint]}, ${motionStyles[options.motionStyle]}, highlighting ${highlights}. Professional automotive video tour, showroom quality, inviting perspective`;
}

/**
 * Build the prompt for Social Clips (Auto)
 */
function buildSocialClipsPrompt(options: SocialClipsOptions): string {
  const platforms: Record<string, string> = {
    'instagram': 'Instagram Reels format',
    'tiktok': 'TikTok vertical video format',
    'youtube-shorts': 'YouTube Shorts format',
    'facebook': 'Facebook Stories format',
  };

  const styles: Record<string, string> = {
    'fast-cuts': 'fast-paced dynamic cuts',
    'smooth': 'smooth transitions',
    'dramatic': 'dramatic reveal shots',
  };

  let prompt = `Create ${platforms[options.platform]} social media clip with ${styles[options.style]}`;
  if (options.addText && options.textOverlay) {
    prompt += `, text overlay: "${options.textOverlay}"`;
  }
  prompt += '. Engaging automotive content, viral-worthy, professional quality';

  return prompt;
}

/**
 * Build the prompt for Damage Detection (Auto)
 */
function buildDamageDetectionPrompt(options: DamageDetectionOptions): string {
  const damageTypes = options.damageTypes.join(', ');
  const overlayStyles: Record<string, string> = {
    'circles': 'circled with red markers',
    'arrows': 'indicated with arrows',
    'highlights': 'highlighted with colored overlays',
  };

  return `Analyze and ${options.highlightDamage ? 'highlight' : 'identify'} vehicle damage: ${damageTypes}. ${options.highlightDamage ? `Mark damage areas ${overlayStyles[options.overlayStyle]}.` : ''} Professional vehicle inspection analysis`;
}

// ============ ADDITIONAL AUTO GENERATION FUNCTIONS ============

/**
 * Spot Removal Generation (Auto)
 */
export async function generateSpotRemoval(
  imageFile: File,
  maskCanvas: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'spot-removal');
  onProgress?.(20, 'Processing spot mask...');

  const maskBlob = await canvasMaskToBlob(maskCanvas);
  const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
  const maskUrl = await uploadFile(maskFile, 'spot-removal-masks');

  onProgress?.(40, 'Removing spots...');

  const result = await fal.subscribe(TOOL_MODEL_MAP['spot-removal'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Cleaning surface...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { image?: { url: string } };
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from spot removal');
}

/**
 * Shadow Enhancement Generation (Auto)
 */
export async function generateShadowEnhancement(
  imageFile: File,
  options: ShadowEnhancementOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'shadow-enhancement');
  onProgress?.(30, 'Adding shadows...');

  const prompt = buildShadowEnhancementPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['shadow-enhancement'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: options.intensity === 'light' ? 0.35 : options.intensity === 'medium' ? 0.5 : 0.7,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Enhancing shadows...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from shadow enhancement');
}

/**
 * Number Plate Mask Generation (Auto)
 */
export async function generateNumberPlateMask(
  imageFile: File,
  options: NumberPlateMaskOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'number-plate-mask');
  let maskUrl: string | undefined;

  if (maskCanvas) {
    onProgress?.(20, 'Processing plate area...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    maskUrl = await uploadFile(maskFile, 'number-plate-masks');
  }

  onProgress?.(40, 'Masking plate...');

  const prompt = buildNumberPlateMaskPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['number-plate-mask'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Applying mask...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from number plate mask');
}

/**
 * Dealer Branding Generation (Auto)
 */
export async function generateDealerBranding(
  imageFile: File,
  options: DealerBrandingOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'dealer-branding');
  onProgress?.(30, 'Adding branding...');

  const prompt = buildDealerBrandingPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['dealer-branding'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: options.opacity / 100 * 0.5, // Scale opacity to strength
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Applying branding...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from dealer branding');
}

/**
 * Paint Color Change Generation (Auto)
 */
export async function generatePaintColor(
  imageFile: File,
  options: PaintColorOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'paint-color');
  onProgress?.(30, 'Changing paint color...');

  const prompt = buildPaintColorPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['paint-color'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.65,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Applying new color...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from paint color change');
}

/**
 * Wheel Customizer Generation (Auto)
 */
export async function generateWheelCustomizer(
  imageFile: File,
  options: WheelCustomizerOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'wheel-customizer');
  onProgress?.(30, 'Customizing wheels...');

  const prompt = buildWheelCustomizerPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['wheel-customizer'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.7,
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Installing new wheels...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from wheel customizer');
}

/**
 * Vehicle Walkthrough Video Generation (Auto)
 */
export async function generateVehicleWalkthrough(
  imageFile: File,
  options: VehicleWalkthroughOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'vehicle-walkthrough');
  onProgress?.(30, 'Generating walkthrough video...');

  const prompt = buildVehicleWalkthroughPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['vehicle-walkthrough'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(options.duration),
      aspect_ratio: '16:9',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(40 + Math.random() * 40, 'Creating walkthrough...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { video?: { url: string } };
  if (data?.video?.url) return data.video.url;
  throw new Error('No video returned from vehicle walkthrough generation');
}

/**
 * Social Clips Video Generation (Auto)
 */
export async function generateSocialClips(
  imageFile: File,
  options: SocialClipsOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'social-clips');
  onProgress?.(30, 'Generating social clip...');

  const prompt = buildSocialClipsPrompt(options);

  // Determine aspect ratio based on platform
  const aspectRatios: Record<string, string> = {
    'instagram': '9:16',
    'tiktok': '9:16',
    'youtube-shorts': '9:16',
    'facebook': '9:16',
  };

  const result = await fal.subscribe(TOOL_MODEL_MAP['social-clips'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(Math.min(options.duration, 10)), // Cap at 10s for most video models
      aspect_ratio: aspectRatios[options.platform] || '9:16',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(40 + Math.random() * 40, 'Creating social content...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { video?: { url: string } };
  if (data?.video?.url) return data.video.url;
  throw new Error('No video returned from social clips generation');
}

/**
 * Damage Detection Generation (Auto)
 */
export async function generateDamageDetection(
  imageFile: File,
  options: DamageDetectionOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'damage-detection');
  onProgress?.(30, 'Analyzing for damage...');

  const prompt = buildDamageDetectionPrompt(options);

  const result = await fal.subscribe(TOOL_MODEL_MAP['damage-detection'], {
    input: {
      image_url: imageUrl,
      prompt,
      strength: 0.4, // Lower strength to preserve original image while adding markers
      num_inference_steps: 28,
      guidance_scale: 7.5,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(50 + Math.random() * 30, 'Detecting damage...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from damage detection');
}

/**
 * Get credits cost for a tool
 */
export function getToolCredits(tool: ToolType): number {
  return TOOL_CREDITS_MAP[tool];
}

/**
 * Check if FAL API key is configured
 */
export function isFalConfigured(): boolean {
  return !!import.meta.env.VITE_FAL_KEY;
}
