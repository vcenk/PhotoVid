# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photovid is a React SPA for an AI-powered video creation platform with:
1. **Landing Page** (`/`) - Marketing site showcasing capabilities
2. **Studio Dashboard** (`/studio`) - Industry-specific workflow interface for generating cinematic videos from images
3. **Specialized Tools** - Lipsync (`/studio/lipsync`), Image generation (`/studio/image`), Apps gallery (`/studio/apps`)
4. **Industry Portals** - Real Estate (`/studio/apps/real-estate`), Auto Dealership (`/studio/apps/auto`)
5. **Workflow Canvas** (`/studio/workflow`) - Node-based visual editor using React Flow
6. **Timeline Video Editor** (`/studio/apps/real-estate/video-builder`) - Multi-track timeline editor with Remotion preview

**Important Architecture Note:** This is a **Vite + React SPA** with **React Router**, NOT a Next.js application, despite Next.js being in dependencies. The entry flow is `index.html` → `index.tsx` → `App.tsx` (which sets up routing). The `app/` directory contains standalone page components imported into the React Router configuration.

## Tech Stack

- **Build Tool:** Vite 6.2 (TypeScript, React plugin)
- **Framework:** React 19 (using new JSX transform)
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4 (via CDN in index.html + class-based dark mode)
- **Animation:** Framer Motion (primary), GSAP (secondary)
- **Icons:** lucide-react
- **Node Editor:** @xyflow/react (React Flow) for workflow canvas
- **State Management:** Zustand + React Context
- **Auth/Backend:** Supabase (@supabase/ssr)
- **AI Generation:** FAL AI (Kling Video, Flux Dev, Lipsync models)
- **Storage:** Cloudflare R2 (S3-compatible via AWS SDK)
- **Video Rendering:** Remotion v4 (`@remotion/player` for preview, `remotion` for compositions, `@remotion/transitions` for scene transitions, `@remotion/light-leaks` for cinematic effects)
- **Type Safety:** TypeScript 5.8

### Remotion AI Skills

The project includes Remotion AI Skills (`.agents/skills/remotion-best-practices/`) which provide best practices for:
- Animations (frame-based, no CSS transitions)
- Transitions (`TransitionSeries`, fade, slide, wipe)
- Light leaks (`@remotion/light-leaks`)
- Text animations (typewriter with string slicing)
- Ken Burns effects
- Audio handling

## Essential Commands

```bash
npm run dev          # Start dev server on port 3100
npm run build        # Production build
npm run preview      # Preview production build
```

No test suite is currently configured.

## Environment Variables

Required environment variables (set in `.env.local`):

### Core Application
```
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Video Generation (FAL AI)
```
VITE_FAL_KEY=your_fal_api_key
```

### Storage (Cloudflare R2)
```
VITE_R2_ACCOUNT_ID=your_r2_account_id
VITE_R2_ACCESS_KEY_ID=your_r2_access_key
VITE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
VITE_R2_BUCKET_NAME=your_bucket_name
VITE_R2_PUBLIC_URL=https://your-public-url.com
```

**Note:** Despite the `NEXT_PUBLIC_` prefix for Supabase, these are consumed by Vite through `vite.config.ts` which exposes them via `process.env.*` defines. The Gemini API key is exposed as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

## Code Architecture

### Entry Flow
1. `index.html` loads with inline Tailwind CDN and Google Fonts
2. Loads `index.tsx` which renders React root
3. `App.tsx` is the main application component wrapped in `ThemeProvider`
4. All landing page content is composed in `App.tsx` using section components

### Studio Architecture

The Studio is a complete workflow-based video generation system with the following architecture:

#### Core Concepts
- **Industry-First Approach**: Users select an industry (Real Estate, E-commerce, Restaurant, Corporate, Creator) before choosing a workflow
- **Dual-Mode Interface**: Wizard mode (guided step-by-step) and Canvas mode (node-based editor - in progress)
- **Async Generation Pipeline**: Upload to R2 → Call Supabase Edge Function → FAL AI Processing → Poll for Result → Save to Asset Library

#### State Management (4 Contexts)

1. **StudioContext** (`lib/store/contexts/StudioContext.tsx`)
   - Manages view routing: `dashboard | wizard | canvas | assets`
   - Handles industry/workflow selection
   - Provides navigation functions: `goHome()`, `openCanvas()`, `openAssets()`

2. **WizardContext** (`lib/store/contexts/WizardContext.tsx`)
   - Manages step-by-step workflow execution
   - Handles file uploads, configuration, generation state
   - Orchestrates the generation pipeline (R2 upload → Edge Function → FAL polling)
   - Provides `startGeneration()` which:
     - Uploads image to R2 via `lib/api/r2.ts`
     - Calls Supabase Edge Function `generate-video`
     - Polls FAL AI for completion using `checkStatus()` and `getResult()`
     - Saves result to AssetContext

3. **ProjectContext** (`lib/store/contexts/ProjectContext.tsx`)
   - Manages project CRUD operations
   - Persists projects to Supabase `projects` table
   - Supports both `wizard` and `canvas` modes

4. **AssetContext** (`lib/store/contexts/AssetContext.tsx`)
   - Global asset library for generated videos and uploaded images
   - Persists assets across workflows
   - Used for reusing assets in canvas mode

#### Workflow System

Workflows are defined in `lib/data/workflows.ts` with the following structure:
- **5 Industries**: Real Estate, E-commerce, Restaurant, Corporate, Creator
- **Industry-Specific Workflows**: Each industry has 1-4 specialized workflows
  - Example: Real Estate has "Property Showcase" and "Room Tour"
  - Example: E-commerce has "Product 360° Spin" and "Lifestyle Showcase"
- **Step Types**: `upload | configure | generate | review`

#### Generation Pipeline

```
User Upload → FileUploader component
     ↓
Upload to R2 → lib/r2.ts (uploadToR2)
     ↓
Call Supabase Edge Function → supabase.functions.invoke('generate-video')
     ↓
Edge Function calls FAL AI → lib/fal.ts (generateImageToVideo)
     ↓
Poll for completion → checkStatus() every 5s, max 5 min
     ↓
Retrieve result → getResult()
     ↓
Save to AssetContext → addAsset()
     ↓
Display in ResultViewer
```

### Key Directories

- **`components/pages/`** - Top-level page components (StudioPage, LipsyncPage, ImagePage, AppsPage, WorkflowPage)
- **`components/landing/`** - Landing page sections (Hero, Pricing, UseCases, etc.)
- **`components/layout/`** - Structural components (Navbar, Background)
- **`components/common/`** - Shared components (ThemeProvider, AuthButton)
- **`components/dashboard/`** - Dashboard UI components
  - `navigation/` - NavigationRail, DashboardTopbar, FlyoutPanels
  - `home/` - HeroComposer, TemplateCarousels, WorkflowLibrary
  - `apps/` - AppCard, AppsGrid
  - `lipsync/` - LipsyncStudio
  - `image/` - ImageStudio
- **`components/studio/`** - Studio-specific components
  - `wizard/` - Wizard mode (FileUploader, ConfigurationPanel, GenerationProgress, ResultViewer)
  - `shared/` - IndustrySelector, WorkflowGrid, AssetLibrary, TemplateGallery
  - `workflow/` - React Flow canvas components
    - `WorkflowCanvas.tsx` - Main canvas container
    - `NodePalette.tsx` - Draggable node sidebar
    - `TemplatePanel.tsx` - Pre-built workflow templates
    - `nodes/` - Custom node types (ImageInputNode, TextToImageNode, LipsyncNode, etc.)
- **`components/video-editor/`** - Timeline video editor
  - `VideoEditorPage.tsx` - Entry point (wraps in `VideoEditorProvider`)
  - `VideoEditorContext.tsx` - State management (project, clips, tracks, assets, playback)
  - `layout/` - EditorLayout (3-panel), AssetSidebar (tabs), PreviewPanel (player + timeline)
- **`remotion/`** - Remotion compositions
  - `compositions/DynamicTimeline.tsx` - Main dynamic composition for editor preview
  - `compositions/PropertyVideo.tsx` - Pre-built property video composition
  - `Root.tsx` / `index.ts` - Composition registration for Remotion CLI
- **`components/industry/`** - Industry-specific portal pages (IndustryPage, IndustryHero, ToolsGrid)
- **`components/tools/`** - Individual tool implementations by industry
  - `real-estate/` - VirtualStagingTool, ItemRemovalTool, PhotoEnhancementTool, SkyReplacementTool, TwilightTool, LawnEnhancementTool, RoomTourTool
- **`lib/api/`** - External API integrations (fal.ts, r2.ts, openai.ts, lipsync.ts)
- **`lib/data/`** - Static data (workflows.ts, apps.ts, templates.ts, industries.ts, workflow-templates.ts)
- **`lib/database/`** - Supabase client utilities (client.ts, server.ts, middleware.ts)
- **`lib/store/`** - State management
  - `contexts/` - React Contexts (StudioContext, WizardContext, ProjectContext, AssetContext)
  - `dashboard.ts` - Zustand store for dashboard state
- **`lib/services/`** - External service integrations (unsplash.ts)
- **`lib/workflow/`** - Workflow engine (types.ts, node-definitions.ts, execution-engine.ts)
- **`lib/types/`** - TypeScript type definitions
- **`app/`** - Standalone page components (login) - imported into React Router

### Theme System

Uses Tailwind's class-based dark mode strategy:
- `ThemeProvider` manages theme state and applies `dark`/`light` class to `<html>`
- Persists preference to localStorage
- Defaults to dark mode or system preference
- Access via `useTheme()` hook

### Styling Patterns

- Primary font: Inter (sans-serif)
- Headings font: Playfair Display (serif)
- Studio color palette: zinc/violet (dark mode first)
  - Backgrounds: `bg-[#09090b]`, `bg-zinc-900`, `bg-zinc-950`
  - Accents: `bg-violet-600`, `text-violet-500`
  - Borders: `border-white/10`, `border-white/5`
- Landing page color palette: zinc/stone grays with indigo accents
- Consistent use of `dark:` variants for all colors/backgrounds
- Common patterns:
  - Studio cards: `rounded-2xl`, `rounded-3xl`, `rounded-[48px]`
  - Buttons: `rounded-xl`, `rounded-full`
  - Transitions: `transition-colors duration-500`, `transition-all duration-200`
  - Shadows: `shadow-2xl shadow-zinc-200`, `shadow-lg shadow-violet-600/20`

### Path Aliases

TypeScript and Vite both configured with `@/*` mapping to project root:
```typescript
import { Navbar } from '@/components/layout/Navbar';
import { INDUSTRIES } from '@/lib/data/workflows';
```

### Supabase Integration

The Supabase client is designed to fail gracefully:
- `lib/database/client.ts` returns `null` if env vars are missing
- All components check for `null` client before attempting auth operations
- Displays warning messages when auth is unavailable
- WizardContext falls back to mock generation if Supabase is unavailable

Example pattern:
```typescript
const supabase = createClient();
if (!supabase) {
  console.warn("Supabase not connected, falling back to MOCK.");
  mockGeneration();
  return;
}
```

#### Database Schema

The `projects` table in Supabase:
```sql
- id: uuid (primary key)
- user_id: uuid (references auth.users)
- name: text
- mode: 'wizard' | 'canvas'
- workflow_data: jsonb (stores workflow state)
- thumbnail_url: text
- created_at, updated_at: timestamps
```

Row Level Security (RLS) is enabled - users can only access their own projects.

### External Service Integration

#### FAL AI (`lib/api/fal.ts`)
- **Primary Model**: `fal-ai/kling-video/v1.5/pro/image-to-video` - Converts images to cinematic videos
- **Secondary Model**: `fal-ai/flux/dev` - Text-to-image generation
- **Pattern**: Async job submission → Poll every 5s → Retrieve result
- **Functions**:
  - `generateImageToVideo(imageUrl, prompt)` - Submit job, returns request_id
  - `checkStatus(requestId)` - Check job status
  - `getResult(requestId)` - Get final video URL

#### Lipsync (`lib/api/lipsync.ts`)
- Multiple model support for audio-driven facial animation
- Models defined in `lib/data/lipsync-models.ts`

#### Cloudflare R2 (`lib/api/r2.ts`)
- S3-compatible object storage via AWS SDK
- Used for storing user-uploaded images before sending to FAL
- `uploadToR2(file, path)` - Uploads file, returns public URL
- Path structure: `user-uploads/{timestamp}-{filename}`

#### Supabase Edge Functions
- `generate-video` - Securely calls FAL AI with server-side API key
- Accepts: `{ imageUrl, prompt, motionStyle }`
- Returns: `{ request_id }` or `{ video: { url } }`

### Routing Structure (`App.tsx`)

The app uses React Router v7 with the following routes:
```
/                                           → LandingPage
/studio                                     → StudioPage (main dashboard)
/studio/apps                                → AppsPage (industry apps gallery)
/studio/apps/real-estate                    → IndustryPage (real estate portal)
/studio/apps/real-estate/virtual-staging    → VirtualStagingTool
/studio/apps/real-estate/item-removal       → ItemRemovalTool
/studio/apps/real-estate/photo-enhancement  → PhotoEnhancementTool
/studio/apps/real-estate/sky-replacement    → SkyReplacementTool
/studio/apps/real-estate/twilight           → TwilightTool
/studio/apps/real-estate/lawn-enhancement   → LawnEnhancementTool
/studio/apps/real-estate/room-tour          → RoomTourTool
/studio/apps/real-estate/video-builder      → VideoEditorPage (timeline editor)
/studio/apps/auto                           → IndustryPage (auto dealership portal)
/studio/lipsync                             → LipsyncPage
/studio/image                               → ImagePage
/studio/workflow                            → WorkflowPage (node-based canvas)
/login                                      → LoginPage
/dashboard/*                                → Redirects to /studio
```

### Workflow Canvas Architecture

The workflow canvas (`WorkflowPage`) uses React Flow for a node-based visual editor:

**Node Types** (defined in `lib/workflow/node-definitions.ts`):
- Input: ImageInputNode, VideoInputNode, AudioInputNode, PromptInputNode
- Processing: TextToImageNode, ImageToVideoNode, LipsyncNode, UpscaleNode, InpaintNode
- Output: PreviewNode

**Execution Engine** (`lib/workflow/execution-engine.ts`):
- Processes nodes in topological order
- Handles async operations (API calls to FAL)
- Manages data flow between connected nodes

### Video Editor Architecture

The timeline-based video editor (`/studio/apps/real-estate/video-builder`) is a standalone subsystem with its own context, layout, and Remotion-based rendering.

#### Layout (3-panel)
- **AssetSidebar** (left, 300px): Tabbed interface — Media, Music, SFX, Text, Transitions, Effects. Glassmorphism cards. Click-to-add-at-playhead.
- **PreviewPanel** (center): Remotion `<Player>` rendering `DynamicTimeline` composition + ClipInspector + transport bar + Timeline.
- **EditorLayout** wraps everything in a full-viewport container with a top bar (project name, format selector, nav toggle).

#### State: VideoEditorContext (`components/video-editor/VideoEditorContext.tsx`)
- Single React Context managing the entire `VideoEditorProject` (defined in `lib/types/video-editor.ts`)
- **localStorage persistence** — auto-saves on every change, restores on mount
- **Blob URL cleanup** — on load, filters out assets with stale `blob:` URLs (invalid after page reload) and removes their associated clips from tracks
- Provides 70+ action methods for assets, tracks, clips, transitions, effects, Ken Burns, playback, zoom, selection

#### Types: `lib/types/video-editor.ts`
- Frame-based timing: all durations/positions in frames at 30fps
- `VideoEditorProject` holds `assets` (Record), `tracks` (array), `clips` (Record), `transitions` (Record)
- `TextClipContent` supports both preset positions (`top`/`center`/`bottom`/`lower-third`) and free `x`/`y` percentage coordinates
- `FORMAT_CONFIGS` maps `landscape`/`square`/`vertical` to pixel dimensions
- `createDefaultProject()` factory creates a project with 4 pre-built tracks (Video, Text, Music, SFX)

#### Remotion: `remotion/compositions/DynamicTimeline.tsx`
- **Uses plain HTML `<img>`/`<video>`/`<audio>` instead of Remotion's `<Img>`/`<Video>`/`<Audio>`** — Remotion components use `delayRender` internally which hangs indefinitely on blob URLs
- Clips rendered via `<Sequence from={startFrame} durationInFrames={duration}>`
- Visual effects applied as CSS `filter` strings (blur, brightness, contrast, etc.)
- Overlay effects: vignette (radial-gradient), light-leak (animated gradient), glitch (random offset)
- Ken Burns: frame-based `scale()`/`translateX()` transforms on images
- Text animations via Remotion's `spring()` function

#### Player-Context Sync Pattern (PreviewPanel)
```
Context.isPlaying → Player.play()/pause()
Player.getCurrentFrame() → polled every 100ms → Context.seekTo()
Context.currentFrame changed externally → Player.seekTo() (via lastSyncedFrame ref)
```
The `lastSyncedFrame` ref prevents feedback loops between context updates and player seeks.

#### Text Drag Overlay
- `TextDragOverlay` component renders inside the same `relative` container as the Player
- Uses Pointer Events API (`setPointerCapture`) for reliable drag tracking
- Auto-enables free positioning (`x`/`y`) on first drag of a preset-positioned clip
- `presetToXY()` maps preset positions to approximate percentage coordinates

#### Presets: `lib/data/editor-presets.ts`
- 10 transition presets, 9 effect presets, 8 text presets, 6 Ken Burns presets
- Font options, color options for text styling

## Important Patterns

### Animation Libraries
- Use **Framer Motion** for declarative animations (fade-ins, hovers, gestures)
- Use **GSAP** for timeline-based animations and scroll triggers
- Both libraries are available globally; choose based on use case complexity

### React 19 Features
- Using new JSX transform (`jsx: "react-jsx"`)
- No need to import React in component files unless using hooks/APIs

### Context Pattern (Critical for Studio)
All contexts follow the ThemeProvider.tsx pattern:
```typescript
// 1. Define context type
interface ContextType { ... }

// 2. Create context
const Context = createContext<ContextType | undefined>(undefined);

// 3. Provider component
export function Provider({ children }) {
  const [state, setState] = useState(...);
  return <Context.Provider value={{...}}>{children}</Context.Provider>;
}

// 4. Custom hook
export function useContext() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useContext must be used within Provider');
  }
  return context;
}
```

### Async Generation Pattern
The WizardContext implements a robust async generation pattern:
1. Start generation with progress tracking (0-100%)
2. Upload files to R2 (progress: 0-30%)
3. Call Supabase Edge Function (progress: 30%)
4. Poll FAL AI status every 5s (progress: 30-95%)
5. Retrieve final result (progress: 100%)
6. Handle errors and timeouts (max 5 minutes)
7. Fallback to mock generation if Supabase unavailable

### Dark Mode
- Always provide both light and dark variants for colors
- Background transitions: `transition-colors duration-500`
- Test both themes when modifying UI
- Studio defaults to dark mode (`bg-[#09090b]`)

### Vite-Specific
- HMR is enabled; changes hot-reload in dev
- Environment variables must be defined in `vite.config.ts` to be available
- Port 3100 is hardcoded; server binds to `0.0.0.0`
- Use `import.meta.env.VITE_*` for environment variables (not `process.env`)

## Common Gotchas

1. **Next.js confusion**: Don't add Next.js patterns (Server Components, route handlers, etc.). This is a Vite SPA with React Router.
2. **Tailwind CDN**: Tailwind v4 loaded via CDN in HTML. Custom config may not apply as expected.
3. **Font loading**: Fonts loaded via Google Fonts CDN, not local files.
4. **Routing**: Routes defined in `App.tsx` using React Router - not file-based routing.
5. **Environment variables**: Use `import.meta.env.VITE_*` for Vite, `process.env.*` for values defined in vite.config.ts.
6. **FAL AI async jobs**: Always poll for completion - don't assume immediate results.
7. **R2 public URLs**: Ensure R2 bucket has public access and VITE_R2_PUBLIC_URL is set correctly.
8. **Context nesting**: WizardProvider must be inside StudioProvider, and both need access to AssetContext.
9. **Mock fallback**: If Supabase is unavailable, WizardContext uses mock generation with test video URL.
10. **React Flow**: The @xyflow/react package requires nodes and edges to have stable IDs for proper rendering.
11. **Remotion blob URLs**: Never use Remotion's `<Img>`/`<Video>`/`<Audio>` components with blob URLs — they call `delayRender` internally which hangs forever. Use plain HTML `<img>`/`<video>`/`<audio>` instead.
12. **Video editor number inputs**: Use `onBlur` for clamping numeric ranges, not `onChange` — otherwise users can't clear the field to type a new value (e.g., clearing "48" to type "120" briefly produces "1" which gets clamped to the minimum).
13. **Video editor state is frame-based**: All timing uses frames (30fps default), not seconds. Use `framesToSeconds()`/`secondsToFrames()` from `lib/types/video-editor.ts` for conversion.

## Development Patterns

### Adding a New Route
1. Create page component in `components/pages/`
2. Add route in `App.tsx` within the `<Routes>` block
3. Add navigation link in appropriate navigation component

### Adding a New Industry Portal
1. Add industry config in `lib/data/industries.ts` (defines tools, workflows, stats, hero content)
2. Add portal route in `App.tsx`: `<Route path="/studio/apps/{slug}" element={<IndustryPage industryId="{slug}" />} />`
3. For tools with custom routes, create tool components in `components/tools/{industry}/` and add routes in `App.tsx`

### Adding a New Workflow Node
1. Create node component in `components/studio/workflow/nodes/`
2. Register in `lib/workflow/node-definitions.ts`
3. Add to node palette in `NodePalette.tsx`
4. Implement execution logic in `lib/workflow/execution-engine.ts`

### Adding a New Wizard Workflow
1. Define workflow object in `lib/data/workflows.ts`
2. Specify `id`, `name`, `description`, `icon`, `requiredFiles`, `estimatedCredits`
3. Define `steps` array with step types: `upload | configure | generate | review`

### Adding a New Industry Tool
1. Create tool component in `components/tools/{industry}/{ToolName}Tool.tsx`
2. Add route in `App.tsx`: `<Route path="/studio/apps/{industry}/{tool-slug}" element={<ToolComponent />} />`
3. Add tool config in `lib/data/industries.ts` with `route` property pointing to the new route
4. Tool components typically include: image upload, configuration options, before/after preview, and generation trigger

## Testing the Generation Pipeline

1. **Without Supabase/FAL**: WizardContext automatically falls back to mock generation
2. **With R2 Only**: Files upload but generation uses mock video
3. **Full Pipeline**: Requires FAL API key in Edge Function, R2 credentials, and deployed Supabase function
