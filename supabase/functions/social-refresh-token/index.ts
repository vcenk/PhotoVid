// Social Refresh Token Edge Function
// Refreshes expiring Facebook tokens (run via cron daily)

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
    // 1. Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const facebookAppId = Deno.env.get('FACEBOOK_APP_ID')
    const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET')

    if (!supabaseUrl || !serviceRoleKey || !facebookAppId || !facebookAppSecret) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Verify this is a cron request (optional auth check)
    // In production, you might want to verify a secret header for cron calls
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')

    // If CRON_SECRET is set, validate it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow regular user auth for manual trigger
      if (authHeader) {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false }
        })
        const token = authHeader.replace('Bearer ', '')
        const { error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // 3. Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // 4. Get integrations with tokens expiring within 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: expiringIntegrations, error: queryError } = await supabaseAdmin
      .from('social_integrations')
      .select('*')
      .eq('status', 'active')
      .eq('platform', 'facebook')
      .not('token_expires_at', 'is', null)
      .lte('token_expires_at', sevenDaysFromNow.toISOString())

    if (queryError) {
      console.error('Query error:', queryError)
      return new Response(
        JSON.stringify({ error: 'Failed to query expiring integrations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!expiringIntegrations || expiringIntegrations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No tokens need refreshing',
          refreshed: 0,
          failed: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Refresh each token
    let refreshed = 0
    let failed = 0
    const results: Array<{ id: string; status: string; error?: string }> = []

    for (const integration of expiringIntegrations) {
      try {
        // Exchange for new long-lived token
        const refreshUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
        refreshUrl.searchParams.set('grant_type', 'fb_exchange_token')
        refreshUrl.searchParams.set('client_id', facebookAppId)
        refreshUrl.searchParams.set('client_secret', facebookAppSecret)
        refreshUrl.searchParams.set('fb_exchange_token', integration.access_token)

        const response = await fetch(refreshUrl.toString())
        const data = await response.json()

        if (data.error) {
          console.error(`Token refresh failed for ${integration.id}:`, data.error)

          // Mark as error
          await supabaseAdmin
            .from('social_integrations')
            .update({
              status: 'error',
              error_message: data.error.message || 'Token refresh failed',
            })
            .eq('id', integration.id)

          failed++
          results.push({
            id: integration.id,
            status: 'failed',
            error: data.error.message,
          })
          continue
        }

        // Calculate new expiry
        const expiresIn = data.expires_in || 5184000 // Default 60 days
        const newExpiresAt = new Date(Date.now() + expiresIn * 1000)

        // Update token
        await supabaseAdmin
          .from('social_integrations')
          .update({
            access_token: data.access_token,
            token_expires_at: newExpiresAt.toISOString(),
            last_refreshed_at: new Date().toISOString(),
            status: 'active',
            error_message: null,
          })
          .eq('id', integration.id)

        refreshed++
        results.push({
          id: integration.id,
          status: 'refreshed',
        })

      } catch (error) {
        console.error(`Unexpected error refreshing ${integration.id}:`, error)
        failed++
        results.push({
          id: integration.id,
          status: 'failed',
          error: 'Unexpected error',
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${expiringIntegrations.length} integrations`,
        refreshed,
        failed,
        results,
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
