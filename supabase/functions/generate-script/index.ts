/**
 * Supabase Edge Function: generate-script
 *
 * Generates property video narration scripts using OpenAI GPT-4o
 * Supports vision-based image analysis for contextually accurate scripts
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  systemPrompt: string;
  userPrompt: string;
  imageUrls?: string[];  // Optional array of image URLs for vision analysis
  model?: string;
  maxTokens?: number;
}

/**
 * Build message content with images for vision model
 */
function buildVisionContent(userPrompt: string, imageUrls: string[]): Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> {
  const content: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [];

  // Add images first (low detail for cost efficiency)
  for (const url of imageUrls) {
    content.push({
      type: 'image_url',
      image_url: {
        url,
        detail: 'low',  // Use low detail for cost efficiency (~85 tokens per image)
      },
    });
  }

  // Add the text prompt
  content.push({
    type: 'text',
    text: userPrompt,
  });

  return content;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const body: RequestBody = await req.json();
    const {
      systemPrompt,
      userPrompt,
      imageUrls,
      model = 'gpt-4o-mini',
      maxTokens = 1500
    } = body;

    if (!userPrompt) {
      throw new Error('userPrompt is required');
    }

    // Determine if we should use vision
    const useVision = imageUrls && imageUrls.length > 0;

    // Use gpt-4o for vision (gpt-4o-mini also supports vision but gpt-4o is better for this)
    const modelToUse = useVision ? 'gpt-4o' : model;

    // Build the user message content
    const userContent = useVision
      ? buildVisionContent(userPrompt, imageUrls)
      : userPrompt;

    console.log(`Generating script with ${useVision ? imageUrls.length + ' images (vision mode)' : 'text only'}`);

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: userContent },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('Script generated successfully, usage:', data.usage);

    return new Response(
      JSON.stringify({
        success: true,
        content,
        usage: data.usage,
        model: modelToUse,
        visionEnabled: useVision,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Script generation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate script',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
