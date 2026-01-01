# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photovid is a React SPA for an AI-powered video creation platform with two main parts:
1. **Landing Page** (`App.tsx`) - Marketing site showcasing capabilities
2. **Studio Dashboard** (`app/studio/page.tsx`) - Industry-specific workflow interface for generating cinematic videos from images

**Important Architecture Note:** This is a **Vite + React SPA**, NOT a Next.js application, despite the presence of Next.js dependencies and an `app/` directory. The actual runtime uses Vite as the build tool with `index.html` → `index.tsx` → `App.tsx` as the entry flow. The `app/` directory contains standalone route components (login, studio, auth callback) but these are NOT using Next.js App Router - they're regular React components that would need manual routing integration.

## Tech Stack

- **Build Tool:** Vite 6.2 (TypeScript, React plugin)
- **Framework:** React 19 (using new JSX transform)
- **Styling:** Tailwind CSS (via CDN in index.html + class-based dark mode)
- **Animation:** Framer Motion (primary), GSAP (secondary)
- **Icons:** lucide-react
- **Auth/Backend:** Supabase (@supabase/ssr)
- **AI Generation:** FAL AI (Kling Video v1.5, Flux Dev)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Type Safety:** TypeScript 5.8

## Essential Commands

### Development
```bash
npm run dev          # Start dev server on port 3010
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing
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

### Studio Architecture (NEW)

The Studio is a complete workflow-based video generation system with the following architecture:

#### Core Concepts
- **Industry-First Approach**: Users select an industry (Real Estate, E-commerce, Restaurant, Corporate, Creator) before choosing a workflow
- **Dual-Mode Interface**: Wizard mode (guided step-by-step) and Canvas mode (node-based editor - in progress)
- **Async Generation Pipeline**: Upload to R2 → Call Supabase Edge Function → FAL AI Processing → Poll for Result → Save to Asset Library

#### State Management (4 Contexts)

1. **StudioContext** (`components/contexts/StudioContext.tsx`)
   - Manages view routing: `dashboard | wizard | canvas | assets`
   - Handles industry/workflow selection
   - Provides navigation functions: `goHome()`, `openCanvas()`, `openAssets()`

2. **WizardContext** (`components/contexts/WizardContext.tsx`)
   - Manages step-by-step workflow execution
   - Handles file uploads, configuration, generation state
   - Orchestrates the generation pipeline (R2 upload → Edge Function → FAL polling)
   - Provides `startGeneration()` which:
     - Uploads image to R2 via `lib/r2.ts`
     - Calls Supabase Edge Function `generate-video`
     - Polls FAL AI for completion using `checkStatus()` and `getResult()`
     - Saves result to AssetContext

3. **ProjectContext** (`components/contexts/ProjectContext.tsx`)
   - Manages project CRUD operations
   - Persists projects to Supabase `projects` table
   - Supports both `wizard` and `canvas` modes

4. **AssetContext** (`components/contexts/AssetContext.tsx`)
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

- **`components/layout/`** - Structural components (Navbar, Background)
- **`components/sections/`** - Landing page sections (Hero, Pricing, etc.)
- **`components/theme/`** - ThemeProvider for dark/light mode
- **`components/contexts/`** - React Contexts for state management (Studio, Wizard, Project, Asset)
- **`components/studio/`** - Studio-specific components
  - `IndustrySelector.tsx` - Industry selection buttons
  - `WorkflowGrid.tsx` - Displays workflow cards for selected industry
  - `AssetLibrary.tsx` - Global asset browser
  - `wizard/` - Wizard mode components (FileUploader, ConfigurationPanel, GenerationProgress, ResultViewer)
  - `nodes/` - Canvas mode node components (in progress)
  - `shared/` - Reusable components across modes
- **`lib/supabase/`** - Supabase client utilities (client.ts, server.ts, middleware.ts)
  - `database.sql` - Database schema with projects table and RLS policies
- **`lib/types/`** - TypeScript type definitions
  - `studio.ts` - Industry, Workflow, Project interfaces
- **`lib/data/`** - Configuration data
  - `workflows.ts` - Industry and workflow definitions
- **`lib/`** - API integrations
  - `fal.ts` - FAL AI client (image-to-video, text-to-image)
  - `r2.ts` - Cloudflare R2 upload client
  - `openai.ts` - OpenAI integration (if used)
- **`app/`** - Standalone page components (login, studio, auth/callback) - NOT Next.js routes

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
- `lib/supabase/client.ts` returns `null` if env vars are missing
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

#### FAL AI (`lib/fal.ts`)
- **Primary Model**: `fal-ai/kling-video/v1.5/pro/image-to-video` - Converts images to cinematic videos
- **Secondary Model**: `fal-ai/flux/dev` - Text-to-image generation
- **Pattern**: Async job submission → Poll every 5s → Retrieve result
- **Functions**:
  - `generateImageToVideo(imageUrl, prompt)` - Submit job, returns request_id
  - `checkStatus(requestId)` - Check job status
  - `getResult(requestId)` - Get final video URL

#### Cloudflare R2 (`lib/r2.ts`)
- S3-compatible object storage
- Used for storing user-uploaded images before sending to FAL
- `uploadToR2(file, path)` - Uploads file, returns public URL
- Path structure: `user-uploads/{timestamp}-{filename}`

#### Supabase Edge Functions
- `generate-video` - Securely calls FAL AI with server-side API key
- Accepts: `{ imageUrl, prompt, motionStyle }`
- Returns: `{ request_id }` or `{ video: { url } }`

### Component Organization

#### Landing Page (`App.tsx`)
Uses a `SectionWrapper` helper component for consistent section spacing and styling. All major sections are imported and composed in sequence:

1. Hero (with MosaicSlideshow background)
2. LogoMarquee
3. WorkflowDemo
4. MosaicSlideshow (full-width)
5. UseCasesSection
6. TemplatePacks
7. KineticShowcaseWall
8. PricingSection
9. FaqAndFinalCtaSection
10. Footer

Most sections use Framer Motion for animations and GSAP for complex scroll-based effects.

#### Studio Dashboard
The studio uses conditional rendering based on `StudioContext.currentView`:

```typescript
{currentView === 'dashboard' && (
  <>
    <IndustrySelector />
    {selectedIndustry && <WorkflowGrid industry={selectedIndustry} />}
  </>
)}

{currentView === 'wizard' && selectedWorkflow && (
  <WizardProvider workflow={selectedWorkflow}>
    <WizardContainer />
  </WizardProvider>
)}

{currentView === 'canvas' && <CanvasEditor />}

{currentView === 'assets' && <AssetLibrary />}
```

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
- Port 3010 is hardcoded; server binds to `0.0.0.0`
- Use `import.meta.env.VITE_*` for environment variables (not `process.env`)

## Common Gotchas

1. **Next.js confusion**: Don't add Next.js patterns (Server Components, route handlers, etc.). This is a Vite SPA.
2. **Tailwind CDN**: Custom Tailwind config exists but CDN is loaded in HTML. Configuration may not apply as expected.
3. **Font loading**: Fonts loaded via Google Fonts CDN, not local files
4. **Auth routes**: The `app/login/page.tsx` component exists but needs manual routing (no automatic Next.js routing)
5. **Environment variables**: Use `import.meta.env.VITE_*` for Vite, `process.env.*` for values defined in vite.config.ts
6. **FAL AI async jobs**: Always poll for completion - don't assume immediate results
7. **R2 public URLs**: Ensure R2 bucket has public access configured and VITE_R2_PUBLIC_URL is set correctly
8. **Context nesting**: WizardProvider must be inside StudioProvider, and both need access to AssetContext
9. **Mock fallback**: If Supabase is unavailable, WizardContext uses mock generation with test video URL

## Workflow Development

### Adding a New Industry
1. Add to `IndustryId` type in `lib/types/studio.ts`
2. Create industry object in `lib/data/workflows.ts` with icon, description, and workflows array
3. Add to `INDUSTRIES` array

### Adding a New Workflow
1. Define workflow object in appropriate industry's `workflows` array
2. Specify `id`, `name`, `description`, `icon`, `requiredFiles`, `estimatedCredits`
3. Define `steps` array with step types: `upload | configure | generate | review`
4. Optionally create custom wizard components in `components/studio/wizard/`

### Creating Custom Wizard Steps
Override default wizard behavior by creating workflow-specific components:
```typescript
// components/studio/workflows/RealEstate/PropertyShowcase.tsx
export const PropertyShowcaseWizard = () => {
  const { currentStep, uploadedFiles } = useWizard();
  // Custom UI for property showcase workflow
};
```

## Database Setup

Run `lib/supabase/database.sql` in your Supabase SQL Editor to:
1. Enable UUID extension
2. Create `projects` table
3. Set up Row Level Security policies
4. Create `user-uploads` storage bucket (or use Cloudflare R2)

## Testing the Generation Pipeline

1. **Without Supabase/FAL**: WizardContext automatically falls back to mock generation
2. **With R2 Only**: Files upload but generation uses mock video
3. **With Supabase Edge Function**: Full pipeline requires:
   - FAL API key configured in Edge Function
   - R2 credentials in environment
   - Supabase function deployed: `supabase functions deploy generate-video`

## Performance Considerations

- **File Uploads**: Images are uploaded to R2 before generation to avoid sending large files through Edge Functions
- **Polling Interval**: 5 seconds balances responsiveness with API rate limits
- **Timeout**: 5-minute max prevents infinite polling
- **Progress Updates**: Visual feedback keeps users engaged during 1-3 minute generation times
- **Asset Library**: Generated videos stored in AssetContext prevent re-generation
