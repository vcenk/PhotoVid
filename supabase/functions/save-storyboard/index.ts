// Secure Save Storyboard Edge Function

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

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    const body = await req.json()
    const { id, projectId, name, propertyData, scenes, settings, totalDuration, status, outputUrl } = body

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Storyboard name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If updating, verify ownership
    if (id) {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('storyboards')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Failed to verify storyboard ownership' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (existing && existing.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: 'Not authorized to update this storyboard' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Upsert storyboard
    const storyboardData = {
      ...(id && { id }),
      user_id: userId,
      project_id: projectId || null,
      name,
      property_data: propertyData || null,
      scenes: scenes || [],
      settings: settings || {},
      total_duration: totalDuration || 0,
      status: status || 'draft',
      output_url: outputUrl || null,
      updated_at: new Date().toISOString()
    }

    const { data: storyboard, error: upsertError } = await supabaseAdmin
      .from('storyboards')
      .upsert(storyboardData, { onConflict: 'id' })
      .select()
      .single()

    if (upsertError) {
      console.error('Failed to save storyboard:', upsertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save storyboard' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, storyboard }),
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
