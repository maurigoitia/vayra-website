# Project: Vayra Landing Page UI Integration

## Architecture
- Target: `public/index.html` (and supporting assets in `public/`)
- Reference: Abstra Design Showcase (`C:\Users\mauri\Downloads\Abstra-Home-v2_1.html`)
- Design Tokens & Theme: Canonical Vayra Dark Palette
  - Backgrounds: `--ink: #0A0F1F`, `--ink-2: #111934`, `--ink-3: #182245`
  - Accents: `--sun: #FFB547` (with warm glow `#EA580C`), `--sky: #8CC8EE`, `--leaf: #7ED3A6`
  - Text: `--paper: #EADFCB`, `--sand: #C9BFA8`, `--muted: #8A8170`, `--dim: #544E42`
- Isolation Strategy:
  - All integrated components use the strict `.vy-` namespace (e.g. `.vy-rail`, `.vy-pcard`, `.vy-gtm-tab`, `.vy-gtm-panel`, `.vy-faq-input`, `.vy-rv`, `.vy-cursor-spotlight`, `.vy-ticker`) to avoid CSS collisions with Vayra's existing classes (`.cell`, `.row`, `.terminal`, etc.).
  - Pure Vanilla JavaScript and CSS; zero heavyweight external dependencies.
- Strict Invariant:
  - 100% of Vayra's original marketing copy, headings, ledes, body text, button labels, and FAQs are preserved verbatim. Zero copy changes.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Ambient Cursor & Radial Glow Tracking | Lerp-interpolated mouse tracking and radial spotlight effect on hero and interactive cards using CSS variables and requestAnimationFrame | M1 | Abstra Survey & Explorer 1/3 |
| 2 | Talent Rail / Operator Showcase Carousel | Horizontal touch/drag & arrow-driven scroll-snap rail showcasing Vayra's talent & AI loop operators without altering Vayra copy | M1 | Abstra Survey & Explorer 1/3 |
| 3 | Interactive Process Panels / Tabs | Split-panel interactive tabs (replacing static list in How We Work or GTM loops) with progress indicators and synchronized views | M1 | Abstra Survey & Explorer 1/3 |
| 4 | Staggered Scroll Reveal Engine | IntersectionObserver-powered `.vy-rv` reveal animations with threshold triggers and `prefers-reduced-motion` compliance | M1 | Abstra Survey & Explorer 1/3 |
| 5 | Interactive FAQ Search & Filtering | Real-time client-side instant tokenized search bar and category filter over Vayra's existing FAQ items | M1 | Abstra Survey & Explorer 1/3 |
| 6 | Copy & Integrity Preservation | Verification that all 8 original sections, headlines, CTAs, and body text match verbatim | M1 | Requirement R2 & Explorer 2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | UI/UX Enhancement Integration | Integrate features 1-5 into `public/index.html` with `.vy-` namespacing, dark theme tokens, and 100% copy preservation | Survey Complete | DONE |

## Interface Contracts
### Integration ↔ Vayra DOM
- `index.html` is the single source of truth.
- Integrated CSS rules are added within clean, scoped style blocks or linked stylesheet with `vy-` prefix.
- Integrated JS functions run on DOMContentLoaded and gracefully handle missing elements without throwing console errors.
- Pre-existing syntax quirk (unescaped snippet in JSON-LD at line 984) is sanitized or maintained without breaking DOM.

## Code Layout
- `public/index.html` — main landing page (owned exclusively by Worker during M1)
- `public/styles.css` / `public/` assets — existing styles and static assets
