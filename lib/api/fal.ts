/**
 * FAL AI Service Helper (Secure)
 * All FAL API calls go through Supabase Edge Functions
 * NEVER exposes API keys to the browser
 */

import { createClient } from "@/lib/database/client";

// Get authentication token
async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// ==========================================
// Type Definitions
// ==========================================

export type ImageSize = 
  | 'square_hd' 
  | 'square' 
  | 'portrait_4_3' 
  | 'portrait_16_9' 
  | 'landscape_4_3' 
  | 'landscape_16_9';

export interface TextToImageParams {
  prompt: string;
  imageSize?: ImageSize;
  numInferenceSteps?: number; // Default: 28
  guidanceScale?: number; // Default: 3.5
  numImages?: number; // Default: 1
  seed?: number;
  negativePrompt?: string;
  enableSafetyChecker?: boolean; // Default: true
}

export interface ImageToVideoParams {
  imageUrl: string;
  prompt?: string;
  duration?: '5' | '10'; // Default: '5'
  aspectRatio?: '16:9' | '9:16' | '1:1'; // Default: '16:9'
}

export interface InpaintParams {
  imageUrl: string;
  maskUrl: string;
  prompt: string;
  negativePrompt?: string;
  numImages?: number; // Default: 1
  outputFormat?: 'jpeg' | 'png'; // Default: 'jpeg'
  safetyTolerance?: '1' | '2' | '3' | '4' | '5' | '6'; // Default: '2'
}

export interface FalError {
  message: string;
  status?: number;
  code?: string;
}

// ==========================================
// API Functions
// ==========================================

/**
 * Generate Text to Image via secure Edge Function
 * Model: fal-ai/flux/dev
 */
export const generateTextToImage = async (params: TextToImageParams) => {
  const token = await getAuthToken();
  if (!token) throw new Error('Authentication required');

  const supabase = createClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.functions.invoke('fal-generate', {
    body: {
      tool: 'text-to-image',
      prompt: params.prompt,
      options: {
        image_size: params.imageSize || "landscape_16_9",
        num_inference_steps: params.numInferenceSteps || 28,
        guidance_scale: params.guidanceScale || 3.5,
        num_images: params.numImages || 1,
        seed: params.seed,
        negative_prompt: params.negativePrompt,
        enable_safety_checker: params.enableSafetyChecker ?? true,
        model_endpoint: 'fal-ai/flux/dev',
      },
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) {
    console.error("FAL Text-to-Image Error:", error);
    throw error;
  }

  return data;
};

/**
 * Generate Image to Video via secure Edge Function
 * Model: fal-ai/kling-video/v1.5/pro/image-to-video
 */
export const generateImageToVideo = async (params: ImageToVideoParams) => {
  const token = await getAuthToken();
  if (!token) throw new Error('Authentication required');

  const supabase = createClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.functions.invoke('fal-generate', {
    body: {
      tool: 'image-to-video',
      imageUrl: params.imageUrl,
      prompt: params.prompt || "Cinematic motion, high quality, 4k",
      options: {
        duration: params.duration || '5',
        aspect_ratio: params.aspectRatio || '16:9',
        model_endpoint: 'fal-ai/kling-video/v1.5/pro/image-to-video',
      },
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) {
    console.error("FAL Image-to-Video Error:", error);
    throw error;
  }

  return data;
};

/**
 * Generate Inpainting (Fill) via secure Edge Function
 * Model: fal-ai/flux-pro/v1/fill
 */
export const generateInpaint = async (params: InpaintParams) => {
  const token = await getAuthToken();
  if (!token) throw new Error('Authentication required');

  const supabase = createClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.functions.invoke('fal-generate', {
    body: {
      tool: 'virtual-renovation', // Using mapped tool name for 'fill' model
      imageUrl: params.imageUrl,
      maskUrl: params.maskUrl,
      prompt: params.prompt,
      options: {
        negative_prompt: params.negativePrompt,
        num_images: params.numImages || 1,
        output_format: params.outputFormat || 'jpeg',
        safety_tolerance: params.safetyTolerance || '2',
        model_endpoint: 'fal-ai/flux-pro/v1/fill',
      },
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) {
    console.error("FAL Inpaint Error:", error);
    throw error;
  }

  return data;
};

/**
 * Check the status of an async FAL job via secure Edge Function
 */
export const checkStatus = async (requestId: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error('Authentication required');

  const supabase = createClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.functions.invoke('fal-status', {
    body: { requestId },
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) {
    console.error("FAL Status Check Error:", error);
    throw error;
  }

  return data;
};

/**
 * Get the result of a completed FAL job via secure Edge Function
 */
export const getResult = async (requestId: string) => {
  return checkStatus(requestId);
};

/**
 * Check if FAL service is available (Supabase connected)
 */
export const isFalConfigured = (): boolean => {
  const supabase = createClient();
  return supabase !== null;
};