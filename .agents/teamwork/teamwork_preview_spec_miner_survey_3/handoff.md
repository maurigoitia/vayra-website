# Specification Mining Report: Vayra Landing Page Optimization & UI Enhancements

**Agent ID**: `teamwork_preview_spec_miner_survey_3`  
**Parent ID**: `3dc578a4-ac2d-40e8-a68e-78abde621e2d`  
**Target Specification Source**: `ORIGINAL_REQUEST.md` (at `C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\.agents\teamwork\ORIGINAL_REQUEST.md`) and Reference Implementation in `index.html` & `styles.css`.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | SVG & Asset Extraction | Map Path Defs Extraction | Extraction of massive `<path>` vectors (`#m-us`, `#m-other`, `#m-city`) from lines 171–175 of `index.html` into a standalone asset file (e.g. `map.svg`). | External SVG asset file requested by browser; referenced via `<use href="...">` or injected DOM. | Identical map rendering with reduced initial HTML payload size (<65 KB vs baseline 126,255 bytes). | If asset 404s or CORS blocks `<use>`, map fails to render; must maintain same-origin relative path. | `ORIGINAL_REQUEST.md` R1 & lines 171–175 of `index.html` |
| 2 | SVG & Asset Extraction | Dynamic Route Vector Preservation | The map route `<path id="at-route">` is dynamically mutated by JS (`routeTo(c)`) using quadratic bezier curves connecting selected coast and talent city. | Selected coast city coordinates (`coast.px`, `coast.py`) and talent city coordinates (`c.px`, `c.py`). | Dynamic SVG path attribute `d="M... Q... ..."` stroke rendered with `#FFB547` dashed line. | If `<path id="at-route">` is removed or isolated in non-DOM asset (e.g. `<img>`), JS throws `TypeError: Cannot read properties of null (reading 'setAttribute')`. | `index.html` lines 184, 489–491 |
| 3 | SVG & Asset Extraction | Map Pin & Overlay Coordinate System | Interactive buttons (`.at-pin`), labels (`#at-label`), and user location (`#at-you`) are positioned over `.mapfield` using CSS percentages `--x` and `--y` derived from viewbox (600x800). | User clicks or hovers over city pins, or changes US coast selector. | Pin highlight, ripple animation (`ping`), city details update, route re-drawn. | Broken relative container aspect-ratio (`600/764`) causes pin misalignment against map continents. | `index.html` lines 186–203, `styles.css` lines 144–154 |
| 4 | Pointer & Cursor Animation | Desktop Mouse Tracking | Smooth custom cursor / pointer animation tracking mouse movement across desktop viewports. | `mousemove` event coordinates (`e.clientX`, `e.clientY`, `e.pageX`, `e.pageY`). | Custom cursor element(s) styled and translated via hardware-accelerated CSS `transform: translate3d(x, y, 0)` or lerp rAF loop. | High CPU usage or frame drops if forced reflow / layout thrashing occurs; must avoid mutating `top`/`left` directly. | `ORIGINAL_REQUEST.md` R2 & Acceptance Criteria |
| 5 | Pointer & Cursor Animation | Interactive Element Hover States | Pointer expands, morphs, or switches styling (e.g. scaling up, ring expansion, or blend-mode change) when hovering over interactive targets (`a`, `button`, `.chip`, `.at-pin`, `select`, `input`, `summary`). | Pointer enters/leaves interactive elements (`mouseenter`, `mouseleave`, or event delegation). | Active hover class applied to custom cursor element (e.g. `.cursor--hover`, `transform: scale(1.6)`). | Overlapping z-index or missing `pointer-events: none` on cursor elements blocks click events to underlying buttons/links. | `ORIGINAL_REQUEST.md` R2 implicit UI standards |
| 6 | Pointer & Cursor Animation | Click / Active State Feedback | Subtle scale-down or pulse reaction when user clicks anywhere on the document. | `mousedown`, `mouseup`, `pointerdown`, `pointerup`. | Cursor scale reduces momentarily (e.g., `scale(0.85)`). | Sticking in pressed state if `mouseup` occurs outside browser window. | `ORIGINAL_REQUEST.md` R2 implicit interaction design |
| 7 | Pointer & Cursor Animation | Viewport Boundary Handling | Pointer smoothly hides / fades out when cursor exits the document/window and reappears upon reentry. | `mouseleave` on document / window, `mouseenter`. | Opacity set to 0 when out of bounds; opacity set to 1 on return. | Cursor stuck at the edge of the screen when user alt-tabs or moves mouse into browser toolbar/tabs. | Edge case probing & DOM event specifications |
| 8 | Accessibility & Degradation | Coarse Pointer / Touch Degradation | On mobile devices, tablets, and touchscreens, custom cursor must be completely disabled and hidden. | `@media (pointer: coarse)`, `@media (hover: none)`. | Custom cursor elements set to `display: none !important`; native touch events unimpeded. | Ghost cursor visible on tap; tapping buttons gets blocked by lingering cursor div. | `ORIGINAL_REQUEST.md` R2 ("provided it degrades gracefully") |
| 9 | Accessibility & Degradation | Reduced Motion Support | Respect user's motion preferences by disabling inertial/spring delay or falling back cleanly. | `window.matchMedia('(prefers-reduced-motion: reduce)')`. | Cursor instantly snaps to pointer or defaults to native cursor without trailing lerp animations. | Vestibular motion triggers motion sickness for users with vestibular disorders if aggressive lag/lerp is forced. | `ORIGINAL_REQUEST.md` R2 & `index.html` lines 450, 589 |
| 10 | Performance & Payload | Document Payload Reduction | Reduction of `index.html` document transfer size from baseline 126,255 bytes down to < 65 KB. | Static file request for `index.html`. | Measurably reduced byte size, faster HTML parsing and Time To First Contentful Paint (FCP). | Over-extracting essential above-the-fold content or breaking DOM bindings. | `ORIGINAL_REQUEST.md` Acceptance Criteria |
| 11 | Error Prevention & Console Health | Zero Console Error Guarantee | Flawless load with zero JavaScript exceptions, no failed 404 network requests, and no unhandled promise rejections. | Page initial load, city selection, coast selection, modal opening, calculator interaction. | Clean Chrome DevTools Console with zero `page_errors`. | `mcp__chrome-devtools__page_errors` triggers test failure if external SVG fails to load or script errors. | `ORIGINAL_REQUEST.md` Acceptance Criteria |

---

## Edge Cases

| # | Feature | Input / Condition | Observed / Expected Behavior | Verification Rule |
|---|---------|-------------------|------------------------------|-------------------|
| E1 | SVG Extraction | Opening via `file://` protocol vs HTTP server | SVG `<use href="asset.svg#id">` is subject to cross-origin security restrictions in `file://` scheme on Chrome/Firefox. | Must be served via HTTP/HTTPS local server (e.g. `npx serve` or Python `http.server`) or fallback gracefully; ensure relative URL is clean. |
| E2 | SVG Extraction | Missing DOM element `#at-route` | If developer replaces entire map `<svg>` with static `<img>` or `object`, `document.getElementById('at-route')` returns `null`. Line 490 executes `$('at-route').setAttribute(...)`, throwing fatal `TypeError`. | `#at-route` MUST remain directly accessible within the inline SVG or DOM tree manipulated by `routeTo()`. |
| E3 | SVG Extraction | Continental Path Aspect Ratio & Alignment | Map viewBox is `0 0 600 800`. The pins are positioned using CSS percentages (e.g., Mendoza `px: 369.4`, `x: 61.56%`). | If extracted SVG viewBox or bounding box changes, pins will point to water or wrong landmasses. Visual alignment must match baseline 1:1. |
| E4 | Pointer Tracking | Cursor `pointer-events` leak | Custom cursor div created without `pointer-events: none`. | Blocks all clicks, text selection, link navigation, and button triggers across the entire page. Must have `pointer-events: none !important`. |
| E5 | Pointer Tracking | Mouse leaves viewport (`mouseleave`) | User moves cursor out of the browser window into the URL bar, developer tools, or secondary monitor. | Custom cursor should immediately hide (`opacity: 0` or inactive state). It must not freeze at the window border. |
| E6 | Pointer Tracking | Window blur / Alt-Tab | User presses Alt-Tab or switches application window while cursor is inside viewport. | Custom cursor must hide on `window.onblur` to avoid persistent ghost cursor. |
| E7 | Pointer Tracking | High DPI / Retina Scaling & Zoom | User zooms in/out (e.g. 150%, 200%) or uses 4K display. | Custom cursor position calculations based on `clientX/clientY` must remain perfectly aligned with native pointer hotspot without offset drift. |
| E8 | Pointer Tracking | Fast flick / Rapid Mouse Movement | User whips mouse across screen faster than 60Hz/120Hz display refresh. | Cursor lerp loop must not detach or produce visual jitter; inner dot should track immediately while trailing aura catches up smoothly. |
| E9 | Touch Devices | Touchscreen tap on button | User on mobile (iPhone/Android) or laptop with touchscreen taps a button or link. | Custom cursor must not appear at the tap coordinate, and touch taps must not trigger mouse-follow logic. |
| E10 | Reduced Motion | OS set to `prefers-reduced-motion: reduce` | User has reduced motion enabled in Windows/macOS settings. | Animation lag/inertia must be disabled, or custom cursor deactivated in favor of standard system cursor. |
| E11 | Interactive Elements | Dynamic elements & Modals | User triggers the Exit modal (`#exit`), cities chips, or calculator slider (`#cnt-range`). | Pointer hover and active states must correctly handle dynamically shown modal elements and form range inputs without z-index collisions (exit modal `z-index` is 100). |
| E12 | Extracted Asset Caching | HTTP cache headers & Cache-Busting | Browser caches `map.svg`. | Extracted SVG must have valid MIME type `image/svg+xml` and proper encoding. |

---

## 5-Component Handoff Report

### 1. Observation
1. **Current `index.html` File Size & Composition**:
   - Path: `C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\index.html`
   - Total file size: `126,255` bytes across `868` lines.
   - Lines 171–175:
     ```html
     <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
       <path id="m-us" d="...">
       <path id="m-other" d="...">
       <path id="m-city" d="...">
     </defs></svg>
     ```
   - Total character length of lines 171–175 alone: `65,543` characters (~65.5 KB), representing **51.9%** of the entire document payload.
2. **DOM Dependency on Map Elements**:
   - Lines 180–185:
     ```html
     <svg viewBox="0 0 600 800" role="img" aria-label="Map of the Americas with the Latin American cities where Vayra talent lives">
       <use href="#m-us" fill="#141D38" stroke="#0A0F1F" stroke-width=".8"/>
       <use href="#m-other" fill="#1A2447" stroke="#0A0F1F" stroke-width=".8"/>
       <use href="#m-city" fill="#26355F" stroke="#0A0F1F" stroke-width=".8"/>
       <path id="at-route" d="" fill="none" stroke="#FFB547" stroke-width="1.6" stroke-dasharray="4 6" stroke-linecap="round" opacity=".85"/>
     </svg>
     ```
   - Lines 488–491 (JavaScript):
     ```javascript
     var $ = function(id){ return document.getElementById(id); };
     function routeTo(c){
       var mx = (c.px + coast.px)/2 + (c.px > coast.px ? 70 : -70), my = (c.py + coast.py)/2;
       $('at-route').setAttribute('d','M' + c.px + ' ' + c.py + ' Q' + mx + ' ' + my + ' ' + coast.px + ' ' + coast.py);
     }
     ```
   - Lines 492–500 (`renderCity`): Calls `routeTo(c)`.
3. **Styling & Pins**:
   - `styles.css` line 144: `.mapfield{position:relative;background:#0A0F1F;aspect-ratio:600/764}`.
   - `styles.css` line 145: `.mapfield > svg{position:absolute;inset:0;width:100%;height:100%}`.
   - `styles.css` lines 147–152: `.at-pin` positioned with `--x`, `--y` percentages.
4. **Existing Reduced Motion Logic**:
   - `index.html` lines 450, 589: `var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;`.
5. **No Existing Cursor Animation**:
   - Currently, no custom cursor markup, styling, or scripts exist in `index.html` or `styles.css`. Standard system cursor is in use.

---

### 2. Logic Chain
1. **Payload Reduction Mechanism**:
   - Removing lines 171–175 (`<defs>` containing `#m-us`, `#m-other`, `#m-city`) and placing them into `map.svg` immediately decreases `index.html` from 126,255 bytes to ~60,712 bytes.
   - This satisfies Acceptance Criterion 1: *"index.html payload size is measurably reduced compared to its current size"*.
2. **Rendering Integrity & JS Safety**:
   - If the entire visible SVG (`<svg viewBox="0 0 600 800">`) were removed or replaced with an `<img src="map.svg">`, the script would fail at line 490 because `$('at-route')` would evaluate to `null`.
   - Therefore, the extraction must either:
     - Reference external defs: `<use href="map.svg#m-us" ...>`, `<use href="map.svg#m-other" ...>`, `<use href="map.svg#m-city" ...>` while keeping the visible `<svg viewBox="0 0 600 800">` and `<path id="at-route">` inline in `index.html`; OR
     - Provide an SVG background layer while keeping `<svg viewBox="0 0 600 800">` containing `#at-route` inline.
   - This satisfies Acceptance Criterion 2: *"The extracted map SVG renders exactly as it did inline, visually verified using Chrome DevTools via MCP"*, and Criterion 3: *"No `mcp__chrome-devtools__page_errors` occur in the console when loading the site"*.
3. **Interactive Pointer Architecture**:
   - The custom cursor tracking requirement mandates visibility and tracking on desktop viewports while degrading gracefully.
   - Technical constraints require:
     - `pointer-events: none` on cursor elements so underlying DOM clicks are never intercepted.
     - `@media (hover: hover) and (pointer: fine)` scoping so touch/mobile devices do not see a displaced cursor dot.
     - Hardware-accelerated positioning (`transform: translate3d(...)`) inside `requestAnimationFrame` to maintain 60–120 FPS without jank or layout recalculations.
     - Hover detection on interactive elements (`a`, `button`, `.chip`, `.at-pin`, `select`) to give a modern, polished feel.
     - Handling `mouseleave` and `blur` to prevent orphan cursor states when the mouse leaves the browser viewport.

---

### 3. Caveats
- **Local `file://` Protocol Security**: If tested directly via `file:///.../index.html`, modern browser cross-origin security rules block SVG `<use href="map.svg#id">`. Verification must be performed via a local HTTP server (e.g. `npx serve .` or `python -m http.server 8000`).
- **Font & External Resource Loading**: Fonts from Google Fonts are linked. In disconnected environments, font fallback occurs; visual checks must focus on map layout and pointer movement rather than webfont glyph rendering.
- **Existing JSON-LD Anomaly**: Line 755 in `index.html` has a known pre-existing markup anomaly (embedded HTML inside JSON-LD FAQ text). This is out of scope for R1/R2 and must not be touched unless specifically directed.

---

### 4. Conclusion
The specification for optimizing the Vayra landing page consists of two core deliverables:
1. **R1 (SVG Extraction)**: Extract the 65.5 KB SVG defs from lines 171–175 of `index.html` into a separate asset (`map.svg`), reducing `index.html` by >50% (down to ~60.7 KB), preserving the inline `<svg viewBox="0 0 600 800">` and `<path id="at-route">` so the dynamic route rendering and city pin coordinates function without console errors.
2. **R2 (Interactive Pointer Animation)**: Implement a lightweight, high-performance vanilla JS or CSS/rAF pointer animation that smoothly tracks mouse coordinates on desktop viewports, expands on interactive targets, possesses `pointer-events: none`, hides when the mouse leaves the window, and gracefully deactivates on touch/coarse pointers and under `prefers-reduced-motion`.

---

### 5. Verification Method & Pass/Fail Metrics

#### A. Reviewer & Forensic Auditor Pass/Fail Metrics Table

| Metric | Target / Threshold | Pass Condition | Fail Condition |
|---|---|---|---|
| **`index.html` File Size** | < 70,000 bytes (Baseline: 126,255 bytes) | Size reduction > 45% (target ~60.7 KB) | File size >= 120,000 bytes (no extraction or negligible reduction) |
| **Console Errors (`page_errors`)** | 0 errors | Console error count === 0 on page load, city click, and scroll | Any uncaught exception, 404 for `map.svg`, or null reference on `at-route` |
| **Map Visual Fidelity** | Identical to baseline | Chrome DevTools screenshot of `#atlas` matches baseline colors (`#141D38`, `#1A2447`, `#26355F`, `#FFB547`), pins, and labels | Map continents blank, blacked out, misaligned, or missing dashed route |
| **Dynamic Route Functionality** | Functional on pin click | Clicking any pin (e.g. `[data-city="sao-paulo"]`) updates route arc path without error | Clicking pin does not update arc or throws JS exception |
| **Custom Pointer Visibility (Desktop)** | Visible on desktop viewport (>= 1024px) | Custom cursor element rendered, active, and moves with mouse | Custom cursor missing, invisible, or stationary |
| **Custom Pointer Movement Tracking** | Tracks cursor coordinates | Inspecting cursor element shows dynamic `transform: translate3d(x, y, 0)` matching pointer | Transform does not update on `mousemove` |
| **Click Interference (`pointer-events`)** | `pointer-events: none` | Clicking buttons, links, and pins works smoothly with cursor active | Cursor element intercepts click events; buttons unresponsive |
| **Touch / Mobile Degradation** | Hidden on coarse pointers | On viewport 390x844 with touch enabled, custom cursor has `display: none` or opacity 0 | Custom cursor appears as a misplaced dot during touch interactions |
| **Reduced Motion Compliance** | Respects `prefers-reduced-motion` | Inertial lag / spring motion disabled when reduced motion is preferred | Rapid lerp/spring animations persist despite user preference |

#### B. Independent Verification Commands
1. **File Size Verification**:
   ```powershell
   Get-Item C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1\index.html | Select-Object Name, Length
   ```
2. **Local Server Setup & Chrome DevTools Visual Inspection**:
   ```powershell
   # Run local server
   npx --yes serve -l 8080 C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1
   ```
3. **Chrome DevTools MCP Console & Visual Verification**:
   - Navigate to `http://localhost:8080/index.html`.
   - Call `mcp__chrome-devtools__page_errors` -> expect `[]`.
   - Take screenshot of `#atlas` -> verify map continents and pins are rendered.
   - Dispatch mouse movement -> verify custom cursor element exists and transforms match coordinates.
   - Switch device emulation to iPhone / Android -> verify custom cursor is hidden and touch taps work.
