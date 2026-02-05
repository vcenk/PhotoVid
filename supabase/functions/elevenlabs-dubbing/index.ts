// ElevenLabs Dubbing Edge Function
// Handles video dubbing/translation via ElevenLabs API
// NEVER expose ELEVENLABS_API_KEY to frontend
//
// ElevenLabs Dubbing API: https://elevenlabs.io/docs/api-reference/dubbing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DubbingRequest {
  action: 'create' | 'status' | 'download' | 'delete';
  // For 'create' action
  videoUrl?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  voiceSettings?: {
    preserveOriginalVoice?: boolean;
    numSpeakers?: number;
  };
  // For 'status', 'download', 'delete' actions
  dubbingId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('ElevenLabs Dubbing function called')

    // 1. Check auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('Auth header present')

    // 2. Validate server configuration
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: ELEVENLABS_API_KEY not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verify user token
    console.log('Creating Supabase admin client')
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    const token = authHeader.replace('Bearer ', '')
    console.log('Verifying user token')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.log('Auth error:', authError?.message || 'No user found')
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('User verified:', user.id)

    // 4. Parse request body
    console.log('Parsing request body')
    const body: DubbingRequest = await req.json()
    const { action, videoUrl, sourceLanguage, targetLanguage, voiceSettings, dubbingId } = body
    console.log('Request action:', action, 'videoUrl:', videoUrl?.substring(0, 50))

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const baseUrl = 'https://api.elevenlabs.io/v1'
    const headers = {
      'xi-api-key': ELEVENLABS_API_KEY,
    }

    // 5. Handle different actions
    if (action === 'create') {
      // Create a new dubbing project
      if (!videoUrl || !targetLanguage) {
        return new Response(
          JSON.stringify({ error: 'videoUrl and targetLanguage are required for dubbing' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ElevenLabs Dubbing API uses multipart/form-data
      const formData = new FormData()
      formData.append('source_url', videoUrl)
      formData.append('target_lang', targetLanguage)

      if (sourceLanguage) {
        formData.append('source_lang', sourceLanguage)
      }

      // Voice cloning settings
      if (voiceSettings?.numSpeakers) {
        formData.append('num_speakers', voiceSettings.numSpeakers.toString())
      }

      // Watermark - allow for free tier, can be disabled for Creator+ plans
      // formData.append('watermark', 'false')  // Requires Creator+ plan

      // High quality mode - also requires paid plan, commenting out for now
      // formData.append('highest_resolution', 'true')

      console.log(`Creating dubbing: ${sourceLanguage || 'auto'} -> ${targetLanguage}`, {
        userId: user.id,
        videoUrl: videoUrl.substring(0, 50) + '...',
      })

      const response = await fetch(`${baseUrl}/dubbing`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs Dubbing Error:', response.status, errorText)
        return new Response(
          JSON.stringify({ error: `ElevenLabs Error: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await response.json()
      console.log('Dubbing created:', data)

      return new Response(
        JSON.stringify({
          success: true,
          dubbingId: data.dubbing_id,
          expectedDuration: data.expected_duration_sec,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'status') {
      // Check dubbing status
      if (!dubbingId) {
        return new Response(
          JSON.stringify({ error: 'dubbingId is required for status check' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const response = await fetch(`${baseUrl}/dubbing/${dubbingId}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs Status Error:', response.status, errorText)
        return new Response(
          JSON.stringify({ error: `ElevenLabs Error: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await response.json()

      return new Response(
        JSON.stringify({
          success: true,
          status: data.status, // 'dubbing', 'dubbed', 'failed'
          targetLanguages: data.target_languages,
          error: data.error,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'download') {
      // Get dubbed video URL
      if (!dubbingId) {
        return new Response(
          JSON.stringify({ error: 'dubbingId is required for download' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the dubbed file for the target language
      const langCode = targetLanguage || 'en'
      const response = await fetch(`${baseUrl}/dubbing/${dubbingId}/audio/${langCode}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs Download Error:', response.status, errorText)
        return new Response(
          JSON.stringify({ error: `ElevenLabs Error: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return the audio/video file as a blob URL or base64
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      return new Response(
        JSON.stringify({
          success: true,
          contentType: response.headers.get('content-type'),
          data: base64,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'delete') {
      // Delete a dubbing project
      if (!dubbingId) {
        return new Response(
          JSON.stringify({ error: 'dubbingId is required for deletion' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const response = await fetch(`${baseUrl}/dubbing/${dubbingId}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs Delete Error:', response.status, errorText)
        return new Response(
          JSON.stringify({ error: `ElevenLabs Error: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
