
***

# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

***

## Current Phase

- **Project Foundation Complete (v1.0)**

***

## Current Goal

- **Maintenance & Scaling**:
  - Extend RAG to support larger local corpora (FAISS/Qdrant).
  - Add more LaTeX templates (IEEE, ACM).
  - Implement full PDF previewing with annotation support.

***

## Completed

- **Phase 1: Project Shell & Auth**
  - Next.js 16 + TypeScript + Tailwind 4 initialization.
  - Dark theme design system and global CSS tokens.
  - Clerk authentication integration and route protection.
  - Prisma schema with PostgreSQL models (Project, User, Section, etc.).
  - Projects dashboard with ProjectGrid and NewProjectDialog.
  - POST /api/projects endpoint with default section seeding.
- **Phase 2: Workspace Layout**
  - Three-pane workspace shell (Sections, Editor, AI Sidebar).
  - Dynamic Sections Sidebar with icons and progress tracking.
  - Section selection logic and navigation.
  - Mocked Editor and AI Sidebar interfaces.
  - Workspace page with Prisma integration and auth/access checks.
- **Phase 3: Collaborative Editor & Auto-save**
  - Integrated TipTap with Liveblocks for real-time editing.
  - Implemented Liveblocks authentication with project membership checks.
  - Added debounced auto-save to PostgreSQL via a new PATCH endpoint.
  - Real-time presence (user count) displayed in the editor header.
- **Phase 4: Local RAG (Backend & Search)**
  - Set up Ollama embedding model (`all-minilm`) integration.
  - Implemented memory-based vector store with LangChain.
  - Created RAG search API with similarity search.
  - Built Literature search UI in the AiSidebar with paper metadata.
  - Implemented mock corpus seeding for testing.
- **Phase 5: AI Section Drafting (Trigger.dev)**
  - Configured Trigger.dev v3 for background task processing.
  - Created a background task that uses RAG context and Ollama (Llama 3.2) to draft sections.
  - Implemented the `/api/sections/[id]/draft` trigger endpoint.
  - Added "Draft with AI" UI functionality in the SectionEditor.

***

- **Phase 6: LaTeX Shadow & Artifact Generation**
  - Implemented LaTeX document generator in `src/lib/latex`.
  - Created background task for project compilation using Trigger.dev.
  - Added "Compile PDF" button to the Navbar.
  - Built "Builds" tab in the AiSidebar to manage and download artifacts.
  - Implemented local artifact storage system in `public/artifacts`.

***

## Next Up

Planned feature units (in likely order):

1. **Project Shell & Auth**
   - Set up Next.js, Tailwind, shadcn/ui, and theme tokens.
   - Integrate Clerk for authentication.
   - Implement the Project Dashboard page with static project cards.

2. **Project Creation & Workspace**
   - New Project modal (idea, type, venue).
   - Persist basic project metadata in PostgreSQL via Prisma.
   - Navigate into a blank workspace with 3-pane layout (sections sidebar, main editor, right sidebar stub).

3. **Sections Sidebar + Empty Editor**
   - DB-backed sections for a project (Intro, Lit Review, etc.).
   - Sections list in left sidebar with active section selection.
   - Empty rich-text editor in the center panel showing the selected section.

4. **Basic RAG Skeleton (Backend)**
   - Set up local literature corpus folder and indexing scripts.
   - Implement minimal RAG search endpoint (no UI yet).

5. **AI Assist Panel (Stub)**
   - Right sidebar UI with tabs (AI Assist, Literature, Citations), wired to placeholder endpoints.

***

## Open Questions

- RAG corpus scope:
  - How many papers and which domains do we want in the **first** local corpus (e.g., only CS/AI, or also health/psychology)?
- LaTeX templates:
  - Which venues should we support initially (IEEE, ACM, generic article), and what’s the default?
- Editor engine:
  - Which rich-text editor framework will we standardize on (TipTap, Slate, Lexical)?
- AI model serving:
  - Exact choice and size of local LLM and embedding model for v1 (e.g., Llama 3.1 8B + `all-MiniLM-L6-v2`), and how they’re exposed (Ollama vs custom FastAPI service).

Add more as they come up; don’t implement around unknowns without documenting them here.

***

- **Phase 7: Polish & Local Corpus Ingestion UI**
  - Integrated `pdf-parse` for local literature ingestion.
  - Built PDF upload and indexing UI in the `AiSidebar`.
  - Added glassmorphism and custom scrollbar utilities for premium feel.
  - Finalized the end-to-end "Research -> Draft -> Compile" workflow.

***

## Session Notes

- No implementation sessions yet; use this section to jot down:
  - What you finished in a coding session.
  - What you were in the middle of when you stopped.
  - Any quick follow-ups to start with next time (e.g., “Hook project list to real DB instead of mock data”).

***
