const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const PORT = 8124;
const CHROME_PORT = 9223;

// Find Chrome
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chromePath = chromeCandidates.find(p => fs.existsSync(p));
if (!chromePath) {
  console.error('No Chrome/Edge browser found!');
  process.exit(1);
}
console.log('Using browser:', chromePath);

// Create static HTTP server
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not Found');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Static server running at http://localhost:${PORT}`);
  try {
    await runAdversarialSuite();
  } catch (err) {
    console.error('Test suite error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

async function runAdversarialSuite() {
  const browserProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CHROME_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--mute-audio',
    `http://localhost:${PORT}/index.html`
  ]);

  let cdp = null;

  try {
    // Wait for CDP endpoint
    console.log('Waiting for CDP endpoint...');
    let jsonList = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://localhost:${CHROME_PORT}/json`);
        jsonList = await res.json();
        if (jsonList && jsonList.length > 0) break;
      } catch (e) {}
    }

    if (!jsonList || jsonList.length === 0) {
      throw new Error('Failed to connect to browser CDP endpoint');
    }

    const pageTarget = jsonList.find(t => t.type === 'page') || jsonList[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    console.log('Target WS URL:', wsUrl);

    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    console.log('Connected to CDP!');

    const runtimeExceptions = [];
    const consoleLogs = [];

    cdp.on('Runtime.exceptionThrown', (params) => {
      runtimeExceptions.push(params);
      console.error('CDP Runtime Exception:', JSON.stringify(params, null, 2));
    });

    cdp.on('Runtime.consoleAPICalled', (params) => {
      consoleLogs.push(params);
      if (params.type === 'error') {
        console.error('CDP Console Error:', params.args.map(a => a.value || a.description).join(' '));
      }
    });

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    // Wait 500ms for page scripts to initialize
    await new Promise(r => setTimeout(r, 500));

    // Suite of tests
    const results = [];

    async function evaluate(expression) {
      const res = await cdp.send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text + ' ' + (res.exceptionDetails.exception?.description || ''));
      }
      return res.result ? res.result.value : undefined;
    }

    console.log('\n--- 1. Testing Page Initialization & Basic DOM ---');
    const initCheck = await evaluate(`(() => {
      return {
        hasJsClass: document.documentElement.classList.contains('js'),
        rail: !!document.getElementById('talentRail'),
        railPrev: !!document.getElementById('railPrev'),
        railNext: !!document.getElementById('railNext'),
        gtmTabs: document.querySelectorAll('.vy-gtm-tab').length,
        gtmPanel: !!document.getElementById('gtmPanel'),
        faqInput: !!document.getElementById('faqSearchInput'),
        faqItems: document.querySelectorAll('#faqList details').length,
        cursorDot: !!document.getElementById('vyCursorDot'),
        cursorRing: !!document.getElementById('vyCursorRing'),
        heroFlashlight: !!document.getElementById('heroSection')
      };
    })()`);
    console.log('Init check result:', initCheck);

    results.push({
      test: 'DOM Elements Verification',
      pass: initCheck.hasJsClass && initCheck.rail && initCheck.railPrev && initCheck.railNext &&
            initCheck.gtmTabs === 5 && initCheck.gtmPanel && initCheck.faqInput && initCheck.faqItems === 9,
      detail: initCheck
    });

    console.log('\n--- 2. Stress Testing Talent Rail Carousel ---');
    // Test: Rapid clicking next beyond scroll limit
    const railStressNext = await evaluate(`(async () => {
      const rail = document.getElementById('talentRail');
      const prev = document.getElementById('railPrev');
      const next = document.getElementById('railNext');
      
      const initialScroll = rail.scrollLeft;
      const initialPrevDisabled = prev.disabled;
      
      // Rapidly click next 25 times
      for (let i = 0; i < 25; i++) {
        next.click();
        await new Promise(r => setTimeout(r, 20));
      }
      // Wait for smooth scrolls to settle
      await new Promise(r => setTimeout(r, 600));
      
      const maxScroll = rail.scrollLeft;
      const nextDisabledAtEnd = next.disabled;
      const prevEnabledAtEnd = !prev.disabled;
      const scrollWidth = rail.scrollWidth;
      const clientWidth = rail.clientWidth;

      // Now rapidly click prev 25 times
      for (let i = 0; i < 25; i++) {
        prev.click();
        await new Promise(r => setTimeout(r, 20));
      }
      await new Promise(r => setTimeout(r, 600));

      const finalScroll = rail.scrollLeft;
      const prevDisabledAtStart = prev.disabled;

      return {
        initialScroll,
        initialPrevDisabled,
        maxScroll,
        nextDisabledAtEnd,
        prevEnabledAtEnd,
        finalScroll,
        prevDisabledAtStart,
        scrollWidth,
        clientWidth,
        scrollBoundsValid: maxScroll > 0 && finalScroll >= 0 && finalScroll <= 5
      };
    })()`);
    console.log('Rail stress test result:', railStressNext);

    results.push({
      test: 'Talent Rail Carousel Stress (Rapid clicks & scroll bounds)',
      pass: railStressNext.scrollBoundsValid && railStressNext.initialPrevDisabled && railStressNext.prevDisabledAtStart,
      detail: railStressNext
    });

    console.log('\n--- 3. Stress Testing GTM Process Tabs (Rapid Switching) ---');
    const gtmStress = await evaluate(`(async () => {
      const tabs = Array.from(document.querySelectorAll('.vy-gtm-tab'));
      const agentStage = document.getElementById('gtmAgentStage');
      const agentText = document.getElementById('gtmAgentText');
      const personStage = document.getElementById('gtmPersonStage');
      const personText = document.getElementById('gtmPersonText');
      const loopCols = Array.from(document.querySelectorAll('.loop .stage'));

      const sequence = [4, 1, 3, 0, 2, 4, 3, 2, 1, 0, 4, 0, 1, 2, 3, 4];
      const errors = [];

      for (const idx of sequence) {
        tabs[idx].click();
        // verify immediate synchronous DOM reflection
        const activeTabs = tabs.filter(t => t.classList.contains('active'));
        if (activeTabs.length !== 1 || activeTabs[0] !== tabs[idx]) {
          errors.push('Tab active class mismatch at idx ' + idx);
        }
        if (tabs[idx].getAttribute('aria-selected') !== 'true') {
          errors.push('aria-selected not true for tab ' + idx);
        }
        const activeCols = loopCols.filter(c => c.classList.contains('vy-active-col'));
        if (activeCols.length !== 1 || activeCols[0] !== loopCols[idx]) {
          errors.push('Loop stage active col mismatch at idx ' + idx);
        }
        await new Promise(r => setTimeout(r, 25));
      }

      return {
        finalTab: tabs.findIndex(t => t.classList.contains('active')),
        agentStageText: agentStage ? agentStage.textContent : null,
        personStageText: personStage ? personStage.textContent : null,
        errors
      };
    })()`);
    console.log('GTM stress test result:', gtmStress);

    results.push({
      test: 'GTM 5-Stage Rapid Switching & DOM Synchronization',
      pass: gtmStress.errors.length === 0 && gtmStress.finalTab === 4 && gtmStress.agentStageText === 'Pipeline',
      detail: gtmStress
    });

    console.log('\n--- 4. Stress Testing FAQ Real-time Search & Filter ---');
    const faqStress = await evaluate(`(async () => {
      const input = document.getElementById('faqSearchInput');
      const clearBtn = document.getElementById('faqClearBtn');
      const resetBtn = document.getElementById('faqResetBtn');
      const count = document.getElementById('faqCount');
      const empty = document.getElementById('faqEmpty');
      const queryText = document.getElementById('faqQueryText');
      const details = Array.from(document.querySelectorAll('#faqList details'));

      const checks = [];

      // Helper to simulate typing
      function setQuery(val) {
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // 1. Specific query with known match: 'pricing'
      setQuery('pricing');
      const pricingVisible = details.filter(d => d.style.display !== 'none');
      checks.push({
        query: 'pricing',
        matchCount: pricingVisible.length,
        hasMatches: pricingVisible.length > 0,
        emptyShown: empty.style.display === 'block',
        countText: count.textContent
      });

      // 2. Query with regex / special characters that could crash broken search implementations:
      // '(.*)+?[\^$|#@!'
      setQuery('(.*)+?[\^$|#@!');
      const regexVisible = details.filter(d => d.style.display !== 'none');
      checks.push({
        query: 'special_chars',
        matchCount: regexVisible.length,
        emptyShown: empty.style.display === 'block',
        emptyQueryText: queryText.textContent,
        countText: count.textContent
      });

      // 3. Click clear button
      clearBtn.click();
      const allAfterClear = details.filter(d => d.style.display !== 'none');
      checks.push({
        step: 'clear_button',
        inputEmpty: input.value === '',
        allVisible: allAfterClear.length === 9,
        firstOpen: details[0].open,
        secondOpen: details[1].open
      });

      // 4. Non-matching query 'nonexistenttermxyz' then click Reset
      setQuery('nonexistenttermxyz');
      const nonExistentMatch = details.filter(d => d.style.display !== 'none');
      const resetBtnDisplay = empty.style.display;
      resetBtn.click();
      const allAfterReset = details.filter(d => d.style.display !== 'none');
      checks.push({
        step: 'reset_button',
        inputEmptyAfterReset: input.value === '',
        allVisibleAfterReset: allAfterReset.length === 9,
        emptyHidden: empty.style.display === 'none'
      });

      // 5. Rapid typing and rapid backspacing
      const rapidQueries = ['s', 'sd', 'sdr', 'latam', 'lat', 'la', 'agent', 'people', 'cost', '', 'vetting', ''];
      for (const q of rapidQueries) {
        setQuery(q);
        await new Promise(r => setTimeout(r, 15));
      }
      const finalVisible = details.filter(d => d.style.display !== 'none');

      return {
        checks,
        rapidSettleCount: finalVisible.length,
        countText: count.textContent
      };
    })()`);
    console.log('FAQ stress test result:', JSON.stringify(faqStress, null, 2));

    const faqPass = faqStress.checks[0].hasMatches &&
                    faqStress.checks[1].emptyShown &&
                    faqStress.checks[2].allVisible &&
                    faqStress.checks[3].allVisibleAfterReset &&
                    faqStress.rapidSettleCount === 9;

    results.push({
      test: 'FAQ Real-Time Search, Rapid Typing & Adversarial Input',
      pass: faqPass,
      detail: faqStress
    });

    console.log('\n--- 5. Testing prefers-reduced-motion: reduce ---');
    // Emulate prefers-reduced-motion
    await cdp.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    // Reload page under reduced-motion
    await cdp.send('Page.reload');
    await new Promise(r => setTimeout(r, 600));

    const reducedMotionCheck = await evaluate(`(() => {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const reveals = Array.from(document.querySelectorAll('.vy-rv'));
      const allRevealed = reveals.every(r => r.classList.contains('vy-in'));
      const computedStyles = reveals.slice(0, 3).map(r => {
        const s = window.getComputedStyle(r);
        return {
          opacity: s.opacity,
          transform: s.transform,
          animation: s.animationName,
          transition: s.transitionDuration
        };
      });

      // Check cursor dot/ring display under reduced motion
      const dot = document.getElementById('vyCursorDot');
      const ring = document.getElementById('vyCursorRing');
      const dotDisplay = dot ? window.getComputedStyle(dot).display : null;
      const ringDisplay = ring ? window.getComputedStyle(ring).display : null;

      return {
        reduceMotionMatches: reduceMotion,
        allRevealedImmediately: allRevealed,
        revealsCount: reveals.length,
        computedStyles,
        dotDisplay,
        ringDisplay
      };
    })()`);
    console.log('Reduced motion result:', reducedMotionCheck);

    results.push({
      test: 'Accessibility: prefers-reduced-motion: reduce',
      pass: reducedMotionCheck.reduceMotionMatches && reducedMotionCheck.allRevealedImmediately && reducedMotionCheck.revealsCount > 0,
      detail: reducedMotionCheck
    });

    console.log('\n--- 6. Testing Touch Device Emulation (pointer: coarse) ---');
    // Emulate touch
    await cdp.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
    });
    await cdp.send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await cdp.send('Page.reload');
    await new Promise(r => setTimeout(r, 600));

    const touchCheck = await evaluate(`(() => {
      const finePointer = window.matchMedia('(pointer: fine)').matches;
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      
      const dot = document.getElementById('vyCursorDot');
      const ring = document.getElementById('vyCursorRing');
      
      // Dispatch touch event
      const touchEvt = new TouchEvent('touchstart', {
        touches: [new Touch({ identifier: 1, target: document.body, clientX: 100, clientY: 200 })]
      });
      document.body.dispatchEvent(touchEvt);

      // Verify custom cursor is NOT active on touch
      const hasPointerClass = document.body.classList.contains('vy-has-pointer');

      // Check mobile talent rail sizing
      const firstCard = document.querySelector('.vy-pcard');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
      
      // Check GTM layout
      const gtmNav = document.querySelector('.vy-gtm-nav');
      const gtmNavScrollable = gtmNav ? gtmNav.scrollWidth >= gtmNav.clientWidth : false;

      return {
        finePointer,
        coarsePointer,
        hasPointerClass,
        cardWidth,
        gtmNavScrollable
      };
    })()`);
    console.log('Touch device emulation result:', touchCheck);

    results.push({
      test: 'Graceful Degradation: Touch Device (pointer: coarse, mobile viewport)',
      pass: !touchCheck.hasPointerClass && touchCheck.cardWidth > 200,
      detail: touchCheck
    });

    console.log('\n--- 7. Checking for Console Errors & Uncaught Exceptions ---');
    // Filter out expected 404s for third-party external tracking scripts if blocked offline,
    // but check for any JS exceptions in project code
    const projectExceptions = runtimeExceptions.filter(e => {
      const text = e.exceptionDetails?.text || '';
      const desc = e.exceptionDetails?.exception?.description || '';
      return !text.includes('hs-scripts') && !desc.includes('hs-scripts');
    });

    const fatalConsoleErrors = consoleLogs.filter(c => {
      if (c.type !== 'error') return false;
      const msg = c.args.map(a => a.value || a.description || '').join(' ');
      // Filter out network errors for hs-scripts.com (HubSpot script loader running locally without internet)
      return !msg.includes('hs-scripts.com') && !msg.includes('net::ERR_');
    });

    console.log('Project exceptions count:', projectExceptions.length);
    console.log('Fatal console errors count:', fatalConsoleErrors.length);

    results.push({
      test: 'Zero Runtime Exceptions & Zero Console Errors',
      pass: projectExceptions.length === 0 && fatalConsoleErrors.length === 0,
      detail: { projectExceptions, fatalConsoleErrors }
    });

    console.log('\n==================================================');
    console.log('ADVERSARIAL SUITE SUMMARY');
    console.log('==================================================');
    let allPassed = true;
    for (const r of results) {
      console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.test}`);
      if (!r.pass) allPassed = false;
    }
    console.log('==================================================');
    console.log('Overall verdict:', allPassed ? 'APPROVE' : 'REQUEST_CHANGES');

    // Write results JSON to challenger directory
    fs.writeFileSync(
      path.join(__dirname, 'adversarial_results.json'),
      JSON.stringify({ allPassed, results, timestamp: new Date().toISOString() }, null, 2)
    );

  } finally {
    if (cdp) cdp.close();
    browserProc.kill();
  }
}

// Lightweight CDP WebSocket Client
class CDPClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.listeners = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id && this.callbacks.has(msg.id)) {
            const cb = this.callbacks.get(msg.id);
            this.callbacks.delete(msg.id);
            if (msg.error) {
              cb.reject(msg.error);
            } else {
              cb.resolve(msg.result);
            }
          } else if (msg.method && this.listeners.has(msg.method)) {
            for (const handler of this.listeners.get(msg.method)) {
              handler(msg.params);
            }
          }
        } catch (err) {
          console.error('CDP parse error:', err);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    if (!this.listeners.has(method)) {
      this.listeners.set(method, []);
    }
    this.listeners.get(method).push(handler);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
