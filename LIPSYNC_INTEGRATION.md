# Lipsync Studio Integration Guide

## Overview

The Lipsync Studio is a full-featured AI-powered lipsync video generation interface integrated with FAL AI's lipsync models. It provides a split-panel interface with controls on the left and a preview stage on the right.

## Components Created

### 1. Model Configuration
**File**: `lib/data/lipsync-models.ts`

Defines 5 lipsync models from FAL AI:
- **Sync Lipsync 2.0 Pro** - Premium quality, zero-shot lipsyncing ($1.17/min)
- **Sync Lipsync 2.0** - Standard quality, cost-effective ($0.70/min)
- **Kling LipSync (Audio)** - Image-to-video with audio input
- **Kling LipSync (Text)** - Image-to-video with text-to-speech
- **LatentSync** - Professional-grade by ByteDance ($0.70/min)

Each model configuration includes:
```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // FAL endpoint path
  displayName: string;           // UI display name
  inputType: 'video' | 'image';  // Required input type
  audioType: 'audio-file' | 'text-to-speech' | 'both';
  duration: string;              // Expected duration
  price: string;                 // Pricing info
  endpoint: string;              // FAL API endpoint
  requiredFields: {...};         // Input validation
  features: string[];            // Feature tags
}
```

### 2. UI Component
**File**: `components/dashboard/lipsync/LipsyncStudio.tsx`

Split-panel layout:
- **Left Panel (350px)**: Controls with model selector, file uploads, text input, generate button
- **Right Panel**: Preview stage with process visualization

Features:
- Dynamic form based on selected model
- Conditional file upload fields (image/video/audio)
- Text-to-speech input for compatible models
- Sync mode selector for Sync Labs models
- Real-time form validation
- Sticky generate button

### 3. Page Wrapper
**File**: `components/pages/LipsyncPage.tsx`

Full-page layout with:
- NavigationRail integration
- FlyoutPanels for quick actions
- Top bar with filter dropdown
- LipsyncStudio as main content

### 4. API Integration
**File**: `lib/api/lipsync.ts`

FAL AI integration utilities:
- `generateLipsync()` - Main generation function
- `uploadFileForFal()` - File upload helper (needs implementation)
- `checkLipsyncStatus()` - Status polling
- `getLipsyncResult()` - Result retrieval

## FAL AI Models - How to Find Them

### Method 1: Search on FAL.ai
1. Visit [fal.ai/explore](https://fal.ai/explore)
2. Search for "lipsync" in the search bar
3. Browse available models with filters

### Method 2: API Documentation
Each model has an API documentation page with input/output schemas:
- **Sync Lipsync 2.0**: [fal.ai/models/fal-ai/sync-lipsync/v2](https://fal.ai/models/fal-ai/sync-lipsync/v2)
- **Kling LipSync**: [fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video](https://fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video)
- **LatentSync**: [fal.ai/models/fal-ai/latentsync](https://fal.ai/models/fal-ai/latentsync)

### Method 3: FAL Client SDK
```bash
npm install @fal-ai/client
```

Then explore models programmatically:
```typescript
import * as fal from '@fal-ai/client';

// List available models
const models = await fal.list();

// Get model schema
const schema = await fal.schema('fal-ai/sync-lipsync/v2');
console.log(schema.input); // See required fields
```

## Adding New Models

To add a new lipsync model from FAL AI:

### Step 1: Research the Model
1. Find the model on fal.ai
2. Check its API documentation
3. Note the input requirements:
   - Does it need video or image?
   - Does it accept audio files or text?
   - What optional parameters exist?

### Step 2: Add to Configuration
Edit `lib/data/lipsync-models.ts`:

```typescript
{
  id: 'new-model-id',
  name: 'fal-ai/new-model',  // Copy from FAL docs
  displayName: 'New Model Name',
  icon: Sparkles,  // Choose from lucide-react
  description: 'Description of what this model does',
  inputType: 'video',  // or 'image'
  audioType: 'audio-file',  // or 'text-to-speech' or 'both'
  duration: '5s',
  price: '$X.XX/min',  // From FAL pricing
  endpoint: 'fal-ai/new-model',  // FAL endpoint path
  requiredFields: {
    video_url: true,
    audio_url: true,
    // Add other required fields based on API docs
  },
  features: ['Feature 1', 'Feature 2']
}
```

### Step 3: Test Integration
The UI will automatically adapt to show/hide input fields based on `requiredFields`.

## Model Input Patterns

### Pattern 1: Video + Audio (Sync Lipsync 2.0)
```typescript
{
  video_url: "https://...",
  audio_url: "https://...",
  model: "lipsync-2-pro",
  sync_mode: "cut_off"
}
```

### Pattern 2: Image + Audio (Kling LipSync)
```typescript
{
  image_url: "https://...",
  audio_url: "https://..."
}
```

### Pattern 3: Image + Text (Kling Text-to-Video)
```typescript
{
  image_url: "https://...",
  text: "What should the character say?"
}
```

## Integration Setup

### 1. Install Dependencies
```bash
npm install @fal-ai/client
```

### 2. Set Environment Variables
Create/update `.env`:
```bash
VITE_FAL_KEY=your_fal_api_key_here
```

Get your API key from [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)

### 3. Implement File Upload
FAL requires **URLs** not file uploads. You need to upload files to your storage (R2, S3) first:

Edit `lib/api/lipsync.ts`:
```typescript
import { uploadToR2 } from './r2';

export async function uploadFileForFal(
  file: File,
  type: 'image' | 'video' | 'audio'
): Promise<string> {
  const bucket = 'lipsync-inputs';
  const url = await uploadToR2(file, bucket);
  return url;
}
```

### 4. Wire Up Generation
In `LipsyncStudio.tsx`, connect the generate button:

```typescript
import { generateLipsync, uploadFileForFal } from '../../../lib/api/lipsync';

const handleGenerate = async () => {
  try {
    setIsGenerating(true);

    // Upload files to get URLs
    let videoUrl, imageUrl, audioUrl;

    if (uploadedVideo) {
      videoUrl = await uploadFileForFal(uploadedVideo, 'video');
    }
    if (uploadedImage) {
      imageUrl = await uploadFileForFal(uploadedImage, 'image');
    }
    if (uploadedAudio) {
      audioUrl = await uploadFileForFal(uploadedAudio, 'audio');
    }

    // Generate lipsync
    const result = await generateLipsync(selectedModel, {
      video_url: videoUrl,
      image_url: imageUrl,
      audio_url: audioUrl,
      text: textInput,
      sync_mode: syncMode
    });

    console.log('Generated video:', result.video.url);
    setGeneratedVideo(result.video.url);

  } catch (error) {
    console.error('Generation failed:', error);
    setError(error.message);
  } finally {
    setIsGenerating(false);
  }
};
```

## Navigation

The lipsync page is accessible via:
- **Route**: `/dashboard/lipsync`
- **Navigation Rail**: Click "Lipsync" icon (Mic icon)

## Sync Modes Explained

For Sync Labs models, choose how to handle audio/video length mismatches:

| Mode | Description |
|------|-------------|
| `cut_off` | Trim audio or video to match shorter duration |
| `loop` | Loop the shorter media to match longer duration |
| `bounce` | Bounce shorter media back and forth |
| `silence` | Add silence/freeze frames to match duration |
| `remap` | Intelligently remap timing to match duration |

## Resources

### FAL AI Documentation
- [Main Lipsync Models](https://fal.ai/models/fal-ai/sync-lipsync)
- [Sync Lipsync 2.0](https://fal.ai/models/fal-ai/sync-lipsync/v2)
- [Kling LipSync Audio-to-Video](https://fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video)
- [Kling LipSync Text-to-Video](https://fal.ai/models/fal-ai/kling-video/lipsync/text-to-video)
- [LatentSync](https://fal.ai/models/fal-ai/latentsync)
- [Sync Labs Blog Post](https://blog.fal.ai/sync-labs-lipsync-2-0-model-now-available-on-fal/)
- [Hummingbird-0 Blog Post](https://blog.fal.ai/hummingbird-0-ai-lip-sync-model-by-tavus-now-available-on-fal/)

### FAL Client SDK
- [NPM Package](https://www.npmjs.com/package/@fal-ai/client)
- [Documentation](https://fal.ai/docs)

## Pricing

All FAL AI lipsync models charge per minute of video processed:
- **Sync Lipsync 2.0**: $0.70/min
- **Sync Lipsync 2.0 Pro**: $1.17/min (~1.67x standard)
- **LatentSync**: $0.70/min
- **Kling/Pixverse**: Variable pricing

## Next Steps

1. ✅ UI components created
2. ✅ Model configurations defined
3. ✅ Navigation integrated
4. ⚠️ Implement `uploadFileForFal()` with R2
5. ⚠️ Wire up generate button handler
6. ⚠️ Add progress tracking UI
7. ⚠️ Add result viewer with download
8. ⚠️ Add error handling and validation
9. ⚠️ Test with real FAL API key

## Troubleshooting

### "FAL client not initialized"
- Check `.env` has `VITE_FAL_KEY`
- Restart dev server after adding env variable

### "Failed to upload file"
- Implement `uploadFileForFal()` function
- Ensure R2 credentials are configured

### "Invalid input for model"
- Check model's API documentation for exact field names
- Verify file URLs are publicly accessible
- Ensure sync_mode is one of the valid options

### "Rate limit exceeded"
- FAL has rate limits on API calls
- Implement request queuing or retry logic
- Check your plan limits

## Model Comparison

| Model | Input | Audio | Quality | Speed | Best For |
|-------|-------|-------|---------|-------|----------|
| Sync 2.0 Pro | Video | File | Premium | Fast | Professional content |
| Sync 2.0 | Video | File | High | Fast | General use |
| LatentSync | Video | File | Professional | Medium | High-end production |
| Kling Audio | Image | File | High | Medium | Static portraits |
| Kling Text | Image | TTS | High | Medium | Quick demos |

Choose based on:
- **Budget**: Standard Sync 2.0 for cost-effectiveness
- **Quality**: Pro or LatentSync for best results
- **Input**: Kling if you only have images
- **Convenience**: Kling Text for text-to-speech
