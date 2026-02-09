/**
 * Unified Tool Generation API
 * Handles all Real Estate AI tool generations through FAL AI
 *
 * SECURITY: All FAL API calls now go through Supabase Edge Functions
 * to keep API keys secure and never expose them to the browser.
 */

import { createClient } from "@/lib/database/client";
import { uploadToR2 } from "./r2";
import {
  ToolType,
  TOOL_MODEL_MAP,
  TOOL_CREDITS_MAP,
  // Real Estate Options
  ExteriorPaintOptions,
  LandscapeDesignOptions,
  LandscapeStyle,
  LandscapeElement,
  VirtualStagingOptions,
  CustomFurnitureStagingOptions,
  PhotoEnhancementOptions,
  SkyReplacementOptions,
  TwilightOptions,
  ItemRemovalOptions,
  LawnEnhancementOptions,
  RoomTourOptions,
  DeclutterOptions,
  AutoDeclutterOptions,
  DeclutterLevel,
  DeclutterCategory,
  VirtualRenovationOptions,
  WallColorOptions,
  FloorReplacementOptions,
  RainToShineOptions,
  NightToDayOptions,
  ChangingSeasonsOptions,
  PoolEnhancementOptions,
  PoolMode,
  PoolElement,
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
  SocialMediaPosterOptions,
  SocialMediaPlatform,
  DesignStyle,
  ColorTheme,
  PosterType,
  RecraftStyle,
  RecraftImageSize,
} from "../types/generation";

// ============ SECURE API HELPERS ============

/**
 * Convert a remote image URL to a local blob URL for reliable display
 * Helps avoid network issues like ERR_QUIC_PROTOCOL_ERROR when displaying FAL media
 *
 * @param remoteUrl - The remote URL to convert
 * @param retries - Number of retry attempts (default 3)
 * @returns A blob URL that can be used for display
 */
export async function fetchAsBlob(remoteUrl: string, retries = 3): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(remoteUrl, {
        // Add cache-busting to avoid cached errors
        headers: attempt > 0 ? { 'Cache-Control': 'no-cache' } : {},
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Fetch attempt ${attempt + 1} failed:`, lastError.message);

      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to fetch image');
}

/**
 * Safely fetch and convert a remote image URL to a blob URL
 * This avoids ERR_QUIC_PROTOCOL_ERROR issues with FAL media URLs
 */
export async function safeImageUrl(remoteUrl: string): Promise<string> {
  try {
    // Fetch as blob to avoid QUIC protocol errors
    return await fetchAsBlob(remoteUrl, 3);
  } catch (error) {
    console.warn('Failed to fetch as blob, returning original URL:', error);
    // Fallback to original URL if blob conversion fails
    return remoteUrl;
  }
}

// Call FAL generate Edge Function (secure - no API key exposure)
async function callFalGenerate(params: {
  tool: string;
  imageUrl?: string;
  maskUrl?: string;
  prompt?: string;
  options?: Record<string, any>;
}): Promise<{ requestId: string; data: any; statusUrl?: string; responseUrl?: string }> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  // supabase.functions.invoke automatically includes the auth token
  const { data, error } = await supabase.functions.invoke('fal-generate', {
    body: params,
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw new Error(error.message || 'Edge Function returned a non-2xx status code');
  }

  if (!data || !data.success) {
    throw new Error(data?.error || 'Generation failed');
  }

  return {
    requestId: data.requestId,
    data: data.data,
    statusUrl: data.statusUrl,
    responseUrl: data.responseUrl,
  };
}

// Poll FAL status Edge Function
async function pollFalStatus(
  requestId: string,
  model: string,
  statusUrl?: string,
  responseUrl?: string,
  maxAttempts = 60
): Promise<any> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  for (let i = 0; i < maxAttempts; i++) {
    // supabase.functions.invoke automatically includes the auth token
    const { data, error } = await supabase.functions.invoke('fal-status', {
      body: { requestId, model, statusUrl, responseUrl },
    });

    console.log(`Poll attempt ${i + 1}:`, JSON.stringify(data, null, 2));

    if (error) {
      console.error('Status check error:', error);
      throw new Error(error.message || 'Status check failed');
    }

    if (data.status === 'COMPLETED') {
      console.log('Completed! Returning data:', JSON.stringify(data.data, null, 2));
      return data.data;
    }

    if (data.status === 'FAILED') {
      throw new Error(data.error || 'Generation failed');
    }

    // Wait 3 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error('Generation timed out');
}

/**
 * Secure FAL Subscribe wrapper
 * Mimics secureSubscribe() but routes through Edge Functions for security
 */
async function secureSubscribe(
  model: string,
  config: {
    input: Record<string, any>;
    logs?: boolean;
    onQueueUpdate?: (update: { status: string }) => void;
  }
): Promise<{ data: any }> {
  // Extract tool from model path
  const tool = Object.entries(TOOL_MODEL_MAP).find(([, m]) => m === model)?.[0] || model;

  // Call the Edge Function
  const { requestId, data, statusUrl, responseUrl } = await callFalGenerate({
    tool,
    imageUrl: config.input.image_url,
    maskUrl: config.input.mask_url,
    prompt: config.input.prompt,
    options: config.input,
  });

  // If immediate result, return it
  if (data?.images || data?.image || data?.video) {
    return { data };
  }

  // Otherwise poll with progress updates
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase not configured');

  for (let i = 0; i < 120; i++) { // 6 minutes max
    // supabase.functions.invoke automatically includes the auth token
    const { data: statusData, error } = await supabase.functions.invoke('fal-status', {
      body: { requestId, model, statusUrl, responseUrl },
    });

    if (error) throw new Error(error.message);

    // Call progress callback
    if (statusData.status === 'IN_PROGRESS' || statusData.status === 'IN_QUEUE') {
      config.onQueueUpdate?.({ status: statusData.status });
    }

    if (statusData.status === 'COMPLETED') {
      return { data: statusData.data };
    }

    if (statusData.status === 'FAILED') {
      throw new Error(statusData.error || 'Generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error('Generation timed out');
}

/**
 * Build the prompt for Virtual Staging
 *
 * Updated with prompt wrapper to fix "half room" issue:
 * - Preserve room layout, walls, windows, doors, flooring
 * - Add complete coherent furniture set for entire room
 * - Realistic scale and natural shadows
 */
function buildVirtualStagingPrompt(options: VirtualStagingOptions): string {
  // Detailed style descriptions for better AI generation results
  const stylePrompts: Record<string, string> = {
    'modern': 'modern minimalist furniture, clean lines, neutral colors, contemporary design, sleek sofa, glass coffee table, simple elegant decor',
    'scandinavian': 'scandinavian style furniture, light oak wood, white and beige tones, cozy textiles, minimalist nordic design, warm and inviting',
    'coastal': 'coastal beach house furniture, light blue and white colors, natural rattan, linen fabrics, nautical accents, airy and relaxed',
    'luxury': 'elegant luxury furniture, cream and gold accents, velvet upholstery, marble coffee table, crystal chandelier, sophisticated high-end interior design',
    'industrial': 'industrial loft furniture, exposed metal, distressed leather sofa, reclaimed wood, edison bulbs, urban warehouse aesthetic',
    'farmhouse': 'farmhouse style furniture, rustic wood, shiplap accents, comfortable linen sofa, vintage decor, warm country charm',
  };

  const roomPrompts: Record<string, string> = {
    'living-room': 'living room',
    'bedroom': 'bedroom',
    'kitchen': 'kitchen',
    'dining': 'dining room',
    'bathroom': 'bathroom',
    'office': 'home office',
  };

  // Prompt wrapper to fix "half room" staging issue
  const promptWrapper = `Photorealistic real estate interior photo. Keep the same camera angle, room layout, walls, windows, doors, and flooring. Add a complete coherent furniture set that fits the entire room, realistic scale, natural shadows, no cut-off furniture. Do not change architecture, window size, wall color, or flooring.`;

  // Style-specific furniture prompt
  const stylePrompt = `Furnish this ${roomPrompts[options.roomType]} with ${stylePrompts[options.style]}, professional interior design photography, well-lit.`;

  return `${promptWrapper} ${stylePrompt}`;
}

/**
 * Build the prompt for Sky Replacement
 *
 * Real-estate-safe prompts with proper constraints:
 * - Always include "photorealistic real estate photography"
 * - Match original lighting direction and exposure
 * - Seamless blend at roofline and tree edges
 * - Avoid halos, over-saturation, dramatic color grading
 * - Do not change buildings, trees, or any non-sky pixels
 *
 * Note: flux-pro/v1/fill does not support negative_prompt,
 * so constraints are embedded in the main prompt.
 */
function buildSkyPrompt(options: SkyReplacementOptions): string {
  const skyPrompts: Record<string, string> = {
    // MLS-Safe options
    'blue-clear': 'Photorealistic clear daytime blue sky, natural gradient, no clouds. Real estate photography. Match original lighting direction and exposure. Seamless blend at roofline and tree edges. Avoid halos, oversaturation, HDR look. Do not alter any non-sky elements.',

    'blue-clouds': 'Photorealistic blue sky with a few soft white cumulus clouds, natural and subtle. Real estate photography. Match original lighting direction and exposure. Seamless blend at edges. Avoid dramatic clouds, oversaturation, HDR, halos. Do not alter non-sky elements.',

    'overcast': 'Photorealistic light gray overcast sky, soft and even, realistic cloud texture, not flat. Real estate photography. Match original exposure. Seamless blend at edges. Avoid banding, halos, heavy HDR. Do not alter non-sky elements.',

    // Marketing-only options (not MLS-safe)
    'golden-hour': 'Photorealistic warm late-afternoon sky with subtle golden tones, realistic and not exaggerated. Match original lighting direction. Seamless blend. Avoid pink/purple fantasy colors, dramatic grading, HDR halos. Do not alter non-sky elements.',

    'sunset': 'Photorealistic mild sunset sky with soft warm tones, realistic and subtle, not dramatic. Match original lighting direction. Seamless blend at roofline and trees. Avoid purple/magenta gradients, oversaturation, HDR halos. Do not alter non-sky elements.',

    'dramatic': 'Photorealistic moody sky with heavier clouds, realistic for local weather, not cinematic. Match original exposure. Seamless blend. Avoid storm lightning, extreme contrast, surreal colors, HDR halos. Do not alter non-sky elements.',
  };

  return skyPrompts[options.skyType];
}

/**
 * Build the prompt for Twilight Conversion (FLUX Kontext Pro)
 *
 * Detailed per-style prompts with window brightness and sky intensity modifiers
 */
function buildTwilightPrompt(options: TwilightOptions): string {
  const stylePrompts: Record<string, string> = {
    'warm-sunset': 'Transform this daytime exterior photo into a warm twilight scene at dusk. Replace the sky with a beautiful sunset gradient of deep orange, soft pink, and purple tones. Turn on all interior lights - every window should glow with warm amber light. Add subtle warm glow from porch lights and exterior fixtures. Keep the house, landscaping, and all architectural details exactly the same. Adjust the overall ambient lighting to match dusk - cooler blue tones on exterior surfaces, warm light spilling from windows onto lawn and driveway.',
    'blue-hour': 'Transform this daytime exterior photo into a blue hour twilight scene. Replace the sky with a deep blue gradient fading to purple and soft pink near the horizon. Turn on all interior lights - windows should have warm golden-amber glow contrasting against the cool blue exterior. Add subtle landscape lighting and porch lights. Keep the house architecture and landscaping exactly the same. The exterior should have a cool blue ambient tone while windows radiate warm inviting light.',
    'golden-dusk': 'Transform this daytime exterior photo into golden hour dusk. Replace the sky with warm golden and peach sunset colors with soft clouds catching the light. Turn on interior lights - windows glowing warmly. Add gentle golden light on the house facade as if from setting sun. Keep the house architecture and landscaping exactly the same. Warm, inviting atmosphere.',
    'dramatic': 'Transform this daytime exterior photo into dramatic twilight. Replace the sky with vivid sunset colors - deep magenta, bright orange, dramatic cloud formations. Turn on all interior lights with warm amber glow. Add pronounced light spill from windows onto surrounding areas. Keep the house architecture and landscaping exactly the same. High contrast between warm interior light and cool exterior.',
  };

  const brightnessModifiers: Record<string, string> = {
    'subtle': 'Keep window glow subtle and understated, just barely visible warm light.',
    'normal': 'Windows should have a natural warm glow, as if lights are on inside.',
    'bright': 'Make the window lights very bright, prominent, and eye-catching.',
  };

  const skyModifiers: Record<string, string> = {
    'muted': 'Keep the sky colors muted and restrained for a natural look.',
    'normal': 'Sky colors should be vivid but realistic.',
    'vivid': 'Make the sky colors rich and saturated for maximum visual impact.',
  };

  return `${stylePrompts[options.style]} ${brightnessModifiers[options.windowBrightness]} ${skyModifiers[options.skyIntensity]} Photorealistic, professional real estate twilight photography. Smooth natural color blending at horizon edge.`;
}

/**
 * Build the prompt for Lawn Enhancement (FLUX Kontext Pro)
 *
 * Detailed prompts that produce visible, dramatic lawn transformation
 */
function buildLawnPrompt(options: LawnEnhancementOptions): string {
  const intensityPrompts: Record<string, string> = {
    'natural': 'Transform the lawn into healthy, naturally green grass with even coverage and realistic texture. The grass should look well-maintained and freshly mowed, a natural medium green color.',
    'enhanced': 'Transform the lawn into a lush, thick, deep green lawn with rich color and dense grass coverage. The grass should look like a professionally maintained lawn - uniformly green, thick, and healthy.',
    'vibrant': 'Transform the lawn into a strikingly vibrant, emerald green lawn with perfectly dense, manicured grass. The grass should be intensely green and look like a golf course fairway - pristine and immaculate.',
  };

  const parts: string[] = [intensityPrompts[options.intensity]];

  if (options.addFlowers) {
    parts.push('Add colorful flower beds along the house foundation and walkway edges - bright red, pink, purple, and yellow flowers with fresh green foliage.');
  }

  if (options.freshDewy) {
    parts.push('Add a fresh morning dew effect with subtle glistening on the grass blades, making the lawn look freshly watered.');
  }

  parts.push('Replace any brown, dead, or patchy grass areas with healthy green grass. Make mulch beds look fresh and dark. Do not remove, alter, or cover any stone walls, retaining walls, walkways, pathways, driveways, fences, or hardscape features. Keep the house, roof, windows, porch, driveway, sky, trees, shrubs, and all architectural and hardscape details exactly the same. Only change the grass and landscaping vegetation. Photorealistic, professional real estate photography.');

  return parts.join(' ');
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
    'modern': 'Transform this into a sleek modern renovation with clean lines, flat-panel cabinetry, quartz or marble countertops, minimalist hardware, and contemporary light fixtures.',
    'traditional': 'Transform this into a classic traditional renovation with raised-panel cabinetry, warm wood tones, crown molding, elegant hardware, and timeless design details.',
    'contemporary': 'Transform this into a contemporary renovation with bold accent colors, mixed materials like concrete and wood, geometric patterns, and artistic design elements.',
    'farmhouse': 'Transform this into a charming farmhouse renovation with shiplap accent walls, open shelving, apron-front sink, rustic wood beams, and warm inviting finishes.',
    'luxury': 'Transform this into a luxury high-end renovation with premium marble surfaces, custom cabinetry, designer fixtures, under-cabinet lighting, and sophisticated upscale finishes.',
  };

  const elementDescriptions: Record<string, string> = {
    'cabinets': 'Install brand new designer cabinets with soft-close doors and matching hardware.',
    'countertops': 'Replace countertops with premium stone or quartz surfaces.',
    'backsplash': 'Add a stylish new backsplash with modern tile patterns.',
    'fixtures': 'Upgrade all fixtures and hardware to modern brushed or matte finishes.',
    'appliances': 'Add new stainless steel professional-grade appliances.',
  };

  const elementDetails = options.elements.map(el => elementDescriptions[el] || el).join(' ');

  return `${stylePrompts[options.style]} ${elementDetails} This is a ${options.renovationType} renovation. Keep the room layout, walls, windows, doors, ceiling, and floor exactly the same. Only renovate the specified elements. Photorealistic, professional real estate photography, well-lit, high-end finish.`;
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

  const colorDesc = options.colorName || options.color;
  return `Change only the wall color in this room to ${colorDesc} (hex ${options.color}) with a ${finishDescriptions[options.finish]}. Paint every visible wall surface with this exact new color. The walls must clearly show the new ${colorDesc} paint color, noticeably different from the original. Keep all furniture, fixtures, flooring, ceiling, windows, doors, artwork, decor, and architectural trim exactly the same. Maintain realistic lighting, shadows, and reflections on the newly painted walls. Photorealistic, professional interior real estate photography.`;
}

/**
 * Build the prompt for Exterior Paint Visualizer
 */
function buildExteriorPaintPrompt(options: ExteriorPaintOptions): string {
  const finishDescriptions: Record<string, string> = {
    'matte': 'matte finish with no shine',
    'eggshell': 'subtle eggshell sheen',
    'satin': 'soft satin luster',
    'semi-gloss': 'semi-gloss reflective finish',
  };

  const parts: string[] = [];
  const unchanged: string[] = [];

  const elements = [
    { key: 'siding', data: options.siding, label: 'exterior siding/walls' },
    { key: 'trim', data: options.trim, label: 'exterior trim' },
    { key: 'door', data: options.door, label: 'front door' },
    { key: 'shutters', data: options.shutters, label: 'window shutters' },
    { key: 'garageDoor', data: options.garageDoor, label: 'garage door' },
  ];

  for (const el of elements) {
    if (el.data.enabled) {
      const colorDesc = el.data.colorName || el.data.color;
      parts.push(`Change the ${el.label} to ${colorDesc} (hex ${el.data.color})`);
    } else {
      unchanged.push(el.label);
    }
  }

  if (parts.length === 0) {
    return 'Keep this exterior photo exactly the same. No changes.';
  }

  const finishText = finishDescriptions[options.finish];
  const changeText = parts.join('. ') + `. Use a ${finishText} on all painted surfaces.`;
  const keepText = unchanged.length > 0 ? ` Keep the ${unchanged.join(', ')} in their original colors.` : '';

  return `${changeText}${keepText} Keep the roof, landscaping, driveway, windows, and all surroundings exactly the same. Maintain realistic lighting, shadows, and weather conditions. Photorealistic, professional real estate exterior photography.`;
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

  return `Replace only the floor in this room with ${floorDescriptions[options.floorType]} in a ${options.style} style. The new flooring should follow the correct perspective and cover the entire visible floor area with realistic plank or tile patterns. Keep all walls, furniture, fixtures, ceiling, doors, windows, and decor exactly the same. Maintain realistic lighting, shadows, and reflections on the new floor surface. Photorealistic, professional interior real estate photography.`;
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

  return `Transform this rainy or overcast exterior photo into a bright sunny day with ${skyTypes[options.skyType]} and ${brightnessLevels[options.brightness]}. Remove all rain, raindrops, puddles, wet reflections, and wet surfaces from the ground, driveway, and sidewalks. Make the ground and pavement completely dry. Replace the gray or dark sky with a beautiful sunny sky. Add warm natural sunlight with realistic shadows and highlights. Keep the house, building, landscaping, trees, cars, and all architectural details exactly the same. Only change the weather and lighting. Photorealistic, professional real estate exterior photography.`;
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

  return `Convert this nighttime exterior photo to bright daytime with ${timeDescriptions[options.timeOfDay]} and ${skyDescriptions[options.skyType]}. Replace the dark night sky with a bright daytime sky. Turn off all artificial lights, porch lights, and window glow. Add natural sunlight illumination with realistic shadows cast by the sun. Make the entire scene look like it was photographed during the day. Keep the house, building, landscaping, driveway, cars, and all architectural details exactly the same. Only change the lighting from night to day. Photorealistic, professional real estate exterior photography.`;
}

/**
 * Build the prompt for Changing Seasons
 */
function buildChangingSeasonsPrompt(options: ChangingSeasonsOptions): string {
  const seasonPrompts: Record<string, string> = {
    'spring': 'Change the season to spring. Add blooming flowers, cherry blossoms, fresh green leaves on the trees and bushes. Make the grass bright green with spring wildflowers.',
    'summer': 'Change the season to summer. Make all foliage lush and vibrant green, add bright warm sunshine, full leafy trees with dense canopy.',
    'fall': 'Change the season to autumn. Transform the tree leaves to orange, red, and golden yellow fall colors. Add fallen leaves on the ground, warm autumn tones throughout.',
    'winter': 'Change the season to winter. Add snow covering the ground, roof, trees, and bushes. Make trees bare or frost-covered. Add overcast winter sky. Snow on the lawn and walkways.',
  };

  const intensityModifiers: Record<string, string> = {
    'subtle': 'Apply light seasonal changes while keeping most of the scene recognizable.',
    'moderate': 'Apply clear seasonal transformation to the landscaping, trees, and sky.',
    'dramatic': 'Apply a full dramatic seasonal transformation to the entire scene.',
  };

  return `${seasonPrompts[options.season]} ${intensityModifiers[options.intensity]} Keep the house structure, architecture, and building materials exactly the same. Professional real estate exterior photography.`;
}

/**
 * Build the prompt for Pool Enhancement
 */
function buildPoolEnhancementPrompt(options: PoolEnhancementOptions): string {
  const POOL_MODE_PROMPTS: Record<string, string> = {
    'clean-water': 'Make the pool water crystal clear turquoise blue. Clean, inviting water with natural light reflections and visible pool floor.',
    'luxury-upgrade': 'Enhance the pool area to luxury resort style. Crystal clear blue water, clean pristine pool deck, lush landscaping around pool.',
    'add-pool': 'Add a rectangular in-ground swimming pool with crystal clear turquoise water to the backyard. Include a clean concrete pool deck around it.',
  };

  const POOL_ELEMENT_PROMPTS: Record<string, string> = {
    'lounge-chairs': 'Add stylish poolside lounge chairs with cushions.',
    'umbrella': 'Add a large patio umbrella providing shade near the pool.',
    'hot-tub': 'Add a built-in hot tub/spa adjacent to the pool.',
    'pool-lighting': 'Add underwater LED pool lighting and ambient deck lighting.',
    'outdoor-kitchen': 'Add an outdoor kitchen/BBQ area near the pool.',
    'fire-pit': 'Add a modern fire pit seating area near the pool.',
    'water-features': 'Add water features like a waterfall or fountain built into the pool edge.',
    'pool-fence': 'Add a glass or wrought iron safety fence around the pool.',
    'cabana': 'Add a poolside cabana with curtains for shade and privacy.',
    'landscaping': 'Add lush tropical landscaping with palms and flowering plants around the pool area.',
    'deck-upgrade': 'Upgrade the pool deck to premium travertine or natural stone pavers.',
    'diving-board': 'Add a diving board at the deep end of the pool.',
  };

  let prompt = POOL_MODE_PROMPTS[options.mode];

  if (options.elements.length > 0) {
    const elementPrompts = options.elements.map(e => POOL_ELEMENT_PROMPTS[e]).join(' ');
    prompt += ` ${elementPrompts}`;
  }

  prompt += ' Keep the house architecture and surrounding structures exactly the same. Only change the pool and immediate pool area. Photorealistic, professional real estate photography.';

  return prompt;
}

/**
 * Build the prompt for Auto Declutter
 */
// Object-removal model expects a list of OBJECTS to remove (not instructions).
// The model auto-detects and removes these objects from the image.
const DECLUTTER_LEVEL_PROMPTS: Record<DeclutterLevel, string> = {
  'light': 'clutter, mess, scattered items, items on floor, items on countertops, trash, loose papers, random objects',
  'medium': 'clutter, personal items, scattered objects, toys, blocks, figurines, balls, items on floor, items on countertops, items on tables, personal photos, picture frames, fridge magnets, toiletries, mail, shoes, bags, mess, small objects, papers, books',
  'deep': 'all objects on floor, all items on surfaces, all items on countertops, all items on tables, all items on shelves, toys, blocks, figurines, balls, books, magazines, electronics, lamps, decorations, photos, frames, art, bags, shoes, coats, bottles, jars, plants, candles, clutter, personal items, small objects, everything except large furniture',
};

const DECLUTTER_CATEGORY_PROMPTS: Record<DeclutterCategory, string> = {
  'personal-photos': 'personal photos, family photos, picture frames, portraits',
  'toys-kids': 'toys, children toys, blocks, wooden blocks, figurines, dinosaur toys, dolls, balls, train tracks, building sets, stuffed animals, toy vehicles, puzzles, art supplies, crayons, baby items, highchair',
  'pet-items': 'pet bowls, pet food bowls, pet beds, pet toys, litter box, pet crate, dog leash, cat scratching post',
  'countertop-items': 'countertop items, kitchen appliances, utensils, dish rack, jars, bottles, cutting boards, toaster, coffee maker, blender',
  'shoes-coats': 'shoes, boots, sandals, coats, jackets, bags, backpacks, umbrellas, hats',
  'trash-bins': 'trash cans, recycling bins, waste baskets, garbage bags',
  'cords-cables': 'cords, cables, power strips, chargers, extension cords, wires',
  'bathroom-items': 'toiletries, towels, bath products, soap dispensers, toothbrushes, shampoo bottles, bathroom clutter',
  'laundry': 'laundry, clothing piles, drying racks, laundry baskets, hampers, ironing boards',
  'exercise-equipment': 'exercise equipment, treadmill, weights, dumbbells, yoga mats, resistance bands, exercise bike',
  'holiday-decor': 'holiday decorations, Christmas lights, ornaments, wreaths, seasonal decorations',
  'religious-items': 'religious items, religious symbols, altar, religious candles, spiritual decorations',
};

function buildAutoDeclutterPrompt(options: AutoDeclutterOptions): string {
  let prompt = DECLUTTER_LEVEL_PROMPTS[options.level];

  if (options.categories.length > 0) {
    const categoryPrompts = options.categories.map(c => DECLUTTER_CATEGORY_PROMPTS[c]).join(', ');
    prompt += `, ${categoryPrompts}`;
  }

  return prompt;
}

/**
 * Build the prompt for Landscape Design
 */
const LANDSCAPE_STYLE_PROMPTS: Record<LandscapeStyle, string> = {
  'lush-green': 'Enhance landscaping with lush green professional landscaping. Thick healthy lawn, well-maintained shrubs and hedges, mature shade trees, colorful flower beds along walkways and foundation. Neat mulch borders and clean edging.',
  'modern-minimal': 'Redesign landscaping with modern minimalist style. Clean geometric lines, ornamental grasses, drought-tolerant succulents, decorative gravel beds, concrete stepping stones, minimal but sculptural plantings with architectural plants.',
  'tropical': 'Redesign landscaping with tropical style. Palm trees, bird of paradise plants, lush tropical foliage, vibrant flowering bushes, ferns, large leafy plants, warm and exotic resort-like feel.',
  'cottage-garden': 'Redesign landscaping with English cottage garden style. Abundant mixed flower beds with roses, lavender, hydrangeas, winding stone pathways, climbing vines on fences, charming and slightly wild natural look with rich colors.',
  'desert-xeriscape': 'Redesign landscaping with desert xeriscape style. Drought-tolerant plants, cacti, agave, desert sage, decorative rock and gravel ground cover, natural stone boulders, minimal water usage aesthetic.',
  'formal-estate': 'Redesign landscaping with formal estate style. Symmetrical design, perfectly trimmed boxwood hedges, manicured topiaries, stone urns with flowers, classic fountain or statue as focal point, elegant and grand.',
};

const ELEMENT_PROMPTS: Record<LandscapeElement, string> = {
  'trees': 'Add mature shade trees strategically placed in the yard.',
  'flower-beds': 'Add colorful flower beds along the foundation and walkways.',
  'pathway': 'Add an attractive stone or paver pathway leading to the front door.',
  'hedges': 'Add neatly trimmed hedges along the property border.',
  'outdoor-lighting': 'Add subtle landscape lighting along pathways and uplighting on trees.',
  'garden-beds': 'Add raised garden beds with mixed plantings.',
  'water-feature': 'Add a small decorative water fountain or birdbath.',
  'planters': 'Add decorative planters with flowers by the front entrance.',
  'retaining-wall': 'Add a natural stone retaining wall with plantings.',
  'pergola': 'Add a wooden or white pergola with climbing vines.',
};

function buildLandscapeDesignPrompt(options: LandscapeDesignOptions): string {
  let prompt = LANDSCAPE_STYLE_PROMPTS[options.style];

  if (options.elements.length > 0) {
    const elementPrompts = options.elements.map(e => ELEMENT_PROMPTS[e]).join(' ');
    prompt += ` ${elementPrompts}`;
  }

  prompt += ' Keep the house architecture, roof, walls, windows, doors, driveway, and structure exactly the same. Only change the landscaping and yard. Photorealistic, professional real estate photography.';

  return prompt;
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
 * Generate Sky Mask using BiRefNet
 * BiRefNet removes the foreground (buildings/trees), leaving transparent background
 * We invert this to get sky=white, buildings=black for inpainting
 */
export async function generateSkyMask(
  imageUrl: string,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Analyzing image for sky detection...');

  // Call BiRefNet for background removal (foreground extraction)
  const result = await secureSubscribe(TOOL_MODEL_MAP['sky-segmentation'], {
    input: {
      image_url: imageUrl,
      model: 'General',
      operating_resolution: '1024x1024',
      output_format: 'png',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(30 + Math.random() * 20), 'Detecting sky area...');
      }
    },
  });

  onProgress?.(60, 'Processing mask...');

  // BiRefNet returns foreground with transparent background
  // We need to invert: sky (was transparent) = white, building (was opaque) = black
  const data = result.data as { image?: { url: string } };
  if (!data?.image?.url) {
    throw new Error('No mask returned from sky segmentation');
  }

  // Return the mask URL - the frontend will need to invert it
  // Or we could do server-side inversion, but for now return as-is
  return data.image.url;
}

/**
 * Virtual Staging Generation (Secure - via Edge Function)
 *
 * Updated parameters based on analysis:
 * - num_images: 3 (generate candidates, pick best)
 * - seed: stored for regeneration
 * - Better prompt wrapper to fix "half room" issue
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
  const model = TOOL_MODEL_MAP['virtual-staging'];

  // Determine output format based on input file type
  const fileExtension = imageFile.name.split('.').pop()?.toLowerCase();
  const outputFormat = (fileExtension === 'png') ? 'png' : 'jpeg';

  const { requestId, data, statusUrl, responseUrl } = await callFalGenerate({
    tool: 'virtual-staging',
    imageUrl,
    prompt,
    options: {
      // Apartment Staging LoRA model parameters
      // Updated based on analysis - generate 3 candidates to fix "half room" issue
      guidance_scale: 2.5,
      num_inference_steps: 40,
      acceleration: 'regular',
      lora_scale: 1.0,
      num_images: 3, // Generate multiple candidates, pick best
      output_format: outputFormat,
    },
  });

  console.log('FAL Generate Response:', JSON.stringify(data, null, 2));

  // Helper to extract image URL from various response formats
  const extractImageUrl = (responseData: any): string | null => {
    if (!responseData) return null;
    // Format: { images: [{ url: "..." }] }
    if (responseData.images?.[0]?.url) return responseData.images[0].url;
    // Format: { images: ["url1", "url2"] }
    if (Array.isArray(responseData.images) && typeof responseData.images[0] === 'string') return responseData.images[0];
    // Format: { output: { images: [...] } }
    if (responseData.output?.images?.[0]?.url) return responseData.output.images[0].url;
    if (responseData.output?.images?.[0] && typeof responseData.output.images[0] === 'string') return responseData.output.images[0];
    // Format: { image: { url: "..." } }
    if (responseData.image?.url) return responseData.image.url;
    // Format: { image_url: "..." }
    if (responseData.image_url) return responseData.image_url;
    // Format: { url: "..." }
    if (responseData.url) return responseData.url;
    return null;
  };

  // If we got immediate result
  const immediateUrl = extractImageUrl(data);
  if (immediateUrl) {
    onProgress?.(100, 'Complete');
    return immediateUrl;
  }

  // Otherwise poll for result
  onProgress?.(50, 'Generating staged room...');
  const result = await pollFalStatus(requestId, model, statusUrl, responseUrl);

  console.log('FAL Poll Result:', JSON.stringify(result, null, 2));

  onProgress?.(100, 'Complete');
  const resultUrl = extractImageUrl(result);
  if (resultUrl) {
    return resultUrl;
  }
  throw new Error('No image returned from generation');
}

/**
 * Photo Enhancement Generation
 *
 * Preset-specific processing based on ChatGPT analysis for MLS-safe results:
 * - auto: Clarity Upscaler only (safest, MLS-clean)
 * - bright: ICLight → Clarity Upscaler (interior boost)
 * - vivid: Clarity Upscaler with higher sharpness (marketing use)
 * - hdr: ICLight → Clarity Upscaler (balanced lighting)
 */
export async function generatePhotoEnhancement(
  imageFile: File,
  options: PhotoEnhancementOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(5, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'photo-enhancement');
  const preset = options.preset || 'auto';

  // Preset-specific parameters for clarity-upscaler
  // Based on ChatGPT analysis for MLS-safe results:
  // - upscale_factor: actual param name (not "scale")
  // - resemblance: how much to preserve original (0.70-0.80)
  // - creativity: how much to enhance (lower = safer)
  // - face_enhance: always false for real estate
  const presetConfigs = {
    auto: {
      upscale_factor: options.upscaleFactor || 2,
      creativity: 0.20,
      resemblance: 0.80,
      guidance_scale: 4,
      num_inference_steps: 20,
      prompt: 'professional real estate photo, natural lighting, clean, sharp details',
    },
    bright: {
      upscale_factor: options.upscaleFactor || 2,
      creativity: 0.22,
      resemblance: 0.78,
      guidance_scale: 4,
      num_inference_steps: 22,
      prompt: 'bright airy interior, natural daylight, professional real estate photo',
    },
    vivid: {
      upscale_factor: options.upscaleFactor || 2,
      creativity: 0.32, // Higher for color pop but still conservative
      resemblance: 0.75,
      guidance_scale: 4.5,
      num_inference_steps: 24,
      prompt: 'vibrant professional real estate photo, enhanced colors, sharp details',
    },
    hdr: {
      upscale_factor: options.upscaleFactor || 2,
      creativity: 0.20,
      resemblance: 0.80,
      guidance_scale: 4,
      num_inference_steps: 22,
      prompt: 'HDR real estate photo, balanced shadows and highlights, professional quality',
    },
  };

  const config = presetConfigs[preset];
  let currentImageUrl = imageUrl;

  // For 'bright' and 'hdr' presets, run ICLight first for relighting
  if (preset === 'bright' || preset === 'hdr') {
    onProgress?.(20, 'Applying lighting adjustment...');

    const lightingStrength = preset === 'hdr' ? 0.35 : 0.25;
    const lightingPrompt = preset === 'hdr'
      ? 'balanced HDR lighting, recovered shadows and highlights, professional real estate'
      : 'bright airy natural lighting, soft shadows, welcoming interior';

    const relightResult = await secureSubscribe(TOOL_MODEL_MAP['photo-relight'], {
      input: {
        image_url: currentImageUrl,
        prompt: lightingPrompt,
        negative_prompt: 'dark, underexposed, harsh shadows, artificial looking',
        lighting_strength: lightingStrength,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(Math.round(30 + Math.random() * 15), 'Adjusting lighting...');
        }
      },
    });

    const relightData = relightResult.data as { image?: { url: string }; images?: Array<{ url: string }> };
    if (relightData?.image?.url) {
      currentImageUrl = relightData.image.url;
    } else if (relightData?.images?.[0]?.url) {
      currentImageUrl = relightData.images[0].url;
    }

    onProgress?.(50, 'Lighting adjusted, now upscaling...');
  } else {
    onProgress?.(30, 'Enhancing photo...');
  }

  // Run clarity-upscaler (always the final step)
  // Using correct parameter names based on fal.ai documentation
  const result = await secureSubscribe(TOOL_MODEL_MAP['photo-enhancement'], {
    input: {
      image_url: currentImageUrl,
      upscale_factor: config.upscale_factor,
      creativity: config.creativity,
      resemblance: config.resemblance,
      guidance_scale: config.guidance_scale,
      num_inference_steps: config.num_inference_steps,
      prompt: config.prompt,
      negative_prompt: '(worst quality, low quality, blurry, noisy:2)',
      enable_face_enhancement: false, // Always false for real estate
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        const baseProgress = (preset === 'bright' || preset === 'hdr') ? 60 : 40;
        onProgress?.(Math.round(baseProgress + Math.random() * 30), 'Enhancing details...');
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
 *
 * Uses fal-ai/flux-pro/v1/fill which requires a mask.
 * If no mask is provided, auto-generates one using BiRefNet.
 *
 * For best results:
 * - Mask should be sky-only (exclude roofs, chimneys, tree lines)
 * - Feathered edge: 2-8px blur depending on resolution
 * - Slightly erode mask by 1-3px to avoid overwriting rooflines
 * - Mask dimensions must exactly match image dimensions
 *
 * Note: flux-pro/v1/fill does NOT support guidance_scale or num_inference_steps.
 * Prompt discipline + mask quality are the primary levers.
 */
export async function generateSkyReplacement(
  imageFile: File,
  options: SkyReplacementOptions,
  maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(5, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'sky-replacement');

  let maskUrl: string | undefined;

  if (maskCanvas) {
    // Use provided manual mask
    onProgress?.(15, 'Processing sky mask...');
    const maskBlob = await canvasMaskToBlob(maskCanvas);
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    maskUrl = await uploadFile(maskFile, 'sky-replacement-masks');
  } else {
    // Auto-generate sky mask using BiRefNet
    onProgress?.(15, 'Auto-detecting sky area...');

    try {
      // BiRefNet returns foreground with transparent background
      // The transparent area IS the sky - we use this directly as the mask
      maskUrl = await generateSkyMask(imageUrl, (progress, status) => {
        // Scale progress from 15-40%
        const scaledProgress = Math.round(15 + (progress * 0.25));
        onProgress?.(scaledProgress, status || 'Detecting sky...');
      });
      onProgress?.(40, 'Sky mask generated');
    } catch (error) {
      console.warn('Auto sky segmentation failed, proceeding without mask:', error);
      // Continue without mask - results may be less accurate
    }
  }

  onProgress?.(45, 'Replacing sky...');

  const prompt = buildSkyPrompt(options);

  // Use flux-pro/v1/fill for inpainting
  // Parameters based on fal.ai documentation - no guidance_scale/steps support
  const result = await secureSubscribe(TOOL_MODEL_MAP['sky-replacement'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      num_images: 3, // Generate multiple candidates, pick best
      enhance_prompt: false, // Keep stable, predictable results
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(55 + Math.random() * 35), 'Replacing sky...');
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
 * Twilight Conversion Generation (FLUX Kontext Pro)
 *
 * Single high-quality image output with detailed style-specific prompts.
 * Kontext Pro handles the full transformation in one step.
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['twilight'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Adding twilight effects...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) {
    return data.images[0].url;
  }
  if (data?.image?.url) {
    return data.image.url;
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['item-removal'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Filling removed areas...');
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
 * Lawn Enhancement Generation (FLUX Kontext Pro)
 *
 * Single high-quality output with strong transformation prompts.
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['lawn-enhancement'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Enhancing landscape...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) {
    return data.images[0].url;
  }
  if (data?.image?.url) {
    return data.image.url;
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['room-tour'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(options.duration),
      aspect_ratio: '16:9',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(40 + Math.random() * 40), 'Creating room tour video...');
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

    const result = await secureSubscribe(TOOL_MODEL_MAP['declutter'], {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(Math.round(50 + Math.random() * 30), 'Removing clutter...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { image?: { url: string } };
    if (data?.image?.url) return data.image.url;
    throw new Error('No image returned from declutter');
  } else {
    // Auto mode - use Kontext Pro with detailed declutter prompt
    const result = await secureSubscribe('fal-ai/flux-pro/kontext', {
      input: {
        image_url: imageUrl,
        prompt: 'Remove all clutter, personal belongings, and unnecessary small objects from this room. Remove toys, shoes, clothes, papers, magazines, mail, dishes, cups, remote controls, chargers, and any items left on floors, countertops, tables, shelves, and beds. Leave all furniture, large appliances, light fixtures, curtains, and architectural features exactly as they are. The room should look clean, tidy, and move-in ready. Photorealistic, professional real estate photography, well-lit.',
        guidance_scale: 3.5,
        num_inference_steps: 28,
        output_format: 'jpeg',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(Math.round(50 + Math.random() * 30), 'Auto-decluttering...');
        }
      },
    });

    onProgress?.(100, 'Complete');
    const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
    if (data?.images?.[0]?.url) return data.images[0].url;
    if (data?.image?.url) return data.image.url;
    throw new Error('No image returned from auto declutter');
  }
}

/**
 * Virtual Renovation Generation
 */
export async function generateVirtualRenovation(
  imageFile: File,
  options: VirtualRenovationOptions,
  _maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'virtual-renovation');

  onProgress?.(35, 'Generating renovation preview...');

  const prompt = buildVirtualRenovationPrompt(options);

  const result = await secureSubscribe(TOOL_MODEL_MAP['virtual-renovation'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying renovation...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from virtual renovation');
}

/**
 * Wall Color Generation
 */
export async function generateWallColor(
  imageFile: File,
  options: WallColorOptions,
  _maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'wall-color');

  onProgress?.(35, 'Changing wall color...');

  const prompt = buildWallColorPrompt(options);

  const result = await secureSubscribe(TOOL_MODEL_MAP['wall-color'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying new color...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from wall color change');
}

/**
 * Exterior Paint Visualizer Generation
 */
export async function generateExteriorPaint(
  imageFile: File,
  options: ExteriorPaintOptions,
  _maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'exterior-paint');

  onProgress?.(35, 'Changing exterior paint...');

  const prompt = buildExteriorPaintPrompt(options);

  const result = await secureSubscribe(TOOL_MODEL_MAP['exterior-paint'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying exterior paint...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from exterior paint change');
}

/**
 * Floor Replacement Generation
 */
export async function generateFloorReplacement(
  imageFile: File,
  options: FloorReplacementOptions,
  _maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'floor-replacement');

  onProgress?.(35, 'Replacing floor...');

  const prompt = buildFloorReplacementPrompt(options);

  const result = await secureSubscribe(TOOL_MODEL_MAP['floor-replacement'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Installing new floor...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from floor replacement');
}

/**
 * Rain to Shine Generation
 *
 * Updated based on analysis:
 * - Constrained strength (0.55-0.70) for global transformations
 * - Better prompt to preserve scene and architecture
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['rain-to-shine'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Adding sunshine...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from rain to shine conversion');
}

/**
 * Night to Day Generation
 *
 * Updated based on analysis:
 * - Strength 0.60-0.75 with more steps for better quality
 * - Better prompt to preserve shadows direction
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['night-to-day'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Adding daylight...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from night to day conversion');
}

/**
 * Changing Seasons Generation
 *
 * Updated based on analysis:
 * - Lower strength (0.45-0.65) to avoid "too AI" look
 * - Better prompt to preserve house materials
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['changing-seasons'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), `Applying ${options.season} effects...`);
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from season change');
}

/**
 * Pool Enhancement Generation
 */
export async function generatePoolEnhancement(
  imageFile: File,
  options: PoolEnhancementOptions,
  _maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'pool-enhancement');

  onProgress?.(35, 'Enhancing pool...');

  const prompt = buildPoolEnhancementPrompt(options);

  const result = await secureSubscribe(TOOL_MODEL_MAP['pool-enhancement'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Enhancing pool water...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from pool enhancement');
}

/**
 * Landscape Design Generation
 */
export async function generateLandscapeDesign(
  imageFile: File,
  options: LandscapeDesignOptions,
  _maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'landscape-design');

  onProgress?.(35, 'Designing landscape...');

  const prompt = buildLandscapeDesignPrompt(options);

  const result = await secureSubscribe(TOOL_MODEL_MAP['landscape-design'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying landscape design...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from landscape design');
}

/**
 * Auto Declutter Generation
 */
export async function generateAutoDeclutter(
  imageFile: File,
  options: AutoDeclutterOptions,
  _maskCanvas?: HTMLCanvasElement,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(10, 'Uploading image...');

  const imageUrl = await uploadFile(imageFile, 'auto-declutter');

  onProgress?.(35, 'Removing clutter...');

  const prompt = buildAutoDeclutterPrompt(options);

  const result = await secureSubscribe(TOOL_MODEL_MAP['auto-declutter'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 5,
      num_inference_steps: 40,
      output_format: 'jpeg',
      safety_tolerance: '2',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Decluttering room...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from auto declutter');
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

  onProgress?.(30, 'Removing watermarks...');

  const prompt = 'Remove all watermarks, logos, and text overlays from this image. Restore the underlying image content cleanly. Keep everything else exactly the same. Professional photograph, high quality.';

  const result = await secureSubscribe(TOOL_MODEL_MAP['watermark-removal'], {
    input: {
      image_url: imageUrl,
      prompt,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      output_format: 'jpeg',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Removing watermarks...');
      }
    },
  });

  onProgress?.(100, 'Complete');
  const data = result.data as { images?: Array<{ url: string }>; image?: { url: string } };
  if (data?.images?.[0]?.url) return data.images[0].url;
  if (data?.image?.url) return data.image.url;
  throw new Error('No image returned from watermark removal');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['headshot-retouching'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Enhancing portrait...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['hdr-merge'], {
    input: {
      image_url: baseImageUrl,
      scale: 2,
      overlapping_tiles: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Processing HDR...');
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
    '2d-basic': 'simple 2D room layout illustration with basic room outlines',
    '2d-detailed': 'detailed 2D room layout illustration with furniture placement',
    '3d-isometric': '3D isometric room layout illustration with furniture and fixtures',
  };

  let prompt = `Generate a ${styleDescriptions[options.style]} based on this room photo. This is an artistic illustration, not an architectural blueprint.`;
  if (options.includeLabels) prompt += ' Include room labels.';
  prompt += ' Clean professional illustration style, clear lines, visually appealing layout diagram.';

  const result = await secureSubscribe(TOOL_MODEL_MAP['floor-plan'], {
    input: {
      prompt,
      image_url: imageUrl,
      num_inference_steps: 28,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Generating floor plan...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['360-staging'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Adding virtual furniture...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['background-swap'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying new background...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['auto-enhance'], {
    input: {
      image_url: imageUrl,
      scale: options.upscaleFactor || 2,
      overlapping_tiles: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Enhancing details...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['blemish-removal'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Repairing surface...');
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

    const result = await secureSubscribe('fal-ai/bria/eraser', {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(Math.round(50 + Math.random() * 30), 'Removing reflections...');
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

    const result = await secureSubscribe(TOOL_MODEL_MAP['reflection-fix'], {
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
          onProgress?.(Math.round(50 + Math.random() * 30), 'Cleaning reflections...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['interior-enhance'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Enhancing interior details...');
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

    const result = await secureSubscribe('fal-ai/flux-pro/v1/fill', {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
        prompt: 'Blurred license plate, privacy protected, smooth blur effect',
        num_inference_steps: 28,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.(Math.round(50 + Math.random() * 30), 'Applying blur...');
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

    const result = await secureSubscribe(TOOL_MODEL_MAP['license-blur'], {
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
          onProgress?.(Math.round(50 + Math.random() * 30), 'Blurring plate...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['vehicle-360'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(options.duration),
      aspect_ratio: '16:9',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(40 + Math.random() * 40), 'Creating 360° spin video...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['window-tint'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Previewing tint...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['spot-removal'], {
    input: {
      image_url: imageUrl,
      mask_url: maskUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(50 + Math.random() * 30), 'Cleaning surface...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['shadow-enhancement'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Enhancing shadows...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['number-plate-mask'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying mask...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['dealer-branding'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying branding...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['paint-color'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Applying new color...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['wheel-customizer'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Installing new wheels...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['vehicle-walkthrough'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(options.duration),
      aspect_ratio: '16:9',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(40 + Math.random() * 40), 'Creating walkthrough...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['social-clips'], {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(Math.min(options.duration, 10)), // Cap at 10s for most video models
      aspect_ratio: aspectRatios[options.platform] || '9:16',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        onProgress?.(Math.round(40 + Math.random() * 40), 'Creating social content...');
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

  const result = await secureSubscribe(TOOL_MODEL_MAP['damage-detection'], {
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
        onProgress?.(Math.round(50 + Math.random() * 30), 'Detecting damage...');
      }
    },
  });

  onProgress?.(100, 'Complete');

  const data = result.data as { images?: Array<{ url: string }> };
  if (data?.images?.[0]?.url) return data.images[0].url;
  throw new Error('No image returned from damage detection');
}

// ============ SOCIAL MEDIA POSTER (Recraft V3) ============

// Platform to Recraft size mapping
const PLATFORM_SIZE_MAP: Record<SocialMediaPlatform, RecraftImageSize> = {
  'instagram-square': 'square_hd',
  'instagram-portrait': 'portrait_4_3',
  'instagram-story': 'portrait_16_9',
  'facebook-post': 'landscape_16_9',
  'facebook-story': 'portrait_16_9',
  'linkedin-post': 'landscape_16_9',
  'pinterest-pin': 'portrait_4_3',
  'youtube-thumbnail': 'landscape_16_9',
};

// Design style to Recraft style mapping
const DESIGN_STYLE_MAP: Record<DesignStyle, RecraftStyle> = {
  'modern-minimal': 'realistic_image',
  'luxury-elegant': 'realistic_image',
  'bold-colorful': 'digital_illustration',
  'clean-professional': 'realistic_image',
  'vector-flat': 'vector_illustration',
};

// Color theme presets
const COLOR_THEME_MAP: Record<ColorTheme, string[]> = {
  'classic-black': ['#000000', '#FFFFFF', '#333333'],
  'navy-gold': ['#1a365d', '#d4af37', '#FFFFFF'],
  'modern-blue': ['#2563eb', '#1e40af', '#FFFFFF'],
  'elegant-green': ['#065f46', '#10b981', '#FFFFFF'],
  'warm-red': ['#dc2626', '#7f1d1d', '#FFFFFF'],
  'purple-luxury': ['#7c3aed', '#4c1d95', '#FFFFFF'],
  'sunset-orange': ['#ea580c', '#f59e0b', '#FFFFFF'],
  'custom': [],
};

// Poster type headline templates
const POSTER_TYPE_HEADLINES: Record<PosterType, string> = {
  'just-listed': 'JUST LISTED',
  'open-house': 'OPEN HOUSE',
  'price-reduced': 'PRICE REDUCED',
  'sold': 'SOLD',
  'coming-soon': 'COMING SOON',
  'new-listing': 'NEW LISTING',
  'featured': 'FEATURED',
  'luxury': 'LUXURY LIVING',
  'investment': 'INVESTMENT OPPORTUNITY',
  'custom': '',
};

// Design style descriptions for prompt building
const STYLE_DESCRIPTIONS: Record<DesignStyle, string> = {
  'modern-minimal': 'clean minimalist design, lots of white space, modern typography, sleek and contemporary',
  'luxury-elegant': 'luxury high-end design, gold accents, elegant serif fonts, sophisticated and premium feel',
  'bold-colorful': 'bold vibrant design, eye-catching colors, strong contrast, dynamic composition',
  'clean-professional': 'professional real estate marketing design, clean layout, trustworthy and polished',
  'vector-flat': 'flat vector illustration style, geometric shapes, modern icons, clean lines',
};

// Color theme descriptions for prompt building
const COLOR_THEME_DESCRIPTIONS: Record<ColorTheme, string> = {
  'classic-black': 'Use black and white color scheme with elegant contrast',
  'navy-gold': 'Use navy blue and gold color scheme for a luxurious feel',
  'modern-blue': 'Use modern blue tones for a professional tech-forward look',
  'elegant-green': 'Use elegant green tones for an eco-friendly premium feel',
  'warm-red': 'Use warm red tones for an energetic impactful design',
  'purple-luxury': 'Use purple and violet tones for a luxury creative feel',
  'sunset-orange': 'Use warm orange and sunset tones for a welcoming vibrant feel',
  'custom': 'Use the specified custom colors',
};

// Helper to get color description for prompt
function getColorDescription(colorTheme: ColorTheme, customColors?: string[]): string {
  if (colorTheme === 'custom' && customColors && customColors.length > 0) {
    return `Use these specific colors for text and graphics: ${customColors.join(', ')}`;
  }
  return COLOR_THEME_DESCRIPTIONS[colorTheme] || COLOR_THEME_DESCRIPTIONS['classic-black'];
}

// Property type descriptions for prompt
const PROPERTY_TYPE_DESCRIPTIONS: Record<string, string> = {
  'house': 'beautiful modern house exterior with landscaping',
  'condo': 'luxury condominium building with city views',
  'apartment': 'stylish apartment interior or building',
  'townhouse': 'elegant townhouse with architectural details',
  'land': 'scenic vacant land with natural features',
  'commercial': 'professional commercial property',
};

/**
 * Build a prompt for the social media poster
 */
function buildPosterPrompt(options: SocialMediaPosterOptions): string {
  const {
    posterType,
    designStyle,
    colorTheme,
    customColors,
    propertyType,
    headline,
    subtext,
    price,
    address,
    agentName,
    propertyImageUrl,
  } = options;

  // Get color description for prompt
  const colorDescription = getColorDescription(colorTheme, customColors);

  let prompt: string;

  // Different prompt based on whether user uploaded a property image
  if (propertyImageUrl) {
    // Image-to-image with Flux Kontext: Add marketing text overlay to the existing photo
    prompt = `Add professional real estate marketing text overlay to this property photo. ${colorDescription}. Add a stylish banner or text box with`;

    // Add the headline text
    const headlineText = headline || POSTER_TYPE_HEADLINES[posterType];
    if (headlineText) {
      prompt += ` bold text saying "${headlineText}"`;
    }

    // Add price if provided
    if (price) {
      prompt += `, price "${price}"`;
    }

    // Add address if provided
    if (address) {
      prompt += `, location "${address}"`;
    }

    prompt += `. Keep the original property photo clearly visible. ${STYLE_DESCRIPTIONS[designStyle] || STYLE_DESCRIPTIONS['clean-professional']}.`;
    return prompt;
  } else {
    // Text-to-image: Generate a new poster from scratch
    prompt = `Professional real estate social media marketing poster. ${STYLE_DESCRIPTIONS[designStyle] || STYLE_DESCRIPTIONS['clean-professional']}. ${colorDescription}.`;

    // Add property visualization only when not using uploaded image
    if (propertyType) {
      prompt += ` Features ${PROPERTY_TYPE_DESCRIPTIONS[propertyType] || 'attractive property image'}.`;
    }
  }

  // Use custom headline or default from poster type
  const headlineText = headline || POSTER_TYPE_HEADLINES[posterType];
  if (headlineText) {
    prompt += ` Bold headline text at the top says "${headlineText}" in large, prominent letters.`;
  }

  // Add price
  if (price) {
    prompt += ` Price "${price}" displayed prominently.`;
  }

  // Add address/location
  if (address) {
    prompt += ` Address or location text "${address}" shown clearly.`;
  }

  // Add subtext
  if (subtext) {
    prompt += ` Subtext reads "${subtext}".`;
  }

  // Add agent branding
  if (agentName) {
    prompt += ` Agent name "${agentName}" at the bottom.`;
  }

  // Standard quality tags
  prompt += ' High-quality marketing material, professional typography, balanced composition, visually appealing layout.';

  return prompt;
}

/**
 * Build prompt optimized for Ideogram V2 Edit (image-to-image with text)
 * Ideogram excels at rendering clean, readable text on images
 */
function buildIdeogramPosterPrompt(options: SocialMediaPosterOptions): string {
  const {
    posterType,
    designStyle,
    colorTheme,
    customColors,
    headline,
    subtext,
    price,
    address,
    agentName,
    brokerageName,
  } = options;

  // Get the headline text
  const headlineText = headline || POSTER_TYPE_HEADLINES[posterType] || 'JUST LISTED';

  // Get color description
  const colorDescription = getColorDescription(colorTheme, customColors);

  // Build a clear, specific prompt for Ideogram - emphasize NOT changing the image
  let prompt = `IMPORTANT: Do NOT modify or change the property/building in any way. Only add text overlays. Add professional real estate marketing text overlay to this exact property photo without altering the building, colors, or scene.`;

  // Main headline - be very specific about the text
  prompt += ` Add a prominent banner or text box at the top with the text "${headlineText}" in bold, large letters.`;

  // Price - if provided
  if (price) {
    prompt += ` Display the price "${price}" prominently below the headline.`;
  }

  // Address - if provided
  if (address) {
    prompt += ` Show the address "${address}" in a readable font.`;
  }

  // Subtext - property details
  if (subtext) {
    prompt += ` Include property details: "${subtext}".`;
  }

  // Agent branding
  if (agentName || brokerageName) {
    const branding = [agentName, brokerageName].filter(Boolean).join(' | ');
    prompt += ` Add agent branding at the bottom: "${branding}".`;
  }

  // Style and color guidance
  prompt += ` ${colorDescription}.`;
  prompt += ` ${STYLE_DESCRIPTIONS[designStyle] || 'Clean professional design'}.`;

  // Key instruction: preserve the property photo exactly
  prompt += ` CRITICAL: The property photo must remain EXACTLY as-is - same building, same colors, same architecture. Only add text elements as overlays. Do not modify the house or property.`;

  return prompt;
}

/**
 * Generate a social media marketing poster using Recraft V3
 * Model: fal-ai/recraft-v3
 */
export async function generateSocialMediaPoster(
  options: SocialMediaPosterOptions,
  maskDataUrl?: string,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  onProgress?.(0, 'Preparing poster generation...');

  // Build prompt
  const prompt = buildPosterPrompt(options);

  // Use different models based on whether an image is provided
  if (options.propertyImageUrl) {
    // IMAGE-TO-IMAGE: Use Ideogram V2 Remix for clean text rendering on images
    onProgress?.(20, 'Adding marketing text to your photo with Ideogram...');

    // Build a prompt optimized for Ideogram text rendering
    const ideogramPrompt = buildIdeogramPosterPrompt(options);

    const result = await callFalGenerate({
      tool: 'social-media-poster-overlay',
      imageUrl: options.propertyImageUrl,
      prompt: ideogramPrompt,
      options: {
        image_weight: 95, // High value to preserve the original property photo
        magic_prompt_option: 'OFF', // Disable magic prompt to prevent unwanted modifications
        style_type: 'DESIGN', // DESIGN style works well for marketing materials
        negative_prompt: 'change building, modify house, alter property, different architecture, new structure, redesign exterior, change colors of building, modify landscape',
      },
    });

    onProgress?.(60, 'Processing result...');

    // Poll for completion if needed - use statusUrl and responseUrl from the API response
    if (result.requestId && !result.data?.images?.[0]?.url) {
      const model = 'fal-ai/ideogram/v2/remix';
      const finalResult = await pollFalStatus(
        result.requestId,
        model,
        result.statusUrl,
        result.responseUrl
      );
      onProgress?.(95, 'Finalizing...');
      const imageUrl = finalResult?.images?.[0]?.url || finalResult?.image?.url;
      if (imageUrl) {
        onProgress?.(100, 'Poster complete!');
        return await safeImageUrl(imageUrl);
      }
      throw new Error('No image in generation result');
    }

    // Direct result
    const imageUrl = result.data?.images?.[0]?.url || result.data?.image?.url;
    if (imageUrl) {
      onProgress?.(100, 'Poster complete!');
      return await safeImageUrl(imageUrl);
    }

    throw new Error('No image in generation result');
  }

  // TEXT-TO-IMAGE: Use Recraft V3 for excellent text rendering
  // Get platform size
  const size = PLATFORM_SIZE_MAP[options.platform] || 'square_hd';

  // Get design style
  const style = DESIGN_STYLE_MAP[options.designStyle] || 'realistic_image';

  // Get colors
  let colors: string[] = [];
  if (options.colorTheme === 'custom' && options.customColors) {
    colors = options.customColors;
  } else {
    colors = COLOR_THEME_MAP[options.colorTheme] || [];
  }

  onProgress?.(20, 'Generating poster design...');

  // Call FAL API through secure Edge Function
  const result = await callFalGenerate({
    tool: 'social-media-poster',
    prompt,
    options: {
      style,
      size,
      colors: colors.length > 0 ? colors : undefined,
    },
  });

  onProgress?.(60, 'Processing result...');

  // Poll for completion if needed - use statusUrl and responseUrl from API response
  if (result.requestId && !result.data?.images?.[0]?.url) {
    const model = TOOL_MODEL_MAP['social-media-poster'];
    const finalResult = await pollFalStatus(
      result.requestId,
      model,
      result.statusUrl,
      result.responseUrl
    );
    onProgress?.(95, 'Finalizing...');
    const imageUrl = finalResult?.images?.[0]?.url || finalResult?.image?.url;
    if (imageUrl) {
      onProgress?.(100, 'Poster complete!');
      return await safeImageUrl(imageUrl);
    }
    throw new Error('No image in generation result');
  }

  // Direct result
  const imageUrl = result.data?.images?.[0]?.url || result.data?.image?.url;
  if (imageUrl) {
    onProgress?.(100, 'Poster complete!');
    return await safeImageUrl(imageUrl);
  }

  throw new Error('No image in generation result');
}

/**
 * Get credits cost for a tool
 */
export function getToolCredits(tool: ToolType): number {
  return TOOL_CREDITS_MAP[tool];
}

/**
 * Check if secure generation is available (Supabase connected)
 * FAL API is now handled server-side via Edge Functions
 */
export function isFalConfigured(): boolean {
  const supabase = createClient();
  return supabase !== null;
}

/**
 * Alias for isFalConfigured - check if secure generation is available
 */
export function isSecureGenerationAvailable(): boolean {
  return isFalConfigured();
}

// ============= PROPERTY REVEAL VIDEOS =============

import type {
  AnimationType,
  AnimationStyle,
  PropertyRevealOptions,
  PropertyRevealResult,
} from '@/lib/types/property-reveal';

import {
  STYLE_MAPS,
  getStyle,
} from '@/lib/types/property-reveal';

/**
 * Build prompt for Room Staging animation
 */
function buildRoomStagingPrompt(style: AnimationStyle): string {
  return `
This exact room from the photo. Maintain all architecture, walls, windows, flooring, and lighting exactly as shown.

A wooden crate appears in the center of the room. The box trembles, then the lid slowly opens.

Furniture and decor rise gracefully from the box: ${style.elements.join(', ')}.

Each piece floats smoothly through the air to its position, then gently settles into place. The movement is choreographed like a ballet - smooth, graceful, and rhythmic. Items appear one by one, not all at once.

The room transforms from empty to a beautifully staged ${style.label}.

CRITICAL REQUIREMENTS:
- Camera remains COMPLETELY STATIC throughout
- Preserve the exact room architecture from the photo
- Keep the same lighting and color temperature
- Furniture should look realistic and properly scaled
- Movement should be slow, elegant, and satisfying
- Final frame looks like professional real estate staging
`.trim();
}

/**
 * Build prompt for Lot to House animation
 */
function buildLotToHousePrompt(style: AnimationStyle): string {
  return `
This empty lot from the photo. Maintain exact terrain, trees, neighboring properties, and surroundings.

A large wooden construction crate sits on the lot. The crate trembles and opens dramatically.

House components rise and fly into position in construction sequence:
${style.elements.map((el, i) => `${i + 1}. ${el}`).join('\n')}

Each component floats gracefully through the air and locks into place. Foundation forms first, then walls rise, structure builds upward, roof sections connect, exterior finishes attach, windows and doors install, final details appear.

The empty lot transforms into a beautiful ${style.label} home.

CRITICAL REQUIREMENTS:
- Camera remains COMPLETELY STATIC throughout
- Preserve exact lot boundaries and surrounding environment
- Components assemble in logical construction order
- Movement is smooth, satisfying, ballet-like choreography
- Final frame looks like a professional real estate listing photo
- House should be properly scaled to the lot
`.trim();
}

/**
 * Build prompt for Exterior Renovation animation
 */
function buildExteriorRenovationPrompt(style: AnimationStyle): string {
  return `
This house from the photo. Keep exact structure, roof shape, and surroundings.

A renovation crate appears in the driveway. It opens and transformation begins.

Renovation elements emerge and apply themselves:
${style.elements.join(', ')}.

Old finishes dissolve away as new materials fly in and attach. Paint spreads smoothly across surfaces, new fixtures mount themselves, upgrades install with satisfying precision.

The dated house transforms into a stunning ${style.label} home.

CRITICAL REQUIREMENTS:
- Camera remains COMPLETELY STATIC
- Preserve exact house structure and footprint
- Old elements fade/dissolve as new ones appear
- Movement is smooth and satisfying
- Transformation feels magical but believable
- Final frame looks like professional after photo
`.trim();
}

/**
 * Build prompt for Landscaping animation
 */
function buildLandscapingPrompt(style: AnimationStyle): string {
  return `
This house with bare yard from the photo. Keep house exactly as shown.

A landscaping crate sits on the bare lawn. It opens and nature emerges.

Landscaping elements float out and arrange themselves:
${style.elements.join(', ')}.

Grass rolls out like carpet, plants rise from the ground and arrange themselves, trees grow into position, pathways assemble stone by stone, lighting stakes into the ground, decorative elements float to their spots.

The bare yard transforms into magazine-worthy ${style.label} curb appeal.

CRITICAL REQUIREMENTS:
- Camera remains COMPLETELY STATIC
- House stays exactly as shown in photo
- Plants and elements properly scaled to yard
- Movement is organic and nature-inspired
- Elements arrange with satisfying choreography
- Final frame looks like professional landscaping photo
`.trim();
}

/**
 * Build prompt for Pool Installation animation
 */
function buildPoolInstallationPrompt(style: AnimationStyle): string {
  return `
This backyard from the photo. Keep house and existing structures exactly as shown.

A large construction crate appears in the yard. It opens dramatically.

Pool and outdoor living elements emerge and construct themselves:
${style.elements.join(', ')}.

The ground opens for the pool, water fills it crystal blue, deck surfaces pour and set, furniture floats into position, plants arrange themselves, lighting installs, water features activate.

The basic backyard transforms into a stunning ${style.label} outdoor oasis.

CRITICAL REQUIREMENTS:
- Camera remains COMPLETELY STATIC
- House and existing structures unchanged
- Pool properly scaled to yard size
- Water appears crystal clear and inviting
- Furniture and decor properly arranged
- Final frame looks like luxury real estate listing
`.trim();
}

/**
 * Build prompt for Interior Renovation animation
 */
function buildInteriorRenovationPrompt(style: AnimationStyle): string {
  return `
This dated room from the photo. Keep room dimensions and window positions.

A renovation crate appears. It opens and transformation begins.

New finishes and fixtures emerge and install themselves:
${style.elements.join(', ')}.

Old surfaces fade away as new materials fly in. Cabinets mount themselves, countertops lower into place, fixtures install, finishes spread across surfaces, lighting illuminates.

The outdated space transforms into a beautiful ${style.label}.

CRITICAL REQUIREMENTS:
- Camera remains COMPLETELY STATIC
- Room structure stays the same
- Old finishes dissolve/fade tastefully
- New elements install in logical order
- Movement is smooth and satisfying
- Final frame looks like renovation after photo
`.trim();
}

/**
 * Build prompt for Seasonal Transform animation
 */
function buildSeasonalPrompt(style: AnimationStyle): string {
  return `
This house from the photo. Keep house exactly as shown.

A festive crate appears. It opens with magical sparkle.

Seasonal decorations float out and arrange themselves:
${style.elements.join(', ')}.

Lights string themselves around the house, decorations fly to their spots, plants bloom instantly, the atmosphere transforms with magical seasonal spirit.

The house transforms into a beautiful ${style.label} display.

CRITICAL REQUIREMENTS:
- Camera remains COMPLETELY STATIC
- House structure unchanged
- Decorations properly scaled and placed
- Magical, whimsical movement
- Festive and inviting atmosphere
- Final frame looks like holiday card photo
`.trim();
}

// Prompt builder map
const CONSTRUCTION_PROMPT_BUILDERS: Record<AnimationType, (style: AnimationStyle) => string> = {
  'room-staging': buildRoomStagingPrompt,
  'lot-to-house': buildLotToHousePrompt,
  'exterior-renovation': buildExteriorRenovationPrompt,
  'landscaping': buildLandscapingPrompt,
  'pool-installation': buildPoolInstallationPrompt,
  'interior-renovation': buildInteriorRenovationPrompt,
  'seasonal-transform': buildSeasonalPrompt,
};

/**
 * Generate Property Reveal Video
 * Model: fal-ai/veo3/image-to-video (Google Veo 3.1)
 */
export async function generatePropertyReveal(
  options: PropertyRevealOptions,
  onProgress?: GenerationProgressCallback
): Promise<PropertyRevealResult> {
  onProgress?.(0, 'Preparing animation...');

  // Get the style
  const style = getStyle(options.animationType, options.styleId);
  if (!style) {
    throw new Error(`Invalid style: ${options.styleId} for type: ${options.animationType}`);
  }

  // Build the prompt
  const promptBuilder = CONSTRUCTION_PROMPT_BUILDERS[options.animationType];
  let prompt = promptBuilder(style);

  // Add audio instructions if enabled
  if (options.withAudio) {
    prompt += '\n\nAudio: Include ambient sounds, construction/assembly sounds, and satisfying settling sounds. End with peaceful silence.';
  }

  onProgress?.(10, 'Starting video generation...');

  // Call FAL API through secure Edge Function
  const result = await callFalGenerate({
    tool: 'property-reveal',
    imageUrl: options.imageUrl,
    prompt,
    options: {
      duration: options.duration,
      generate_audio: options.withAudio,
      aspect_ratio: '16:9',
    },
  });

  onProgress?.(30, 'Processing video...');

  // Poll for completion - video generation can take longer, use 120 attempts (6 min)
  if (result.requestId && !result.data?.video?.url) {
    const model = 'fal-ai/veo3/image-to-video';
    const finalResult = await pollFalStatus(
      result.requestId,
      model,
      result.statusUrl,
      result.responseUrl,
      120
    );

    onProgress?.(95, 'Finalizing...');

    const videoUrl = finalResult?.video?.url;
    if (videoUrl) {
      onProgress?.(100, 'Animation complete!');
      return {
        videoUrl,
        duration: options.duration,
        hasAudio: options.withAudio,
        animationType: options.animationType,
      };
    }
    throw new Error('No video in generation result');
  }

  // Direct result
  const videoUrl = result.data?.video?.url;
  if (videoUrl) {
    onProgress?.(100, 'Animation complete!');
    return {
      videoUrl,
      duration: options.duration,
      hasAudio: options.withAudio,
      animationType: options.animationType,
    };
  }

  throw new Error('No video in generation result');
}

/**
 * Generate a floor mask for furniture placement
 * Creates a gradient mask where white = floor area (where furniture goes)
 */
async function generateFloorMask(
  imageFile: File | null,
  imageUrl: string | null,
  maskType: 'floor' | 'center' | 'full' = 'floor'
): Promise<File> {
  // Load the image to get dimensions
  let img: HTMLImageElement;

  if (imageFile) {
    img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(imageFile);
    });
  } else if (imageUrl) {
    img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });
  } else {
    throw new Error('No image provided for mask generation');
  }

  const width = img.width;
  const height = img.height;

  // Create canvas for mask
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Fill with black (areas to preserve)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // Draw white areas (where furniture will be added)
  ctx.fillStyle = 'white';

  if (maskType === 'floor') {
    // Floor area: bottom 55% with gradient fade at top
    const floorStart = height * 0.45;
    const gradient = ctx.createLinearGradient(0, floorStart, 0, floorStart + height * 0.15);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');

    // Gradient transition
    ctx.fillStyle = gradient;
    ctx.fillRect(0, floorStart, width, height * 0.15);

    // Solid floor area
    ctx.fillStyle = 'white';
    ctx.fillRect(0, floorStart + height * 0.15, width, height);
  } else if (maskType === 'center') {
    // Center area: oval in the middle of the room
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.65, width * 0.4, height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (maskType === 'full') {
    // Full room: everything except walls (top 30%)
    const wallHeight = height * 0.3;
    const gradient = ctx.createLinearGradient(0, wallHeight, 0, wallHeight + height * 0.1);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, wallHeight, width, height * 0.1);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, wallHeight + height * 0.1, width, height);
  }

  // Convert canvas to blob/file
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], 'mask.png', { type: 'image/png' }));
      } else {
        reject(new Error('Failed to create mask'));
      }
    }, 'image/png');
  });
}

/**
 * Custom Furniture Staging - Stage rooms with furniture using inpainting
 * Uses FLUX Pro Fill to preserve room structure and add furniture only in masked areas
 *
 * @param emptyRoomFile - File for the empty room image (or null if using URL)
 * @param emptyRoomUrl - URL for the empty room image (or null if using file)
 * @param furnitureFile - File for the furniture reference image (for style description)
 * @param furnitureUrl - URL for the furniture reference image (for style description)
 * @param options - Staging options (prompt, maskUrl, furnitureArea)
 * @param onProgress - Progress callback
 * @returns URL of the staged image
 */
export async function generateCustomFurnitureStaging(
  emptyRoomFile: File | null,
  emptyRoomUrl: string | null,
  furnitureFile: File | null,
  furnitureUrl: string | null,
  options: CustomFurnitureStagingOptions,
  onProgress?: GenerationProgressCallback
): Promise<string> {
  // Validate inputs
  if (!emptyRoomFile && !emptyRoomUrl) {
    throw new Error('Empty room image is required (either file or URL)');
  }

  onProgress?.(5, 'Preparing images...');

  // Upload room image
  let roomImageUrl = emptyRoomUrl;
  if (emptyRoomFile) {
    onProgress?.(10, 'Uploading empty room image...');
    roomImageUrl = await uploadFile(emptyRoomFile, 'custom-furniture-staging');
  }

  if (!roomImageUrl) {
    throw new Error('Failed to prepare room image URL');
  }

  // Generate or use provided mask
  let maskUrl = options.maskUrl;
  if (!maskUrl) {
    onProgress?.(20, 'Generating furniture placement mask...');
    const maskFile = await generateFloorMask(
      emptyRoomFile,
      emptyRoomUrl,
      options.furnitureArea || 'floor'
    );
    maskUrl = await uploadFile(maskFile, 'custom-furniture-staging-mask');
  }

  onProgress?.(30, 'Processing with AI...');

  // Build a detailed prompt - the furniture reference helps describe what to add
  const defaultPrompt = 'Beautiful living room furniture arrangement: a plush comfortable sofa with throw pillows, elegant coffee table, soft area rug, side tables with decorative lamps, and tasteful wall art. Cohesive interior design, photorealistic, professional real estate photography, natural lighting.';
  const prompt = options.prompt || defaultPrompt;

  const model = TOOL_MODEL_MAP['custom-furniture-staging'];

  const { requestId, data, statusUrl, responseUrl } = await callFalGenerate({
    tool: 'custom-furniture-staging',
    imageUrl: roomImageUrl,
    maskUrl: maskUrl,
    prompt,
    options: {
      mask_url: maskUrl,
      output_format: 'jpeg',
    },
  });

  console.log('FAL Generate Response:', JSON.stringify(data, null, 2));

  // Helper to extract image URL from various response formats
  const extractImageUrl = (responseData: any): string | null => {
    if (!responseData) return null;
    if (responseData.images?.[0]?.url) return responseData.images[0].url;
    if (Array.isArray(responseData.images) && typeof responseData.images[0] === 'string') return responseData.images[0];
    if (responseData.output?.images?.[0]?.url) return responseData.output.images[0].url;
    if (responseData.output?.images?.[0] && typeof responseData.output.images[0] === 'string') return responseData.output.images[0];
    if (responseData.image?.url) return responseData.image.url;
    if (responseData.image_url) return responseData.image_url;
    if (responseData.url) return responseData.url;
    return null;
  };

  // If we got immediate result
  const immediateUrl = extractImageUrl(data);
  if (immediateUrl) {
    onProgress?.(100, 'Complete');
    return immediateUrl;
  }

  // Otherwise poll for result
  onProgress?.(50, 'Adding furniture to room...');
  const result = await pollFalStatus(requestId, model, statusUrl, responseUrl);

  console.log('FAL Poll Result:', JSON.stringify(result, null, 2));

  onProgress?.(100, 'Complete');
  const resultUrl = extractImageUrl(result);
  if (resultUrl) {
    return resultUrl;
  }
  throw new Error('No image returned from generation');
}
