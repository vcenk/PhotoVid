/**
 * Supabase Edge Function: synthesize-voice
 *
 * Synthesizes voice narration using Deepgram Aura TTS
 * Uploads audio to R2 for smooth streaming (avoids base64 stuttering)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const DEEPGRAM_API_KEY = Deno.env.get('DEEPGRAM_API_KEY');
const DEEPGRAM_TTS_URL = 'https://api.deepgram.com/v1/speak';
const DEEPGRAM_STT_URL = 'https://api.deepgram.com/v1/listen';

// R2 Configuration
const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID');
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID');
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY');
const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME');
const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  text: string;
  voiceId?: string;
  model?: string;
  preview?: boolean;
}

/**
 * Estimate word timings based on text (fallback if STT fails)
 */
function estimateWordTimings(
  text: string,
  duration: number
): Array<{ word: string; start: number; end: number }> {
  const words = text.split(/\s+/).filter(Boolean);
  const avgWordDuration = duration / words.length;

  let currentTime = 0;
  return words.map((word) => {
    const timing = {
      word,
      start: currentTime,
      end: currentTime + avgWordDuration,
    };
    currentTime += avgWordDuration;
    return timing;
  });
}

/**
 * Estimate duration from text (words per minute)
 */
function estimateDuration(text: string, wordsPerMinute = 150): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return (wordCount / wordsPerMinute) * 60;
}

/**
 * Get actual word timestamps using Deepgram STT
 * This transcribes the generated audio to get precise word-level timing
 */
async function getActualWordTimings(
  audioUrl: string,
  apiKey: string
): Promise<{
  wordTimings: Array<{ word: string; start: number; end: number }>;
  duration: number;
} | null> {
  try {
    console.log('Getting actual word timestamps via Deepgram STT...');

    // Build STT URL with parameters for word-level timestamps
    const url = new URL(DEEPGRAM_STT_URL);
    url.searchParams.set('model', 'nova-2'); // Best accuracy model
    url.searchParams.set('smart_format', 'true');
    url.searchParams.set('punctuate', 'true');
    url.searchParams.set('utterances', 'true'); // Get utterance-level timing
    url.searchParams.set('diarize', 'false'); // Single speaker

    // Call Deepgram STT API with audio URL
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: audioUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram STT error:', errorText);
      return null;
    }

    const data = await response.json();

    // Extract word timings from response
    const words = data.results?.channels?.[0]?.alternatives?.[0]?.words || [];
    const duration = data.metadata?.duration || 0;

    if (words.length === 0) {
      console.log('No words found in STT response, falling back to estimates');
      return null;
    }

    const wordTimings = words.map((w: { word: string; start: number; end: number }) => ({
      word: w.word,
      start: w.start,
      end: w.end,
    }));

    console.log(`STT returned ${wordTimings.length} word timings, duration: ${duration}s`);
    return { wordTimings, duration };
  } catch (error) {
    console.error('STT error:', error);
    return null;
  }
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Create HMAC-SHA256 signature
 */
async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

/**
 * Create SHA-256 hash
 */
async function sha256(message: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', message);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Get signing key for AWS Signature V4
 */
async function getSigningKey(secretKey: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + secretKey), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return await hmacSha256(kService, 'aws4_request');
}

/**
 * Upload to R2 using AWS Signature V4
 */
async function uploadToR2(audioData: Uint8Array): Promise<string | null> {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    console.log('R2 not configured');
    return null;
  }

  try {
    const filename = `voice-audio/${Date.now()}-${crypto.randomUUID()}.mp3`;
    const host = `${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = `https://${host}/${filename}`;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const region = 'auto';
    const service = 's3';

    const payloadHash = await sha256(audioData);

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = `PUT\n/${filename}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestHash = await sha256(new TextEncoder().encode(canonicalRequest));

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

    const signingKey = await getSigningKey(R2_SECRET_ACCESS_KEY, dateStamp, region, service);
    const signatureBuffer = await hmacSha256(signingKey, stringToSign);
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Host': host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        'Authorization': authorization,
        'Content-Type': 'audio/mpeg',
      },
      body: audioData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('R2 upload failed:', response.status, errorText);
      return null;
    }

    console.log('R2 upload successful:', filename);
    return `${R2_PUBLIC_URL}/${filename}`;
  } catch (error) {
    console.error('R2 upload error:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY not configured');
    }

    const body: RequestBody = await req.json();
    const { text, voiceId = 'aura-asteria-en' } = body;

    if (!text) {
      throw new Error('text is required');
    }

    // Build Deepgram TTS URL with parameters
    const url = new URL(DEEPGRAM_TTS_URL);
    url.searchParams.set('model', voiceId);
    url.searchParams.set('encoding', 'mp3');

    console.log('Calling Deepgram TTS...');

    // Call Deepgram Aura TTS
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram API error: ${errorText}`);
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);

    // Estimate duration (fallback)
    const estimatedDuration = estimateDuration(text);

    // Try to upload to R2 for streaming (fixes stuttering)
    let audioUrl = await uploadToR2(audioData);

    // Fallback to base64 if R2 fails
    if (!audioUrl) {
      console.log('Falling back to base64 audio');
      const base64Audio = arrayBufferToBase64(audioBuffer);
      audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
    }

    // Try to get actual word timings via STT (best sync)
    // Only if we have a proper URL (not base64)
    let wordTimings: Array<{ word: string; start: number; end: number }>;
    let actualDuration = estimatedDuration;

    if (audioUrl && !audioUrl.startsWith('data:')) {
      const sttResult = await getActualWordTimings(audioUrl, DEEPGRAM_API_KEY);
      if (sttResult) {
        wordTimings = sttResult.wordTimings;
        actualDuration = sttResult.duration;
        console.log('Using actual word timings from STT');
      } else {
        // Fallback to estimates
        wordTimings = estimateWordTimings(text, estimatedDuration);
        console.log('Falling back to estimated word timings');
      }
    } else {
      // Base64 URL - can't use STT, use estimates
      wordTimings = estimateWordTimings(text, estimatedDuration);
    }

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        duration: actualDuration,
        wordTimings,
        voiceId,
        usedStt: !audioUrl?.startsWith('data:'), // Indicate if STT was used
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Voice synthesis error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to synthesize voice',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
