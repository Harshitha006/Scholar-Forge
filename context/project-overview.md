# ScholarForge

## Overview

ScholarForge is a real-time collaborative research-writing workspace. Users describe the kind of research paper they want to write in plain English, an AI agent guides topic scoping and literature discovery, collaborators refine the outline and content in a shared editor, and the app maintains an internal LaTeX representation and generates a complete, downloadable paper and references.

Users work in a plain-English, Overleaf-style environment: the app manages sections, citations, and LaTeX under the hood so they never have to see raw LaTeX unless they want to.


## Goals

1. Let authenticated users create and manage research projects (one project = one paper).  
2. Provide a collaborative real-time editor for the paper (sections, comments, presence).  
3. Let users search and import relevant papers from a local literature index.  
4. Let AI:
   - Refine the initial idea into a research question and outline.  
   - Generate and refine section drafts grounded in retrieved literature.  
5. Maintain both:
   - A user-facing plain English document.  
   - A synchronized LaTeX representation ready for compilation.  
6. Manage citations and references (BibTeX) internally and inject them into the LaTeX.  
7. Let users compile, persist, and download the final paper (PDF + `.tex` + `.bib`, plus optional Markdown).

***

## Core User Flow

1. User signs in.  
2. User creates or selects a research project.  
3. User selects:
   - Paper type (survey, empirical, theoretical, etc.).  
   - Target venue or style (e.g., IEEE, ACM).  
4. User enters the project workspace (collaborative editor).  
5. User describes the paper idea in natural language.  
6. AI:
   - Refines the idea into research questions and keywords.  
   - Suggests an outline and initial section skeleton (Introduction, Literature Review, Methods, etc.).  
7. User runs literature search within the app and pins selected papers to the project.  
8. AI generates or extends sections (e.g., Literature Review, Introduction) using pinned papers.  
9. Collaborators refine text in the shared editor (plain English view).  
10. The app continuously:
    - Maintains a LaTeX shadow document.  
    - Maintains citation keys and `.bib` entries for used references.  
11. User triggers **Compile & Export**:
    - App generates full LaTeX, compiles to PDF, and persists artifacts.  
12. User reviews, downloads, or exports the paper (PDF, `.tex`, `.bib`, optional Markdown).

***

## Features

### Authentication and Projects

- User sign-in and route protection.  
- Project creation with fields:
  - Title, paper type, target venue/style, domain.  
- Project ownership and collaborator access (owner + collaborators).  
- Project list view and navigation into the workspace.

### Collaborative Editor

- Shared real-time editor (like Google Docs / Overleaf) using Liveblocks-style presence and React-based editor components.  
- Live cursors, presence indicators, and inline comments.  
- Section-based structure:
  - Introduction, Literature Review, Methods, Results, Discussion, Conclusion, References, plus custom sections.  
- Automatic, continuous saving of:
  - Plain-text sections (what users see).  
  - LaTeX sections (what’s compiled).

### Local Literature Search and Management

- Local corpus of research PDFs indexed into a vector database (e.g., FAISS).  
- In-app search:
  - Query by keywords, author, year, paper type.  
  - Show titles, abstracts, and key snippets.  
- Users can:
  - Pin papers to the project.  
  - Open a “paper view” to read and ask questions about a specific paper.  
- Pinned papers appear in a project-level citation manager.

### AI Assistance

#### Topic Refinement

- From an initial prompt, AI produces:
  - A refined research question.  
  - Topic keywords.  
  - Suggested scope and constraints.  

#### Outline Generation

- AI generates an initial section outline based on paper type and venue.

#### Section Drafting

- For each section, AI can:
  - Propose bullet-point structure.  
  - Draft paragraphs grounded on pinned papers and retrieved chunks.  
  - Insert citation placeholders.

#### Paper Understanding

- For pinned papers, AI can:
  - Summarize at different levels (basic, advanced).  
  - Extract key concepts, methods, and limitations.

### Plain-English → LaTeX Conversion

- Internal shadow LaTeX representation:
  - For each section, maintain `plain_text` and `latex_text` snapshots.  
- Automatic conversion rules:
  - Headings, lists, quotes, references, simple math.  
- Optional AI-assisted conversion:
  - For complex structures (tables, algorithm environments), AI generates LaTeX snippets based on the user’s plain description.  
- Users can optionally open an **advanced LaTeX view** to tweak generated LaTeX directly.

### Citations and References

- Project-level citation database:
  - Metadata for each pinned paper.  
  - BibTeX representation per citation.  
- Inline citation support:
  - Insert citations into plain text via UI (e.g., “Insert citation → search by author/year”).  
  - Store as placeholders in plain text, converted to `\cite{key}` in LaTeX.  
- Auto-generated References section:
  - Ensure only cited works are included.  
  - Respect style (numeric, author–year, etc.) based on venue.

### Spec / Paper Generation

- The current document graph (sections + citations) is converted to:
  - A unified LaTeX document based on a chosen template (e.g., IEEE).  
  - A Markdown version for non-LaTeX workflows.  
- Generated artifacts:
  - `main.tex`, `refs.bib`, compiled `main.pdf`, optional `paper.md`.  
- Artifacts are persisted on disk / Blob and linked to the project.  
- Users can:
  - View the PDF in-app.  
  - Download PDF, LaTeX, and BibTeX.

***

## Scope

### In Scope

- Authentication and route protection.  
- Project creation, ownership, and collaborator roles.  
- Real-time collaborative editor with presence and comments.  
- Local literature search over a pre-indexed corpus.  
- Project-level citation management (pinning papers, BibTeX generation).  
- AI-assisted:
  - Topic refinement.  
  - Outline generation.  
  - Section drafting and rewriting.  
  - Literature summaries based on retrieved papers.  
- Dual representation of the document:
  - Plain English for editing.  
  - LaTeX for compilation.  
- LaTeX compilation to PDF using local TeX installation.  
- Persistent storage of:
  - Project metadata.  
  - Pinned papers and citation data.  
  - Drafts, LaTeX snapshots, and compiled artifacts.  
- Download/export of PDF, LaTeX, BibTeX, and optional Markdown.

### Out Of Scope

- Billing and subscription systems.  
- Fine-grained permission tiers beyond owner/collaborator.  
- Full version history / branching / review workflows.  
- Mobile-native clients (iOS/Android); only responsive web.  
- Online calls to external LLM APIs at runtime (everything uses local models).  
- Real-time scraping of web literature (corpus built offline, then used locally).

***

## Success Criteria

1. A signed-in user can create and open a research project and see a section-based workspace.  
2. Multiple users can collaborate in the same project simultaneously (shared editor and presence).  
3. A user can run a literature search, pin relevant papers, and see them in the project’s citation panel.  
4. AI can:
   - Turn an initial natural-language idea into a research question and outline.  
   - Generate draft sections that cite pinned papers via placeholders.  
5. The document graph (sections + citations) can be converted into:
   - A correct LaTeX document.  
   - A compiled PDF that respects the chosen venue’s style.  
6. Project metadata, pinned papers, drafts, LaTeX snapshots, and generated artifacts are stored and retrieved correctly when reopening a project.  
7. A non-LaTeX user can write and edit the entire paper in plain English, while the system maintains valid LaTeX and references internally.

***

