// Social Post Edge Function
// Publishes content to Facebook Pages and Instagram Business accounts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GRAPH_API_VERSION = 'v19.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

interface PostRequest {
  integrationId: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  caption: string
  scheduledFor?: string // ISO date string for scheduling
}

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
    const body: PostRequest = await req.json()
    const { integrationId, mediaUrl, mediaType, caption, scheduledFor } = body

    if (!integrationId || !mediaUrl || !mediaType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: integrationId, mediaUrl, mediaType' }),
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

    // 5. Fetch integration
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('social_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', user.id)
      .single()

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Integration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Check integration status
    if (integration.status !== 'active') {
      return new Response(
        JSON.stringify({ error: `Integration is ${integration.status}. Please reconnect.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Check token expiration
    if (integration.token_expires_at) {
      const expiresAt = new Date(integration.token_expires_at)
      if (expiresAt <= new Date()) {
        // Mark as expired
        await supabaseAdmin
          .from('social_integrations')
          .update({ status: 'expired' })
          .eq('id', integrationId)

        return new Response(
          JSON.stringify({ error: 'Token has expired. Please reconnect.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 8. If scheduled, just save the post for later
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor)
      if (scheduledDate <= new Date()) {
        return new Response(
          JSON.stringify({ error: 'Scheduled time must be in the future' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: scheduledPost, error: scheduleError } = await supabaseAdmin
        .from('social_posts')
        .insert({
          user_id: user.id,
          integration_id: integrationId,
          platform: integration.platform,
          post_type: mediaType,
          media_url: mediaUrl,
          caption: caption || '',
          status: 'scheduled',
          scheduled_for: scheduledFor,
        })
        .select()
        .single()

      if (scheduleError) {
        console.error('Failed to schedule post:', scheduleError)
        return new Response(
          JSON.stringify({ error: 'Failed to schedule post' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: 'scheduled',
          postId: scheduledPost.id,
          scheduledFor: scheduledFor,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. Publish immediately based on platform
    let platformPostId: string | null = null
    let publishError: string | null = null

    const accessToken = integration.page_access_token || integration.access_token

    if (integration.platform === 'facebook') {
      // Post to Facebook Page
      const result = await postToFacebook(
        integration.page_id,
        accessToken,
        mediaUrl,
        mediaType,
        caption
      )
      platformPostId = result.postId
      publishError = result.error
    } else if (integration.platform === 'instagram') {
      // Post to Instagram
      const result = await postToInstagram(
        integration.instagram_account_id,
        accessToken,
        mediaUrl,
        mediaType,
        caption
      )
      platformPostId = result.postId
      publishError = result.error
    }

    // 10. Log the post
    const postStatus = publishError ? 'failed' : 'published'
    const { data: postRecord } = await supabaseAdmin
      .from('social_posts')
      .insert({
        user_id: user.id,
        integration_id: integrationId,
        platform: integration.platform,
        post_type: mediaType,
        platform_post_id: platformPostId,
        media_url: mediaUrl,
        caption: caption || '',
        status: postStatus,
        error_message: publishError,
        published_at: publishError ? null : new Date().toISOString(),
      })
      .select()
      .single()

    // 11. Update last_used_at on integration
    await supabaseAdmin
      .from('social_integrations')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', integrationId)

    // 12. Return result
    if (publishError) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'failed',
          error: publishError,
          postId: postRecord?.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: 'published',
        postId: postRecord?.id,
        platformPostId,
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

// Post to Facebook Page
async function postToFacebook(
  pageId: string,
  accessToken: string,
  mediaUrl: string,
  mediaType: 'image' | 'video',
  caption: string
): Promise<{ postId: string | null; error: string | null }> {
  try {
    let endpoint: string
    let body: Record<string, string>

    if (mediaType === 'image') {
      endpoint = `${GRAPH_API_BASE}/${pageId}/photos`
      body = {
        url: mediaUrl,
        message: caption || '',
        access_token: accessToken,
      }
    } else {
      endpoint = `${GRAPH_API_BASE}/${pageId}/videos`
      body = {
        file_url: mediaUrl,
        description: caption || '',
        access_token: accessToken,
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (data.error) {
      console.error('Facebook post error:', data.error)
      return { postId: null, error: data.error.message || 'Failed to post to Facebook' }
    }

    return { postId: data.id || data.post_id, error: null }
  } catch (error) {
    console.error('Facebook post exception:', error)
    return { postId: null, error: 'Failed to post to Facebook' }
  }
}

// Post to Instagram Business Account
async function postToInstagram(
  igAccountId: string,
  accessToken: string,
  mediaUrl: string,
  mediaType: 'image' | 'video',
  caption: string
): Promise<{ postId: string | null; error: string | null }> {
  try {
    // Step 1: Create media container
    const containerEndpoint = `${GRAPH_API_BASE}/${igAccountId}/media`
    const containerBody: Record<string, string> = {
      access_token: accessToken,
      caption: caption || '',
    }

    if (mediaType === 'image') {
      containerBody.image_url = mediaUrl
    } else {
      containerBody.media_type = 'VIDEO'
      containerBody.video_url = mediaUrl
    }

    const containerResponse = await fetch(containerEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerBody),
    })

    const containerData = await containerResponse.json()

    if (containerData.error) {
      console.error('Instagram container error:', containerData.error)
      return { postId: null, error: containerData.error.message || 'Failed to create Instagram media container' }
    }

    const containerId = containerData.id

    // For videos, wait for processing
    if (mediaType === 'video') {
      let status = 'IN_PROGRESS'
      let attempts = 0
      const maxAttempts = 30 // 5 minutes max

      while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
        attempts++

        const statusResponse = await fetch(
          `${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const statusData = await statusResponse.json()
        status = statusData.status_code || 'FINISHED'

        if (statusData.error) {
          return { postId: null, error: 'Video processing failed' }
        }
      }

      if (status === 'IN_PROGRESS') {
        return { postId: null, error: 'Video processing timed out' }
      }

      if (status === 'ERROR') {
        return { postId: null, error: 'Video processing failed' }
      }
    }

    // Step 2: Publish the media container
    const publishEndpoint = `${GRAPH_API_BASE}/${igAccountId}/media_publish`
    const publishResponse = await fetch(publishEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    })

    const publishData = await publishResponse.json()

    if (publishData.error) {
      console.error('Instagram publish error:', publishData.error)
      return { postId: null, error: publishData.error.message || 'Failed to publish to Instagram' }
    }

    return { postId: publishData.id, error: null }
  } catch (error) {
    console.error('Instagram post exception:', error)
    return { postId: null, error: 'Failed to post to Instagram' }
  }
}
