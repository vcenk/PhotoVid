# Photovid Studio Implementation Plan

## 1. Project Vision
Photovid is a dual-mode "AI Studio for Creators" specializing in cinematic motion.
- **Mode A (Industry Wizards):** Linear, template-driven workflows for specific industries (Real Estate, E-commerce).
- **Mode B (Node Canvas):** Advanced, graph-based editor where outputs of one generation feed into another (Rivet-style).

**Tech Stack:**
- **Frontend:** React 19, Vite, Tailwind CSS, React Flow (for Node Canvas).
- **AI Processing:** FAL AI (Image/Video), OpenAI (LLM/Prompt Enhancement).
- **Database:** Supabase (PostgreSQL + Auth).
- **Storage:** Cloudflare R2 (High-volume media storage).

---

## 2. User Experience & Design
**Aesthetic:** Clean, "White" Dashboard (Imagine.art style).
- **Light Mode Default:** High contrast text, subtle gray borders, white backgrounds.
- **Visuals:** Large previews, minimal UI chrome, distinct "Studio" feel.

**Navigation Structure:**
- **Dashboard:** Recent projects, Industry Template selector.
- **Studio (Wizard Mode):** Step-by-step form for chosen template.
- **Studio (Canvas Mode):** Infinite canvas with draggable nodes.
- **Assets:** Media library (Cloudflare R2 backed).

---

## 3. Architecture

### 3.1 Frontend Modules
- **`components/studio/wizard/`**: Linear workflow components (Upload -> Configure -> Generate).
- **`components/studio/nodes/`**: React Flow custom nodes (Input Node, FAL AI Node, LLM Node, Output Node).
- **`lib/fal-ai/`**: Client wrappers for FAL AI API.
- **`lib/cloudflare/`**: S3-compatible client for R2 uploads/downloads.

### 3.2 Data Schema (Supabase)

**Table: `projects`**
- `id`: uuid
- `user_id`: uuid
- `name`: text
- `mode`: 'wizard' | 'canvas'
- `workflow_data`: jsonb (Stores wizard steps OR node graph state)
- `thumbnail_url`: text

**Table: `assets`**
- `id`: uuid
- `project_id`: uuid
- `storage_path`: text (R2 path)
- `type`: 'image' | 'video'
- `meta`: jsonb (resolution, duration, seed)

---

## 4. Node-Based Workflow (The "Rivet" Feature)
**Library:** `reactflow` (standard for React graph editors).

**Node Types:**
1.  **Input Node:** File uploader or Text Prompt.
2.  **Processor Node:**
    *   *FAL - Flux/SDXL:* Text-to-Image.
    *   *FAL - SVD/Runway:* Image-to-Video.
    *   *OpenAI - GPT-4:* Prompt Refiner.
3.  **Utility Node:** Resize, Crop, Loop.
4.  **Output Node:** Video Player/Download.

**Interaction:**
- Users drag connections: `[Image Output] ---> [Video Input]`.
- Execution engine traverses the graph: `Input -> Generate Image -> Pass URL -> Generate Video`.

---

## 5. Implementation Roadmap

### Phase 1: Foundation & "White" Theme (Days 1-2)
- [ ] Set up `implementation.md`.
- [ ] Configure Tailwind for Light Mode (Zinc-50/White theme).
- [ ] Create `Layout` shell (Sidebar, Header) matching Imagine.art.
- [ ] Integrate Supabase Auth (already present, verify styling).

### Phase 2: Industry Wizards (The "Easy" Mode) (Days 3-5)
- [ ] Build "Real Estate" linear workflow (as previously planned).
- [ ] Integrate FAL AI for simple Image-to-Video.
- [ ] Implement Cloudflare R2 upload helper.

### Phase 3: The Node Engine (The "Advanced" Mode) (Days 6-10)
- [ ] Install `reactflow`.
- [ ] Create Custom Node components.
- [ ] Build the Graph Execution Engine (Client-side logic to run the chain).
- [ ] Connect Node outputs to FAL AI inputs.

### Phase 4: Backend & Persistence (Days 11-14)
- [ ] Set up Supabase tables.
- [ ] Implement Save/Load for Project Graphs.
- [ ] Optimize R2 storage (presigned URLs).

---

## 6. Integration Details

### FAL AI Integration
- Use `fal-client` library.
- **Queue System:** Since video generation takes time, use Webhooks or Polling for status updates in the Node graph.

### Cloudflare R2
- Use AWS SDK v3 (S3 Client) pointing to Cloudflare endpoint.
- Pattern:
    1. Client requests "Upload URL" from Next.js API/Supabase Edge Function.
    2. Client uploads file directly to R2.
    3. Client sends R2 URL to FAL AI.
