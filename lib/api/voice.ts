/**
 * Voice Synthesis API - Deepgram Aura TTS integration
 *
 * Synthesizes natural voice narration for property videos with:
 * - Multiple voice options
 * - Word-level timing for synchronized captions
 * - R2 storage for audio files
 */

import type {
  PropertyScript,
  SynthesizedVoice,
  WordTiming,
  VoiceConfig,
  SynthesizeVoiceRequest,
  SynthesizeVoiceResponse,
} from '@/lib/types/quick-video-v2';
import { AVAILABLE_VOICES, generateId } from '@/lib/types/quick-video-v2';
import { createClient } from '@/lib/database/client';

/**
 * Deepgram Aura voice models
 * Documentation: https://developers.deepgram.com/docs/tts-models
 */
export const DEEPGRAM_VOICES = AVAILABLE_VOICES;

/**
 * Get voice configuration by ID
 */
export function getVoiceById(voiceId: string): VoiceConfig | null {
  return DEEPGRAM_VOICES.find((v) => v.voiceId === voiceId) || null;
}

/**
 * Combine script segments into full text
 */
function combineScriptText(script: PropertyScript): string {
  return script.segments.map((s) => s.text).join(' ');
}

/**
 * Estimate word timings based on text (fallback when API doesn't provide)
 */
function estimateWordTimings(text: string, totalDuration: number): WordTiming[] {
  const words = text.split(/\s+/).filter(Boolean);
  const avgWordDuration = totalDuration / words.length;

  let currentTime = 0;
  return words.map((word) => {
    const timing: WordTiming = {
      word,
      start: currentTime,
      end: currentTime + avgWordDuration,
    };
    currentTime += avgWordDuration;
    return timing;
  });
}

/**
 * Parse Deepgram word timings from response
 */
function parseDeepgramTimings(
  response: any,
  fallbackText: string,
  fallbackDuration: number
): WordTiming[] {
  try {
    // Deepgram Aura TTS returns word timings in the response
    if (response?.words && Array.isArray(response.words)) {
      return response.words.map((w: any) => ({
        word: w.word || '',
        start: w.start || 0,
        end: w.end || 0,
      }));
    }

    // Fallback to estimation
    return estimateWordTimings(fallbackText, fallbackDuration);
  } catch {
    return estimateWordTimings(fallbackText, fallbackDuration);
  }
}

/**
 * Generate mock voice synthesis (for development/testing)
 */
async function generateMockVoice(
  script: PropertyScript,
  voiceId: string
): Promise<SynthesizedVoice> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const fullText = combineScriptText(script);
  const wordTimings = estimateWordTimings(fullText, script.totalDuration);

  return {
    audioUrl: '/audio/sample-narration.mp3', // Mock URL
    duration: script.totalDuration,
    wordTimings,
    voiceId,
    generatedAt: new Date(),
  };
}

/**
 * Synthesize voice using Deepgram Aura TTS
 */
export async function synthesizeVoice(
  request: SynthesizeVoiceRequest
): Promise<SynthesizeVoiceResponse> {
  const { script, voiceId } = request;

  try {
    const supabase = createClient();

    if (!supabase) {
      console.warn('Supabase not available, using mock voice synthesis');
      const voice = await generateMockVoice(script, voiceId);
      return { success: true, voice };
    }

    const fullText = combineScriptText(script);

    // Call Supabase Edge Function for Deepgram TTS
    const { data, error } = await supabase.functions.invoke('synthesize-voice', {
      body: {
        text: fullText,
        voiceId,
        model: 'aura-asteria-en', // Default model, voiceId overrides
      },
    });

    if (error) {
      console.error('Voice synthesis error:', error);
      const voice = await generateMockVoice(script, voiceId);
      return { success: true, voice };
    }

    // Parse response
    const wordTimings = parseDeepgramTimings(
      data,
      fullText,
      script.totalDuration
    );

    const voice: SynthesizedVoice = {
      audioUrl: data.audioUrl || '/audio/sample-narration.mp3',
      duration: data.duration || script.totalDuration,
      wordTimings,
      voiceId,
      generatedAt: new Date(),
    };

    return { success: true, voice };
  } catch (error) {
    console.error('Voice synthesis failed:', error);

    // Fallback to mock
    const voice = await generateMockVoice(script, voiceId);
    return { success: true, voice };
  }
}

/**
 * Get voice preview audio URL
 */
export async function getVoicePreview(voiceId: string): Promise<string | null> {
  const voice = getVoiceById(voiceId);
  if (!voice) return null;

  // Return cached preview URL if available
  if (voice.previewUrl) return voice.previewUrl;

  try {
    const supabase = createClient();

    if (!supabase) {
      return null;
    }

    // Generate a short preview
    const { data, error } = await supabase.functions.invoke('synthesize-voice', {
      body: {
        text: 'Welcome to this stunning property, where every detail has been carefully considered.',
        voiceId,
        preview: true,
      },
    });

    if (error || !data?.audioUrl) {
      return null;
    }

    return data.audioUrl;
  } catch {
    return null;
  }
}

/**
 * Calculate segment timing offsets
 * Maps word timings back to script segments for synchronized display
 */
export function calculateSegmentTimings(
  script: PropertyScript,
  wordTimings: WordTiming[]
): Map<string, { start: number; end: number }> {
  const segmentTimings = new Map<string, { start: number; end: number }>();

  let wordIndex = 0;
  let currentTime = 0;

  for (const segment of script.segments) {
    const segmentWords = segment.text.split(/\s+/).filter(Boolean);
    const segmentStart = wordTimings[wordIndex]?.start ?? currentTime;

    // Find end of segment
    const lastWordIndex = Math.min(
      wordIndex + segmentWords.length - 1,
      wordTimings.length - 1
    );
    const segmentEnd = wordTimings[lastWordIndex]?.end ?? currentTime + segment.duration;

    segmentTimings.set(segment.id, { start: segmentStart, end: segmentEnd });

    wordIndex += segmentWords.length;
    currentTime = segmentEnd;
  }

  return segmentTimings;
}

/**
 * Get current segment based on playback time
 */
export function getCurrentSegment(
  script: PropertyScript,
  wordTimings: WordTiming[],
  currentTime: number
): string | null {
  const segmentTimings = calculateSegmentTimings(script, wordTimings);

  for (const [segmentId, timing] of segmentTimings) {
    if (currentTime >= timing.start && currentTime < timing.end) {
      return segmentId;
    }
  }

  return null;
}

/**
 * Get visible words up to current time (for animated captions)
 */
export function getVisibleWords(
  wordTimings: WordTiming[],
  currentTime: number
): WordTiming[] {
  return wordTimings.filter((w) => w.start <= currentTime);
}

/**
 * Get currently speaking word (for highlighting)
 */
export function getCurrentWord(
  wordTimings: WordTiming[],
  currentTime: number
): WordTiming | null {
  return wordTimings.find(
    (w) => currentTime >= w.start && currentTime < w.end
  ) || null;
}
