import * as fal from '@fal-ai/client';
import { LipsyncModelConfig } from '../data/lipsync-models';

// Initialize FAL client with your API key
// Set this in your environment variables: VITE_FAL_KEY
export function initializeFalClient() {
  const apiKey = import.meta.env.VITE_FAL_KEY;
  if (!apiKey) {
    console.warn('FAL API key not found. Set VITE_FAL_KEY in your .env file');
    return false;
  }
  fal.config({
    credentials: apiKey,
  });
  return true;
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
 * Generate a lipsync video using FAL AI
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
    throw new Error('FAL client not initialized. Missing API key.');
  }

  try {
    // Build the request based on model requirements
    const request: any = {};

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

    // Submit to FAL
    console.log(`Submitting to ${model.endpoint}:`, request);

    const result = await fal.subscribe(model.endpoint, {
      input: request,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
      },
    });

    return result as LipsyncResult;
  } catch (error: any) {
    console.error('Lipsync generation failed:', error);
    throw new Error(error.message || 'Failed to generate lipsync video');
  }
}

/**
 * Upload a file to a temporary URL for use with FAL
 * FAL requires URLs, not file uploads
 *
 * You'll need to implement this based on your storage solution (R2, S3, etc.)
 */
export async function uploadFileForFal(
  file: File,
  type: 'image' | 'video' | 'audio'
): Promise<string> {
  // TODO: Implement file upload to your R2/S3 storage
  // For now, return a placeholder
  console.log(`Upload ${type} file:`, file.name);

  // Example using your existing R2 upload function
  // import { uploadToR2 } from './r2';
  // const url = await uploadToR2(file, 'lipsync-inputs');
  // return url;

  throw new Error('File upload not implemented. Please upload to R2 and get URL.');
}

/**
 * Check the status of a lipsync generation
 */
export async function checkLipsyncStatus(requestId: string): Promise<any> {
  try {
    const status = await fal.queue.status(requestId, { logs: true });
    return status;
  } catch (error: any) {
    console.error('Failed to check status:', error);
    throw error;
  }
}

/**
 * Get the result of a completed lipsync generation
 */
export async function getLipsyncResult(requestId: string): Promise<LipsyncResult> {
  try {
    const result = await fal.queue.result(requestId);
    return result as LipsyncResult;
  } catch (error: any) {
    console.error('Failed to get result:', error);
    throw error;
  }
}
