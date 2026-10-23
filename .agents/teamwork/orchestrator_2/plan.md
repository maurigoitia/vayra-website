# Plan: Vayra Landing Page UI Integration

## Objective
Integrate advanced UI/UX components from the Abstra reference design (e.g. Talent Rail, Scroll Reveals, Interactive Panels, cursor tracking/effects) into Vayra (`public/index.html`), while strictly preserving 100% of Vayra's original text copy and adapting to Vayra's dark theme aesthetics without console errors.

## Execution Steps
1. **Survey Phase (Explorers)**
   - Dispatch 3 parallel Explorers:
     - Explorer 1: Locate and dissect the Abstra reference file (inspect HTML structure, CSS rules, animations, JS behavior, Talent Rail, interactive panels, scroll reveal triggers).
     - Explorer 2: Analyze `public/index.html` (map all sections, current text copy, design tokens `--ink`, `--sun`, current CSS/JS, and structure).
     - Explorer 3: Formulate a detailed integration mapping proposal (where each component fits, how classes and scripts will be merged without breaking existing layout or touching copy).
2. **Synthesis & PROJECT.md**
   - Synthesize explorer reports into `PROJECT.md` with concrete Feature Inventory, Architecture, and Interface Contracts.
3. **Implementation Phase (Worker)**
   - Dispatch `teamwork_preview_worker` to execute the integration with strict copy preservation and dark theme styling.
   - Worker tests and validates no syntax errors and clean integration.
4. **Independent Verification & Adversarial Review**
   - Dispatch Reviewer(s) to verify code structure, theme conformance, and console health.
   - Dispatch Challenger(s) to verify interactivity and responsiveness.
   - Dispatch Forensic Auditor (`teamwork_preview_auditor`) to strictly compare text diffs against original Vayra copy to verify 100% copy preservation and zero cheating.
5. **Gate & Sentinel Reporting**
   - Record verdicts in `GATE_STATUS.md`.
   - On unanimous approval, write `handoff.md` and send completion report to parent Sentinel.
