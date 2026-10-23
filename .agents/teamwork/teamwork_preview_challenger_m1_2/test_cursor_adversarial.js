/**
 * Empirical Adversarial Test Harness for cursor.js (Requirement R2)
 * Tests all 5 task categories + edge cases and failure modes.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CURSOR_JS_PATH = path.resolve(__dirname, '../../../cursor.js');
const STYLES_CSS_PATH = path.resolve(__dirname, '../../../styles.css');
const INDEX_HTML_PATH = path.resolve(__dirname, '../../../index.html');

const cursorSource = fs.readFileSync(CURSOR_JS_PATH, 'utf8');
const stylesSource = fs.readFileSync(STYLES_CSS_PATH, 'utf8');
const indexHtmlSource = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

// Test runner state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    results.push({ name: testName, status: 'PASS', details });
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    results.push({ name: testName, status: 'FAIL', details });
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

// Mock DOM Environment Generator
function createMockEnvironment(options = {}) {
  const {
    pointerFine = true,
    reducedMotion = false,
    hasMatchMedia = true,
    readyState = 'complete'
  } = options;

  let nextRafId = 1;
  const activeRafs = new Map();
  let rafCallCount = 0;
  let cancelRafCount = 0;

  const listeners = {
    window: {},
    document: {}
  };

  class MockClassList {
    constructor() {
      this.classes = new Set();
    }
    add(...cls) {
      cls.forEach(c => this.classes.add(c));
    }
    remove(...cls) {
      cls.forEach(c => this.classes.delete(c));
    }
    contains(cls) {
      return this.classes.has(cls);
    }
    toString() {
      return Array.from(this.classes).join(' ');
    }
  }

  class MockElement {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase();
      this.className = '';
      this.classList = new MockClassList();
      this.style = {};
      this.attributes = {};
      this.children = [];
      this.parentNode = null;
      this.innerHTML = '';
    }

    setAttribute(k, v) {
      this.attributes[k] = String(v);
    }

    getAttribute(k) {
      return this.attributes[k] || null;
    }

    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    }

    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) {
        this.children.splice(idx, 1);
        child.parentNode = null;
      }
      return child;
    }

    closest(selector) {
      // Simple mock selector matcher
      const selectors = selector.split(',').map(s => s.trim().toLowerCase());
      let cur = this;
      while (cur) {
        for (const s of selectors) {
          if (s === cur.tagName.toLowerCase()) return cur;
          if (s.startsWith('.') && cur.classList.contains(s.slice(1))) return cur;
          if (s.startsWith('[role=') && cur.getAttribute('role') === s.slice(7, -2)) return cur;
          if (s === '[tabindex]:not([tabindex="-1"])') {
            const ti = cur.getAttribute('tabindex');
            if (ti !== null && ti !== '-1') return cur;
          }
        }
        cur = cur.parentNode;
      }
      return null;
    }
  }

  const documentBody = new MockElement('BODY');

  const doc = {
    readyState,
    body: documentBody,
    createElement: (tag) => new MockElement(tag),
    addEventListener: (type, fn, opts) => {
      listeners.document[type] = listeners.document[type] || [];
      listeners.document[type].push(fn);
    },
    removeEventListener: (type, fn) => {
      if (listeners.document[type]) {
        listeners.document[type] = listeners.document[type].filter(f => f !== fn);
      }
    },
    dispatchEvent: (type, event) => {
      const list = listeners.document[type] || [];
      for (const fn of [...list]) {
        fn(event);
      }
    }
  };

  const win = {
    document: doc,
    addEventListener: (type, fn, opts) => {
      listeners.window[type] = listeners.window[type] || [];
      listeners.window[type].push(fn);
    },
    removeEventListener: (type, fn) => {
      if (listeners.window[type]) {
        listeners.window[type] = listeners.window[type].filter(f => f !== fn);
      }
    },
    dispatchEvent: (type, event) => {
      const list = listeners.window[type] || [];
      for (const fn of [...list]) {
        fn(event);
      }
    },
    requestAnimationFrame: (cb) => {
      rafCallCount++;
      const id = nextRafId++;
      activeRafs.set(id, cb);
      return id;
    },
    cancelAnimationFrame: (id) => {
      cancelRafCount++;
      activeRafs.delete(id);
    }
  };

  if (hasMatchMedia) {
    win.matchMedia = (query) => {
      if (query.includes('(pointer: fine)')) {
        return { matches: pointerFine };
      }
      if (query.includes('prefers-reduced-motion: reduce')) {
        return { matches: reducedMotion };
      }
      return { matches: false };
    };
  }

  // Step simulation of rAF frames
  function tickRaf(time = 16) {
    if (activeRafs.size === 0) return 0;
    const currentBatch = Array.from(activeRafs.entries());
    activeRafs.clear();
    for (const [id, cb] of currentBatch) {
      cb(time);
    }
    return currentBatch.length;
  }

  function runRafUntilIdle(maxFrames = 1000) {
    let frames = 0;
    while (activeRafs.size > 0 && frames < maxFrames) {
      tickRaf();
      frames++;
    }
    return { frames, isStuck: activeRafs.size > 0 };
  }

  return {
    window: win,
    document: doc,
    tickRaf,
    runRafUntilIdle,
    getActiveRafCount: () => activeRafs.size,
    getRafCallCount: () => rafCallCount,
    getCancelRafCount: () => cancelRafCount,
    listeners
  };
}

function runCursorInEnv(env) {
  const context = {
    window: env.window,
    document: env.document,
    requestAnimationFrame: env.window.requestAnimationFrame,
    cancelAnimationFrame: env.window.cancelAnimationFrame,
    Math: Math,
    console: console
  };
  vm.createContext(context);
  vm.runInContext(cursorSource, context);
}

console.log('=== STARTING EMPIRICAL ADVERSARIAL TEST SUITE FOR CURSOR.JS ===\n');

// -------------------------------------------------------------
// TASK 1: Simulation of rapid pointer movement & lerp convergence
// -------------------------------------------------------------
console.log('--- TASK 1: Rapid Pointer Movement, Whips & Lerp Stability ---');
{
  const env = createMockEnvironment();
  runCursorInEnv(env);

  const dot = env.document.body.children.find(c => c.className === 'cursor-dot');
  const ring = env.document.body.children.find(c => c.className === 'cursor-ring');

  assert(dot && ring, 'T1.0: Cursor dot and ring injected into body');

  // Test 1.1: Rapid whipping mousemove with large coordinate swings
  const coordinates = [
    { x: 100, y: 100 },
    { x: 12000, y: -4500 },
    { x: -800, y: 99999 },
    { x: 543.21, y: 123.45 },
    { x: 0, y: 0 },
    { x: 1920, y: 1080 }
  ];

  let hasNaN = false;
  let hasInfinity = false;

  for (const pt of coordinates) {
    env.window.dispatchEvent('pointermove', { clientX: pt.x, clientY: pt.y, pointerType: 'mouse' });
    // Run multiple frames per coordinate jump
    for (let f = 0; f < 10; f++) {
      env.tickRaf();
      const dotT = dot.style.transform || '';
      const ringT = ring.style.transform || '';
      if (dotT.includes('NaN') || ringT.includes('NaN')) hasNaN = true;
      if (dotT.includes('Infinity') || ringT.includes('Infinity')) hasInfinity = true;
    }
  }

  assert(!hasNaN, 'T1.1: No NaN coordinates produced under extreme pointer whip values');
  assert(!hasInfinity, 'T1.2: No Infinity coordinates produced under extreme pointer whip values');

  // Test 1.2: Teleport jump and lerp monotonic convergence test
  env.window.dispatchEvent('pointermove', { clientX: 1000, clientY: 1000, pointerType: 'mouse' });
  env.runRafUntilIdle(200);

  // Now jump to 5000, 5000
  env.window.dispatchEvent('pointermove', { clientX: 5000, clientY: 5000, pointerType: 'mouse' });
  let prevDist = Infinity;
  let monotonicallyConverging = true;

  for (let i = 0; i < 60; i++) {
    env.tickRaf();
    const match = ring.style.transform.match(/translate3d\(([^p]+)px,\s*([^p]+)px/);
    if (match) {
      const rx = parseFloat(match[1]);
      const ry = parseFloat(match[2]);
      const dist = Math.hypot(5000 - rx, 5000 - ry);
      if (dist > prevDist + 1e-6) {
        monotonicallyConverging = false;
      }
      prevDist = dist;
    }
  }

  assert(monotonicallyConverging, 'T1.3: Lerp distance monotonically decreases each frame towards target');
  assert(prevDist < 0.2, 'T1.4: Lerp reaches within sub-pixel convergence (<0.2px) of target', `Final dist: ${prevDist}`);

  // Test 1.3: Burst of 1000 high-frequency events in same frame
  const rafBefore = env.getRafCallCount();
  for (let i = 0; i < 1000; i++) {
    env.window.dispatchEvent('pointermove', { clientX: 500 + i, clientY: 500 + i, pointerType: 'mouse' });
  }
  // During high-frequency burst, it should only schedule ONE rAF if isMoving is true
  assert(env.getActiveRafCount() <= 1, 'T1.5: High frequency pointer events do NOT flood rAF queue (<=1 active rAF)', `Active rAFs: ${env.getActiveRafCount()}`);
}

// -------------------------------------------------------------
// TASK 2: Idle State Detection and rAF Loop Sleep
// -------------------------------------------------------------
console.log('\n--- TASK 2: Idle State Detection & rAF Sleep (0 CPU Spin) ---');
{
  const env = createMockEnvironment();
  runCursorInEnv(env);

  // Mouse moves to a position
  env.window.dispatchEvent('pointermove', { clientX: 800, clientY: 600, pointerType: 'mouse' });
  const initialRafs = env.getActiveRafCount();
  assert(initialRafs === 1, 'T2.1: rAF loop starts immediately on pointermove');

  // Run until idle
  const { frames, isStuck } = env.runRafUntilIdle(200);
  assert(!isStuck, 'T2.2: rAF loop successfully terminates when idle', `Took ${frames} frames`);
  assert(env.getActiveRafCount() === 0, 'T2.3: Active rAF count is exactly 0 after reaching idle state (0 CPU spin)');

  // Advance time by 60 "virtual frames" with no mouse movement
  let extraFramesRun = 0;
  for (let f = 0; f < 60; f++) {
    extraFramesRun += env.tickRaf();
  }
  assert(extraFramesRun === 0, 'T2.4: Zero rAF frames executed during mouse inactivity (verified 0 CPU spin)');

  // Now mouse moves again: must wake up seamlessly!
  env.window.dispatchEvent('pointermove', { clientX: 850, clientY: 620, pointerType: 'mouse' });
  assert(env.getActiveRafCount() === 1, 'T2.5: rAF loop wakes up on subsequent pointermove after sleep');

  const secondRun = env.runRafUntilIdle(200);
  assert(!secondRun.isStuck, 'T2.6: rAF loop sleeps again after second movement settles');
  assert(env.getActiveRafCount() === 0, 'T2.7: Active rAF count returns to 0 after second idle');
}

// -------------------------------------------------------------
// TASK 3: Boundary Cases (mouseleave, mouseenter, blur, focus)
// -------------------------------------------------------------
console.log('\n--- TASK 3: Boundary Cases (mouseleave, mouseenter, blur, focus) ---');
{
  const env = createMockEnvironment();
  runCursorInEnv(env);

  assert(!env.document.body.classList.contains('cursor-hidden'), 'T3.1: Body does not have cursor-hidden initially');

  // mouseleave
  env.document.dispatchEvent('mouseleave', {});
  assert(env.document.body.classList.contains('cursor-hidden'), 'T3.2: mouseleave adds cursor-hidden class');

  // mouseenter
  env.document.dispatchEvent('mouseenter', {});
  assert(!env.document.body.classList.contains('cursor-hidden'), 'T3.3: mouseenter removes cursor-hidden class');

  // blur
  env.window.dispatchEvent('blur', {});
  assert(env.document.body.classList.contains('cursor-hidden'), 'T3.4: window blur adds cursor-hidden class');

  // focus
  env.window.dispatchEvent('focus', {});
  assert(!env.document.body.classList.contains('cursor-hidden'), 'T3.5: window focus removes cursor-hidden class');

  // Interleaved boundary transitions:
  // User moves mouse out (mouseleave) and switches tab (blur)
  env.document.dispatchEvent('mouseleave', {});
  env.window.dispatchEvent('blur', {});
  assert(env.document.body.classList.contains('cursor-hidden'), 'T3.6: mouseleave + blur retains cursor-hidden');

  // User returns to tab (focus) while pointer is STILL outside the window:
  env.window.dispatchEvent('focus', {});
  // NOTICE: focus removes cursor-hidden even if mouseenter hasn't fired!
  const hasHiddenOnFocusWithoutEnter = env.document.body.classList.contains('cursor-hidden');
  console.log(`  [INFO] Boundary observation: focus while pointer is outside window sets cursor-hidden: ${hasHiddenOnFocusWithoutEnter}`);
}

// -------------------------------------------------------------
// TASK 4: Graceful Degradation & Touch Teardown
// -------------------------------------------------------------
console.log('\n--- TASK 4: Graceful Degradation (Coarse Pointer, Touch, Reduced Motion) ---');
{
  // 4.1 Coarse pointer environment
  const envCoarse = createMockEnvironment({ pointerFine: false });
  runCursorInEnv(envCoarse);
  assert(envCoarse.document.body.children.length === 0, 'T4.1: Coarse pointer device skips cursor injection completely');
  assert(!envCoarse.document.body.classList.contains('cursor-active'), 'T4.2: cursor-active class not added on coarse pointer');

  // 4.2 Reduced motion environment
  const envReducedMotion = createMockEnvironment({ reducedMotion: true });
  runCursorInEnv(envReducedMotion);
  assert(envReducedMotion.document.body.children.length === 0, 'T4.3: prefers-reduced-motion skips cursor injection completely');
  assert(!envReducedMotion.document.body.classList.contains('cursor-active'), 'T4.4: cursor-active class not added on reduced motion');

  // 4.3 Environment without matchMedia
  const envNoMatchMedia = createMockEnvironment({ hasMatchMedia: false });
  let threwNoMM = false;
  try {
    runCursorInEnv(envNoMatchMedia);
  } catch (e) {
    threwNoMM = true;
  }
  assert(!threwNoMM, 'T4.5: Missing matchMedia handled gracefully without exceptions');
  assert(envNoMatchMedia.document.body.children.length === 0, 'T4.6: No cursor injected when matchMedia missing');

  // 4.4 Dynamic touch fallback (hybrid laptop / screen tap)
  const envHybrid = createMockEnvironment();
  runCursorInEnv(envHybrid);

  assert(envHybrid.document.body.children.length === 2, 'T4.7: Cursor initially injected on fine-pointer hybrid');
  assert(envHybrid.document.body.classList.contains('cursor-active'), 'T4.8: cursor-active added');

  // Simulate pointer movement to get rAF running
  envHybrid.window.dispatchEvent('pointermove', { clientX: 200, clientY: 200, pointerType: 'mouse' });
  assert(envHybrid.getActiveRafCount() > 0, 'T4.9: rAF active before touch');

  // User taps the touchscreen!
  envHybrid.window.dispatchEvent('touchstart', {});

  assert(!envHybrid.document.body.classList.contains('cursor-active'), 'T4.10: touchstart removes cursor-active');
  assert(envHybrid.document.body.children.length === 0, 'T4.11: touchstart removes dot and ring from DOM');
  assert(envHybrid.getActiveRafCount() === 0, 'T4.12: touchstart cancels pending rAF');

  // What happens if pointermove fires AFTER touchstart?
  let threwAfterTouch = false;
  try {
    envHybrid.window.dispatchEvent('pointermove', { clientX: 300, clientY: 300, pointerType: 'mouse' });
    envHybrid.tickRaf();
  } catch (e) {
    threwAfterTouch = true;
  }
  assert(!threwAfterTouch, 'T4.13: Subsequent pointermove after touch teardown does not crash');

  // 4.5 Ignore pointerType: touch on pointermove
  const envTouchPointer = createMockEnvironment();
  runCursorInEnv(envTouchPointer);
  envTouchPointer.window.dispatchEvent('pointermove', { clientX: 500, clientY: 500, pointerType: 'touch' });
  assert(envTouchPointer.getActiveRafCount() === 0, 'T4.14: pointermove with pointerType="touch" is ignored (no rAF started)');
}

// -------------------------------------------------------------
// TASK 5: Click Event Interaction & Hover Delegation
// -------------------------------------------------------------
console.log('\n--- TASK 5: Click Interaction, Hover Delegation & Non-Blocking CSS ---');
{
  const env = createMockEnvironment();
  runCursorInEnv(env);

  // 5.1 Click press feedback
  assert(!env.document.body.classList.contains('cursor-clicking'), 'T5.1: cursor-clicking not active initially');

  env.window.dispatchEvent('pointerdown', { pointerType: 'mouse' });
  assert(env.document.body.classList.contains('cursor-clicking'), 'T5.2: pointerdown adds cursor-clicking class');

  env.window.dispatchEvent('pointerup', { pointerType: 'mouse' });
  assert(!env.document.body.classList.contains('cursor-clicking'), 'T5.3: pointerup removes cursor-clicking class');

  // pointerdown with touch pointerType must NOT add cursor-clicking
  env.window.dispatchEvent('pointerdown', { pointerType: 'touch' });
  assert(!env.document.body.classList.contains('cursor-clicking'), 'T5.4: pointerdown with touch does NOT add cursor-clicking');

  // 5.2 Hover event delegation
  const testElements = [
    { tag: 'a', interactive: true },
    { tag: 'button', interactive: true },
    { tag: 'input', interactive: true },
    { tag: 'select', interactive: true },
    { tag: 'textarea', interactive: true },
    { tag: 'summary', interactive: true },
    { tag: 'div', role: 'button', interactive: true },
    { tag: 'span', className: 'btn', interactive: true },
    { tag: 'span', className: 'chip', interactive: true },
    { tag: 'div', className: 'at-pin', interactive: true },
    { tag: 'div', className: 'poster', interactive: true },
    { tag: 'div', tabindex: '0', interactive: true },
    { tag: 'div', tabindex: '-1', interactive: false },
    { tag: 'p', interactive: false },
    { tag: 'div', interactive: false },
    { tag: 'section', interactive: false }
  ];

  for (const t of testElements) {
    const el = env.document.createElement(t.tag);
    if (t.role) el.setAttribute('role', t.role);
    if (t.className) el.classList.add(t.className);
    if (t.tabindex) el.setAttribute('tabindex', t.tabindex);
    env.document.body.appendChild(el);

    // Test pointerover
    env.document.dispatchEvent('pointerover', { target: el });
    const hasHover = env.document.body.classList.contains('cursor-hover');
    if (t.interactive) {
      assert(hasHover, `T5.5: Hovering on interactive <${t.tag} class="${t.className||''}" role="${t.role||''}"> adds cursor-hover`);
    } else {
      assert(!hasHover, `T5.6: Hovering on non-interactive <${t.tag} tabindex="${t.tabindex||''}"> does NOT add cursor-hover`);
    }

    // Test pointerout
    env.document.dispatchEvent('pointerout', { target: el });
    assert(!env.document.body.classList.contains('cursor-hover'), `T5.7: pointerout from <${t.tag}> removes cursor-hover`);

    env.document.body.removeChild(el);
  }

  // Nested interactive element test: <span> inside <button>
  const parentBtn = env.document.createElement('button');
  const childSpan = env.document.createElement('span');
  parentBtn.appendChild(childSpan);
  env.document.body.appendChild(parentBtn);

  env.document.dispatchEvent('pointerover', { target: childSpan });
  assert(env.document.body.classList.contains('cursor-hover'), 'T5.8: Pointer over child of interactive element triggers hover via .closest()');
  env.document.dispatchEvent('pointerout', { target: childSpan });
  assert(!env.document.body.classList.contains('cursor-hover'), 'T5.9: Pointer out of child removes hover');
  env.document.body.removeChild(parentBtn);

  // 5.3 CSS pointer-events: none verification
  // Parse styles.css to ensure .cursor-dot and .cursor-ring have pointer-events: none
  const dotRingMatch = stylesSource.match(/\.cursor-dot,\s*\.cursor-ring\s*\{[^}]+\}/);
  assert(dotRingMatch !== null, 'T5.10: styles.css contains ruleset for .cursor-dot, .cursor-ring');
  if (dotRingMatch) {
    const rules = dotRingMatch[0];
    assert(rules.includes('pointer-events: none'), 'T5.11: .cursor-dot and .cursor-ring have pointer-events: none', rules);
    assert(rules.includes('position: fixed'), 'T5.12: .cursor-dot and .cursor-ring have position: fixed');
    assert(rules.includes('z-index: 99999'), 'T5.13: .cursor-dot and .cursor-ring have high z-index (99999)');
  }
}

// -------------------------------------------------------------
// ADVERSARIAL DISCOVERY & EDGE CASE EXPOSURE
// -------------------------------------------------------------
console.log('\n--- ADVERSARIAL EDGE CASE TESTS & ANOMALY SCANNING ---');
{
  // Test A: Initial Position Flash / Artifact Scan before first mousemove
  const env = createMockEnvironment();
  runCursorInEnv(env);

  const dot = env.document.body.children.find(c => c.className === 'cursor-dot');
  const ring = env.document.body.children.find(c => c.className === 'cursor-ring');

  const dotTransform = dot.style.transform;
  const ringTransform = ring.style.transform;
  const bodyHasCursorActive = env.document.body.classList.contains('cursor-active');

  console.log('  Initial state before any mousemove:');
  console.log('    body.classList.cursor-active:', bodyHasCursorActive);
  console.log('    dot.style.transform:', dotTransform || '(empty)');
  console.log('    ring.style.transform:', ringTransform || '(empty)');

  // In styles.css:
  // .cursor-dot, .cursor-ring { opacity: 0; }
  // body.cursor-active .cursor-dot, body.cursor-active .cursor-ring { opacity: 1; }
  // Because cursor-active is added immediately in initCursor(), before mouse moves,
  // CSS sets opacity: 1 on .cursor-dot and .cursor-ring!
  // And dot has top: 0, left: 0, margin: -3px; ring has top: 0, left: 0, margin: -18px!
  // If dot.style.transform is empty, they sit at screen coordinate (0, 0)!
  const initialTransformEmpty = (!dotTransform || dotTransform === '') && (!ringTransform || ringTransform === '');
  if (initialTransformEmpty && bodyHasCursorActive) {
    console.log('  [OBSERVATION] Potential Visual Artifact: Before first mousemove, body has cursor-active (opacity: 1), but dot and ring have no transform set, sitting at top: 0, left: 0 until mouse moves.');
  }

  // Test B: Sub-pixel precision / floating point rounding stability
  // What if clientX / clientY are fractions like 100.333333333?
  env.window.dispatchEvent('pointermove', { clientX: 100.333333333, clientY: 200.666666666, pointerType: 'mouse' });
  const { frames: subFrames, isStuck: subStuck } = env.runRafUntilIdle(200);
  assert(!subStuck, 'TA.1: Fractional/sub-pixel coordinates settle to idle correctly', `Settled in ${subFrames} frames`);

  // Test C: Negative off-screen coordinate convergence
  env.window.dispatchEvent('pointermove', { clientX: -50, clientY: -50, pointerType: 'mouse' });
  const { frames: negFrames, isStuck: negStuck } = env.runRafUntilIdle(200);
  assert(!negStuck, 'TA.2: Off-screen negative coordinates converge to idle correctly', `Settled in ${negFrames} frames`);

  // Test D: Memory leak / event listener teardown audit
  // On touchstart, only touchstart removes itself. What about other listeners?
  env.window.dispatchEvent('touchstart', {});
  console.log('  [OBSERVATION] Listeners remaining after touchstart:');
  console.log('    window pointermove count:', (env.listeners.window.pointermove || []).length);
  console.log('    document pointerover count:', (env.listeners.document.pointerover || []).length);
  console.log('    window pointerdown count:', (env.listeners.window.pointerdown || []).length);
}

console.log('\n=== SUMMARY OF EMPIRICAL ADVERSARIAL TESTING ===');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

process.exit(failedTests > 0 ? 1 : 0);
