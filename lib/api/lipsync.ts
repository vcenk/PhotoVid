/**
 * Lipsync Generation API (Secure)
 * All FAL API calls go through Supabase Edge Functions
 * NEVER exposes API keys to the browser
 */

import { createClient } from "@/lib/database/client";
import { LipsyncModelConfig } from '../data/lipsync-models';

// Get authentication token
async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Check if FAL client is available (Supabase connected)
 */
export function initializeFalClient(): boolean {
  const supabase = createClient();
  return supabase !== null;
}

// Generic lipsync generation function
export interface LipsyncInput {
  video_url?: string;
  image_url?: string;
  audio_url?: string;
  text?: string;
  model?: string;
  sync_mode?: string;
}

export interface LipsyncResult {
  video: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  request_id?: string;
}

/**
 * Generate a lipsync video using FAL AI via secure Edge Function
 *
 * @param model - The lipsync model configuration
 * @param input - The input parameters based on the model requirements
 * @returns The generated video result
 */
export async function generateLipsync(
  model: LipsyncModelConfig,
  input: LipsyncInput
): Promise<LipsyncResult> {
  if (!initializeFalClient()) {
    throw new Error('FAL client not initialized. Supabase not configured.');
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Build the request based on model requirements
    const request: Record<string, any> = {};

    if (model.requiredFields.video_url && input.video_url) {
      request.video_url = input.video_url;
    }

    if (model.requiredFields.image_url && input.image_url) {
      request.image_url = input.image_url;
    }

    if (model.requiredFields.audio_url && input.audio_url) {
      request.audio_url = input.audio_url;
    }

    if (model.requiredFields.text && input.text) {
      request.text = input.text;
    }

    if (model.requiredFields.model) {
      request.model = input.model || model.requiredFields.model;
    }

    if (model.requiredFields.sync_mode && input.sync_mode) {
      request.sync_mode = input.sync_mode;
    }

    console.log(`Submitting to ${model.endpoint}:`, request);

    // Call secure Edge Function
    const { data, error } = await supabase.functions.invoke('fal-generate', {
      body: {
        tool: 'lipsync',
        imageUrl: request.image_url,
        options: {
          ...request,
          model_endpoint: model.endpoint,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Lipsync generation failed');
    }

    // If we got immediate result
    if (data?.data?.video) {
      return data.data as LipsyncResult;
    }

    // Otherwise poll for result
    const requestId = data?.requestId;
    if (!requestId) {
      throw new Error('No request ID returned');
    }

    // Poll for completion
    for (let i = 0; i < 120; i++) { // 6 minutes max
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data: statusData, error: statusError } = await supabase.functions.invoke('fal-status', {
        body: {
          requestId,
          model: model.endpoint,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statusError) {
        throw new Error(statusError.message || 'Status check failed');
      }

      console.log('Queue update:', statusData);

      if (statusData.status === 'COMPLETED') {
        return statusData.data as LipsyncResult;
      }

      if (statusData.status === 'FAILED') {
        throw new Error('Lipsync generation failed');
      }
    }

    throw new Error('Lipsync generation timed out');
  } catch (error: any) {
    console.error('Lipsync generation failed:', error);
    throw new Error(error.message || 'Failed to generate lipsync video');
  }
}

/**
 * Upload a file to a temporary URL for use with FAL
 * FAL requires URLs, not file uploads
 *
 * Use uploadToR2 from r2.ts for actual implementation
 */
export async function uploadFileForFal(
  file: File,
  type: 'image' | 'video' | 'audio'
): Promise<string> {
  console.log(`Upload ${type} file:`, file.name);

  // Import and use R2 upload
  const { uploadToR2 } = await import('./r2');
  const url = await uploadToR2(file, `lipsync-inputs/${type}`);
  return url;
}

/**
 * Check the status of a lipsync generation via secure Edge Function
 */
export async function checkLipsyncStatus(requestId: string, model: string = 'fal-ai/sync-lipsync/v2'): Promise<any> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data, error } = await supabase.functions.invoke('fal-status', {
      body: {
        requestId,
        model,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Status check failed');
    }

    return data;
  } catch (error: any) {
    console.error('Failed to check status:', error);
    throw error;
  }
}

/**
 * Get the result of a completed lipsync generation via secure Edge Function
 */
export async function getLipsyncResult(requestId: string, model: string = 'fal-ai/sync-lipsync/v2'): Promise<LipsyncResult> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data, error } = await supabase.functions.invoke('fal-status', {
      body: {
        requestId,
        model,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to get result');
    }

    if (data.status === 'COMPLETED') {
      return data.data as LipsyncResult;
    }

    throw new Error('Result not ready yet');
  } catch (error: any) {
    console.error('Failed to get result:', error);
    throw error;
  }
}
