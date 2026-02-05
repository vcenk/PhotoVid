# Photovid.studio Video Module PRD

## Product Overview

**Module Name:** Photovid Video  
**Parent Product:** Photovid.studio  
**Version:** 1.0  
**Author:** Cenk  
**Date:** February 2026  

### Summary

A Remotion-based video generation module for Photovid.studio that transforms real estate images into professional listing videos, property tours, and social media shorts. Agents upload images (or use AI-generated images from Photovid), add property details, and receive platform-ready videos in minutes.

---

## Problem Statement

Real estate agents need video content but face these challenges:

| Problem | Current Solution | Cost |
|---------|------------------|------|
| No video editing skills | Hire videographer | $200-500/video |
| Time to create videos manually | Skip video, lose leads | Lost revenue |
| Different formats for each platform | Re-edit multiple times | 2-3 hours/listing |
| Generic templates look unprofessional | Expensive software (Animoto, Promo) | $50-100/month |

**Opportunity:** Photovid users already have high-quality AI-generated property images. Adding video turns a $20 image package into a $50+ content package.

---

## Target User

**Primary:** Real estate agents using Photovid.studio for AI image generation  
**Secondary:** Property managers, real estate marketers, Airbnb hosts  

**User Profile:**
- Non-technical, needs one-click solutions
- Creates 5-20 listings/month
- Active on Instagram, Facebook, TikTok
- Values speed over customization
- Budget: $30-100/month for marketing tools

---

## Core Features

### Feature 1: Image-to-Video Generator

Transform property images into animated listing videos.

**Input:**
- 5-15 property images (from Photovid AI or uploaded)
- Property details: address, price, beds/baths, sqft, features
- Agent branding: logo, headshot, contact info

**Output:**
- Animated slideshow with Ken Burns effects
- Text overlays with property info
- Branded intro/outro
- Background music
- Multiple formats (9:16, 16:9, 1:1)

**Template Styles:**

| Style | Description | Best For |
|-------|-------------|----------|
| Luxury | Slow pans, elegant transitions, minimal text | High-end properties |
| Modern | Quick cuts, bold typography, energetic | Urban condos, new builds |
| Cozy | Warm tones, soft transitions, lifestyle focus | Family homes |
| Commercial | Data-focused, professional, feature callouts | Commercial/investment |
| Social | Fast-paced, vertical, trending audio | TikTok/Reels |

---

### Feature 2: Virtual Tour to Shorts

Extract highlights from existing property tour videos (YouTube, Matterport exports, agent walkthrough videos).

**Pipeline:**
```
YouTube URL / Video Upload
    ↓
yt-dlp download + audio extraction
    ↓
Whisper transcription (agent narration)
    ↓
AI identifies best 30-60 sec segments:
  - Room reveals
  - Feature callouts ("look at this kitchen")
  - Emotional moments ("perfect for entertaining")
    ↓
User selects clips → Auto-caption → Export
```

**Auto-Detection Triggers:**
- "Check out..." / "Look at..." / "This is the..."
- Room transitions (scene change detection)
- Price/feature mentions in transcript
- High energy moments in voice

---

### Feature 3: Listing Data Integration

Auto-populate video content from listing data.

**Data Sources:**
- Manual input (address, price, features)
- MLS API integration (future: Zillow, Realtor.com)
- Google Places API (neighborhood info, nearby amenities)

**Auto-Generated Content:**
- Property stats overlay (beds, baths, sqft, price)
- Neighborhood highlights ("5 min to downtown", "Top-rated schools")
- Map animation showing location
- Price comparison to area average

---

### Feature 4: Agent Branding Kit

One-time setup, applied to all videos automatically.

**Brand Elements:**
- Logo (positioned in corner or intro/outro)
- Headshot (for "Listed by" section)
- Brand colors (applied to text, overlays)
- Contact info (phone, email, website)
- Social handles
- Custom fonts (from approved list)
- Tagline/slogan

**Stored in:** User profile, inherited by all new projects

---

### Feature 5: Viral Caption Engine (Real Estate Optimized)

Captions designed for property content.

**Caption Styles:**

| Style | Description | Example |
|-------|-------------|---------|
| Feature Callout | Bold text highlighting amenities | "CHEF'S KITCHEN" |
| Price Pop | Animated price reveal | "$499,000" with scale effect |
| Stats Bar | Bottom ticker with property data | "4 BD | 3 BA | 2,500 SQFT" |
| Agent CTA | Contact information overlay | "Call Sarah: 555-0123" |
| Neighborhood | Location context | "📍 Downtown Vancouver" |

---

### Feature 6: Multi-Platform Export

One-click export optimized for each platform.

| Platform | Aspect Ratio | Duration | Special Features |
|----------|--------------|----------|------------------|
| Instagram Reels | 9:16 | 30-60 sec | Trending audio, hashtag suggestions |
| TikTok | 9:16 | 15-60 sec | Hook in first 2 sec, fast cuts |
| YouTube Shorts | 9:16 | 30-60 sec | End screen with subscribe CTA |
| Facebook Feed | 16:9 or 1:1 | 30-120 sec | Caption-friendly (85% watch muted) |
| Instagram Feed | 1:1 | 30-60 sec | Cover frame selection |
| MLS/Website | 16:9 | 60-180 sec | Unbranded option, longer format |

---

### Feature 7: Stock Media Integration

Auto-insert relevant B-roll and music.

**B-Roll Categories (via Pexels API):**
- Neighborhood lifestyle (cafes, parks, streets)
- Interior details (fireplaces, kitchens, pools)
- Seasonal exteriors (snow, fall leaves, summer)
- City skylines and aerials

**Music Library:**
- Upbeat/energetic (modern listings)
- Elegant/sophisticated (luxury)
- Warm/acoustic (family homes)
- Corporate/professional (commercial)

**Licensing:** Royalty-free tracks included, premium library add-on

---

## Technical Architecture

### Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js (existing Photovid stack) | Shared auth, UI components |
| Video Engine | Remotion | React-based programmatic video |
| Rendering | Remotion Lambda | Serverless, auto-scaling |
| Transcription | Whisper (OpenAI API or local) | Word-level timestamps |
| AI Analysis | Claude API | Clip selection, content suggestions |
| Video Download | yt-dlp | YouTube/social video extraction |
| Stock Media | Pexels API | B-roll and backgrounds |
| Storage | Supabase Storage / S3 | User assets, rendered videos |
| Database | Supabase PostgreSQL | Projects, renders, user data |
| Queue | BullMQ + Redis | Render job management |

### Database Schema (New Tables)

```sql
-- Video projects
video_projects (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  property_id uuid REFERENCES properties,
  template_id text,
  config jsonb,  -- Full Remotion composition config
  status text,   -- draft, rendering, completed, failed
  created_at timestamp,
  updated_at timestamp
)

-- Rendered videos
video_renders (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES video_projects,
  platform text,        -- tiktok, reels, youtube, etc.
  aspect_ratio text,    -- 9:16, 16:9, 1:1
  duration_seconds int,
  file_url text,
  thumbnail_url text,
  file_size_mb decimal,
  render_time_seconds int,
  created_at timestamp
)

-- Agent branding
agent_branding (
  user_id uuid PRIMARY KEY REFERENCES users,
  logo_url text,
  headshot_url text,
  brand_colors jsonb,   -- {primary, secondary, accent}
  contact_info jsonb,   -- {phone, email, website, socials}
  tagline text,
  font_preference text,
  updated_at timestamp
)

-- Video templates
video_templates (
  id text PRIMARY KEY,
  name text,
  category text,        -- luxury, modern, cozy, social
  preview_url text,
  config_schema jsonb,  -- Expected input structure
  is_premium boolean,
  created_at timestamp
)
```

### Remotion Composition Structure

```tsx
// Main composition entry point
<Composition
  id="PropertyVideo"
  component={PropertyVideo}
  durationInFrames={fps * duration}
  fps={30}
  width={1080}
  height={1920}  // 9:16 default
  defaultProps={{
    template: 'modern',
    property: {
      address: '',
      price: '',
      beds: 0,
      baths: 0,
      sqft: 0,
      features: [],
      images: []
    },
    branding: {
      logo: '',
      colors: { primary: '', secondary: '' },
      contact: {}
    },
    music: 'upbeat',
    captions: true
  }}
/>
```

### Reusable Components

```
/src/remotion/
├── compositions/
│   ├── PropertyVideo.tsx      # Main composition
│   ├── SocialShort.tsx        # Vertical short format
│   └── FullTour.tsx           # Longer format
├── components/
│   ├── IntroSlide.tsx         # Animated logo/address entrance
│   ├── ImageSlide.tsx         # Ken Burns, zoom, pan effects
│   ├── PropertyStats.tsx      # Beds/baths/sqft overlay
│   ├── PriceReveal.tsx        # Animated price display
│   ├── FeatureCallout.tsx     # Bold text callouts
│   ├── MapAnimation.tsx       # Location context
│   ├── AgentCard.tsx          # Agent info + headshot
│   ├── CTASlide.tsx           # Contact CTA
│   ├── LogoWatermark.tsx      # Persistent corner logo
│   └── CaptionOverlay.tsx     # Animated captions
├── effects/
│   ├── kenBurns.ts            # Pan and zoom
│   ├── transitions.ts         # Fade, slide, wipe
│   ├── textAnimations.ts      # Typewriter, bounce, fade
│   └── particles.ts           # Subtle background effects
├── templates/
│   ├── luxury.ts              # Template config
│   ├── modern.ts
│   ├── cozy.ts
│   └── social.ts
└── utils/
    ├── timing.ts              # Duration calculations
    ├── colors.ts              # Color manipulation
    └── fonts.ts               # Font loading
```

### API Endpoints

```
POST /api/video/projects          # Create new video project
GET  /api/video/projects          # List user's projects
GET  /api/video/projects/:id      # Get project details
PUT  /api/video/projects/:id      # Update project config
DEL  /api/video/projects/:id      # Delete project

POST /api/video/render            # Start render job
GET  /api/video/render/:id        # Check render status
POST /api/video/render/:id/cancel # Cancel render

GET  /api/video/templates         # List available templates
GET  /api/video/templates/:id     # Get template details

POST /api/video/import-url        # Import from YouTube URL
POST /api/video/transcribe        # Transcribe uploaded video
POST /api/video/analyze-clips     # AI clip selection

GET  /api/branding                # Get user's branding kit
PUT  /api/branding                # Update branding kit
POST /api/branding/logo           # Upload logo
POST /api/branding/headshot       # Upload headshot
```

---

## User Interface

### New Screens

| Screen | Purpose | Entry Point |
|--------|---------|-------------|
| Video Dashboard | Manage video projects | Main nav "Videos" |
| Template Picker | Select video style | "New Video" button |
| Video Editor | Configure video content | After template selection |
| Preview Player | Review before render | "Preview" in editor |
| Render Status | Track rendering progress | After starting render |
| Brand Kit Setup | Configure agent branding | Settings > Branding |
| URL Import | Paste YouTube/upload video | "Import Video" button |
| Clip Selector | Choose clips from long video | After URL processing |

### Editor Interface Sections

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]  Property Video Editor              [Preview] [Render] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌─────────────────────────────┐ │
│  │                      │  │ PROPERTY DETAILS            │ │
│  │                      │  │ Address: [____________]     │ │
│  │    LIVE PREVIEW      │  │ Price:   [$_________]       │ │
│  │    (Remotion Player) │  │ Beds: [_] Baths: [_]        │ │
│  │                      │  │ Sqft: [____]                │ │
│  │     advancement:     │  │                             │ │
│  │    [▶] advancement:  │  │ Features:                   │ │
│  │    00:15 / 00:45     │  │ [x] Pool  [ ] Garage        │ │
│  │                      │  │ [ ] View  [x] Renovated     │ │
│  └──────────────────────┘  │                             │ │
│                            ├─────────────────────────────┤ │
│  ┌──────────────────────┐  │ IMAGES (drag to reorder)    │ │
│  │ Template: [Modern ▼] │  │ [img1] [img2] [img3] [+]    │ │
│  │ Music:    [Upbeat ▼] │  │                             │ │
│  │ Duration: [45 sec ▼] │  ├─────────────────────────────┤ │
│  │ Captions: [On    ▼]  │  │ STYLE                       │ │
│  └──────────────────────┘  │ Primary: [■ #2563eb]        │ │
│                            │ Font:    [Montserrat ▼]     │ │
│                            └─────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Export: [✓] TikTok  [✓] Reels  [ ] YouTube  [ ] Facebook  │
└─────────────────────────────────────────────────────────────┘
```

---

## Pricing Integration

### Photovid.studio Pricing Update

| Tier | Current | With Video | Video Quota |
|------|---------|------------|-------------|
| Free | 5 images | 5 images + 1 video | 1 video/month, watermarked |
| Starter ($19) | 50 images | 50 images + 5 videos | 5 videos/month |
| Pro ($49) | 200 images | 200 images + 20 videos | 20 videos/month |
| Agency ($99) | 500 images | 500 images + 50 videos | 50 videos/month |

### Video Add-ons

| Add-on | Price | Description |
|--------|-------|-------------|
| Extra videos | $2/video | Beyond plan limit |
| 4K export | $1/video | Higher resolution |
| Premium templates | $5/template | One-time purchase |
| Remove watermark (Free tier) | $3/video | Single video unlock |
| Rush render | $1/video | Priority queue |

---

## MVP Scope (6 weeks)

### Week 1-2: Foundation
- [ ] Remotion project setup within Photovid codebase
- [ ] 2 base templates (Modern, Social)
- [ ] Basic composition: intro → images → stats → CTA
- [ ] Ken Burns effect on images
- [ ] Local rendering for development

### Week 3-4: Editor & Pipeline
- [ ] Video editor UI (property details, image upload, preview)
- [ ] Remotion Player integration for live preview
- [ ] Remotion Lambda setup for production renders
- [ ] Render queue with status tracking
- [ ] S3 storage for rendered videos

### Week 5-6: Polish & Launch
- [ ] Agent branding kit (logo, colors, contact)
- [ ] 2 more templates (Luxury, Cozy)
- [ ] Multi-platform export (9:16, 16:9, 1:1)
- [ ] Background music integration
- [ ] Billing integration (video quotas)
- [ ] Download and share functionality

### Post-MVP (Phase 2)
- [ ] URL-to-Shorts (YouTube import)
- [ ] AI clip selection
- [ ] Viral captions with word-level sync
- [ ] Auto-cut features (silence removal, zoom punches)
- [ ] MLS API integration
- [ ] Neighborhood B-roll auto-insertion

---

## File Structure

```
photovid-studio/
├── src/
│   ├── app/
│   │   ├── video/
│   │   │   ├── page.tsx              # Video dashboard
│   │   │   ├── new/page.tsx          # Template picker
│   │   │   ├── [id]/page.tsx         # Video editor
│   │   │   └── [id]/preview/page.tsx # Full preview
│   │   └── settings/
│   │       └── branding/page.tsx     # Brand kit setup
│   ├── components/
│   │   └── video/
│   │       ├── VideoEditor.tsx
│   │       ├── TemplateCard.tsx
│   │       ├── PreviewPlayer.tsx
│   │       ├── RenderProgress.tsx
│   │       └── ExportOptions.tsx
│   └── lib/
│       └── video/
│           ├── render.ts             # Lambda render trigger
│           ├── templates.ts          # Template configs
│           └── transcribe.ts         # Whisper integration
├── remotion/
│   ├── index.ts                      # Remotion entry
│   ├── Root.tsx                      # Composition registry
│   ├── compositions/
│   ├── components/
│   ├── effects/
│   └── templates/
├── remotion.config.ts
└── package.json
```

---

## Success Metrics

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Videos created | 200 | 1,500 | 5,000 |
| Users with 1+ video | 50 | 300 | 1,000 |
| Video feature adoption | 10% | 25% | 40% |
| Avg videos per active user | 2 | 4 | 6 |
| Upsell to paid (from Free) | 5% | 10% | 15% |
| Revenue from video add-ons | $200 | $2,000 | $10,000 |

---

## Implementation Commands

```bash
# Install Remotion in existing project
npm i remotion @remotion/cli @remotion/player @remotion/lambda

# Create Remotion folder structure
mkdir -p remotion/{compositions,components,effects,templates}

# Add scripts to package.json
# "remotion:dev": "remotion studio",
# "remotion:build": "remotion bundle",
# "remotion:render": "remotion render"

# Start Remotion Studio for development
npm run remotion:dev
```

---

## Notes for Claude CLI

When implementing, prioritize in this order:

1. **Get one template working end-to-end first** (image slideshow with Ken Burns)
2. **Add Remotion Player for preview** before Lambda rendering
3. **Keep compositions simple** - one JSON config drives everything
4. **Reuse Photovid's existing** auth, storage, and UI components
5. **Test Lambda renders early** - cost and timing will affect architecture

Key integration points with existing Photovid code:
- Use existing Supabase client and auth context
- Extend existing image upload components for video assets
- Add video quota to existing subscription management
- Reuse property data if user already created listing images
