// Social Publish Scheduled Edge Function
// Publishes scheduled posts when their time has come (run via cron every 5 min)

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

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // 3. Get posts scheduled for now or earlier
    const { data: scheduledPosts, error: queryError } = await supabaseAdmin
      .from('social_posts')
      .select(`
        *,
        integration:social_integrations(*)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())

    if (queryError) {
      console.error('Query error:', queryError)
      return new Response(
        JSON.stringify({ error: 'Failed to query scheduled posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No posts to publish',
          published: 0,
          failed: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Publish each post
    let published = 0
    let failed = 0
    const results: Array<{ id: string; status: string; error?: string }> = []

    for (const post of scheduledPosts) {
      const integration = post.integration

      // Mark as publishing
      await supabaseAdmin
        .from('social_posts')
        .update({ status: 'publishing' })
        .eq('id', post.id)

      // Verify integration is still valid
      if (!integration || integration.status !== 'active') {
        await supabaseAdmin
          .from('social_posts')
          .update({
            status: 'failed',
            error_message: 'Integration is no longer active',
          })
          .eq('id', post.id)

        failed++
        results.push({
          id: post.id,
          status: 'failed',
          error: 'Integration is no longer active',
        })
        continue
      }

      // Check token expiration
      if (integration.token_expires_at) {
        const expiresAt = new Date(integration.token_expires_at)
        if (expiresAt <= new Date()) {
          await supabaseAdmin
            .from('social_posts')
            .update({
              status: 'failed',
              error_message: 'Token has expired',
            })
            .eq('id', post.id)

          await supabaseAdmin
            .from('social_integrations')
            .update({ status: 'expired' })
            .eq('id', integration.id)

          failed++
          results.push({
            id: post.id,
            status: 'failed',
            error: 'Token has expired',
          })
          continue
        }
      }

      // Publish based on platform
      const accessToken = integration.page_access_token || integration.access_token
      let platformPostId: string | null = null
      let publishError: string | null = null

      if (post.platform === 'facebook') {
        const result = await postToFacebook(
          integration.page_id,
          accessToken,
          post.media_url,
          post.post_type,
          post.caption
        )
        platformPostId = result.postId
        publishError = result.error
      } else if (post.platform === 'instagram') {
        const result = await postToInstagram(
          integration.instagram_account_id,
          accessToken,
          post.media_url,
          post.post_type,
          post.caption
        )
        platformPostId = result.postId
        publishError = result.error
      }

      // Update post status
      if (publishError) {
        await supabaseAdmin
          .from('social_posts')
          .update({
            status: 'failed',
            error_message: publishError,
          })
          .eq('id', post.id)

        failed++
        results.push({
          id: post.id,
          status: 'failed',
          error: publishError,
        })
      } else {
        await supabaseAdmin
          .from('social_posts')
          .update({
            status: 'published',
            platform_post_id: platformPostId,
            published_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        // Update integration last_used_at
        await supabaseAdmin
          .from('social_integrations')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', integration.id)

        published++
        results.push({
          id: post.id,
          status: 'published',
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${scheduledPosts.length} posts`,
        published,
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

// Post to Facebook Page
async function postToFacebook(
  pageId: string,
  accessToken: string,
  mediaUrl: string,
  mediaType: string,
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
      return { postId: null, error: data.error.message || 'Failed to post' }
    }

    return { postId: data.id || data.post_id, error: null }
  } catch (error) {
    return { postId: null, error: 'Failed to post to Facebook' }
  }
}

// Post to Instagram
async function postToInstagram(
  igAccountId: string,
  accessToken: string,
  mediaUrl: string,
  mediaType: string,
  caption: string
): Promise<{ postId: string | null; error: string | null }> {
  try {
    // Create container
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

    const containerResponse = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(containerBody),
      }
    )

    const containerData = await containerResponse.json()

    if (containerData.error) {
      return { postId: null, error: containerData.error.message || 'Container creation failed' }
    }

    const containerId = containerData.id

    // For videos, wait for processing
    if (mediaType === 'video') {
      let status = 'IN_PROGRESS'
      let attempts = 0

      while (status === 'IN_PROGRESS' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 10000))
        attempts++

        const statusResponse = await fetch(
          `${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const statusData = await statusResponse.json()
        status = statusData.status_code || 'FINISHED'
      }

      if (status !== 'FINISHED') {
        return { postId: null, error: 'Video processing failed or timed out' }
      }
    }

    // Publish
    const publishResponse = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    )

    const publishData = await publishResponse.json()

    if (publishData.error) {
      return { postId: null, error: publishData.error.message || 'Publish failed' }
    }

    return { postId: publishData.id, error: null }
  } catch (error) {
    return { postId: null, error: 'Failed to post to Instagram' }
  }
}
