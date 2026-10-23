# Project: Vayra Landing Page Optimization & Interactive UI Enhancements

## Architecture
A high-performance modern static web application architecture optimizing initial document payload and integrating responsive, GPU-accelerated cursor interactions:
1. **Document Layer (`index.html`)**: Lean HTML document (<65 KB, reduced by >50% from 126.3 KB) with extracted static asset references and dynamic DOM elements (`#at-route`).
2. **Asset Layer (`map.svg`)**: Standalone SVG asset containing continent path geometries (`#m-us`, `#m-other`, `#m-city`), loaded via `<img>` and cached by the browser.
3. **Interactive UI Layer (`cursor.js`)**: Decoupled, zero-dependency vanilla JS cursor controller managing two-tier pointer tracking (precision dot + lerp aura ring) via `requestAnimationFrame` with autonomous idle sleep and passive event delegation.
4. **Style Layer (`styles.css`)**: Comprehensive design system tokens (`--sun`, `--ink`, etc.), layered map positioning, and media query guards (`(hover: hover) and (pointer: fine)`, `prefers-reduced-motion: reduce`, `(pointer: coarse)`).

## Feature Inventory
Every feature from the Survey phase with its assigned milestone.
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Map Path Defs Extraction | Extract 65.5 KB SVG defs from lines 171-175 of `index.html` into standalone `map.svg`. | M1 | survey_1, survey_3 |
| 2 | Layered Map Integration | Replace inline defs and `<use>` with `<img class="map-bg" src="/map.svg">` and inline `<svg class="map-route">` with `#at-route`. | M1 | survey_1, survey_3 |
| 3 | CSS Mapfield Styling | Update `.mapfield > svg, .mapfield > img` and `.map-route { pointer-events: none }` in `styles.css`. | M1 | survey_1 |
| 4 | Dynamic Route Arc Preservation | Preserve `#at-route` DOM node and verify `routeTo(c)` calculations and arc updates on city/coast clicks. | M1 | survey_1, survey_3 |
| 5 | Two-Tier Cursor Markup & Architecture | Inner precision dot (`.cursor-dot`, 6px, `--sun`) + outer trailing aura (`.cursor-ring`, 36px) dynamically injected or structured. | M1 | survey_2 |
| 6 | GPU-Accelerated Cursor Tracking | Decoupled pointer tracking using `translate3d(x,y,0)` in `requestAnimationFrame` loop with lerp (factor ~0.18) and idle rAF sleep. | M1 | survey_2 |
| 7 | Interactive Hover States | Event-delegated hover states (`.cursor-hover`) expanding ring to 1.65x over buttons, links, chips, pins, selects, inputs. | M1 | survey_2 |
| 8 | Click & Boundary States | Click feedback (`.cursor-clicking`) scale 0.85, viewport leave/enter fade out/in, blur/focus management. | M1 | survey_2 |
| 9 | Graceful Degradation (Touch & Mobile) | Full deactivation on touch devices (`@media (pointer: coarse)`, `(hover: none)`, `touchstart` cleanup). | M1 | survey_2, survey_3 |
| 10 | Reduced Motion Compliance | Respect `prefers-reduced-motion: reduce` by disabling cursor animation and reverting to system cursor. | M1 | survey_2, survey_3 |
| 11 | Payload Size Verification | Measure `index.html` size reduction to ensure size drops from 126.3 KB to <65 KB. | M2 | survey_1, survey_3 |
| 12 | Visual & Console Health Verification | Chrome DevTools MCP check: 0 console errors, visual fidelity of map & cursor, interactive tests. | M2 | survey_3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Implementation (R1 SVG Extraction & R2 Pointer Animation) | Extract `map.svg`, implement `cursor.js`, update `index.html` & `styles.css` | none | DONE (`map.svg`, `cursor.js`, -52.0% payload) |
| 2 | M2: E2E Verification & Forensic Audit | Comprehensive verification: Reviewers (APPROVE x2), Challengers (APPROVE x2), Auditor (CLEAN) | M1 | DONE (All gates passed, 0 violations) |

## Code Layout
- `map.svg` — Extracted standalone SVG map asset (root)
- `cursor.js` — Vanilla JS pointer tracking module (root)
- `index.html` — Updated document referencing `map.svg` and `cursor.js` (root)
- `styles.css` — Updated styling for map layers and custom cursor (root)

## Interface Contracts
### `index.html` ↔ `map.svg`
- `index.html` renders `<img class="map-bg" src="/map.svg" alt="..." width="600" height="800" loading="eager" decoding="async">` inside `.mapfield`.
- `map.svg` must have `viewBox="0 0 600 800"`, valid XML declaration, root `<svg>`, and path IDs `m-us`, `m-other`, `m-city`.

### `index.html` ↔ `cursor.js`
- `cursor.js` loaded via `<script defer src="/cursor.js"></script>` in `index.html`.
- On fine-pointer devices, dynamically creates `.cursor-dot` and `.cursor-ring` or controls markup.
- `styles.css` defines `.cursor-dot`, `.cursor-ring`, `.cursor-ring-inner`, `.cursor-hover`, `.cursor-clicking`, and `@media (pointer: coarse)`.

### DOM ↔ `routeTo(c)`
- `#at-route` `<path>` must exist as a child of inline `<svg class="map-route" viewBox="0 0 600 800">`.
- Coordinates `(c.px, c.py)` map to `viewBox 0 0 600 800`.
