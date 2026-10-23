# DISPATCH — 2026-10-15T15:02:33Z

You are Worker 1 implementing Milestone 1: Vayra Landing Page UI Integration.

Your Working Directory: C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\.agents\teamwork\teamwork_preview_worker_m1
Project Root: C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1
Original Request Path: C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md Path: C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\PROJECT.md

Explorer Reports:
- Abstra Reference Analysis: C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\.agents\teamwork\teamwork_preview_explorer_survey_1\survey_abstra.md
- Vayra & Locked Copy Catalog: C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\.agents\teamwork\teamwork_preview_explorer_survey_2\survey_vayra.md
- Integration Plan & Architecture: C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\.agents\teamwork\teamwork_preview_explorer_survey_3\integration_plan.md
- Abstra Reference File: C:\Users\mauri\Downloads\Abstra-Home-v2_1.html

Write Ownership:
You exclusively own `public/index.html` (and any related assets under `public/`).

Core Requirements:
1. Implement the key structural UI/UX features from the Abstra reference design into Vayra (`public/index.html`):
   - Ambient Flashlight & Spotlight Cursor Tracking (hero and card spotlight tracking using lerp and CSS custom properties)
   - Talent Rail Horizontal Carousel (scroll-snap / drag or button-navigated rail showcasing Vayra's talent and operator capabilities)
   - Interactive Split Process Panels / Tabs (synchronizing process stages with preview details and progress state)
   - Scroll Reveal Engine (`.vy-rv` with IntersectionObserver and prefers-reduced-motion fallback)
   - Real-time FAQ Search & Category Filter (client-side query matching with zero results fallback)
2. STRICT COPY PRESERVATION (NO TEXT CHANGES):
   CRITICAL — You MUST NOT copy or alter any of the marketing copy, text, or messaging currently in Vayra's `public/index.html`. Every heading, subtitle, body paragraph, metric, CTA label, and FAQ question/answer belongs to Vayra and is strictly locked. Only extract HTML structure, CSS styles, and JavaScript functionality from the reference.
3. DARK THEME HARMONIZATION:
   Ensure all ported components adapt perfectly to Vayra's existing dark theme palette (`--ink: #0A0F1F`, `--ink-2: #111934`, `--sun: #FFB547`, `--paper: #EADFCB`, `--sand: #C9BFA8`, etc.).
4. NAMESPACING:
   Use the `.vy-` namespace for all newly integrated classes and elements to avoid any collision with existing Vayra styling.
5. VALIDATION:
   Ensure there are zero syntax errors and zero JavaScript console errors when loaded.
