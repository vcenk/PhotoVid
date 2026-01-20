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

/**
 * Generate Image to Video via secure Edge Function
 */
export const generateImageToVideo = async (imageUrl: string, prompt?: string) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.functions.invoke('fal-generate', {
    body: {
      tool: 'image-to-video',
      imageUrl,
      prompt: prompt || "Cinematic motion, high quality, 4k",
      options: {
        duration: '5',
        aspect_ratio: '16:9',
      },
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error("FAL Generation Error:", error);
    throw error;
  }

  return data;
};

/**
 * Generate Text to Image via secure Edge Function
 */
export const generateTextToImage = async (prompt: string) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.functions.invoke('fal-generate', {
    body: {
      tool: 'text-to-image',
      prompt,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error("FAL Generation Error:", error);
    throw error;
  }

  return data;
};

/**
 * Check the status of an async FAL job via secure Edge Function
 */
export const checkStatus = async (requestId: string) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.functions.invoke('fal-status', {
    body: {
      requestId,
      model: 'fal-ai/kling-video/v1.5/pro/image-to-video',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Use fal-status to get completed result
  const { data, error } = await supabase.functions.invoke('fal-status', {
    body: {
      requestId,
      model: 'fal-ai/kling-video/v1.5/pro/image-to-video',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error("FAL Result Error:", error);
    throw error;
  }

  return data;
};

/**
 * Check if FAL service is available (Supabase connected)
 */
export const isFalConfigured = (): boolean => {
  const supabase = createClient();
  return supabase !== null;
};
