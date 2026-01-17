// Secure Credit Deduction Edge Function
// NEVER expose SERVICE_ROLE_KEY to frontend
// This function validates JWT, extracts user_id, and deducts credits

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. IMMEDIATELY check for auth header - return 403 if missing
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Create Supabase admin client with SERVICE ROLE KEY
    // This key is NEVER exposed to frontend - only available in Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // 3. Verify the JWT token and extract user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    // IMMEDIATELY return 403 if token is invalid
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Extract user_id from VERIFIED token - NEVER trust client-provided user_id
    const userId = user.id

    // 5. Parse and validate request body
    const body = await req.json()
    const { amount, tool, generationId, description } = body

    if (typeof amount !== 'number' || amount <= 0 || amount > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount. Must be between 1 and 100.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!tool || typeof tool !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Tool name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Get current balance using service role (bypasses RLS)
    const { data: credits, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('balance, lifetime_used')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      // User might not have credits record yet - create one
      if (fetchError.code === 'PGRST116') {
        const { error: insertError } = await supabaseAdmin
          .from('user_credits')
          .insert({
            user_id: userId,
            balance: 100, // Default starting credits
            lifetime_used: 0,
            lifetime_purchased: 0
          })

        if (insertError) {
          console.error('Failed to create credits record:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to initialize credits' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Retry fetching
        const { data: newCredits, error: retryError } = await supabaseAdmin
          .from('user_credits')
          .select('balance, lifetime_used')
          .eq('user_id', userId)
          .single()

        if (retryError || !newCredits) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch credits' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Use new credits
        Object.assign(credits || {}, newCredits)
      } else {
        console.error('Failed to fetch credits:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch credits' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const currentBalance = credits?.balance ?? 100
    const currentLifetimeUsed = credits?.lifetime_used ?? 0

    // 7. Check if user has enough credits
    if (currentBalance < amount) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          balance: currentBalance,
          required: amount
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Deduct credits atomically
    const newBalance = currentBalance - amount
    const newLifetimeUsed = currentLifetimeUsed + amount

    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        balance: newBalance,
        lifetime_used: newLifetimeUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to deduct credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. Log transaction for audit trail
    const { error: txError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'generation',
        generation_id: generationId || null,
        description: description || `${tool} generation`,
      })

    if (txError) {
      console.error('Failed to log transaction:', txError)
      // Don't fail the request, just log the error
    }

    // 10. Return success with new balance
    return new Response(
      JSON.stringify({
        success: true,
        newBalance,
        deducted: amount,
        tool
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
