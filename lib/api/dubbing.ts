/**
 * ElevenLabs Dubbing API Client (Secure)
 * All ElevenLabs API calls go through Supabase Edge Functions
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

/**
 * Check if dubbing client is available (Supabase connected)
 */
export function isDubbingAvailable(): boolean {
  const supabase = createClient();
  return supabase !== null;
}

export interface DubbingOptions {
  sourceLanguage?: string; // Auto-detect if not provided
  targetLanguage: string;
  preserveOriginalVoice?: boolean;
  numSpeakers?: number;
}

export interface DubbingResult {
  dubbingId: string;
  expectedDuration?: number;
}

export interface DubbingStatus {
  status: 'dubbing' | 'dubbed' | 'failed';
  targetLanguages?: string[];
  error?: string;
}

/**
 * Create a new dubbing project
 * Uploads video and starts the dubbing process
 */
export async function createDubbing(
  videoUrl: string,
  options: DubbingOptions
): Promise<DubbingResult> {
  if (!isDubbingAvailable()) {
    throw new Error('Dubbing not available. Supabase not configured.');
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
    console.log(`Creating dubbing: ${options.sourceLanguage || 'auto'} -> ${options.targetLanguage}`);

    const response = await supabase.functions.invoke('elevenlabs-dubbing', {
      body: {
        action: 'create',
        videoUrl,
        sourceLanguage: options.sourceLanguage,
        targetLanguage: options.targetLanguage,
        voiceSettings: {
          preserveOriginalVoice: options.preserveOriginalVoice ?? true,
          numSpeakers: options.numSpeakers,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { data, error } = response;

    console.log('Dubbing response:', { data, error });

    // Check for error in response data (edge function returns error in body)
    if (data?.error) {
      throw new Error(data.error);
    }

    if (error) {
      console.error('Supabase function error:', error);
      // Try to get more details
      throw new Error(error.message || 'Dubbing creation failed');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Dubbing creation failed - no success response');
    }

    return {
      dubbingId: data.dubbingId,
      expectedDuration: data.expectedDuration,
    };
  } catch (error: any) {
    console.error('Failed to create dubbing:', error);
    throw new Error(error.message || 'Failed to create dubbing project');
  }
}

/**
 * Check the status of a dubbing project
 */
export async function checkDubbingStatus(dubbingId: string): Promise<DubbingStatus> {
  if (!isDubbingAvailable()) {
    throw new Error('Dubbing not available. Supabase not configured.');
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
    const { data, error } = await supabase.functions.invoke('elevenlabs-dubbing', {
      body: {
        action: 'status',
        dubbingId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Status check failed');
    }

    return {
      status: data.status,
      targetLanguages: data.targetLanguages,
      error: data.error,
    };
  } catch (error: any) {
    console.error('Failed to check dubbing status:', error);
    throw error;
  }
}

/**
 * Download the dubbed video/audio
 * Returns base64 encoded data
 */
export async function downloadDubbedContent(
  dubbingId: string,
  targetLanguage: string
): Promise<{ contentType: string; data: string }> {
  if (!isDubbingAvailable()) {
    throw new Error('Dubbing not available. Supabase not configured.');
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
    const { data, error } = await supabase.functions.invoke('elevenlabs-dubbing', {
      body: {
        action: 'download',
        dubbingId,
        targetLanguage,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Download failed');
    }

    return {
      contentType: data.contentType,
      data: data.data,
    };
  } catch (error: any) {
    console.error('Failed to download dubbed content:', error);
    throw error;
  }
}

/**
 * Delete a dubbing project
 */
export async function deleteDubbing(dubbingId: string): Promise<void> {
  if (!isDubbingAvailable()) {
    throw new Error('Dubbing not available. Supabase not configured.');
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
    const { error } = await supabase.functions.invoke('elevenlabs-dubbing', {
      body: {
        action: 'delete',
        dubbingId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Delete failed');
    }
  } catch (error: any) {
    console.error('Failed to delete dubbing:', error);
    throw error;
  }
}

/**
 * Poll for dubbing completion
 * Returns when dubbing is complete or fails
 */
export async function waitForDubbing(
  dubbingId: string,
  onProgress?: (status: DubbingStatus) => void,
  maxWaitMs: number = 600000 // 10 minutes default
): Promise<DubbingStatus> {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkDubbingStatus(dubbingId);

    if (onProgress) {
      onProgress(status);
    }

    if (status.status === 'dubbed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Dubbing failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Dubbing timed out');
}

/**
 * Upload a file to R2 for use with dubbing
 */
export async function uploadVideoForDubbing(file: File): Promise<string> {
  console.log('Uploading video for dubbing:', file.name);

  // Import and use R2 upload
  const { uploadToR2 } = await import('./r2');
  const url = await uploadToR2(file, 'dubbing-inputs');
  return url;
}
