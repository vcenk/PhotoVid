// Secure Save Project Edge Function
// All project writes go through this function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // 2. Verify token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // 3. Parse request
    const body = await req.json()
    const { id, name, mode, workflowData, thumbnailUrl } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Invalid project name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (mode && !['wizard', 'canvas'].includes(mode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid mode. Must be wizard or canvas.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. If updating existing project, verify ownership
    if (id) {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('projects')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Failed to verify project ownership' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Prevent updating someone else's project
      if (existing && existing.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: 'Not authorized to update this project' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 5. Upsert project
    const projectData = {
      ...(id && { id }),
      user_id: userId, // Always set from verified token
      name,
      mode: mode || 'wizard',
      workflow_data: workflowData || null,
      thumbnail_url: thumbnailUrl || null,
      updated_at: new Date().toISOString()
    }

    const { data: project, error: upsertError } = await supabaseAdmin
      .from('projects')
      .upsert(projectData, { onConflict: 'id' })
      .select()
      .single()

    if (upsertError) {
      console.error('Failed to save project:', upsertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save project' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, project }),
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
