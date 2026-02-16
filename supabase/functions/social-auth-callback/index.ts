// Social Auth Callback Edge Function
// Exchanges OAuth code for tokens, fetches pages and Instagram accounts

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
    const { code, state } = body

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing code or state parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const facebookAppId = Deno.env.get('FACEBOOK_APP_ID')
    const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET')
    const redirectUri = Deno.env.get('SOCIAL_OAUTH_REDIRECT_URI')

    if (!supabaseUrl || !serviceRoleKey || !facebookAppId || !facebookAppSecret || !redirectUri) {
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

    // 5. Validate state parameter (CSRF protection)
    const { data: storedState, error: stateError } = await supabaseAdmin
      .from('social_oauth_states')
      .select('*')
      .eq('state', state)
      .eq('user_id', user.id)
      .single()

    if (stateError || !storedState) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired state parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete used state
    await supabaseAdmin
      .from('social_oauth_states')
      .delete()
      .eq('id', storedState.id)

    // 6. Exchange code for short-lived access token
    const tokenUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
    tokenUrl.searchParams.set('client_id', facebookAppId)
    tokenUrl.searchParams.set('client_secret', facebookAppSecret)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())
    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Facebook token error:', tokenData.error)
      return new Response(
        JSON.stringify({ error: tokenData.error.message || 'Failed to exchange code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const shortLivedToken = tokenData.access_token

    // 7. Exchange for long-lived access token (~60 days)
    const longLivedUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token')
    longLivedUrl.searchParams.set('client_id', facebookAppId)
    longLivedUrl.searchParams.set('client_secret', facebookAppSecret)
    longLivedUrl.searchParams.set('fb_exchange_token', shortLivedToken)

    const longLivedResponse = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedResponse.json()

    if (longLivedData.error) {
      console.error('Long-lived token error:', longLivedData.error)
      return new Response(
        JSON.stringify({ error: 'Failed to get long-lived token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const longLivedToken = longLivedData.access_token
    const expiresIn = longLivedData.expires_in || 5184000 // Default 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

    // 8. Get user info
    const meResponse = await fetch(
      `${GRAPH_API_BASE}/me?fields=id,name&access_token=${longLivedToken}`
    )
    const meData = await meResponse.json()

    if (meData.error) {
      console.error('User info error:', meData.error)
      return new Response(
        JSON.stringify({ error: 'Failed to get user info' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. Get pages the user manages
    const pagesResponse = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=id,name,access_token,picture,instagram_business_account&access_token=${longLivedToken}`
    )
    const pagesData = await pagesResponse.json()

    if (pagesData.error) {
      console.error('Pages error:', pagesData.error)
      return new Response(
        JSON.stringify({ error: 'Failed to get pages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const pages = pagesData.data || []

    if (pages.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No Facebook Pages found. Please make sure you have a Facebook Page and granted the required permissions.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 10. For each page, get Instagram business account details if connected
    const integrations = []

    for (const page of pages) {
      let instagramAccountId = null
      let instagramUsername = null
      let instagramProfilePictureUrl = null

      if (page.instagram_business_account) {
        // Fetch Instagram account details
        const igResponse = await fetch(
          `${GRAPH_API_BASE}/${page.instagram_business_account.id}?fields=id,username,profile_picture_url&access_token=${page.access_token}`
        )
        const igData = await igResponse.json()

        if (!igData.error) {
          instagramAccountId = igData.id
          instagramUsername = igData.username
          instagramProfilePictureUrl = igData.profile_picture_url
        }
      }

      // Upsert Facebook Page integration
      const fbIntegration = {
        user_id: user.id,
        platform: 'facebook',
        platform_user_id: meData.id,
        access_token: longLivedToken,
        token_expires_at: tokenExpiresAt.toISOString(),
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        page_picture_url: page.picture?.data?.url || null,
        instagram_account_id: instagramAccountId,
        instagram_username: instagramUsername,
        instagram_profile_picture_url: instagramProfilePictureUrl,
        status: 'active',
        scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'],
        last_refreshed_at: new Date().toISOString(),
      }

      const { data: savedFb, error: fbError } = await supabaseAdmin
        .from('social_integrations')
        .upsert(fbIntegration, {
          onConflict: 'user_id,platform,page_id',
        })
        .select()
        .single()

      if (fbError) {
        console.error('Error saving FB integration:', fbError)
      } else {
        integrations.push({
          id: savedFb.id,
          platform: 'facebook',
          pageId: page.id,
          pageName: page.name,
          pagePictureUrl: page.picture?.data?.url || null,
          instagramAccountId,
          instagramUsername,
          instagramProfilePictureUrl,
          status: 'active',
          connectedAt: savedFb.connected_at,
        })
      }

      // If Instagram is connected, also create an Instagram integration entry
      if (instagramAccountId) {
        const igIntegration = {
          user_id: user.id,
          platform: 'instagram',
          platform_user_id: instagramAccountId,
          access_token: page.access_token, // Instagram uses page token
          token_expires_at: null, // Page tokens don't expire
          page_id: page.id, // Reference to parent FB page
          page_name: page.name,
          page_access_token: page.access_token,
          instagram_account_id: instagramAccountId,
          instagram_username: instagramUsername,
          instagram_profile_picture_url: instagramProfilePictureUrl,
          status: 'active',
          scopes: ['instagram_basic', 'instagram_content_publish'],
          last_refreshed_at: new Date().toISOString(),
        }

        const { data: savedIg, error: igError } = await supabaseAdmin
          .from('social_integrations')
          .upsert(igIntegration, {
            onConflict: 'user_id,platform,page_id',
          })
          .select()
          .single()

        if (igError) {
          console.error('Error saving IG integration:', igError)
        } else {
          integrations.push({
            id: savedIg.id,
            platform: 'instagram',
            pageId: page.id,
            pageName: page.name,
            instagramAccountId,
            instagramUsername,
            instagramProfilePictureUrl,
            status: 'active',
            connectedAt: savedIg.connected_at,
          })
        }
      }
    }

    // 11. Return success with integrations
    return new Response(
      JSON.stringify({
        success: true,
        message: `Connected ${integrations.length} account(s)`,
        integrations,
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
