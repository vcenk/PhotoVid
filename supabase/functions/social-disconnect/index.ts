// Social Disconnect Edge Function
// Removes integration and optionally revokes token

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GRAPH_API_VERSION = 'v19.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

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

    // 2. Get request body
    const body = await req.json()
    const { integrationId, revokeToken = false } = body

    if (!integrationId) {
      return new Response(
        JSON.stringify({ error: 'Missing integrationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Create admin client and verify user
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

    // 5. Fetch integration to verify ownership
    const { data: integration, error: fetchError } = await supabaseAdmin
      .from('social_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Integration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Optionally revoke token on Facebook
    if (revokeToken && integration.access_token) {
      try {
        // Revoke user's permissions for this app
        const revokeUrl = `${GRAPH_API_BASE}/${integration.platform_user_id}/permissions?access_token=${integration.access_token}`
        await fetch(revokeUrl, { method: 'DELETE' })
        // We don't check for errors here - if revoke fails, we still delete locally
      } catch (error) {
        console.error('Token revoke error (non-fatal):', error)
      }
    }

    // 7. Delete the integration
    const { error: deleteError } = await supabaseAdmin
      .from('social_integrations')
      .delete()
      .eq('id', integrationId)

    if (deleteError) {
      console.error('Failed to delete integration:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete integration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. If this was a Facebook integration, also delete associated Instagram integration
    if (integration.platform === 'facebook' && integration.page_id) {
      await supabaseAdmin
        .from('social_integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'instagram')
        .eq('page_id', integration.page_id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Integration disconnected successfully',
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
