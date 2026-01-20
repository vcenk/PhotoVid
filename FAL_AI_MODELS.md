# FAL AI Models Documentation

This document provides comprehensive information about all FAL AI models used in Photovid, including their parameters, credit costs, and tool mappings.

## Table of Contents

- [Models Overview](#models-overview)
- [Real Estate Tools](#real-estate-tools)
- [Auto Dealership Tools](#auto-dealership-tools)
- [Model Details](#model-details)
  - [Clarity Upscaler](#1-clarity-upscaler)
  - [FLUX.1 [dev] Image-to-Image](#2-flux1-dev-image-to-image)
  - [FLUX.1 [pro] Fill (Inpainting)](#3-flux1-pro-fill-inpainting)
  - [BRIA Eraser](#4-bria-eraser)
  - [BiRefNet (Segmentation)](#5-birefnet-segmentation)
  - [ICLight v2 (Relighting)](#6-iclight-v2-relighting)
  - [Apartment Staging LoRA](#7-apartment-staging-lora)
  - [Kling Video](#8-kling-video)
  - [FLUX.1 [dev] Text-to-Image](#9-flux1-dev-text-to-image)
  - [Sync Lipsync v2](#10-sync-lipsync-v2)

---

## Models Overview

| Model | Model ID | Use Case | Credit Range |
|-------|----------|----------|--------------|
| Clarity Upscaler | `fal-ai/clarity-upscaler` | Photo enhancement, HDR merge | 1 credit |
| FLUX.1 [dev] Image-to-Image | `fal-ai/flux/dev/image-to-image` | Twilight, lawn, weather, seasons | 1-2 credits |
| FLUX.1 [pro] Fill | `fal-ai/flux-pro/v1/fill` | Sky replacement, renovation, inpainting | 2-3 credits |
| BRIA Eraser | `fal-ai/bria/eraser` | Item removal, declutter, watermark removal | 1-2 credits |
| BiRefNet | `fal-ai/birefnet` | Sky segmentation, background removal | 1 credit |
| ICLight v2 | `fal-ai/iclight-v2` | Photo relighting (bright/HDR presets) | 1 credit |
| Apartment Staging LoRA | `fal-ai/flux-2-lora-gallery/apartment-staging` | Virtual staging | 2 credits |
| Kling Video | `fal-ai/kling-video/v1.5/pro/image-to-video` | Room tour, vehicle videos | 3-5 credits |
| FLUX.1 [dev] | `fal-ai/flux/dev` | Text-to-image, floor plans | 5 credits |
| Sync Lipsync v2 | `fal-ai/sync-lipsync/v2` | Lipsync video generation | 3 credits |

---

## Real Estate Tools

| Tool | Model | Credits | Description |
|------|-------|---------|-------------|
| `virtual-staging` | Apartment Staging LoRA | 2 | Fill empty rooms with designer furniture |
| `photo-enhancement` | Clarity Upscaler | 1 | One-click HDR, lighting & color correction |
| `photo-relight` | ICLight v2 | 1 | Interior relighting for bright/HDR presets |
| `sky-segmentation` | BiRefNet | 1 | Auto sky mask generation |
| `sky-replacement` | FLUX.1 [pro] Fill | 2 | Replace gray skies with perfect blue |
| `twilight` | FLUX.1 [dev] Image-to-Image | 2 | Transform daytime to dusk photos |
| `item-removal` | BRIA Eraser | 2 | Remove clutter, cars & unwanted objects |
| `lawn-enhancement` | FLUX.1 [dev] Image-to-Image | 2 | Make grass greener & landscaping vibrant |
| `declutter` | BRIA Eraser | 2 | Auto-remove clutter without masking |
| `virtual-renovation` | FLUX.1 [pro] Fill | 3 | Visualize kitchen/bathroom remodels |
| `wall-color` | FLUX.1 [pro] Fill | 2 | Preview different paint colors |
| `floor-replacement` | FLUX.1 [pro] Fill | 2 | Swap hardwood, tile, or carpet styles |
| `rain-to-shine` | FLUX.1 [dev] Image-to-Image | 1 | Convert cloudy/rainy to sunny weather |
| `night-to-day` | FLUX.1 [dev] Image-to-Image | 2 | Convert nighttime exteriors to daylight |
| `changing-seasons` | FLUX.1 [dev] Image-to-Image | 2 | Add spring blooms, fall leaves, or snow |
| `pool-enhancement` | FLUX.1 [pro] Fill | 2 | Add water to empty pools, clarify water |
| `watermark-removal` | BRIA Eraser | 1 | Remove watermarks from images |
| `headshot-retouching` | FLUX.1 [dev] Image-to-Image | 2 | Professional portrait enhancement |
| `hdr-merge` | Clarity Upscaler | 1 | Merge bracketed exposures automatically |
| `room-tour` | Kling Video | 5 | Generate cinematic video from photo |
| `floor-plan` | FLUX.1 [dev] | 5 | Create 2D floor plans from photos |
| `360-staging` | FLUX.1 [dev] Image-to-Image | 5 | Stage panoramic VR photos |

---

## Auto Dealership Tools

| Tool | Model | Credits | Description |
|------|-------|---------|-------------|
| `background-swap` | FLUX.1 [pro] Fill | 2 | Replace backgrounds with showroom/outdoor |
| `auto-enhance` | Clarity Upscaler | 1 | One-click color correction and polish |
| `blemish-removal` | BRIA Eraser | 2 | Remove scratches, dents, imperfections |
| `reflection-fix` | FLUX.1 [dev] Image-to-Image | 2 | Remove unwanted reflections |
| `interior-enhance` | FLUX.1 [dev] Image-to-Image | 2 | Brighten and enhance interior shots |
| `license-blur` | FLUX.1 [dev] Image-to-Image | 1 | Automatically blur license plates |
| `spot-removal` | BRIA Eraser | 2 | Remove dirt spots and minor blemishes |
| `shadow-enhancement` | FLUX.1 [dev] Image-to-Image | 2 | Add professional shadows for depth |
| `number-plate-mask` | FLUX.1 [pro] Fill | 1 | Replace plates with dealer branding |
| `dealer-branding` | FLUX.1 [dev] Image-to-Image | 1 | Add custom dealer logos and overlays |
| `window-tint` | FLUX.1 [dev] Image-to-Image | 2 | Preview different window tint levels |
| `paint-color` | FLUX.1 [dev] Image-to-Image | 2 | Preview different paint colors |
| `wheel-customizer` | FLUX.1 [dev] Image-to-Image | 2 | Preview different wheel styles |
| `vehicle-360` | Kling Video | 5 | Generate rotating vehicle showcase |
| `vehicle-walkthrough` | Kling Video | 5 | Generate interior walkthrough video |
| `social-clips` | Kling Video | 3 | Short-form social video content |
| `damage-detection` | FLUX.1 [dev] Image-to-Image | 3 | AI-powered damage assessment |

---

## Model Details

### 1. Clarity Upscaler

**Model ID:** `fal-ai/clarity-upscaler`
**Documentation:** https://fal.ai/models/fal-ai/clarity-upscaler/api

**Used by:** `photo-enhancement`, `auto-enhance`, `hdr-merge`

#### Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `image_url` | string | *required* | - | Source image URL |
| `upscale_factor` | integer | 2 | 2-4 | Upscaling factor |
| `creativity` | float | 0.20 | 0.0-1.0 | How much to enhance (lower = safer for MLS) |
| `resemblance` | float | 0.80 | 0.0-1.0 | How much to preserve original |
| `guidance_scale` | float | 4.0 | 1.0-10.0 | Prompt adherence strength |
| `num_inference_steps` | integer | 20 | 10-50 | Denoising steps (more = better quality) |
| `prompt` | string | - | - | Enhancement guidance prompt |
| `negative_prompt` | string | - | - | What to avoid |
| `enable_face_enhancement` | boolean | false | - | Enable face enhancement (off for real estate) |

#### Preset Configurations (Photo Enhancement)

| Preset | creativity | resemblance | guidance_scale | steps | Notes |
|--------|------------|-------------|----------------|-------|-------|
| `auto` | 0.20 | 0.80 | 4.0 | 20 | MLS-safe, minimal changes |
| `bright` | 0.22 | 0.78 | 4.0 | 22 | Used after ICLight relighting |
| `vivid` | 0.32 | 0.75 | 4.5 | 24 | Marketing use, enhanced colors |
| `hdr` | 0.20 | 0.80 | 4.0 | 22 | Used after ICLight relighting |

---

### 2. FLUX.1 [dev] Image-to-Image

**Model ID:** `fal-ai/flux/dev/image-to-image`
**Documentation:** https://fal.ai/models/fal-ai/flux/dev/image-to-image/api

**Used by:** `twilight`, `lawn-enhancement`, `rain-to-shine`, `night-to-day`, `changing-seasons`, `headshot-retouching`, `360-staging`, `reflection-fix`, `interior-enhance`, `license-blur`, `shadow-enhancement`, `dealer-branding`, `paint-color`, `wheel-customizer`, `damage-detection`

#### Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `image_url` | string | *required* | - | Source image URL |
| `prompt` | string | *required* | - | Transformation prompt |
| `strength` | float | 0.85 | 0.0-1.0 | How much to change (1.0 = complete remake) |
| `num_inference_steps` | integer | 28 | 10-50 | Denoising steps |
| `guidance_scale` | float | 3.5 | 1.0-10.0 | FLUX uses lower guidance |
| `num_images` | integer | 1 | 1-4 | Number of candidate images |
| `seed` | integer | - | - | Random seed for reproducibility |

#### Tool-Specific Configurations

| Tool | strength | steps | guidance | num_images | Notes |
|------|----------|-------|----------|------------|-------|
| `twilight` | 0.65 | 32 | 7.0 | 3 | Lower strength to avoid over-transformation |
| `lawn-enhancement` (natural) | 0.35 | 28 | 6.5 | 2 | Very conservative |
| `lawn-enhancement` (enhanced) | 0.45 | 28 | 6.5 | 2 | Moderate |
| `lawn-enhancement` (vibrant) | 0.55 | 28 | 6.5 | 2 | More noticeable |
| `rain-to-shine` | 0.50 | 28 | 7.0 | 2 | Weather conversion |
| `changing-seasons` | 0.45 | 28 | 6.5 | 2 | Seasonal transformation |
| `declutter` (auto) | 0.40 | 28 | 3.5 | 1 | Subtle cleanup |

---

### 3. FLUX.1 [pro] Fill (Inpainting)

**Model ID:** `fal-ai/flux-pro/v1/fill`
**Documentation:** https://fal.ai/models/fal-ai/flux-pro/v1/fill/api

**Used by:** `sky-replacement`, `virtual-renovation`, `wall-color`, `floor-replacement`, `pool-enhancement`, `background-swap`, `number-plate-mask`

#### Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `image_url` | string | *required* | - | Source image URL |
| `mask_url` | string | *required* | - | Mask image URL (white = areas to replace) |
| `prompt` | string | *required* | - | What to generate in masked area |
| `num_images` | integer | 1 | 1-4 | Number of candidate images |
| `output_format` | string | "jpeg" | jpeg/png | Output image format |
| `safety_tolerance` | string | "2" | 1-6 | Content safety level |
| `enhance_prompt` | boolean | false | - | Auto-enhance prompt (keep false for stability) |

**Important Notes:**
- Does NOT support `guidance_scale` or `num_inference_steps`
- Prompt quality and mask quality are the primary control levers
- Mask must exactly match image dimensions
- Recommended: 2-8px feather on mask edges

#### Sky Replacement Mask Requirements

- Sky area should be white, buildings/trees should be black
- Slightly erode mask by 1-3px to avoid overwriting rooflines
- Use BiRefNet for auto-generation of sky masks

---

### 4. BRIA Eraser

**Model ID:** `fal-ai/bria/eraser`
**Documentation:** https://fal.ai/models/fal-ai/bria/eraser/api

**Used by:** `item-removal`, `declutter`, `watermark-removal`, `blemish-removal`, `spot-removal`

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `image_url` | string | *required* | Source image URL |
| `mask_url` | string | *required* | Mask image URL (white = areas to remove) |

**Notes:**
- Very simple API - just image and mask
- Mask should have white areas where objects need to be removed
- AI automatically fills in removed areas intelligently
- No additional tuning parameters available

---

### 5. BiRefNet (Segmentation)

**Model ID:** `fal-ai/birefnet`
**Documentation:** https://fal.ai/models/fal-ai/birefnet/api

**Used by:** `sky-segmentation` (internal helper for sky-replacement)

#### Parameters

| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `image_url` | string | *required* | - | Source image URL |
| `model` | string | "General" | General, Portrait, etc. | Segmentation model type |
| `operating_resolution` | string | "1024x1024" | Various | Processing resolution |
| `output_format` | string | "png" | png/jpeg | Output format (png for transparency) |

**Output:**
- Returns foreground (buildings/trees) with transparent background
- Transparent area IS the sky - can be used as-is or inverted for mask

---

### 6. ICLight v2 (Relighting)

**Model ID:** `fal-ai/iclight-v2`
**Documentation:** https://fal.ai/models/fal-ai/iclight-v2/api

**Used by:** `photo-relight` (internal helper for bright/HDR photo enhancement)

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `image_url` | string | *required* | Source image URL |
| `prompt` | string | - | Lighting description |
| `negative_prompt` | string | - | What to avoid |
| `lighting_preference` | string | "normal" | "normal" or "more light" |

#### Usage in Photo Enhancement Pipeline

| Preset | lighting_strength | lighting_preference | Prompt Focus |
|--------|------------------|---------------------|--------------|
| `bright` | 0.25 | "normal" | Bright airy natural lighting |
| `hdr` | 0.35 | "more light" | Balanced HDR, recovered shadows |

---

### 7. Apartment Staging LoRA

**Model ID:** `fal-ai/flux-2-lora-gallery/apartment-staging`
**Documentation:** https://fal.ai/models/fal-ai/flux-2-lora-gallery/apartment-staging

**Used by:** `virtual-staging`

#### Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `image_urls` | array | *required* | - | Array of image URLs |
| `prompt` | string | *required* | - | Staging description |
| `guidance_scale` | float | 2.5 | 1.0-10.0 | Prompt adherence |
| `num_inference_steps` | integer | 40 | 20-50 | Denoising steps |
| `acceleration` | string | "regular" | regular/turbo | Speed vs quality tradeoff |
| `lora_scale` | float | 1.0 | 0.0-2.0 | LoRA influence strength |
| `num_images` | integer | 3 | 1-4 | Candidates to generate |
| `output_format` | string | "png" | jpeg/png | Output format |
| `enable_safety_checker` | boolean | true | - | Content safety check |

#### Style Prompts

| Style | Prompt Description |
|-------|-------------------|
| `modern` | Modern minimalist furniture, clean lines, neutral colors |
| `scandinavian` | Light oak wood, white and beige tones, cozy textiles |
| `coastal` | Beach house style, light blue and white, natural rattan |
| `luxury` | High-end furniture, cream and gold, velvet upholstery |
| `industrial` | Exposed metal, distressed leather, reclaimed wood |
| `farmhouse` | Rustic wood, shiplap accents, warm country charm |

#### Prompt Wrapper (fixes "half room" issue)

```
Photorealistic real estate interior photo. Keep the same camera angle,
room layout, walls, windows, doors, and flooring. Add a complete coherent
furniture set that fits the entire room, realistic scale, natural shadows,
no cut-off furniture. Do not change architecture, window size, wall color,
or flooring.
```

---

### 8. Kling Video

**Model ID:** `fal-ai/kling-video/v1.5/pro/image-to-video`
**Documentation:** https://fal.ai/models/fal-ai/kling-video/v1.5/pro/image-to-video

**Used by:** `room-tour`, `vehicle-360`, `vehicle-walkthrough`, `social-clips`

#### Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `image_url` | string | *required* | - | Source image URL |
| `prompt` | string | *required* | - | Motion/video description |
| `duration` | integer | 5 | 5, 10 | Video duration in seconds |
| `aspect_ratio` | string | "16:9" | 16:9, 9:16, 1:1 | Output aspect ratio |
| `cfg_scale` | float | 0.5 | 0.3-0.5 | Creativity scale (lower = more creative) |
| `negative_prompt` | string | - | - | What to avoid |

#### Motion Style Prompts

| Style | Prompt Description |
|-------|-------------------|
| `smooth-pan` | Smooth horizontal panning motion revealing the entire room |
| `zoom-in` | Slow cinematic zoom into the room highlighting key features |
| `orbit` | Gentle orbital camera movement around the room center |
| `cinematic` | Dramatic slow motion cinematic camera movement with depth |

---

### 9. FLUX.1 [dev] Text-to-Image

**Model ID:** `fal-ai/flux/dev`
**Documentation:** https://fal.ai/models/fal-ai/flux/dev/api

**Used by:** `floor-plan`, `text-to-image`

#### Parameters

| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `prompt` | string | *required* | - | Image generation prompt |
| `image_size` | string | "landscape_16_9" | Various presets | Output dimensions |
| `num_inference_steps` | integer | 28 | 10-50 | Denoising steps |
| `guidance_scale` | float | 3.5 | 1.0-10.0 | Prompt adherence |
| `num_images` | integer | 1 | 1-4 | Number of images |
| `seed` | integer | - | - | Random seed for reproducibility |

---

### 10. Sync Lipsync v2

**Model ID:** `fal-ai/sync-lipsync/v2`
**Documentation:** https://fal.ai/models/fal-ai/sync-lipsync/v2

**Used by:** Lipsync feature

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `video_url` | string | *required* | Source video URL |
| `audio_url` | string | *required* | Audio track URL |

---

## Best Practices

### MLS-Safe Settings

For real estate photos that need to pass MLS guidelines:

1. **Photo Enhancement:** Use `auto` or `bright` presets only
2. **Sky Replacement:** Use `blue-clear`, `blue-clouds`, or `overcast` only
3. **Virtual Staging:** Keep `removeExisting: false` to preserve existing features
4. **All tools:** Use lower strength values (0.3-0.5) to avoid "fake" looking results

### Generating Candidates

Many tools now generate multiple candidates (2-4 images) to improve quality:

- `virtual-staging`: 3 candidates
- `sky-replacement`: 3 candidates
- `twilight`: 3 candidates
- `lawn-enhancement`: 2 candidates

The first/best result is automatically selected, but future versions may allow user selection.

### Credit Optimization

- Use `photo-enhancement` (1 credit) before more expensive tools
- Start with `auto` preset before trying more intensive options
- Use BiRefNet for auto-segmentation instead of manual masks when possible

---

## API Flow

All FAL API calls go through Supabase Edge Functions for security:

```
Frontend → supabase.functions.invoke('fal-generate') → FAL API
                         ↓
                 (Polling for async jobs)
                         ↓
Frontend ← supabase.functions.invoke('fal-status') ← FAL API
```

This ensures FAL API keys are never exposed to the browser.

---

## Pricing Reference

Credits are internal currency. Actual FAL API costs vary by model.

| Model | Approx. FAL Cost | Internal Credits |
|-------|------------------|------------------|
| Clarity Upscaler | ~$0.02/image | 1 |
| FLUX Image-to-Image | ~$0.03/image | 1-2 |
| FLUX Pro Fill | ~$0.05/image | 2-3 |
| BRIA Eraser | ~$0.02/image | 1-2 |
| BiRefNet | ~$0.01/image | 1 |
| ICLight v2 | ~$0.02/image | 1 |
| Apartment Staging | ~$0.05/image | 2 |
| Kling Video | ~$0.10-0.20/video | 3-5 |
| FLUX Text-to-Image | ~$0.03/image | 5 |

*Note: FAL pricing may change. Check https://fal.ai/pricing for current rates.*
