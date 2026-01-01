// Setup instructions:
// 1. Run: npx supabase secrets set FAL_KEY=your_key_here
// 2. Run: npx supabase functions deploy generate-video

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the request body
    const { prompt, imageUrl, motionStyle } = await req.json()
    
    // 2. Validate API Key exists in backend secrets
    const FAL_KEY = Deno.env.get('FAL_KEY')
    if (!FAL_KEY) {
      throw new Error('FAL_KEY not set in backend secrets')
    }

    // 3. Prepare Prompt
    const finalPrompt = `Cinematic ${motionStyle || 'smooth'} motion. ${prompt}`

    // 4. Call FAL AI (Kling Model)
    // Note: We use the 'submit' endpoint to start the job, then 'poll'
    // For simplicity in this Edge Function, we'll return the request_id
    // and let the client poll, OR we can wait here. 
    // Best practice for long-running jobs is to use a queue, but here we will proxy the submit.
    
    const response = await fetch("https://queue.fal.run/fal-ai/kling-video/v1.5/pro/image-to-video", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: finalPrompt,
        aspect_ratio: "16:9"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FAL AI Error: ${errorText}`);
    }

    const data = await response.json();

    // Return the request_id so the frontend can poll for status using the public FAL client
    // OR simply return the result if using a sync endpoint (Kling is async).
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})