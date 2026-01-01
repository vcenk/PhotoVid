import { fal } from "@fal-ai/client";

/**
 * FAL AI Service Helper
 * Handles Image-to-Video and Text-to-Image generations
 */

// Configure FAL client (assumes VITE_FAL_KEY is in .env)
// Note: In a production app, you'd want to handle this via a proxy to protect your key.
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

export const falClient = fal;

export const generateImageToVideo = async (imageUrl: string, prompt?: string) => {
  try {
    const result = await fal.subscribe("fal-ai/kling-video/v1.5/pro/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: prompt || "Cinematic motion, high quality, 4k",
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("FAL Queue Update:", update);
      },
    });
    return result;
  } catch (error) {
    console.error("FAL Generation Error:", error);
    throw error;
  }
};

export const generateTextToImage = async (prompt: string) => {
  const result = await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt: prompt,
    },
  });
  return result;
};

/**
 * Check the status of an async FAL job
 */
export const checkStatus = async (requestId: string) => {
  try {
    const result = await fal.queue.status("fal-ai/kling-video/v1.5/pro/image-to-video", {
      requestId,
      logs: true,
    });
    return result;
  } catch (error) {
    console.error("FAL Status Check Error:", error);
    throw error;
  }
};

/**
 * Get the result of a completed FAL job
 */
export const getResult = async (requestId: string) => {
  try {
    const result = await fal.queue.result("fal-ai/kling-video/v1.5/pro/image-to-video", {
      requestId,
    });
    return result;
  } catch (error) {
    console.error("FAL Result Error:", error);
    throw error;
  }
};
