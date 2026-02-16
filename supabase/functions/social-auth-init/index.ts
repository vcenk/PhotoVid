// Social Auth Init Edge Function
// Generates Facebook OAuth URL with state parameter for CSRF protection

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Facebook OAuth scopes needed for Pages and Instagram
const FACEBOOK_SCOPES = [
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
].join(',')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Check auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const facebookAppId = Deno.env.get('FACEBOOK_APP_ID')
    const redirectUri = Deno.env.get('SOCIAL_OAUTH_REDIRECT_URI')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!facebookAppId || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Facebook integration not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Create admin client and verify user
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Generate cryptographic state parameter
    const stateBytes = new Uint8Array(32)
    crypto.getRandomValues(stateBytes)
    const state = Array.from(stateBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // 5. Store state in database for validation on callback
    const { error: stateError } = await supabaseAdmin
      .from('social_oauth_states')
      .insert({
        user_id: user.id,
        state: state,
        platform: 'facebook',
        redirect_uri: redirectUri,
      })

    if (stateError) {
      console.error('Failed to store OAuth state:', stateError)
      return new Response(
        JSON.stringify({ error: 'Failed to initialize OAuth' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Build Facebook OAuth URL
    const oauthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
    oauthUrl.searchParams.set('client_id', facebookAppId)
    oauthUrl.searchParams.set('redirect_uri', redirectUri)
    oauthUrl.searchParams.set('scope', FACEBOOK_SCOPES)
    oauthUrl.searchParams.set('state', state)
    oauthUrl.searchParams.set('response_type', 'code')

    // 7. Return OAuth URL
    return new Response(
      JSON.stringify({
        success: true,
        oauthUrl: oauthUrl.toString(),
        state: state,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
