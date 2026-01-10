# Photovid - AI Studio for Creators

## Project Overview
Photovid is a sophisticated "AI Studio for Creators" designed to transform static photos into cinematic motion and provide a comprehensive suite of AI-powered creative tools. The project has evolved from a landing page into a full-featured **React Single Page Application (SPA)** built with **Vite**, featuring a node-based workflow system and specialized studios for image and video generation.

## Tech Stack
*   **Framework:** React 19.2
*   **Routing:** React Router Dom 7
*   **Build Tool:** Vite 6.2
*   **State Management:** Zustand (Dashboard/Studio state)
*   **Workflow Engine:** @xyflow/react (Node-based automation)
*   **Styling & Animation:** Tailwind CSS 4, Framer Motion, GSAP
*   **AI Services:**
    *   **Fal.ai:** Image and video generation models.
    *   **OpenAI:** Prompt enhancement and text generation.
    *   **Google Gemini API:** Intelligent creative assistance.
    *   **Lipsync API:** Video synchronization services.
*   **Backend/Services:** Supabase (Auth & Database), AWS S3/R2 (Asset storage)

## Project Structure
*   `App.tsx`: Main entry point with React Router configuration and global error handling.
*   `components/`:
    *   `pages/`: Top-level route components (Landing, Studio, Apps, Workflow, etc.).
    *   `dashboard/`: Dashboard-specific UI including `NavigationRail`, `FlyoutPanels`, and `Topbar`.
    *   `studio/`: The core creative engine.
        *   `workflow/`: Node-based canvas for building custom AI pipelines using `@xyflow/react`.
        *   `wizard/`: Step-by-step generation interface for guided workflows.
        *   `shared/`: Reusable studio components like `AssetLibrary` and `IndustrySelector`.
    *   `landing/`: Components for the marketing landing page.
*   `lib/`:
    *   `workflow/`: Core logic for the node-based `execution-engine` and `node-definitions`.
    *   `api/`: Service clients for external AI and storage providers (Fal, Lipsync, OpenAI, R2).
    *   `store/`: Application state management using Zustand and React Contexts.
    *   `data/`: Static configurations, prompts, and template definitions.
*   `app/`: Next.js-style routes (auth, login) preserved for Supabase integration, though the main application is a Vite SPA.

## Key Architecture & Features
*   **Navigation Rail:** A persistent sidebar providing quick access to different studio modes and flyout menus for video/image editing.
*   **Workflow System:** A flexible, node-based system (`lib/workflow`) that allows users to chain AI models together (e.g., Text-to-Image -> Image-to-Video -> Upscale).
*   **Studio Modes:** Specialized interfaces for different creative tasks:
    *   **Image Studio:** Advanced image generation and manipulation.
    *   **Lipsync Studio:** Audio-driven video animation.
    *   **Workflow Canvas:** Visual programming for AI pipelines.
*   **Theme Support:** Integrated dark/light mode via `ThemeProvider`.

## Development

### Prerequisites
*   Node.js
*   Environment Variables: `GEMINI_API_KEY`, `VITE_FAL_KEY`, etc. (see `.env.example`)

### Scripts
*   **Start Dev Server:** `npm run dev` (Runs `vite`)
*   **Build:** `npm run build` (Runs `vite build`)
*   **Preview:** `npm run preview` (Runs `vite preview`)

## Common Tasks
*   **Adding AI Nodes:** Define new nodes in `lib/workflow/node-definitions.ts` and add their UI in `components/studio/workflow/nodes/`.
*   **Updating UI Theme:** Modify `tailwind.config.js` or `index.css`.
*   **Adding Studio Pages:** Create a new page in `components/pages/` and register the route in `App.tsx`.