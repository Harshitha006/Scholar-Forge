# Architecture Context

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                   |
| UI               | Tailwind + shadcn/ui    | Component composition and styling                              |
| Auth             | Clerk                   | User identity and route protection                             |
| Database         | Prisma + PostgreSQL     | Relational metadata: projects, collaborators, specs, task runs |
| Canvas           | Liveblocks + React Flow | Real-time collaborative canvas, presence, and cursors          |
| Background tasks | Trigger.dev             | Durable AI generation workflows                                |
| Artifact storage | Vercel Blob             | Canvas snapshots and generated Markdown specs                  |

## System Boundaries

app/api

    Authenticated request handlers.

    Responsibilities:

        Input validation and schema parsing.

        Ownership and collaborator checks.

        Triggering background jobs (AI drafting, LaTeX build).

        Reading and writing to PostgreSQL and Blob storage.

trigger

    Long-running background jobs:

        AI topic refinement, outline and section generation.

        Literature-based synthesis (RAG).

        Plain English → LaTeX conversion for sections.

        LaTeX compilation and artifact upload.

lib

    Shared infrastructure:

        Prisma client and DB helpers.

        Access control utilities (project membership checks).

        RAG utilities: embedding, retrieval, reranking.

        LaTeX template helpers per venue/style.

components

    UI composition:

        Project dashboard, sidebars, dialogs.

        Collaborative editor surface (section list, editor panes).

        Citation manager panel and paper search UI.

        PDF preview and artifact download components.

prisma

    Database schema and generated client:

        Models for User, Project, Section, Citation, Artifact, TaskRun, PinnedPaper, etc..

rag (or data/literature)

    Indexing and retrieval logic for local papers:

        PDF parsing, chunking, and embedding.

        Abstractions over FAISS / Qdrant indices.

data

    Local corpus of PDFs and initial indices created offline.

    Not used for new runtime artifacts (those go to Blob).



## Storage Model
    Database (PostgreSQL)

        Metadata, ownership, relationships, and task runs:

            Projects and collaborator links.

            Sections (plain text + LaTeX snapshots, ordering, type).

            Pinned papers and citation metadata (including BibTeX key).

            Artifacts (paths to .tex, .pdf, .bib, markdown exports).

            Background task runs and status.

Vector Store (FAISS/Qdrant)

    Embeddings for:

        Global literature corpus (PDF chunks).

        Per-project uploaded documents or datasets (optional).

Vercel Blob

    Generated artifacts:

        papers/{projectId}/main.tex

        papers/{projectId}/refs.bib

        papers/{projectId}/main.pdf

        papers/{projectId}/sections.json or paper.md

    Blob URLs stored in PostgreSQL as references (filePath, pdfPath, bibPath, etc.).

Local File System (build-time / dev)

    Pre-indexed literature corpus and FAISS index files.

    LaTeX templates for venues.

## Auth and Collaboration Model
    Every project has a single owner (Clerk user ID).

    Projects can include additional collaborators.

    Only authenticated users can access protected routes.

    Only the owner or a collaborator can:

        Edit project metadata.

        Edit sections, citations, and artifacts.

        Trigger AI workflows and compilation.

    Liveblocks room tokens:

        Issued only after verifying project membership.

        One room per project to back the collaborative editor and presence.



## Literature and Citation Model
# Global literature corpus:

Pre-ingested PDFs stored locally or in a separate storage path.

Indexed into FAISS/Qdrant with embeddings and metadata records in PostgreSQL.

# Project-level pinned papers:

A user can search and “pin” relevant papers to a project.

Pinned papers are recorded in DB with a reference to the global paper ID.

# Citations:

Each project maintains a set of citation entries (with BibTeX).

Inline citations in sections reference these entries by key.

# References:

Only citations actually used in sections are emitted into refs.bib.


## AI Generation Model

Research Guidance and Draft Generation
# Input:

User prompt (idea, domain, paper type, venue).

Project context (existing research question, sections).

Pinned papers and retrieved literature chunks (from vector store).

# Execution:

## Durable background task via Trigger.dev:

Topic refinement and outline drafting.

Section draft generation (Intro, Lit Review, etc.).

Summarization of pinned papers into project notes.

## Tasks write results back into:

Section records (plain-text drafts).

Project metadata (refined question, outline).

# Output:

Updated sections with drafts and AI annotations (e.g., “human review needed” flags).

Suggested citations / paper IDs to attach to sections.

# Plain-English → LaTeX Conversion
## Input:

Section’s current plain-text content.

Project-level LaTeX template (IEEE, ACM, etc.).

Existing citation keys for inline references.

## Execution:

Short-running synchronous tasks for simple conversions (headings, lists) may be done inline.

More complex conversions (tables, algorithms, large sections) run as Trigger.dev jobs.

LLM is instructed to:

Preserve content and citations.

Use the correct LaTeX macros for the chosen style.

## Output:

latex_text stored per section.

Updated main.tex representation ready for compilation.

## Paper Compilation
# Input:

All section latex_text fragments.

Project’s LaTeX template + metadata (title, authors, abstract).

refs.bib file generated from project citations.

# Execution:

Trigger.dev job that:

Assembles the final LaTeX document.

Runs pdflatex (and bibtex/biber as needed) in a sandboxed environment.

Uploads main.tex, refs.bib, and main.pdf to Vercel Blob.

# Output:

Artifact records in PostgreSQL pointing to Blob paths.

Compilation status and logs recorded in a TaskRun entry.



## Invariants

API handlers are not long-running.
    Any expensive AI work, RAG queries over large corpora, or LaTeX compilation runs inside Trigger.dev background tasks, not in app/api.

Separation of metadata and large artifacts.
    PostgreSQL stores identities, relationships, and paths; Blob storage stores the heavy files (PDF, LaTeX, Markdown, section snapshots).

Auth and ownership checks at every mutation.
    All state changes (projects, sections, citations, pins, artifacts) validate project membership and role before proceeding.

Realtime collaboration restricted by membership.
    Liveblocks room tokens are only issued after server-side membership checks; non-members cannot join a project’s collaborative editor.

Consistent document schema.
The section and citation schema must be uniform for:

    User-created text.

    AI-generated drafts.

    Imported snippets from external documents.
    This ensures the LaTeX generator and compiler can operate on a stable structure.

Local-first AI.
    No external LLM API calls at runtime. All AI inference uses locally hosted models, respecting privacy and avoiding rate limits.
