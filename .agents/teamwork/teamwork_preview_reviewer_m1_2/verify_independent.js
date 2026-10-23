const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '../../../');
const mapSvgPath = path.join(rootDir, 'map.svg');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(rootDir, 'styles.css');
const cursorJsPath = path.join(rootDir, 'cursor.js');

let passes = 0;
let failures = 0;

function check(desc, condition, details) {
  if (condition) {
    passes++;
    console.log(`  [PASS] ${desc}`);
  } else {
    failures++;
    console.error(`  [FAIL] ${desc} ${details ? '(' + details + ')' : ''}`);
  }
}

console.log("==================================================");
console.log("INDEPENDENT FUNCTIONAL & ADVERSARIAL VERIFICATION");
console.log("==================================================");

// 1. Map Architecture & Assets
console.log("\n1. Layered Map Architecture & Payload Reduction");
const indexContent = fs.readFileSync(indexPath, 'utf8');
const indexBytes = Buffer.byteLength(indexContent, 'utf8');
const mapContent = fs.readFileSync(mapSvgPath, 'utf8');
const mapBytes = Buffer.byteLength(mapContent, 'utf8');

check("index.html payload under 65,000 bytes", indexBytes < 65000, `Actual: ${indexBytes} bytes`);
check("index.html payload reduction > 50%", ((126255 - indexBytes) / 126255) > 0.50, `Actual: ${(((126255 - indexBytes) / 126255) * 100).toFixed(2)}%`);
check("Large <defs> continent paths removed from index.html", !indexContent.includes('id="m-us"') && !indexContent.includes('id="m-other"'));
check("External map.svg referenced via <img> with .map-bg", indexContent.includes('<img class="map-bg" src="/map.svg"'));
check("Dynamic #at-route <path> preserved inline in index.html", indexContent.includes('<path id="at-route"'));
check("Inline route svg has class .map-route and viewBox 0 0 600 800", indexContent.includes('<svg class="map-route" viewBox="0 0 600 800"'));

// Check map.svg content
check("map.svg has root <svg> with viewBox 0 0 600 800", /<svg[^>]+viewBox="0 0 600 800"/.test(mapContent));
check("map.svg has xmlns attribute", mapContent.includes('xmlns="http://www.w3.org/2000/svg"'));
check("map.svg contains #m-us path with geometry", /<path id="m-us" d="M[0-9]/.test(mapContent));
check("map.svg contains #m-other path with geometry", /<path id="m-other" d="M[0-9]/.test(mapContent));
check("map.svg contains #m-city path with geometry", /<path id="m-city" d="M[0-9]/.test(mapContent));
check("map.svg properly closed with </svg>", mapContent.trim().endsWith('</svg>'));

// 2. CSS Mapfield & Cursor System
console.log("\n2. CSS Styling & Layout Guarantees");
const cssContent = fs.readFileSync(cssPath, 'utf8');

check(".mapfield > svg and .mapfield > img positioned absolutely inset 0", cssContent.includes('.mapfield > svg, .mapfield > img{position:absolute;inset:0;width:100%;height:100%}'));
check(".mapfield > .map-route has pointer-events: none", cssContent.includes('.mapfield > .map-route{pointer-events:none}'));
check(".cursor-dot has fixed position and pointer-events: none", cssContent.includes('.cursor-dot') && cssContent.includes('pointer-events: none'));
check(".cursor-ring and .cursor-ring-inner defined", cssContent.includes('.cursor-ring') && cssContent.includes('.cursor-ring-inner'));
check("Hover expansion state defined for .cursor-ring-inner", cssContent.includes('body.cursor-hover .cursor-ring-inner'));
check("Click contraction state defined for .cursor-ring-inner", cssContent.includes('body.cursor-clicking .cursor-ring-inner'));
check("Media query guards for reduced-motion and coarse pointer", cssContent.includes('@media (prefers-reduced-motion: reduce), (pointer: coarse), (hover: none)'));

// 3. Runtime Simulation of cursor.js
console.log("\n3. Runtime Simulation of cursor.js");
const cursorJsCode = fs.readFileSync(cursorJsPath, 'utf8');

function createMockEnvironment(options = {}) {
  const listeners = {};
  const bodyClasses = new Set();
  const appendedElements = [];
  let rafCallback = null;
  let rafCount = 0;

  const mockElement = (tag) => {
    return {
      tagName: tag.toUpperCase(),
      className: '',
      attributes: {},
      style: {},
      parentNode: null,
      setAttribute(k, v) { this.attributes[k] = v; },
      getAttribute(k) { return this.attributes[k]; }
    };
  };

  const body = {
    tagName: 'BODY',
    classList: {
      add: (cls) => bodyClasses.add(cls),
      remove: (cls) => bodyClasses.delete(cls),
      contains: (cls) => bodyClasses.has(cls)
    },
    appendChild: (el) => {
      el.parentNode = body;
      appendedElements.push(el);
    },
    removeChild: (el) => {
      el.parentNode = null;
      const idx = appendedElements.indexOf(el);
      if (idx !== -1) appendedElements.splice(idx, 1);
    }
  };

  const document = {
    readyState: 'complete',
    body: body,
    createElement: (tag) => mockElement(tag),
    addEventListener: (evt, fn, opts) => {
      listeners['doc:' + evt] = listeners['doc:' + evt] || [];
      listeners['doc:' + evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (listeners['doc:' + evt]) {
        listeners['doc:' + evt] = listeners['doc:' + evt].filter(f => f !== fn);
      }
    }
  };

  const window = {
    matchMedia: (query) => {
      if (query.includes('prefers-reduced-motion: reduce')) {
        return { matches: options.reducedMotion === true };
      }
      if (query.includes('(hover: hover) and (pointer: fine)')) {
        return { matches: options.finePointer !== false };
      }
      return { matches: false };
    },
    addEventListener: (evt, fn, opts) => {
      listeners['win:' + evt] = listeners['win:' + evt] || [];
      listeners['win:' + evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (listeners['win:' + evt]) {
        listeners['win:' + evt] = listeners['win:' + evt].filter(f => f !== fn);
      }
    },
    requestAnimationFrame: (cb) => {
      rafCount++;
      rafCallback = cb;
      return rafCount;
    },
    cancelAnimationFrame: (id) => {
      rafCallback = null;
    }
  };

  const trigger = (target, evt, data = {}) => {
    const fns = listeners[target + ':' + evt] || [];
    fns.forEach(fn => fn({ pointerType: 'mouse', target: null, ...data }));
  };

  const stepRaf = () => {
    if (rafCallback) {
      const cb = rafCallback;
      rafCallback = null;
      cb();
      return true;
    }
    return false;
  };

  return { window, document, listeners, bodyClasses, appendedElements, trigger, stepRaf, getRafCallback: () => rafCallback };
}

// Test A: Reduced Motion Guard
{
  const env = createMockEnvironment({ reducedMotion: true, finePointer: true });
  const sandbox = { window: env.window, document: env.document };
  vm.createContext(sandbox);
  vm.runInContext(cursorJsCode, sandbox);
  check("Guard: does not inject cursor on prefers-reduced-motion: reduce", env.appendedElements.length === 0);
}

// Test B: Touch/Coarse Pointer Guard
{
  const env = createMockEnvironment({ reducedMotion: false, finePointer: false });
  const sandbox = {
    window: env.window,
    document: env.document,
    requestAnimationFrame: env.window.requestAnimationFrame,
    cancelAnimationFrame: env.window.cancelAnimationFrame
  };
  vm.createContext(sandbox);
  vm.runInContext(cursorJsCode, sandbox);
  check("Guard: does not inject cursor on pointer: coarse / touch device", env.appendedElements.length === 0);
}

// Test C: Fine Pointer Initialization & Mechanics
{
  const env = createMockEnvironment({ reducedMotion: false, finePointer: true });
  const sandbox = {
    window: env.window,
    document: env.document,
    requestAnimationFrame: env.window.requestAnimationFrame,
    cancelAnimationFrame: env.window.cancelAnimationFrame
  };
  vm.createContext(sandbox);
  vm.runInContext(cursorJsCode, sandbox);

  check("Init: injects .cursor-dot and .cursor-ring into document.body",
    env.appendedElements.length === 2 &&
    env.appendedElements.some(e => e.className === 'cursor-dot') &&
    env.appendedElements.some(e => e.className === 'cursor-ring')
  );
  check("Init: adds cursor-active class to document.body", env.bodyClasses.has('cursor-active'));

  // Test pointermove
  env.trigger('win', 'pointermove', { clientX: 200, clientY: 300, pointerType: 'mouse' });
  const dot = env.appendedElements.find(e => e.className === 'cursor-dot');
  const ring = env.appendedElements.find(e => e.className === 'cursor-ring');

  check("Pointermove: starts requestAnimationFrame loop", env.getRafCallback() !== null);
  env.stepRaf();
  check("rAF render: sets dot transform to translate3d(200px, 300px, 0)", dot.style.transform === 'translate3d(200px, 300px, 0)');

  // Move pointer again to 400, 500 and simulate frames
  env.trigger('win', 'pointermove', { clientX: 400, clientY: 500, pointerType: 'mouse' });
  let frames = 0;
  while (env.stepRaf() && frames < 100) {
    frames++;
  }
  check("rAF loop: settles within reasonable frames and goes to sleep", frames > 0 && frames < 80);
  check("rAF idle sleep: stops scheduling rAF once ring has caught up", env.getRafCallback() === null);

  const ringMatch = ring.style.transform.match(/translate3d\(([^,]+)px,\s*([^,]+)px/);
  const rx = ringMatch ? parseFloat(ringMatch[1]) : 0;
  const ry = ringMatch ? parseFloat(ringMatch[2]) : 0;
  check("Ring final position: settles at target coordinates (~400px, ~500px)", Math.abs(rx - 400) < 0.2 && Math.abs(ry - 500) < 0.2, `Actual: ${rx}, ${ry}`);

  // Test hover interaction via event delegation
  const buttonEl = {
    tagName: 'BUTTON',
    closest: (sel) => sel.includes('button') ? buttonEl : null
  };
  env.trigger('doc', 'pointerover', { target: buttonEl });
  check("Hover enter: adds cursor-hover on pointerover of interactive element", env.bodyClasses.has('cursor-hover'));
  env.trigger('doc', 'pointerout', { target: buttonEl });
  check("Hover leave: removes cursor-hover on pointerout of interactive element", !env.bodyClasses.has('cursor-hover'));

  // Test window focus/blur
  env.trigger('win', 'blur');
  check("Window blur: adds cursor-hidden on blur", env.bodyClasses.has('cursor-hidden'));
  env.trigger('win', 'focus');
  check("Window focus: removes cursor-hidden on focus", !env.bodyClasses.has('cursor-hidden'));

  // Test click interaction
  env.trigger('win', 'pointerdown', { pointerType: 'mouse' });
  check("Click press: adds cursor-clicking on pointerdown", env.bodyClasses.has('cursor-clicking'));
  env.trigger('win', 'pointerup', { pointerType: 'mouse' });
  check("Click release: removes cursor-clicking on pointerup", !env.bodyClasses.has('cursor-clicking'));

  // Test boundary handling
  env.trigger('doc', 'mouseleave');
  check("Window boundary: adds cursor-hidden on mouseleave", env.bodyClasses.has('cursor-hidden'));
  env.trigger('doc', 'mouseenter');
  check("Window boundary: removes cursor-hidden on mouseenter", !env.bodyClasses.has('cursor-hidden'));

  // Test dynamic touch teardown
  env.trigger('win', 'touchstart');
  check("Touch teardown: removes cursor-dot and cursor-ring from DOM", env.appendedElements.length === 0);
  check("Touch teardown: clears cursor-active from body", !env.bodyClasses.has('cursor-active'));
}

console.log("\n==================================================");
console.log(`AUDIT RESULTS: ${passes} PASSES, ${failures} FAILURES`);
console.log("==================================================");

if (failures > 0) {
  process.exit(1);
} else {
  console.log("ALL INDEPENDENT VERIFICATION TESTS PASSED!");
}
