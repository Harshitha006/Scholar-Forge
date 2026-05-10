## Theme

Dark-only. The app feels like a focused **research cockpit**: near‑black background, layered writing surfaces, and vivid accents for AI actions and citations.

All colors are CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

| Role             | CSS Variable             | Hex / Value               |
| ---------------- | ------------------------ | ------------------------- |
| Page background  | `--bg-base`              | `#080809`                 |
| Surface          | `--bg-surface`           | `#111114`                 |
| Elevated surface | `--bg-elevated`          | `#18181c`                 |
| Subtle surface   | `--bg-subtle`            | `#1e1e23`                 |
| Default border   | `--border-default`       | `#2a2a30`                 |
| Subtle border    | `--border-subtle`        | `#3a3a42`                 |
| Primary text     | `--text-primary`         | `#f0f0f4`                 |
| Secondary text   | `--text-secondary`       | `#c0c0cc`                 |
| Muted text       | `--text-muted`           | `#808090`                 |
| Faint text       | `--text-faint`           | `#505060`                 |
| Brand accent     | `--accent-primary`       | `#00c8d4`                 |
| Brand dim        | `--accent-primary-dim`   | `rgba(0, 200, 212, 0.12)` |
| AI accent        | `--accent-ai`            | `#6457f9`                 |
| AI text          | `--accent-ai-text`       | `#8b82ff`                 |
| Error            | `--state-error`          | `#ff4d4f`                 |
| Success          | `--state-success`        | `#34d399`                 |
| Warning          | `--state-warning`        | `#fbbf24`                 |

Tailwind utilities map to these variables. Use `bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`, `text-copy-primary`, `text-copy-muted`, `border-surface-default`, `border-surface-subtle`, `text-brand`, `bg-accent-dim`, `text-ai`, etc.

***

## Typography

| Role      | Font       | CSS Variable           |
| --------- | ---------- | ---------------------- |
| UI text   | Geist Sans | `--font-geist-sans`    |
| Code/mono | Geist Mono | `--font-geist-mono`    |

Fonts are loaded via `next/font` and applied as CSS variables on `<html>`. Body uses Geist Sans with `antialiased`.

Usage:

- General UI, section titles, paragraph text: Geist Sans.
- LaTeX source, BibTeX, code blocks, inline math previews: Geist Mono.

***

## Border Radius

Radius increases with depth: small inside, larger outside.

| Context                 | Class         |
| ----------------------- | ------------- |
| Inline / small controls | `rounded-xl`  |
| Cards / panels          | `rounded-2xl` |
| Modal / overlay         | `rounded-3xl` |

Examples:

- Citation chips, buttons → `rounded-xl`.
- Project cards, sidebars, editor panels → `rounded-2xl`.
- New Project modal, Compile modal, Explain‑paper dialog → `rounded-3xl`.

***

## Document & Tag Palette (Canvas Equivalent)

Instead of system-design nodes, your palette is used for **section tags, status chips, and alerts**. Define in `types/ui.ts` as `SECTION_TAG_COLORS`.

| Fill      | Text      | Character / Usage                                  |
| --------- | --------- | -------------------------------------------------- |
| `#1F1F1F` | `#EDEDED` | Neutral (default section chip)                     |
| `#10233D` | `#52A8FF` | Methods/Results tags, data-related highlights      |
| `#2E1938` | `#BF7AF0` | AI-related tags (AI suggestions, AI tools)        |
| `#331B00` | `#FF990A` | Warnings, “Needs human review” indicators         |
| `#3C1618` | `#FF6166` | Errors (LaTeX compile failed, missing citations)  |
| `#3A1726` | `#F75F8F` | Experimental/optional features, draft markers     |
| `#0F2E18` | `#62C073` | Success (compiled, section ready, tests passed)   |
| `#062822` | `#0AC7B4` | Literature / reference tags, pinned paper labels  |

Default pill: neutral dark fill + light text.

***

## “Edges” and Relationships

You don’t have graph edges, but you do have relationships:

- Section ↔ Citations
- Section ↔ Pinned papers
- Project ↔ Artifacts

Visual conventions:

- Use **subtle connector cues** instead of lines:
  - Small dot indicators in section list showing citation count.
  - Citation pills that highlight when you hover a reference in the Citations tab.
- Keep relationship cues secondary:
  - Use thinner borders and subtler colors than main text, similar to “edges are visually secondary” in a canvas.

***

## Component Library

- Use **shadcn/ui** over Tailwind for primitives.
- Components live in `components/ui/*`.
- Use `shadcn` CLI to add components; don’t rewrite library components.
- Project-specific layout and logic live in higher-level components:
  - `components/layout/AppShell.tsx`
  - `components/editor/SectionEditor.tsx`
  - `components/sidebar/SectionsSidebar.tsx`
  - `components/sidebar/AiSidebar.tsx`

***

## Layout Patterns

- **Editor workspace**:
  - Full viewport under the navbar.
  - Three zones:
    - Left floating sidebar: sections outline and project summary.
    - Center: main editor (plain or split view).
    - Right slide-over: AI & Literature sidebar.

- **Sidebars**:
  - Floating surfaces on `bg-base`:
    - `bg-elevated`, `border-surface-default`, `rounded-2xl`.
    - Slight inner shadow or subtle border to separate from base.

- **Modals / dialogs**:
  - Centered, `rounded-3xl`, `bg-elevated`, `border-surface-default`.
  - Backdrop blur with semi-transparent dark overlay.

- **Navbar**:
  - Top bar with `bg-surface`, bottom border `border-surface-default`.
  - Contains:
    - Logo + “Projects” entry on left.
    - Current project title and type in center.
    - Presence, compile status, and user menu on right.

***

## Icons

- **Lucide React**, stroke icons only.
- Sizes:
  - `h-4 w-4` for inline (inside buttons, chips, small controls).
  - `h-5 w-5` for primary action buttons and toolbar icons.
  - `h-8 w-8` for empty states and feature highlights.

Usage examples:

- Sections:
  - File-text for Introduction.
  - Book-open for Literature Review.
  - Flask/beaker for Methods.
  - Bar-chart for Results.
  - Message-circle for Discussion.
- AI:
  - Sparkles/wand icon in `text-ai`.
- Compilation/export:
  - File-output or file-down icon in `text-brand`.

***

