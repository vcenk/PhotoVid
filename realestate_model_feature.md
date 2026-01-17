# Real Estate AI Tools - Model & Feature Reference

This document outlines all real estate AI tools, their FAL AI models, generation types, and credit costs.

---

## Generation Types

| Type | Description |
|------|-------------|
| `image-to-image` | Transforms an input image based on a prompt |
| `inpainting` | Fills/replaces masked areas of an image |
| `eraser` | Removes objects from masked areas |
| `upscaler` | Enhances image quality and resolution |
| `image-to-video` | Generates video from a static image |
| `text-to-image` | Generates image from text description |

---

## Photo Enhancement Tools

| Tool | FAL AI Model | Type | Credits | Description |
|------|--------------|------|---------|-------------|
| **Virtual Staging** | `fal-ai/flux/dev/image-to-image` | image-to-image | 2 | Fill empty rooms with stylish furniture |
| **Photo Enhancement** | `fal-ai/clarity-upscaler` | upscaler | 1 | One-click HDR, lighting & color correction |
| **Sky Replacement** | `fal-ai/flux-pro/v1/fill` | inpainting | 2 | Replace gray skies with perfect blue |
| **Day to Twilight** | `fal-ai/flux/dev/image-to-image` | image-to-image | 2 | Transform daytime to stunning dusk photos |
| **Item Removal** | `fal-ai/bria/eraser` | eraser | 2 | Remove clutter, cars & unwanted objects |
| **Lawn Enhancement** | `fal-ai/flux/dev/image-to-image` | image-to-image | 2 | Make grass greener & landscaping vibrant |
| **One-Click Declutter** | `fal-ai/bria/eraser` | eraser | 2 | Auto-remove clutter without masking |

---

## Renovation & Design Tools

| Tool | FAL AI Model | Type | Credits | Description |
|------|--------------|------|---------|-------------|
| **Virtual Renovation** | `fal-ai/flux-pro/v1/fill` | inpainting | 3 | Visualize kitchen/bathroom remodels |
| **Wall Color Changer** | `fal-ai/flux-pro/v1/fill` | inpainting | 2 | Preview different paint colors |
| **Floor Replacement** | `fal-ai/flux-pro/v1/fill` | inpainting | 2 | Swap hardwood, tile, or carpet styles |

---

## Weather & Lighting Tools

| Tool | FAL AI Model | Type | Credits | Description |
|------|--------------|------|---------|-------------|
| **Rain to Shine** | `fal-ai/flux/dev/image-to-image` | image-to-image | 1 | Convert cloudy/rainy to sunny weather |
| **Night to Day** | `fal-ai/flux/dev/image-to-image` | image-to-image | 2 | Convert nighttime exteriors to daylight |
| **Changing Seasons** | `fal-ai/flux/dev/image-to-image` | image-to-image | 2 | Add spring blooms, fall leaves, or snow |

---

## Pool & Water Tools

| Tool | FAL AI Model | Type | Credits | Description |
|------|--------------|------|---------|-------------|
| **Pool Enhancement** | `fal-ai/flux-pro/v1/fill` | inpainting | 2 | Add water to empty pools, clarify murky water |

---

## Utility Tools

| Tool | FAL AI Model | Type | Credits | Description |
|------|--------------|------|---------|-------------|
| **Watermark Removal** | `fal-ai/bria/eraser` | eraser | 1 | Remove watermarks from images |
| **Headshot Retouching** | `fal-ai/flux/dev/image-to-image` | image-to-image | 2 | Professional portrait enhancement |
| **HDR Auto-Merge** | `fal-ai/clarity-upscaler` | upscaler | 1 | Merge bracketed exposures automatically |

---

## Video Tools

| Tool | FAL AI Model | Type | Credits | Description |
|------|--------------|------|---------|-------------|
| **Room Tour Video** | `fal-ai/kling-video/v1.5/pro/image-to-video` | image-to-video | 5 | Generate cinematic video from a single photo |

---

## Advanced / Premium Tools

| Tool | FAL AI Model | Type | Credits | Description |
|------|--------------|------|---------|-------------|
| **Floor Plan Generator** | `fal-ai/flux/dev` | text-to-image | 5 | Create 2D floor plans from photos |
| **360° Virtual Staging** | `fal-ai/flux/dev/image-to-image` | image-to-image | 5 | Stage panoramic VR photos |

---

## Model Summary

### FAL AI Models Used

| Model ID | Purpose | Approx. Cost |
|----------|---------|--------------|
| `fal-ai/flux/dev/image-to-image` | Image transformation with prompts | $0.025/image |
| `fal-ai/flux-pro/v1/fill` | Inpainting / masked area replacement | $0.05/image |
| `fal-ai/flux/dev` | Text-to-image generation | $0.025/image |
| `fal-ai/bria/eraser` | Object removal / erasing | $0.03/image |
| `fal-ai/clarity-upscaler` | Image upscaling & enhancement | $0.02/image |
| `fal-ai/kling-video/v1.5/pro/image-to-video` | Image to video generation | $0.10/5s video |

---

## Tool Categories by Generation Type

### Image-to-Image (8 tools)
- Virtual Staging
- Day to Twilight
- Lawn Enhancement
- Rain to Shine
- Night to Day
- Changing Seasons
- Headshot Retouching
- 360° Virtual Staging

### Inpainting (5 tools)
- Sky Replacement
- Virtual Renovation
- Wall Color Changer
- Floor Replacement
- Pool Enhancement

### Eraser (3 tools)
- Item Removal
- One-Click Declutter
- Watermark Removal

### Upscaler (2 tools)
- Photo Enhancement
- HDR Auto-Merge

### Image-to-Video (1 tool)
- Room Tour Video

### Text-to-Image (1 tool)
- Floor Plan Generator

---

## Route Reference

All tools are accessible at `/studio/apps/real-estate/{tool-slug}`:

```
/studio/apps/real-estate/virtual-staging
/studio/apps/real-estate/photo-enhancement
/studio/apps/real-estate/sky-replacement
/studio/apps/real-estate/twilight
/studio/apps/real-estate/item-removal
/studio/apps/real-estate/lawn-enhancement
/studio/apps/real-estate/declutter
/studio/apps/real-estate/virtual-renovation
/studio/apps/real-estate/wall-color
/studio/apps/real-estate/floor-replacement
/studio/apps/real-estate/rain-to-shine
/studio/apps/real-estate/night-to-day
/studio/apps/real-estate/changing-seasons
/studio/apps/real-estate/pool-enhancement
/studio/apps/real-estate/watermark-removal
/studio/apps/real-estate/headshot-retouching
/studio/apps/real-estate/hdr-merge
/studio/apps/real-estate/room-tour
/studio/apps/real-estate/floor-plan
/studio/apps/real-estate/360-staging
```

---

## Credits Pricing Summary

| Credits | Tools |
|---------|-------|
| **1 credit** | Photo Enhancement, Rain to Shine, Watermark Removal, HDR Merge |
| **2 credits** | Virtual Staging, Sky Replacement, Twilight, Item Removal, Lawn Enhancement, Declutter, Wall Color, Floor Replacement, Night to Day, Changing Seasons, Pool Enhancement, Headshot Retouching |
| **3 credits** | Virtual Renovation |
| **5 credits** | Room Tour Video, Floor Plan Generator, 360° Virtual Staging |

---

## TypeScript Type Definitions

All types are defined in `lib/types/generation.ts`:

```typescript
export type ToolType =
  // Photo Enhancement
  | 'virtual-staging'
  | 'photo-enhancement'
  | 'sky-replacement'
  | 'twilight'
  | 'item-removal'
  | 'lawn-enhancement'
  | 'declutter'
  // Renovation & Design
  | 'virtual-renovation'
  | 'wall-color'
  | 'floor-replacement'
  // Weather & Lighting
  | 'rain-to-shine'
  | 'night-to-day'
  | 'changing-seasons'
  // Pool & Water
  | 'pool-enhancement'
  // Utility
  | 'watermark-removal'
  | 'headshot-retouching'
  | 'hdr-merge'
  // Video
  | 'room-tour'
  // Advanced
  | 'floor-plan'
  | '360-staging';

export type GenerationType =
  | 'text_to_image'
  | 'image_to_image'
  | 'image_to_video'
  | 'video_to_video';
```

---

## File Locations

| File | Purpose |
|------|---------|
| `lib/types/generation.ts` | Type definitions for all tools |
| `lib/api/toolGeneration.ts` | FAL AI integration functions |
| `lib/data/industries.ts` | Tool configurations for UI |
| `components/tools/real-estate/*.tsx` | Individual tool UI components |
| `App.tsx` | Route definitions |
