// Secure FAL AI Generation Edge Function
// Handles all FAL API calls server-side to protect API credentials
// NEVER expose FAL_KEY to frontend
//
// Model Documentation:
// - flux/dev/image-to-image: https://fal.ai/models/fal-ai/flux/dev/image-to-image/api
// - clarity-upscaler: https://fal.ai/models/fal-ai/clarity-upscaler/api
// - bria/eraser: https://fal.ai/models/fal-ai/bria/eraser/api
// - kling-video: https://fal.ai/models/fal-ai/kling-video/v1.5/pro/image-to-video
// - flux-pro/v1/fill: https://fal.ai/models/fal-ai/flux-pro/v1/fill/api
// - flux-pro/kontext: https://fal.ai/models/fal-ai/flux-pro/kontext/api

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FAL model mapping for all tools
const TOOL_MODEL_MAP: Record<string, string> = {
  // Real Estate Tools
  'virtual-staging': 'fal-ai/flux-2-lora-gallery/apartment-staging',
  'photo-enhancement': 'fal-ai/clarity-upscaler',
  'photo-relight': 'fal-ai/iclight-v2', // ICLight for relighting (bright/hdr presets)
  'sky-segmentation': 'fal-ai/birefnet', // Background removal for sky mask
  'sky-replacement': 'fal-ai/flux-pro/v1/fill',
  'twilight': 'fal-ai/flux-pro/kontext',
  'item-removal': 'fal-ai/bria/eraser',
  'lawn-enhancement': 'fal-ai/flux-pro/kontext',
  'room-tour': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  'declutter': 'fal-ai/bria/eraser',
  'auto-declutter': 'fal-ai/image-editing/object-removal',
  'virtual-renovation': 'fal-ai/flux-pro/kontext',
  'wall-color': 'fal-ai/flux-pro/kontext',
  'floor-replacement': 'fal-ai/flux-pro/kontext',
  'rain-to-shine': 'fal-ai/flux-pro/kontext',
  'night-to-day': 'fal-ai/flux-pro/kontext',
  'changing-seasons': 'fal-ai/flux/dev/image-to-image',
  'pool-enhancement': 'fal-ai/flux-pro/kontext',
  'watermark-removal': 'fal-ai/bria/eraser',
  'headshot-retouching': 'fal-ai/flux/dev/image-to-image',
  'hdr-merge': 'fal-ai/clarity-upscaler',
  'floor-plan': 'fal-ai/flux/dev',
  '360-staging': 'fal-ai/flux/dev/image-to-image',
  // Auto Dealership Tools
  'background-swap': 'fal-ai/flux-pro/v1/fill',
  'auto-enhance': 'fal-ai/clarity-upscaler',
  'blemish-removal': 'fal-ai/bria/eraser',
  'reflection-fix': 'fal-ai/flux/dev/image-to-image',
  'interior-enhance': 'fal-ai/flux/dev/image-to-image',
  'license-blur': 'fal-ai/flux/dev/image-to-image',
  'vehicle-360': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  'window-tint': 'fal-ai/flux/dev/image-to-image',
  'spot-removal': 'fal-ai/bria/eraser',
  'shadow-enhancement': 'fal-ai/flux/dev/image-to-image',
  'number-plate-mask': 'fal-ai/flux-pro/v1/fill',
  'dealer-branding': 'fal-ai/flux/dev/image-to-image',
  'paint-color': 'fal-ai/flux/dev/image-to-image',
  'wheel-customizer': 'fal-ai/flux/dev/image-to-image',
  'vehicle-walkthrough': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  'social-clips': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  'damage-detection': 'fal-ai/flux/dev/image-to-image',
  // General tools
  'text-to-image': 'fal-ai/flux/dev',
  'image-to-video': 'fal-ai/kling-video/v1.5/pro/image-to-video',
  'lipsync': 'fal-ai/sync-lipsync/v2',
};

interface GenerationRequest {
  tool: string;
  imageUrl?: string;
  maskUrl?: string;
  prompt?: string;
  options?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
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

    // 2. Validate server configuration
    const FAL_KEY = Deno.env.get('FAL_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!FAL_KEY) {
      console.error('FAL_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: FAL_KEY not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verify user token
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

    // 4. Parse request body
    const body: GenerationRequest = await req.json()
    const { tool, imageUrl, maskUrl, prompt, options = {} } = body

    if (!tool) {
      return new Response(
        JSON.stringify({ error: 'Tool parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const model = TOOL_MODEL_MAP[tool]
    if (!model) {
      return new Response(
        JSON.stringify({ error: `Unknown tool: ${tool}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Build FAL API input based on model type
    // Reference: https://fal.ai/models
    let falInput: Record<string, any> = {}

    if (model.includes('apartment-staging')) {
      // Apartment Staging LoRA - specialized model for virtual staging
      // https://fal.ai/models/fal-ai/flux-2-lora-gallery/apartment-staging
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for virtual staging' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_urls: [imageUrl], // Array of image URLs
        prompt: prompt || options.prompt || 'Furnish this room with modern furniture and decor',
        guidance_scale: options.guidance_scale || 2.5,
        num_inference_steps: options.num_inference_steps || 40,
        acceleration: options.acceleration || 'regular',
        enable_safety_checker: options.enable_safety_checker ?? true,
        output_format: options.output_format || 'png',
        num_images: options.num_images || 1,
        lora_scale: options.lora_scale || 1,
      }
    }
    else if (model.includes('clarity-upscaler')) {
      // Clarity Upscaler - https://fal.ai/models/fal-ai/clarity-upscaler/api
      // Parameters based on analysis: upscale_factor, creativity, resemblance, guidance_scale, num_inference_steps
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for upscaler' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        prompt: prompt || options.prompt || 'masterpiece, best quality, highres, professional photo',
        negative_prompt: options.negative_prompt || '(worst quality, low quality, normal quality:2)',
      }
      // Apply preset-specific parameters with correct names
      if (options.upscale_factor !== undefined) {
        falInput.upscale_factor = options.upscale_factor
      } else if (options.scale !== undefined) {
        falInput.upscale_factor = options.scale // Backwards compatibility
      }
      if (options.creativity !== undefined) {
        falInput.creativity = options.creativity
      }
      if (options.resemblance !== undefined) {
        falInput.resemblance = options.resemblance
      }
      if (options.guidance_scale !== undefined) {
        falInput.guidance_scale = options.guidance_scale
      }
      if (options.num_inference_steps !== undefined) {
        falInput.num_inference_steps = options.num_inference_steps
      }
      // Real estate specific: always disable face enhancement
      falInput.enable_face_enhancement = options.enable_face_enhancement ?? false
    }
    else if (model.includes('iclight')) {
      // ICLight v2 - Relighting model for bright/hdr presets
      // https://fal.ai/models/fal-ai/iclight-v2/api
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for relighting' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        prompt: prompt || options.prompt || 'professional real estate photo, bright natural lighting',
        negative_prompt: options.negative_prompt || 'dark, underexposed, overexposed, harsh shadows',
      }
      // Lighting strength: 0.25 for bright, 0.35 for hdr
      if (options.lighting_strength !== undefined) {
        falInput.lighting_preference = options.lighting_strength > 0.3 ? 'more light' : 'normal'
      }
    }
    else if (model.includes('birefnet')) {
      // BiRefNet - Background removal for sky segmentation
      // https://fal.ai/models/fal-ai/birefnet/api
      // Returns foreground (building) with transparent background - invert for sky mask
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for segmentation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        model: options.model || 'General', // General, Portrait, etc.
        operating_resolution: options.operating_resolution || '1024x1024',
        output_format: options.output_format || 'png',
      }
    }
    else if (model.includes('bria/eraser')) {
      // Bria Eraser - https://fal.ai/models/fal-ai/bria/eraser/api
      // Parameters: image_url, mask_url (both required)
      if (!imageUrl || !maskUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl and maskUrl are required for eraser tools' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        mask_url: maskUrl,
      }
    }
    else if (model.includes('flux-pro/v1/fill')) {
      // FLUX.1 [pro] Fill - https://fal.ai/models/fal-ai/flux-pro/v1/fill/api
      // Parameters: image_url, mask_url, prompt, num_images, output_format, safety_tolerance
      if (!imageUrl || !maskUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl and maskUrl are required for fill/inpainting tools' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        mask_url: maskUrl,
        prompt: prompt || options.prompt || '',
        num_images: options.num_images || 1,
        output_format: options.output_format || 'jpeg',
        safety_tolerance: options.safety_tolerance || '2',
      }
    }
    else if (model.includes('kling-video') || model.includes('image-to-video')) {
      // Kling Video - https://fal.ai/models/fal-ai/kling-video/v1.5/pro/image-to-video
      // Parameters: image_url, prompt, duration (5 or 10), aspect_ratio, cfg_scale, negative_prompt
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for video generation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        prompt: prompt || options.prompt || 'Cinematic camera motion, smooth movement, high quality video',
        duration: options.duration || 5, // 5 or 10 seconds
        aspect_ratio: options.aspect_ratio || '16:9',
        cfg_scale: options.cfg_scale || 0.5, // 0.3-0.5 recommended
      }
      if (options.negative_prompt) {
        falInput.negative_prompt = options.negative_prompt
      }
    }
    else if (model.includes('image-editing/object-removal')) {
      // Image Editing Object Removal - https://fal.ai/models/fal-ai/image-editing/object-removal/api
      // Parameters: image_url, prompt (objects to remove), guidance_scale, num_inference_steps, output_format, safety_tolerance
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for object removal' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        prompt: prompt || options.prompt || 'clutter, personal items, mess',
        guidance_scale: options.guidance_scale ?? 5,
        num_inference_steps: options.num_inference_steps ?? 40,
        output_format: options.output_format || 'jpeg',
        safety_tolerance: options.safety_tolerance || '2',
      }
    }
    else if (model.includes('kontext')) {
      // FLUX Kontext Pro - https://fal.ai/models/fal-ai/flux-pro/kontext/api
      // Parameters: prompt, image_url, guidance_scale, num_inference_steps, output_format
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for Kontext tools' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        prompt: prompt || options.prompt || '',
        guidance_scale: options.guidance_scale ?? 3.5,
        num_inference_steps: options.num_inference_steps ?? 28,
        output_format: options.output_format || 'jpeg',
      }
    }
    else if (model.includes('image-to-image')) {
      // FLUX.1 [dev] Image-to-Image - https://fal.ai/models/fal-ai/flux/dev/image-to-image/api
      // Parameters: image_url, prompt, strength (0-1, default 0.85), num_inference_steps, guidance_scale
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ error: 'imageUrl is required for image-to-image tools' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      falInput = {
        image_url: imageUrl,
        prompt: prompt || options.prompt || '',
        strength: options.strength ?? 0.85, // 0-1, where 1.0 completely remakes, 0 preserves original
        num_inference_steps: options.num_inference_steps || 28,
        guidance_scale: options.guidance_scale || 3.5, // FLUX uses lower guidance (3.5 recommended)
      }
    }
    else if (model.includes('flux/dev') && !model.includes('image-to-image')) {
      // FLUX.1 [dev] Text-to-Image - https://fal.ai/models/fal-ai/flux/dev/api
      // Parameters: prompt, image_size, num_inference_steps, guidance_scale, num_images
      falInput = {
        prompt: prompt || options.prompt || '',
        image_size: options.image_size || 'landscape_16_9',
        num_inference_steps: options.num_inference_steps || 28,
        guidance_scale: options.guidance_scale || 3.5,
        num_images: options.num_images || 1,
      }
      // Add seed for reproducibility if provided
      if (options.seed !== undefined) {
        falInput.seed = options.seed
      }
    }
    else if (model.includes('lipsync')) {
      // Sync Lipsync - https://fal.ai/models/fal-ai/sync-lipsync/v2
      // Parameters: video_url, audio_url
      falInput = {
        video_url: options.video_url || imageUrl,
        audio_url: options.audio_url,
        ...options,
      }
    }

    // Log the request (without sensitive data)
    console.log(`Calling FAL API: ${model}`, {
      tool,
      userId: user.id,
      hasImage: !!imageUrl,
      hasMask: !!maskUrl,
      hasPrompt: !!prompt,
    })
    console.log('FAL Input:', JSON.stringify(falInput, null, 2))

    // 6. Call FAL API
    const falResponse = await fetch(`https://queue.fal.run/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(falInput),
    })

    if (!falResponse.ok) {
      const errorText = await falResponse.text()
      console.error('FAL API Error:', falResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: `FAL AI Error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const falData = await falResponse.json()
    console.log('FAL Response:', JSON.stringify(falData, null, 2))

    // 7. Return the result
    // FAL returns request_id, status_url, response_url for async jobs
    return new Response(
      JSON.stringify({
        success: true,
        data: falData,
        requestId: falData.request_id,
        statusUrl: falData.status_url,
        responseUrl: falData.response_url,
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
