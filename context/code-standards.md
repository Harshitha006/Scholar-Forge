

## General

- Keep modules small and single-purpose (e.g., “section formatting”, “citation insertion”, “RAG retrieval”), not “misc utilities”.
- Fix root causes — for example, if citations misalign, fix the citation mapping logic instead of hardcoding keys in the editor.
- Do not mix unrelated concerns in one component or route (e.g., no LaTeX compilation logic inside an editor component).
- Respect the system boundaries defined in your architecture context (UI vs API vs RAG vs background tasks).

***

## TypeScript

- Enable and keep **strict mode** for the entire Next.js project.
- Avoid `any`; use explicit interfaces or narrow union types for:
  - Section data.
  - Citation objects.
  - RAG results.
  - AI task payloads.
- Use `interface` for object contracts that describe:
  - `Section`, `Citation`, `Project`, `Artifact`, `TaskRun`, `RagResult`, etc.
- Validate unknown external input (API body, query params, webhooks) at system boundaries using a schema validator (e.g., Zod) before trusting it.

***

## Next.js

- Default to **React Server Components** for pages and layouts.
- Add `"use client"` only when a component needs:
  - Collaborative editor behavior.
  - Liveblocks presence.
  - Real-time AI streaming UI.
  - Local stateful interactions (modals, popovers).
- Keep route handlers focused on a single responsibility:
  - e.g., `/api/projects/create`, `/api/sections/update`, `/api/citations/insert`.
- Long-running work **must** run in background tasks (Trigger.dev or equivalent), not directly inside request handlers:
  - RAG-based section drafting.
  - Large PDF ingestion and indexing.
  - LaTeX compilation to PDF.

***

## Styling

- Use CSS custom property tokens defined in `globals.css` (as you defined earlier) — no raw Tailwind colors like `zinc-*` and no hex literals.
- Reference tokens only via Tailwind utility names:
  - `bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`
  - `text-copy-primary`, `text-copy-secondary`, `text-copy-muted`, `text-copy-faint`
  - `border-surface-default`, `border-surface-subtle`
  - `text-brand`, `bg-accent-dim`, `text-ai`, `bg-ai-dim`
- Maintain the border radius scale:
  - `rounded-xl` for inline controls (chips, buttons, citation pills).
  - `rounded-2xl` for cards, sidebars, editor panels.
  - `rounded-3xl` for modals, overlays, and major dialogs.

***

## API Routes

- Always validate and parse request input first (e.g., Zod schemas for body/json) before any logic runs.
- Enforce **auth and project membership** checks before any mutation:
  - Only project owner/collaborators can create/update sections, citations, and artifacts.
- Return consistent, predictable response shapes:
  - Use a common pattern like `{ success: boolean, data?: T, error?: { code: string; message: string } }`.
- Keep route handlers thin:
  - Move actual logic into shared modules:
    - `lib/projects`, `lib/sections`, `lib/citations`, `lib/rag`, `lib/latex`, etc.
  - API handlers should mostly:
    - Validate input.
    - Check auth.
    - Call a domain function.
    - Return a shaped response.

***

## Data and Storage

- **PostgreSQL via Prisma** is for:
  - Project metadata (title, type, venue, research question).
  - Sections (plain text, LaTeX snapshot references, ordering).
  - Citations and pinned papers.
  - Artifacts metadata (paths to .tex/.bib/.pdf, not the file content).
  - Task run records (AI tasks and compile runs).
- **Blob storage** is for large generated artifacts:
  - LaTeX sources: `papers/{projectId}/main.tex`.
  - BibTeX files: `papers/{projectId}/refs.bib`.
  - Compiled PDFs: `papers/{projectId}/main.pdf`.
  - Optional JSON/Markdown snapshots.
- Do **not** store large generated content (full PDF binaries, large LaTeX strings) directly in the database — always store a reference (Blob URL/path).
- Task run records are first-class relational data:
  - Treat task IDs and ownership as verified before:
    - Emitting Liveblocks tokens.
    - Exposing any compile logs or AI outputs.

***

## File Organization

- `lib/`
  - Shared infrastructure:
    - Prisma client.
    - Auth and access control helpers (e.g., `requireProjectMember`).
    - RAG utilities: embedding, search, chunking.
    - LaTeX helpers: template assembly, file generation.
- `trigger/`
  - All **durable background tasks** and AI workflows:
    - Section drafting and rewriting.
    - Literature search + synthesis jobs.
    - Plain → LaTeX generation for sections.
    - LaTeX compilation and artifact upload.
- `components/`
  - UI composition only:
    - Editor shell, sidebars, modals, buttons, panels.
    - No database calls, no business logic (just props + callbacks).
- `app/api/`
  - Route handlers for:
    - Projects (create, list, update).
    - Sections (CRUD).
    - Citations and pinned papers.
    - AI triggers (kick off background jobs).
    - Artifacts (get latest, list versions).
  - Handlers should call into `lib/*` for actual operations.

- Name files after **responsibility**, not technology:
  - Good: `lib/sections/updateSection.ts`, `lib/rag/searchProjectCorpus.ts`.
  - Avoid: `lib/utils.ts`, `lib/helpers.ts` catch‑alls.

***
