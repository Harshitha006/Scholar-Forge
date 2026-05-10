

## Development Workflow

### Approach

- Build the app **incrementally** using a spec‑driven workflow.
- Treat your context files (`architecture-context.md`, `ui-context.md`, `code-standards.md`, etc.) as the **source of truth** for:
  - What to build.
  - How it should behave.
  - What’s already done.
- Always implement against these specs:
  - For a new feature (e.g., “Section drafting with AI”), first update/confirm its behavior in the spec.
  - Then implement exactly that; don’t improvise new flows at coding time.

***

## Scoping Rules

- Work on **one feature unit or subsystem at a time**, for example:
  - “Create project” flow.
  - “Sections sidebar UI”.
  - “Basic RAG search endpoint”.
  - “Plain → LaTeX conversion for a single section”.
- Prefer **small, testable increments**:
  - A unit you can click through in the UI or call via a single API and say “this works end-to-end”.
- Do not combine **unrelated boundaries** in one step, such as:
  - Editor UI + RAG + LaTeX compilation in a single PR.

***

## When To Split Work

Split an implementation unit if it tries to combine these at once:

- UI changes and background AI tasks.  
  Example: If you’re building a “Generate section draft” feature, do:
  - Step 1: Frontend button + call to a stub API.
  - Step 2: API → Trigger.dev job that returns mock data.
  - Step 3: Connect to real AI/RAG logic.

- Real-time editor state and database persistence.  
  Example:
  - First: get collaborative text working with Liveblocks.
  - Next: wire up periodic save to DB.

- Multiple unrelated API routes.  
  Example:
  - Don’t implement `/api/sections/update` and `/api/citations/insert` in the same step unless they’re tightly coupled to the same user story.

- Behavior not clearly defined in context files.  
  Example:
  - If “Generate outline” behavior is fuzzy, update `ui-context.md` / `architecture-context.md` first.

If you can’t verify a change quickly by:
- calling a single API, or
- clicking through a small UI path,
then the scope is too big—split it.

***

## Handling Missing Requirements

- Do **not** invent new product behavior at coding time.
  - Example: don’t decide that “Compile” should auto-share PDFs unless the spec says so.
- If a requirement is ambiguous:
  - Clarify and write the intended behavior into the relevant context file before implementing.
- If something is missing:
  - Add it as an open question in `progress-tracker.md` (e.g., “How should multiple LaTeX templates be selected?”) before continuing.

***

## Protected Foundation Components

Do **not** modify generated third‑party foundation components unless a task explicitly says so.

Protected:

- `components/ui/*` (shadcn/ui primitives).
- Any third-party library internals (Liveblocks SDK, editor library internals, Prisma-generated types, etc.).

Rules:

- Keep them as **generic, reusable** building blocks.
- Apply project-specific styling, layout, and feature logic in your own app-level components:
  - e.g., `components/editor/SectionEditor.tsx`, not inside `components/ui/button.tsx`.
- Only touch foundation components when:
  - A spec explicitly calls for a design token change or base behavior change.

***

## Keeping Docs In Sync

Whenever implementation changes:

- System architecture or boundaries:
  - Example: you add a new background worker for LaTeX linting → update `architecture-context.md`.
- Storage model decisions:
  - Example: you decide to store section snapshots as JSON in Blob as well → update storage section.
- Code conventions or standards:
  - Example: you standardize a new API response pattern → update `code-standards.md`.
- Feature scope:
  - Example: you change how “Explain this paper” works → update `ui-context.md`.

Also ensure:

- `progress-tracker.md` reflects **actual** state, not intended state.
  - Mark units as completed only when they work end-to-end as defined.

Before moving from one unit to the next:

1. The current unit works **end to end** within its defined scope.
   - E.g., “Create project” → navigate to workspace → project record exists and loads correctly.
2. No invariant from `architecture-context.md` was violated.
   - E.g., no long-running AI task in an API route.
3. `progress-tracker.md` is updated:
   - What was implemented.
   - Any known follow-ups or open questions.

***

## Code Standards (for this project)

### General

- Keep modules small and **single-purpose**:
  - `lib/rag/searchProjectCorpus.ts` vs a bloated `lib/utils.ts`.
- Fix root causes, not symptoms:
  - If LaTeX compile fails often, fix the LaTeX assembler instead of adding ad-hoc string replacements.
- Do not mix unrelated concerns:
  - No database calls in React components.
  - No UI logic in Trigger.dev tasks.
- Respect architecture boundaries:
  - UI ↔ API ↔ background tasks ↔ model layer.

***

### TypeScript

- Strict mode across the entire project.
- Avoid `any`. Use:
  - `interface` for data contracts (`Section`, `Citation`, `Artifact`, `TaskRun`).
  - Narrow unions and generics where needed.
- Validate unknown input at boundaries:
  - All API payloads and query params must be parsed & validated before use (e.g., Zod).
- Explicit types for AI payloads:
  - What the background job expects.
  - What the frontend expects back.

***

### Next.js

- Prefer **React Server Components** for pages/layouts/data fetching.
- Add `"use client"` only when needed:
  - Collaborative editor.
  - Presence and cursors.
  - Modals, drawers, local state UIs.
- Keep route handlers focused:
  - Each handler should map roughly to one user goal, like “update section text”.
- Long-running work stays out of API handlers:
  - RAG, section drafting, LaTeX compilation always run in Trigger.dev or equivalent.

***

### Styling

- Use tokens from `globals.css` (mapped via Tailwind):
  - `bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`.
  - `text-copy-primary`, `text-copy-muted`, `text-brand`, `text-ai`.
  - `border-surface-default`, `border-surface-subtle`.
- No raw Tailwind colors (`zinc-500`, `slate-900`) or hex values.
- Border radius scale:
  - `rounded-xl` for chips, small buttons, citation pills.
  - `rounded-2xl` for cards, sidebars, panels.
  - `rounded-3xl` for modals, overlays, compile dialogs.

***

### API Routes

- First step in every handler:
  - Validate input.
  - Fetch user via Clerk.
  - Verify project membership if needed.
- Enforce auth and ownership before any write.
- Return consistent shapes:
  - e.g., `{ success: true, data }` or `{ success: false, error: { code, message } }`.
- Keep handlers thin:
  - Logic lives in `lib/projects`, `lib/sections`, `lib/citations`, `lib/rag`, `lib/latex`, etc.
  - Route handler = glue between HTTP and domain functions.

***

### Data and Storage

- PostgreSQL via Prisma:
  - Projects, sections, citations, pinned papers.
  - Artifacts metadata (paths/URLs, not binary content).
  - Task runs (AI generation jobs, compile jobs).
- Blob storage:
  - LaTeX source + BibTeX + PDFs + optional Markdown/JSON exports.
- Do not store large generated content in DB:
  - Store path references only.
- Treat task run records as verified:
  - When issuing tokens or exposing logs, always verify `userId` + `projectId` + `taskId` relationship.

***

### File Organization

- `lib/`
  - Prisma client, auth helpers.
  - Domain logic: projects, sections, citations, RAG, LaTeX.
- `trigger/`
  - Background jobs:
    - AI drafting, RAG flows, conversions, LaTeX compilation.
- `components/`
  - Pure UI:
    - Editor shell, sidebars, tabs, modals, buttons.
  - No DB calls, no direct model invocations.
- `app/api/`
  - HTTP endpoints for:
    - Project CRUD.
    - Section CRUD.
    - Citation management.
    - AI job triggers.
    - Artifact retrieval.
- Name by responsibility:
  - `lib/sections/createSection.ts` over `lib/sections/helpers.ts`.

***