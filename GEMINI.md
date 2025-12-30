# Photovid - Cinematic Background Project

## Project Overview
Photovid is a visually rich web application designed as an "AI Studio for Creators." It focuses on turning static photos into cinematic motion. The project is a **React Single Page Application (SPA)** built with **Vite**.

**Note on Architecture:**
The project structure exhibits a hybrid characteristic:
*   **Vite SPA (Active):** The application runs via `vite` and utilizes `index.html` and `App.tsx` as the primary entry point. The main landing page logic is contained within `App.tsx`.
*   **Next.js Artifacts:** There is a `next` dependency and an `app/` directory (typical of Next.js App Router) containing auth routes. However, the current build scripts and entry points utilize Vite. Development should primarily focus on the Vite/React patterns unless a migration to Next.js is explicitly requested.

## Tech Stack
*   **Framework:** React 19
*   **Build Tool:** Vite 6.2
*   **Styling:** Tailwind CSS (inferred from usage), `lucide-react` (Icons)
*   **Animation:** Framer Motion, GSAP
*   **Backend/Services:** Supabase (Client & SSR libraries present), Google Gemini API (implied by `GEMINI_API_KEY`)

## Project Structure
*   `App.tsx`: Main application component containing the landing page structure.
*   `components/`: UI components.
    *   `layout/`: Structural components like `Navbar`, `Background`.
    *   `sections/`: Specific landing page sections (e.g., `Hero`, `Pricing`, `Showcase`).
*   `lib/`: Utilities and library configurations (e.g., `supabase/`).
*   `app/`: Contains Next.js-style route definitions (e.g., `auth/callback`), likely for Supabase auth flows, but their integration with the Vite frontend should be verified.
*   `public/`: Static assets.

## Development

### Prerequisites
*   Node.js
*   `GEMINI_API_KEY` set in `.env` or `.env.local`

### Scripts
*   **Start Dev Server:** `npm run dev` (Runs `vite`)
*   **Build:** `npm run build` (Runs `vite build`)
*   **Preview:** `npm run preview` (Runs `vite preview`)

## Key Configuration
*   **Vite:** `vite.config.ts` handles build configuration, environment variable loading, and path aliases (mapped `@` to root).
*   **Environment:** `GEMINI_API_KEY` is exposed to the client via `vite.config.ts` defines.

## Common Tasks
*   **Modifying the Landing Page:** Most content is located in `App.tsx` or the specific components within `components/sections/`.
*   **Styling:** Uses Tailwind utility classes. Global styles or theme configurations may be in `index.css` (check if exists) or `tailwind.config.js`.
