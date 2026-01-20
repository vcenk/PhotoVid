// Secure FAL Status Check Edge Function
// Checks the status of FAL AI jobs and retrieves results

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatusRequest {
  requestId: string;
  statusUrl?: string;
  responseUrl?: string;
  model?: string; // Legacy support
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate server configuration
    const FAL_KEY = Deno.env.get('FAL_KEY')

    if (!FAL_KEY) {
      console.error('FAL_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: FAL_KEY not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse request body
    const body: StatusRequest = await req.json()
    const { requestId, statusUrl, responseUrl, model } = body

    console.log('Status request:', { requestId, statusUrl, responseUrl, model })

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'requestId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Build status URL - prefer provided statusUrl, fall back to constructed URL
    let finalStatusUrl = statusUrl
    if (!finalStatusUrl && model) {
      finalStatusUrl = `https://queue.fal.run/${model}/requests/${requestId}/status`
    }
    if (!finalStatusUrl) {
      return new Response(
        JSON.stringify({ error: 'statusUrl or model is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching status from:', finalStatusUrl)

    const statusResponse = await fetch(finalStatusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
      },
    })

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.error('FAL Status Error:', statusResponse.status, errorText)
      return new Response(
        JSON.stringify({
          error: `FAL Status Error: ${statusResponse.status}: ${errorText}`,
          status: 'FAILED'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const statusData = await statusResponse.json()
    console.log('Status data:', JSON.stringify(statusData, null, 2))

    // 4. If completed, get the result
    if (statusData.status === 'COMPLETED') {
      // Check if result is already in statusData (some models include it)
      if (statusData.images || statusData.output || statusData.image) {
        console.log('Result already in status response')
        return new Response(
          JSON.stringify({
            status: 'COMPLETED',
            data: statusData,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Prefer provided responseUrl, fall back to constructed URL
      let finalResponseUrl = responseUrl
      if (!finalResponseUrl && model) {
        finalResponseUrl = `https://queue.fal.run/${model}/requests/${requestId}`
      }

      if (finalResponseUrl) {
        console.log('Fetching result from:', finalResponseUrl)

        const resultResponse = await fetch(finalResponseUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Key ${FAL_KEY}`,
          },
        })

        if (resultResponse.ok) {
          const resultData = await resultResponse.json()
          console.log('Result received:', JSON.stringify(resultData, null, 2).substring(0, 500))
          return new Response(
            JSON.stringify({
              status: 'COMPLETED',
              data: resultData,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          const errorText = await resultResponse.text()
          console.error('FAL Result Error:', errorText)
          return new Response(
            JSON.stringify({
              status: 'FAILED',
              error: `Failed to fetch result: ${errorText}`,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // 5. Return current status
    return new Response(
      JSON.stringify({
        status: statusData.status,
        queuePosition: statusData.queue_position,
        progress: statusData.progress,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
