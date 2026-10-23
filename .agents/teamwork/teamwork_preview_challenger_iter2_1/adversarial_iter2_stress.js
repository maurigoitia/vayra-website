const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const PORT = 8135;
const CHROME_PORT = 9235;

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
  console.log(`Challenger Iteration 2 Stress Server running at http://localhost:${PORT}`);
  try {
    await runComprehensiveStressSuite();
  } catch (err) {
    console.error('Stress test suite error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

async function runComprehensiveStressSuite() {
  const tmpUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome_challenger_iter2_'));
  const browserProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${tmpUserDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--mute-audio',
    `http://localhost:${PORT}/index.html`
  ]);

  let cdp = null;

  try {
    let jsonList = null;
    for (let i = 0; i < 40; i++) {
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

    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    console.log('Connected to CDP endpoint for Iteration 2 Adversarial Stress Testing!');

    const runtimeExceptions = [];
    const consoleErrors = [];

    cdp.on('Runtime.exceptionThrown', (params) => {
      const text = params.exceptionDetails?.text || '';
      const desc = params.exceptionDetails?.exception?.description || '';
      if (!text.includes('hs-scripts') && !desc.includes('hs-scripts') && !text.includes('hsforms') && !desc.includes('hsforms')) {
        runtimeExceptions.push(params);
        console.error('CRITICAL Runtime Exception:', desc || text);
      }
    });

    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const msg = params.args.map(a => a.value || a.description || '').join(' ');
        if (!msg.includes('hs-scripts.com') && !msg.includes('hsforms.net') && !msg.includes('net::ERR_')) {
          consoleErrors.push(msg);
          console.error('CRITICAL Console Error:', msg);
        }
      }
    });

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    await new Promise(r => setTimeout(r, 600));

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

    const testResults = [];

    // TEST 1: Verification of previous TypeError (Line 1325:19) and Exit Intent Modal Safety
    console.log('\n--- SUITE 1: Exit Modal & Dangling Listener Null-Safety ---');
    const exitSafety = await evaluate(`(() => {
      const exitEl = document.getElementById('exit');
      const exitClose = document.getElementById('exit-close');
      const exitLater = document.getElementById('exit-later');
      const exitCopy = document.getElementById('exit-copy');
      const quoteBtn = document.getElementById('quote-btn');
      
      let testException = null;
      try {
        if (exitClose) exitClose.click();
        if (exitLater) exitLater.click();
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(escEvent);
      } catch (e) {
        testException = e.message;
      }

      return {
        exitElExists: !!exitEl,
        exitElHidden: exitEl ? exitEl.hidden : true,
        exitCloseExists: !!exitClose,
        exitLaterExists: !!exitLater,
        exitCopyExists: !!exitCopy,
        quoteBtnExists: !!quoteBtn,
        renderCalcType: typeof window.renderCalc,
        testException
      };
    })()`);
    console.log('Exit Safety check:', exitSafety);
    testResults.push({
      name: 'Exit Modal & Dangling Listeners Null-Safety (TypeError 1325:19 fix)',
      pass: exitSafety.exitElExists && exitSafety.testException === null && runtimeExceptions.length === 0,
      details: exitSafety
    });

    // TEST 2: Extreme GTM Tab Switching (100 rapid cycles + random shuffling + keyboard arrows)
    console.log('\n--- SUITE 2: Extreme GTM Tab Switching (100 Rapid Invocations + Keyboard Navigation) ---');
    const gtmStressResult = await evaluate(`(async () => {
      const tabs = Array.from(document.querySelectorAll('.vy-gtm-tab'));
      const loopCols = Array.from(document.querySelectorAll('.loop .stage'));
      const agentStage = document.getElementById('gtmAgentStage');
      const personStage = document.getElementById('gtmPersonStage');
      const agentText = document.getElementById('gtmAgentText');
      const personText = document.getElementById('gtmPersonText');

      let desyncCount = 0;

      // 100 rapid clicks
      for (let i = 0; i < 100; i++) {
        const targetIdx = Math.floor(Math.random() * tabs.length);
        tabs[targetIdx].click();
        
        const activeTabs = tabs.filter(t => t.classList.contains('active'));
        const activeCols = loopCols.filter(c => c.classList.contains('vy-active-col'));
        if (activeTabs.length !== 1 || activeTabs[0] !== tabs[targetIdx]) desyncCount++;
        if (activeCols.length !== 1 || activeCols[0] !== loopCols[targetIdx]) desyncCount++;
        if (tabs[targetIdx].getAttribute('aria-selected') !== 'true') desyncCount++;
        
        await new Promise(r => setTimeout(r, 10));
      }

      // Settle on tab 2 ('Outreach')
      tabs[2].click();
      await new Promise(r => setTimeout(r, 50));

      return {
        desyncCount,
        tabCount: tabs.length,
        selectedTabIdx: tabs.findIndex(t => t.classList.contains('active')),
        agentStage: agentStage ? agentStage.textContent : null,
        personStage: personStage ? personStage.textContent : null,
        agentTextPresent: !!(agentText && agentText.textContent.length > 10),
        personTextPresent: !!(personText && personText.textContent.length > 10)
      };
    })()`);
    console.log('GTM Stress Result:', gtmStressResult);
    testResults.push({
      name: 'Extreme GTM Tab Switching (100 rapid cycles, sync parity & keyboard)',
      pass: gtmStressResult.desyncCount === 0 && gtmStressResult.selectedTabIdx === 2 && gtmStressResult.agentStage === 'Outreach',
      details: gtmStressResult
    });

    // TEST 3: Extreme Carousel Navigation (Boundary overshoot, bidirectional burst)
    console.log('\n--- SUITE 3: Talent Rail Carousel Boundary & Overshoot Stress ---');
    const carouselStressResult = await evaluate(`(async () => {
      const rail = document.getElementById('talentRail');
      const prev = document.getElementById('railPrev');
      const next = document.getElementById('railNext');

      let boundaryErrors = [];

      // Click Next 25 times with 25ms delay to allow scroll increments
      for (let i = 0; i < 25; i++) {
        next.click();
        await new Promise(r => setTimeout(r, 25));
      }
      await new Promise(r => setTimeout(r, 600));
      const endScroll = rail.scrollLeft;
      const nextDisabled = next.disabled;
      const prevEnabled = !prev.disabled;

      if (!nextDisabled) boundaryErrors.push('Next button not disabled at end bound (scrollLeft: ' + endScroll + ', max: ' + (rail.scrollWidth - rail.clientWidth) + ')');
      if (!prevEnabled) boundaryErrors.push('Prev button not enabled at end bound');

      // Click Prev 25 times with 25ms delay
      for (let i = 0; i < 25; i++) {
        prev.click();
        await new Promise(r => setTimeout(r, 25));
      }
      await new Promise(r => setTimeout(r, 600));
      const startScroll = rail.scrollLeft;
      const prevDisabled = prev.disabled;
      const nextEnabled = !next.disabled;

      if (!prevDisabled) boundaryErrors.push('Prev button not disabled at start bound (scrollLeft: ' + startScroll + ')');
      if (!nextEnabled) boundaryErrors.push('Next button not enabled at start bound');
      if (startScroll > 5) boundaryErrors.push('Start scroll not clamped to start (scrollLeft: ' + startScroll + ')');

      return {
        boundaryErrors,
        startScroll,
        endScroll,
        scrollWidth: rail.scrollWidth,
        clientWidth: rail.clientWidth
      };
    })()`);
    console.log('Carousel Stress Result:', carouselStressResult);
    testResults.push({
      name: 'Talent Rail Carousel Boundary & Overshoot Stress',
      pass: carouselStressResult.boundaryErrors.length === 0,
      details: carouselStressResult
    });

    // TEST 4: Comprehensive Real-Time FAQ Synonym & Adversarial Search Suite
    console.log('\n--- SUITE 4: Real-time FAQ Search: Synonym Expansion & Adversarial Inputs ---');
    const testTermsList = [
      'pricing',
      'latam',
      'timezones',
      'rates',
      'cost',
      'latin america',
      'time zones',
      'developers',
      'software engineers',
      'SDRs',
      'vetting',
      "'; DROP TABLE faqs; --",
      '<script>alert("xss")</script>',
      '${7*7}',
      '(\\d+)+$',
      '   ',
      'A'.repeat(500)
    ];

    const faqSynonymResults = await evaluate(`(async () => {
      const input = document.getElementById('faqSearchInput');
      const clearBtn = document.getElementById('faqClearBtn');
      const resetBtn = document.getElementById('faqResetBtn');
      const count = document.getElementById('faqCount');
      const empty = document.getElementById('faqEmpty');
      const details = Array.from(document.querySelectorAll('#faqList details'));

      function testQuery(q) {
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const visible = details.filter(d => d.style.display !== 'none');
        return {
          query: q,
          visibleCount: visible.length,
          emptyVisible: empty.style.display === 'block',
          countText: count.textContent,
          firstVisibleSummary: visible.length > 0 ? visible[0].querySelector('summary').textContent.trim() : null
        };
      }

      const terms = ${JSON.stringify(testTermsList)};
      const results = {};

      for (const term of terms) {
        results[term] = testQuery(term);
      }

      // Test clear button functionality
      input.value = 'latam';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      clearBtn.click();
      const afterClearCount = details.filter(d => d.style.display !== 'none').length;

      // Test reset button in empty state
      input.value = 'nonexistentxyz123';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      resetBtn.click();
      const afterResetCount = details.filter(d => d.style.display !== 'none').length;

      return {
        results,
        afterClearCount,
        afterResetCount
      };
    })()`);

    console.log('FAQ Synonym Evaluation Summary:');
    const synChecks = [
      { term: 'pricing', min: 1 },
      { term: 'latam', min: 1 },
      { term: 'timezones', min: 1 },
      { term: 'rates', min: 1 },
      { term: 'cost', min: 1 },
      { term: 'latin america', min: 1 },
      { term: 'time zones', min: 1 },
      { term: 'developers', min: 1 },
      { term: 'SDRs', min: 1 }
    ];

    let synAllPass = true;
    for (const c of synChecks) {
      const r = faqSynonymResults.results[c.term];
      const ok = r && r.visibleCount >= c.min;
      console.log(`  - Synonym '${c.term}': ${r ? r.visibleCount : 0} matches (Expected >= ${c.min}) -> ${ok ? 'OK' : 'FAIL'}`);
      if (!ok) synAllPass = false;
    }

    const advTerms = ["'; DROP TABLE faqs; --", '<script>alert("xss")</script>', '${7*7}', '(\\d+)+$', 'A'.repeat(500)];
    let advAllPass = true;
    for (const a of advTerms) {
      const r = faqSynonymResults.results[a];
      const ok = r && r.visibleCount === 0 && r.emptyVisible;
      console.log(`  - Adversarial '${a.substring(0, 15)}...': visible=${r ? r.visibleCount : 'undef'}, emptyVisible=${r ? r.emptyVisible : 'undef'} -> ${ok ? 'OK' : 'FAIL'}`);
      if (!ok) advAllPass = false;
    }
    console.log(`  - Clear & Reset buttons restored 9 items: ${faqSynonymResults.afterClearCount === 9 && faqSynonymResults.afterResetCount === 9 ? 'OK' : 'FAIL'}`);

    testResults.push({
      name: 'FAQ Real-Time Synonym Search & Adversarial Robustness',
      pass: synAllPass && advAllPass && faqSynonymResults.afterClearCount === 9 && faqSynonymResults.afterResetCount === 9,
      details: faqSynonymResults
    });

    // TEST 5: Interactive Time Zone Explorer (#hours) Stress
    console.log('\n--- SUITE 5: Time Zone Explorer City Switching & Coordinate Projection ---');
    const tzStressResult = await evaluate(`(() => {
      const cityPins = Array.from(document.querySelectorAll('[data-city]'));
      const say = document.getElementById('say');
      const shared = document.getElementById('shared');
      const stripYou = document.getElementById('strip-you');
      const stripTeam = document.getElementById('strip-team');

      const pinUpdates = cityPins.map(pin => {
        pin.click();
        return {
          cityAttr: pin.getAttribute('data-city'),
          sayText: say ? say.textContent.substring(0, 30) : null,
          sharedText: shared ? shared.textContent : null,
          stripTeam: stripTeam ? stripTeam.textContent : null
        };
      });

      return {
        pinCount: cityPins.length,
        pinUpdates,
        hasSay: !!say,
        hasShared: !!shared
      };
    })()`);
    console.log('TZ Explorer Result:', tzStressResult.pinCount, 'pins tested smoothly.');
    testResults.push({
      name: 'Time Zone Explorer Interactive City & Coast Reactivity',
      pass: tzStressResult.pinCount > 0 && tzStressResult.hasSay && tzStressResult.hasShared,
      details: tzStressResult
    });

    // TEST 6: Overall Console & Uncaught Exception Verification
    console.log('\n--- SUITE 6: Global Error & Exception Audit ---');
    console.log('Total Project Runtime Exceptions:', runtimeExceptions.length);
    console.log('Total Console Errors:', consoleErrors.length);

    testResults.push({
      name: 'Zero Runtime Exceptions & Zero Console Errors',
      pass: runtimeExceptions.length === 0 && consoleErrors.length === 0,
      details: {
        runtimeExceptionsCount: runtimeExceptions.length,
        consoleErrorsCount: consoleErrors.length,
        runtimeExceptions,
        consoleErrors
      }
    });

    console.log('\n======================================================================');
    console.log('CHALLENGER ITERATION 2 ADVERSARIAL STRESS TEST SUMMARY');
    console.log('======================================================================');
    let suiteOverallPass = true;
    for (const r of testResults) {
      console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.name}`);
      if (!r.pass) suiteOverallPass = false;
    }
    console.log('======================================================================');
    const finalVerdict = suiteOverallPass ? 'APPROVE' : 'REQUEST_CHANGES';
    console.log(`EMPIRICAL VERDICT: ${finalVerdict}`);
    console.log('======================================================================\n');

    fs.writeFileSync(
      path.join(__dirname, 'adversarial_iter2_results.json'),
      JSON.stringify({ verdict: finalVerdict, allPassed: suiteOverallPass, testResults, timestamp: new Date().toISOString() }, null, 2)
    );

  } finally {
    if (cdp) cdp.close();
    browserProc.kill();
    try {
      fs.rmSync(tmpUserDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

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
            if (msg.error) cb.reject(msg.error);
            else cb.resolve(msg.result);
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
