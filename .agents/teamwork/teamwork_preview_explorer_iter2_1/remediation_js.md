# Remediation Strategy & Root-Cause Forensic Report: JavaScript Runtime Crashes

**Author**: Explorer 1 (`teamwork_preview_explorer_iter2_1`)  
**Milestone**: Iteration 2 Remediation  
**Target File**: `public/index.html`  
**Date**: 2026-10-15  

---

## Executive Summary

During headless Chrome DevTools Protocol (CDP) execution, `public/index.html` failed with a fatal unhandled runtime exception:
```
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener') at line 1325:19
```
This report delivers an exhaustive forensic breakdown of the root cause, reveals **three critical latent secondary crashes** that would execute sequentially if only the primary error were patched, audits all 4 inline scripts in `public/index.html`, and provides an exact, zero-regression replacement specification for Worker 1.

---

## 1. Forensic Root-Cause Analysis

### 1.1 The Primary Fatal Crash: Line 1325:19

In `public/index.html`, lines 1320–1332 contain the event wiring for the exit intent dialog:
```javascript
1320:   if (exitEl) {
1321:     exitEl.addEventListener('click', function(e){ if (e.target === exitEl) closeExit(); });
1322:     $('exit-close').addEventListener('click', closeExit);
1323:     $('exit-later').addEventListener('click', closeExit);
1324:     document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !exitEl.hidden) closeExit(); });
1325:     $('exit-copy').addEventListener('click', function(){
1326:       var out = $('exit-copied');
1327:       if (navigator.clipboard && navigator.clipboard.writeText) {
1328:         navigator.clipboard.writeText('hello@vayra.team').then(function(){ out.textContent = 'Copied hello@vayra.team'; }).catch(function(){ out.textContent = 'Select hello@vayra.team and copy it.'; });
1329:       } else { out.textContent = 'Select hello@vayra.team and copy it.'; }
1330:     });
1331:     $('quote-btn').addEventListener('click', mark);
1332:   }
```

#### DOM Discrepancy Evidence:
In `public/index.html` (lines 1155–1181), the `#exit` modal markup is:
```html
<div class="exit" id="exit" role="dialog" aria-modal="true" aria-labelledby="exit-title" hidden>
  <div class="exit-card split-card">
    <button class="exit-x" id="exit-close" type="button" aria-label="Close">&times;</button>
    <div class="exit-video-col">
      <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
        <source src="/avatar.mp4" type="video/mp4">
      </video>
    </div>
    <div class="exit-form-col">
      <h2 id="exit-title" style="font-size: 32px; margin-bottom: 16px;">Scaling your engineering or GTM team?</h2>
      <p style="margin-bottom: 24px; color: var(--paper-muted);">Your growth shouldn't be bottlenecked by hiring cycles. We deploy top 1% LATAM engineers and AI-augmented GTM teams in 48 hours. Drop your email to see our vetted talent.</p>
      <div id="hubspot-form-container"></div>
      <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
      <script>
        hbspt.forms.create({
          region: "na1",
          portalId: "43876008",
          formId: "3d666d6a-543e-4638-9588-e9f02931d683",
          target: "#hubspot-form-container"
        });
      </script>
      <div class="exit-actions" style="margin-top: 16px;">
        <button class="exit-later" id="exit-later" type="button">No thanks, just looking</button>
      </div>
    </div>
  </div>
</div>
```

The exit modal was previously redesigned: the manual email copy box and quote button were replaced with the embedded HubSpot form (`#hubspot-form-container`).
Consequently:
- `document.getElementById('exit')` (`exitEl`) is present.
- `document.getElementById('exit-close')` is present.
- `document.getElementById('exit-later')` is present.
- **`document.getElementById('exit-copy')` is NULL.**
- **`document.getElementById('exit-copied')` is NULL.**
- **`document.getElementById('quote-btn')` is NULL.**
- **`document.getElementById('exit-quote')` is NULL.**

Because `exitEl` is truthy, execution enters `if (exitEl)`. When it hits line 1325:
`$('exit-copy').addEventListener('click', ...)` evaluates to `null.addEventListener(...)`, immediately throwing `TypeError`.

---

## 2. Latent Secondary Crashes (Cascading Failures)

If an implementer were to only guard line 1325, the script would crash on subsequent lines. Forensic tracing revealed **three additional latent exceptions**:

### 2.1 Latent Crash #1: Line 1331 (`$('quote-btn')`)
```javascript
1331:   $('quote-btn').addEventListener('click', mark);
```
- **Evaluation**: `document.getElementById('quote-btn')` is `null`.
- **Failure**: As soon as line 1325 is guarded, line 1331 executes and throws:
  `Uncaught TypeError: Cannot read properties of null (reading 'addEventListener') at line 1331`.
- **Remediation**: Guard with `var qb = $('quote-btn'); if (qb) qb.addEventListener('click', mark);`.

### 2.2 Latent Crash #2: Line 1333 (`renderCalc()`)
```javascript
1333:   renderCalc();
```
- **Evaluation**: In `public/index.html`, `function renderCalc()` **is not defined anywhere** in the file!
  In earlier versions of the page, a salary savings calculator existed with `function renderCalc()`, `teamCounts`, `teamLevels`, and `usSalary()`. When the page was overhauled, the calculator DOM and function definition were removed, but the function invocation at line 1333 (and line 1244) remained!
- **Failure**: Because line 1325 threw synchronously, line 1333 was never reached. If the listeners on lines 1325 and 1331 are guarded, line 1333 executes immediately and throws:
  `Uncaught ReferenceError: renderCalc is not defined at line 1333`.
- **Remediation**:
  - Replace line 1333 with: `if (typeof renderCalc === 'function') { renderCalc(); }`
  - Update line 1244 with: `if (calcReady && typeof renderCalc === 'function') { renderCalc(); }`

### 2.3 Latent Crash #3: Line 1309 (`$('exit-quote').focus()`)
```javascript
1306:   function openExit(){
1307:     if (shown || seen() || !exitEl) return;
1308:     mark(); lastFocus = document.activeElement; exitEl.hidden = false;
1309:     setTimeout(function(){ $('exit-quote').focus(); }, 30);
1310:   }
```
- **Evaluation**: `#exit-quote` was an input in the legacy exit modal. It does not exist in the HubSpot form markup.
- **Failure**: Whenever exit intent is triggered (user moves mouse off the top of the viewport or scrolls rapidly up on mobile), `openExit()` executes. 30ms later, `$('exit-quote').focus()` evaluates to `null.focus()`, throwing:
  `Uncaught TypeError: Cannot read properties of null (reading 'focus')`.
- **Remediation**: Replace line 1309 with:
  ```javascript
  setTimeout(function(){
    var eq = $('exit-quote') || $('exit-close');
    if (eq && typeof eq.focus === 'function') eq.focus();
  }, 30);
  ```

---

## 3. Comprehensive DOM Query Audit of `public/index.html`

We performed an exhaustive audit of every `document.getElementById`, `document.querySelector`, `document.querySelectorAll`, and helper `$()` call across all inline scripts in `public/index.html`:

| Script Section | Query Expression | Target DOM ID / Selector | Exists in DOM? | Guarded? | Risk Assessment |
|---|---|---|---|---|---|
| **HubSpot Embed** (lines 1168–1175) | `target: "#hubspot-form-container"` | `#hubspot-form-container` | YES (line 1166) | N/A (HubSpot SDK) | SAFE |
| **Legacy Main IIFE** (lines 1184–1334) | `$('at-route')` | `#at-route` (SVG path) | YES (line 970) | Inside `routeTo()` | SAFE |
| | `$('at-label')` | `#at-label` | YES (line 988) | Inside `renderCity()` | SAFE |
| | `$('ch-name')` | `#ch-name` | YES (line 1020) | Inside `renderCity()` | SAFE |
| | `$('ch-country')` | `#ch-country` | YES (line 1020) | Inside `renderCity()` | SAFE |
| | `$('cityline')` | `#cityline` | YES (line 1023) | Inside `renderCity()` | SAFE |
| | `$('at-you')` | `#at-you` | YES (line 972) | Inside `renderCoast()` | SAFE |
| | `$('at-you-t')` | `#at-you-t` | YES (line 972) | Inside `renderCoast()` | SAFE |
| | `$(id)` for geo-notes | `#geo-note-a`, `#geo-note-b` | `#geo-note-a` YES, `b` NO | `if (n)` guarded (line 1240) | SAFE |
| | `$('say')` | `#say` | YES (line 1022) | Inside `renderTime()` | SAFE |
| | `$('band-you')` | `#band-you` | YES (line 1026) | Inside `renderTime()` | SAFE |
| | `$('band-team')` | `#band-team` | YES (line 1027) | Inside `renderTime()` | SAFE |
| | `$('strip-you')` | `#strip-you` | YES (line 1026) | Inside `renderTime()` | SAFE |
| | `$('strip-team')` | `#strip-team` | YES (line 1027) | Inside `renderTime()` | SAFE |
| | `$('shared')` | `#shared` | YES (line 1029) | Inside `renderTime()` | SAFE |
| | `$('t-hours')` | `#t-hours` | NO | `if (th2)` guarded (line 1264) | SAFE |
| | `$('t-line')` | `#t-line` | NO | Inside `if (th2)` block | SAFE |
| | `$('ch-meta')` | `#ch-meta` | YES (line 1021) | Inside `renderTime()` | SAFE |
| | `$('exit')` | `#exit` | YES (line 1155) | Assigned to `exitEl` | SAFE |
| | `$('exit-close')` | `#exit-close` | YES (line 1157) | Inside `if (exitEl)` | SAFE (add guard for hygiene) |
| | `$('exit-later')` | `#exit-later` | YES (line 1177) | Inside `if (exitEl)` | SAFE (add guard for hygiene) |
| | `$('exit-quote')` | `#exit-quote` | **NO** | **UNGUARDED** (line 1309) | **FATAL (Latent #3)** |
| | `$('exit-copy')` | `#exit-copy` | **NO** | **UNGUARDED** (line 1325) | **FATAL (Primary)** |
| | `$('exit-copied')` | `#exit-copied` | **NO** | Inside un-called callback | **FATAL if clicked** |
| | `$('quote-btn')` | `#quote-btn` | **NO** | **UNGUARDED** (line 1331) | **FATAL (Latent #1)** |
| | `renderCalc()` call | Function symbol | **NO** | **UNGUARDED** (line 1333) | **FATAL (Latent #2)** |
| **Legacy Email Copy** (lines 1493–1527) | `document.querySelectorAll('#rows .row')` | `#rows .row` | NO | `if (rows.length && !reduce)` | SAFE |
| | `document.getElementById('copy')` | `#copy` | YES (line 1132) | Assigned to `btn` | Recommend `if (btn)` guard |
| | `document.getElementById('copied')` | `#copied` | YES (line 1135) | Assigned to `out` | SAFE |
| | `document.getElementById('addr')` | `#addr` | YES (line 1131) | Assigned to `addr` | SAFE |
| **Abstra Engine `#vy-enhancements`** (lines 1534–1849) | `document.querySelectorAll('.vy-rv')` | `.vy-rv` | YES (8 elements) | `if (reveals.length)` | SAFE |
| | `document.getElementById('heroSection')` | `#heroSection` | YES (line 697) | `if (hero)` guarded (line 1564) | SAFE |
| | `document.getElementById('vyCursorDot')` | `#vyCursorDot` | YES (line 1530) | `if (cursorDot && cursorRing)` | SAFE |
| | `document.getElementById('vyCursorRing')` | `#vyCursorRing` | YES (line 1531) | `if (cursorDot && cursorRing)` | SAFE |
| | `document.querySelectorAll('.vy-pcard')` | `.vy-pcard` | YES (6 elements) | `if (cards.length)` | SAFE |
| | `document.getElementById('talentRail')` | `#talentRail` | YES (line 782) | `if (rail && railPrev && railNext)` | SAFE |
| | `document.getElementById('railPrev')` | `#railPrev` | YES (line 778) | `if (rail && railPrev && railNext)` | SAFE |
| | `document.getElementById('railNext')` | `#railNext` | YES (line 779) | `if (rail && railPrev && railNext)` | SAFE |
| | `document.querySelectorAll('.vy-gtm-tab')` | `.vy-gtm-tab` | YES (5 elements) | `if (gtmTabs.length)` | SAFE |
| | `document.getElementById('gtmAgentStage')` | `#gtmAgentStage` | YES (line 924) | `if (gtmAgentStage)` guarded | SAFE |
| | `document.getElementById('gtmAgentText')` | `#gtmAgentText` | YES (line 925) | `if (gtmAgentText)` guarded | SAFE |
| | `document.getElementById('gtmPersonStage')`| `#gtmPersonStage`| YES (line 931) | `if (gtmPersonStage)` guarded | SAFE |
| | `document.getElementById('gtmPersonText')` | `#gtmPersonText` | YES (line 932) | `if (gtmPersonText)` guarded | SAFE |
| | `document.getElementById('faqSearchInput')`| `#faqSearchInput`| YES (line 1074) | `if (faqInput && faqList)` | SAFE |
| | `document.getElementById('faqList')` | `#faqList` | YES (line 1080) | `if (faqInput && faqList)` | SAFE |

---

## 4. Concrete Remediation Proposal for Worker 1

### Scope of Changes
All changes are localized strictly to `public/index.html` lines 1244, 1306–1334, and line 1515. **Zero text copy is changed. Zero styles or HTML markup structures are changed.**

### Target 1: Lines 1244 (Calculator Safe Check)
#### Before:
```javascript
    routeTo(CITIES[cityIdx]); renderTime();
    if (calcReady) renderCalc();
  }
```
#### After:
```javascript
    routeTo(CITIES[cityIdx]); renderTime();
    if (calcReady && typeof renderCalc === 'function') renderCalc();
  }
```

### Target 2: Lines 1306–1334 (Exit Intent & Calculator Calls)
#### Before:
```javascript
  function openExit(){
    if (shown || seen() || !exitEl) return;
    mark(); lastFocus = document.activeElement; exitEl.hidden = false;
    setTimeout(function(){ $('exit-quote').focus(); }, 30);
  }
  function closeExit(){ exitEl.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener('mouseout', function(e){ if (!e.relatedTarget && e.clientY <= 0) openExit(); });
  var maxDepth = 0, lastY = window.scrollY, lastT = Date.now();
  window.addEventListener('scroll', function(){
    var y = window.scrollY, t = Date.now(), h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0) maxDepth = Math.max(maxDepth, y / h);
    if (window.matchMedia('(pointer: coarse)').matches && maxDepth > 0.45 && (lastY - y) > 140 && (t - lastT) < 260) openExit();
    lastY = y; lastT = t;
  }, {passive:true});
  if (exitEl) {
    exitEl.addEventListener('click', function(e){ if (e.target === exitEl) closeExit(); });
    $('exit-close').addEventListener('click', closeExit);
    $('exit-later').addEventListener('click', closeExit);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !exitEl.hidden) closeExit(); });
    $('exit-copy').addEventListener('click', function(){
      var out = $('exit-copied');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('hello@vayra.team').then(function(){ out.textContent = 'Copied hello@vayra.team'; }).catch(function(){ out.textContent = 'Select hello@vayra.team and copy it.'; });
      } else { out.textContent = 'Select hello@vayra.team and copy it.'; }
    });
    $('quote-btn').addEventListener('click', mark);
  }
  renderCalc();
})();
```

#### After:
```javascript
  function openExit(){
    if (shown || seen() || !exitEl) return;
    mark(); lastFocus = document.activeElement; exitEl.hidden = false;
    setTimeout(function(){
      var eq = $('exit-quote') || $('exit-close');
      if (eq && typeof eq.focus === 'function') eq.focus();
    }, 30);
  }
  function closeExit(){ exitEl.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener('mouseout', function(e){ if (!e.relatedTarget && e.clientY <= 0) openExit(); });
  var maxDepth = 0, lastY = window.scrollY, lastT = Date.now();
  window.addEventListener('scroll', function(){
    var y = window.scrollY, t = Date.now(), h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0) maxDepth = Math.max(maxDepth, y / h);
    if (window.matchMedia('(pointer: coarse)').matches && maxDepth > 0.45 && (lastY - y) > 140 && (t - lastT) < 260) openExit();
    lastY = y; lastT = t;
  }, {passive:true});
  if (exitEl) {
    exitEl.addEventListener('click', function(e){ if (e.target === exitEl) closeExit(); });
    var exitClose = $('exit-close');
    if (exitClose) exitClose.addEventListener('click', closeExit);
    var exitLater = $('exit-later');
    if (exitLater) exitLater.addEventListener('click', closeExit);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !exitEl.hidden) closeExit(); });
    var exitCopy = $('exit-copy');
    if (exitCopy) {
      exitCopy.addEventListener('click', function(){
        var out = $('exit-copied');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('hello@vayra.team').then(function(){
            if (out) out.textContent = 'Copied hello@vayra.team';
          }).catch(function(){
            if (out) out.textContent = 'Select hello@vayra.team and copy it.';
          });
        } else if (out) {
          out.textContent = 'Select hello@vayra.team and copy it.';
        }
      });
    }
    var quoteBtn = $('quote-btn');
    if (quoteBtn) quoteBtn.addEventListener('click', mark);
  }
  if (typeof renderCalc === 'function') {
    renderCalc();
  }
})();
```

### Target 3: Lines 1515 (Contact Copy Button Hygiene)
#### Before:
```javascript
  btn.addEventListener('click', function(){
```
#### After:
```javascript
  if (btn) {
    btn.addEventListener('click', function(){
      var text = addr ? addr.textContent.trim() : 'hello@vayra.team';
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          if (out) out.textContent = 'Copied: ' + text;
        }).catch(function(){
          selectAddr(); if (out) out.textContent = 'Selected. Press Ctrl+C or Cmd+C to copy.';
        });
      } else {
        selectAddr(); if (out) out.textContent = 'Selected. Press Ctrl+C or Cmd+C to copy.';
      }
    });
  }
```

---

## 5. Verification Commands & Acceptance Criteria

Once Worker 1 applies these changes:

1. **Syntax Check**:
   ```bash
   node -e "const fs = require('fs'); const { execSync } = require('child_process'); const code = fs.readFileSync('public/index.html', 'utf8'); const scripts = code.match(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi); scripts.forEach((s, i) => { const c = s.replace(/<script[^>]*>|<\/script>/gi, ''); if (c.includes('@context')) return; fs.writeFileSync('temp_t.js', c); execSync('node -c temp_t.js'); fs.unlinkSync('temp_t.js'); }); console.log('All inline scripts valid');"
   ```
2. **Reviewer 1 Test Suite**:
   ```bash
   node .agents/teamwork/teamwork_preview_reviewer_1/review_audit_m1.js
   ```
   *Expectation*: Zero console errors, zero page exceptions, all 42 tests passing.
3. **Auditor 1 Forensic Test Suite**:
   ```bash
   node .agents/teamwork/teamwork_preview_auditor_1/forensic_audit.js
   ```
   *Expectation*: `[PASS] Zero console.error calls on page load`, `[PASS] Zero unhandled runtime exceptions on page load`, 100% checks passing.
