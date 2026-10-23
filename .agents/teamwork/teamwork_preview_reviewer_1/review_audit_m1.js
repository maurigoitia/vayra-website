const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const INDEX_HTML_PATH = path.join(PUBLIC_DIR, 'index.html');
const STYLES_CSS_PATH = path.join(PUBLIC_DIR, 'styles.css');

let passCount = 0;
let failCount = 0;
const findings = [];

function assert(condition, testName, category = 'General') {
  if (condition) {
    console.log(`[PASS] [${category}] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] [${category}] ${testName}`);
    failCount++;
    findings.push({ category, testName });
  }
}

async function runReviewAudit() {
  console.log("==================================================================");
  console.log("  INDEPENDENT REVIEWER 1 AUDIT & ADVERSARIAL STRESS TEST SUITE");
  console.log("==================================================================");
  console.log("Testing target:", PUBLIC_DIR);

  // -------------------------------------------------------------------------
  // SUITE 1: Static Files, Syntax & HTML/CSS/JS Validation
  // -------------------------------------------------------------------------
  console.log("\n>>> SUITE 1: Static Files, Syntax & Validation");
  assert(fs.existsSync(INDEX_HTML_PATH), "public/index.html exists", "Static");
  assert(fs.existsSync(STYLES_CSS_PATH), "public/styles.css exists", "Static");

  const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const stylesCss = fs.readFileSync(STYLES_CSS_PATH, 'utf8');

  // JSON-LD validation
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let ldMatch;
  let ldBlocks = 0;
  while ((ldMatch = jsonLdRegex.exec(indexHtml)) !== null) {
    ldBlocks++;
    try {
      const parsed = JSON.parse(ldMatch[1]);
      assert(parsed && typeof parsed === 'object', `JSON-LD block #${ldBlocks} parses cleanly as JSON`, "Syntax");
    } catch (e) {
      assert(false, `JSON-LD block #${ldBlocks} parsing failed: ${e.message}`, "Syntax");
    }
  }
  assert(ldBlocks >= 1, `Found ${ldBlocks} valid JSON-LD structured data blocks`, "Syntax");

  // Inline script syntax validation using node -c
  const inlineScriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  let scriptIdx = 0;
  while ((scriptMatch = inlineScriptRegex.exec(indexHtml)) !== null) {
    const attrs = scriptMatch[1];
    const code = scriptMatch[2].trim();
    if (attrs.includes('application/ld+json') || !code) continue;
    scriptIdx++;

    const tmpFile = path.join(__dirname, `_review_temp_script_${scriptIdx}.js`);
    fs.writeFileSync(tmpFile, code, 'utf8');
    try {
      execSync(`node -c "${tmpFile}"`, { stdio: 'pipe' });
      assert(true, `Inline script #${scriptIdx} passes node -c syntax check`, "JS-Syntax");
    } catch (e) {
      assert(false, `Inline script #${scriptIdx} failed node -c: ${e.message}`, "JS-Syntax");
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  }
  assert(scriptIdx >= 2, `Validated syntax of ${scriptIdx} inline scripts`, "JS-Syntax");

  // CSS syntax check: brace balance & basic lexing
  function checkCssBraces(css, name) {
    let depth = 0;
    let inString = false;
    let strChar = '';
    let inComment = false;
    for (let i = 0; i < css.length; i++) {
      const ch = css[i];
      const next = css[i + 1];
      if (inComment) {
        if (ch === '*' && next === '/') { inComment = false; i++; }
        continue;
      }
      if (ch === '/' && next === '*') { inComment = true; i++; continue; }
      if (inString) {
        if (ch === '\\') { i++; continue; }
        if (ch === strChar) inString = false;
        continue;
      }
      if (ch === '"' || ch === "'") { inString = true; strChar = ch; continue; }
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth < 0) return false;
    }
    return depth === 0 && !inComment && !inString;
  }

  assert(checkCssBraces(stylesCss, "styles.css"), "public/styles.css has balanced CSS braces and clean comment syntax", "CSS-Syntax");
  const inlineStyleMatch = indexHtml.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/i);
  assert(inlineStyleMatch && checkCssBraces(inlineStyleMatch[1], "index.html <style>"), "Inline <style> in index.html has balanced braces", "CSS-Syntax");

  // -------------------------------------------------------------------------
  // SUITE 2: Strict Copy Preservation & Integrity
  // -------------------------------------------------------------------------
  console.log("\n>>> SUITE 2: Strict Copy Preservation & Integrity");
  const lockedMarketingCopy = [
    "Senior GTM and engineering teams, <em>augmented with AI.</em>",
    "Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents.",
    "Get a quote",
    "See the GTM system",
    "What we do",
    "Teams that sell, build and ship with AI in the loop.",
    "GTM engineers and teams",
    "Orchestrated teams",
    "AI-augmented engineering",
    "Add people to your team",
    "Hand us a goal",
    "The GTM system",
    "Agents do the repetitive work. People own the pipeline.",
    "Watch hiring, funding and product news across your market.",
    "Enrich accounts and contacts with what matters.",
    "Draft first lines and sequences per account.",
    "Summarize replies and calls into clean notes.",
    "Keep the CRM updated without anyone chasing it.",
    "Decide which signals are worth acting on.",
    "Check every account against your real ICP.",
    "Rewrite, approve and send in your voice.",
    "Run the calls and build the relationship.",
    "Report to you on what is moving and why.",
    "How we work",
    "You only meet people we would hire ourselves.",
    "Your hours, not ours.",
    "We stay after the hire.",
    "What is Vayra?",
    "How much does senior talent in Latin America cost?",
    "What does AI-augmented mean?",
    "What is an orchestrated team?",
    "What do GTM engineers do?",
    "Which roles can Vayra provide?",
    "Can I start with one person?",
    "Extend my team or hand you a goal?",
    "Where are your people based?"
  ];

  let missingCopy = 0;
  lockedMarketingCopy.forEach(copy => {
    if (!indexHtml.includes(copy)) {
      assert(false, `Missing copy string: "${copy.substring(0, 30)}..."`, "Copy-Lock");
      missingCopy++;
    }
  });
  if (missingCopy === 0) {
    assert(true, `All ${lockedMarketingCopy.length} key marketing copy excerpts preserved verbatim`, "Copy-Lock");
  }

  // Check no accidental Abstra marketing copy leaked in
  const forbiddenAbstraCopy = [
    "Abstra helps you build",
    "Workflow automation for finance",
    "Python scripts into internal tools",
    "Connect to your Postgres database"
  ];
  forbiddenAbstraCopy.forEach(badCopy => {
    assert(!indexHtml.includes(badCopy), `No foreign Abstra marketing copy: "${badCopy}"`, "Integrity");
  });

  // -------------------------------------------------------------------------
  // SUITE 3: Dark Theme Conformance & Palette Tokens
  // -------------------------------------------------------------------------
  console.log("\n>>> SUITE 3: Dark Theme Conformance");
  assert(indexHtml.includes('color-scheme: dark'), "index.html defines 'color-scheme: dark'", "Dark-Theme");
  assert(indexHtml.includes('--ink:#0A0F1F'), "index.html defines canonical --ink:#0A0F1F (deep navy)", "Dark-Theme");
  assert(indexHtml.includes('--ink-2:#111934'), "index.html defines canonical --ink-2:#111934 (raised surface)", "Dark-Theme");
  assert(indexHtml.includes('--sun:#FFB547'), "index.html defines canonical --sun:#FFB547 (Andes sun accent)", "Dark-Theme");
  assert(indexHtml.includes('--leaf:#7ED3A6'), "index.html defines canonical --leaf:#7ED3A6 (agent/ok state)", "Dark-Theme");
  assert(indexHtml.includes('--sky:#8CC8EE'), "index.html defines canonical --sky:#8CC8EE (secondary accent)", "Dark-Theme");

  // Check that new .vy- components use theme tokens and no rogue pure white backgrounds
  const newComponentRules = [
    '.vy-cursor-dot',
    '.vy-cursor-ring',
    '.vy-rail-btn',
    '.vy-pcard',
    '.vy-gtm-tab',
    '.vy-gtm-card',
    '.vy-faq-input',
    '.vy-faq-empty'
  ];
  newComponentRules.forEach(selector => {
    assert(stylesCss.includes(selector), `styles.css includes ${selector}`, "Dark-Theme");
    assert(indexHtml.includes(selector), `index.html includes ${selector}`, "Dark-Theme");
  });

  // Check that .vy-gtm-tab uses dark variables
  assert(stylesCss.includes('background: var(--ink);') || stylesCss.includes('background:var(--ink)'), ".vy-gtm-tab uses var(--ink) background", "Dark-Theme");
  assert(stylesCss.includes('.vy-gtm-card-agent') && stylesCss.includes('border-left: 3px solid var(--leaf);'), "Agent card uses --leaf border", "Dark-Theme");
  assert(stylesCss.includes('.vy-gtm-card-person') && stylesCss.includes('border-left: 3px solid var(--sun);'), "Person card uses --sun border", "Dark-Theme");

  // -------------------------------------------------------------------------
  // SUITE 4: Namespacing (.vy-) and Zero Collisions
  // -------------------------------------------------------------------------
  console.log("\n>>> SUITE 4: Namespacing (.vy-) & Zero Collisions");
  const requiredVyClasses = [
    'vy-rail-wrap',
    'vy-rail-head',
    'vy-rail-actions',
    'vy-rail-btn',
    'vy-rail',
    'vy-pcard',
    'vy-gtm-interactive',
    'vy-gtm-nav',
    'vy-gtm-tab',
    'vy-gtm-panel',
    'vy-gtm-card',
    'vy-faq-search-wrap',
    'vy-faq-search-box',
    'vy-faq-input',
    'vy-faq-clear',
    'vy-faq-count',
    'vy-faq-empty',
    'vy-rv',
    'vy-in'
  ];

  requiredVyClasses.forEach(cls => {
    assert(stylesCss.includes('.' + cls), `styles.css defines namespaced .${cls}`, "Namespacing");
    assert(indexHtml.includes(cls), `index.html uses namespaced ${cls}`, "Namespacing");
  });

  // Verify that core legacy classes were not modified/renamed
  const legacyClasses = ['.nav', '.hero', '.eyebrow', '.lede', '.btn', '.btn-sun', '.loop', '.stage', '.lane', '.cell'];
  legacyClasses.forEach(legacyCls => {
    assert(indexHtml.includes(legacyCls.replace('.', '')), `Legacy class preserved: ${legacyCls}`, "Namespacing");
  });

  // -------------------------------------------------------------------------
  // SUITE 5: Real Headless Browser Execution & Console Health via CDP
  // -------------------------------------------------------------------------
  console.log("\n>>> SUITE 5: Real Headless Browser Execution (CDP)");

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);

  if (!browserBin) {
    console.error("[WARN] No Chrome or Edge binary found for CDP E2E testing!");
    assert(false, "Headless browser executable must exist", "Browser-E2E");
    printSummaryAndExit();
    return;
  }

  // Create lightweight HTTP server serving project public folder
  const mimeMap = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.mp4': 'video/mp4',
    '.txt': 'text/plain',
    '.xml': 'application/xml'
  };

  const port = 49234;
  const cdpPort = 49235;

  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/') cleanUrl = '/index.html';
    const filePath = path.join(PUBLIC_DIR, cleanUrl);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(port, '127.0.0.1', async () => {
    console.log(`Local HTTP server running on http://127.0.0.1:${port}`);

    const userDataDir = path.join(__dirname, '_review_browser_profile');
    if (fs.existsSync(userDataDir)) {
      try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
    }

    const browserArgs = [
      '--headless=new',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-gpu',
      'about:blank'
    ];

    const browserProc = spawn(browserBin, browserArgs, { stdio: 'ignore' });

    // Helper to query CDP endpoints
    async function getCdpTargets() {
      for (let attempt = 0; attempt < 25; attempt++) {
        try {
          const res = await fetch(`http://127.0.0.1:${cdpPort}/json`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length) return data;
          }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 200));
      }
      throw new Error("Failed to connect to CDP /json endpoint");
    }

    try {
      const targets = await getCdpTargets();
      const pageTarget = targets.find(t => t.type === 'page') || targets[0];
      const wsUrl = pageTarget.webSocketDebuggerUrl;
      console.log('Connected to CDP target:', wsUrl);

      // Simple WebSocket client using built-in Node 22+ WebSocket or node ws
      const ws = new WebSocket(wsUrl);

      let msgId = 1;
      const pendingCallbacks = new Map();
      const consoleErrors = [];
      const pageErrors = [];

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pendingCallbacks.has(msg.id)) {
          const cb = pendingCallbacks.get(msg.id);
          pendingCallbacks.delete(msg.id);
          cb(msg);
        }

        // Capture console and runtime events
        if (msg.method === 'Runtime.consoleAPICalled') {
          const type = msg.params.type;
          const text = (msg.params.args || []).map(a => a.value || JSON.stringify(a)).join(' ');
          if (type === 'error') {
            console.error(`[CDP CONSOLE.ERROR] ${text}`);
            consoleErrors.push(text);
          } else if (type === 'warn') {
            console.warn(`[CDP CONSOLE.WARN] ${text}`);
          }
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          const details = msg.params.exceptionDetails;
          const excText = details.text + (details.exception ? ' ' + details.exception.description : '');
          console.error(`[CDP PAGE EXCEPTION] ${excText}`);
          pageErrors.push(excText);
        }
      };

      await new Promise(resolve => { ws.onopen = resolve; });

      function sendCdp(method, params = {}) {
        return new Promise((resolve) => {
          const id = msgId++;
          pendingCallbacks.set(id, resolve);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      async function evalInPage(expr) {
        const res = await sendCdp('Runtime.evaluate', {
          expression: expr,
          returnByValue: true,
          awaitPromise: true
        });
        if (res.result && res.result.exceptionDetails) {
          throw new Error(res.result.exceptionDetails.text + ': ' + (res.result.exceptionDetails.exception?.description || ''));
        }
        return res.result?.result?.value;
      }

      // Enable CDP domains
      await sendCdp('Page.enable');
      await sendCdp('Runtime.enable');
      await sendCdp('Log.enable');

      // Navigate to landing page
      console.log(`Navigating to http://127.0.0.1:${port}/index.html ...`);
      await sendCdp('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });

      // Wait 1.5s for initial DOM parsing, scripts execution, and initial frames
      await new Promise(r => setTimeout(r, 1500));

      // 1. Check Console Health
      assert(consoleErrors.length === 0, `Page loaded with zero console.error calls (Found: ${consoleErrors.length})`, "Console-Health");
      assert(pageErrors.length === 0, `Page loaded with zero unhandled runtime exceptions (Found: ${pageErrors.length})`, "Console-Health");

      // 2. Check JS enablement class
      const hasJsClass = await evalInPage("document.documentElement.classList.contains('js')");
      assert(hasJsClass === true, "document.documentElement has 'js' class added", "JS-Engine");

      // 3. Test Hero Spotlight & Pointer move
      const heroExists = await evalInPage("!!document.getElementById('heroSection')");
      assert(heroExists === true, "#heroSection element exists in DOM", "Hero-Spotlight");

      await evalInPage(`
        (function() {
          var hero = document.getElementById('heroSection');
          var evt = new PointerEvent('pointermove', { clientX: 200, clientY: 150, bubbles: true });
          hero.dispatchEvent(evt);
        })()
      `);
      await new Promise(r => setTimeout(r, 100));

      // 4. Test Ambient Cursor Ring & Dot
      const cursorDotExists = await evalInPage("!!document.getElementById('vyCursorDot')");
      const cursorRingExists = await evalInPage("!!document.getElementById('vyCursorRing')");
      assert(cursorDotExists && cursorRingExists, "#vyCursorDot and #vyCursorRing are present", "Ambient-Cursor");

      // 5. Test Talent Rail Carousel Navigation
      const railData = await evalInPage(`
        (function() {
          var rail = document.getElementById('talentRail');
          var prev = document.getElementById('railPrev');
          var next = document.getElementById('railNext');
          var cards = rail ? rail.querySelectorAll('.vy-pcard').length : 0;
          return {
            exists: !!rail && !!prev && !!next,
            cards: cards,
            prevDisabled: prev ? prev.disabled : false,
            nextDisabled: next ? next.disabled : false
          };
        })()
      `);
      assert(railData.exists === true, "Talent rail (#talentRail) and controls (#railPrev, #railNext) exist", "Talent-Rail");
      assert(railData.cards >= 3, `Talent rail contains ${railData.cards} cards (.vy-pcard)`, "Talent-Rail");
      assert(railData.prevDisabled === true, "Previous button (#railPrev) is initially disabled at scrollLeft=0", "Talent-Rail");

      // Click next button
      await evalInPage("document.getElementById('railNext').click()");
      await new Promise(r => setTimeout(r, 200));

      // 6. Test Interactive Split Process Panels / 5-Stage Tabs (#gtm)
      const gtmInit = await evalInPage(`
        (function() {
          var t0 = document.getElementById('gtmTab0');
          var t1 = document.getElementById('gtmTab1');
          var aStage = document.getElementById('gtmAgentStage');
          var aText = document.getElementById('gtmAgentText');
          return {
            t0Active: t0 ? t0.classList.contains('active') : false,
            aStageText: aStage ? aStage.textContent : '',
            aBodyText: aText ? aText.textContent : ''
          };
        })()
      `);
      assert(gtmInit.t0Active === true, "GTM Tab 0 (Signals) is initially active", "GTM-Interactive");
      assert(gtmInit.aStageText === "Signals", "GTM Agent Stage readout displays 'Signals'", "GTM-Interactive");

      // Click Tab 2 (Outreach)
      await evalInPage("document.getElementById('gtmTab2').click()");
      await new Promise(r => setTimeout(r, 100));

      const gtmStage2 = await evalInPage(`
        (function() {
          var t2 = document.getElementById('gtmTab2');
          var aStage = document.getElementById('gtmAgentStage');
          var aText = document.getElementById('gtmAgentText');
          var pText = document.getElementById('gtmPersonText');
          var activeCol = document.querySelectorAll('.loop .stage.vy-active-col').length;
          return {
            t2Active: t2 ? t2.classList.contains('active') : false,
            aStage: aStage ? aStage.textContent : '',
            aText: aText ? aText.textContent : '',
            pText: pText ? pText.textContent : '',
            activeColCount: activeCol
          };
        })()
      `);
      assert(gtmStage2.t2Active === true, "Clicking #gtmTab2 makes Tab 2 active", "GTM-Interactive");
      assert(gtmStage2.aStage === "Outreach", "Agent stage updated to 'Outreach'", "GTM-Interactive");
      assert(gtmStage2.aText.includes("Draft first lines"), "Agent copy updated to 'Draft first lines...'", "GTM-Interactive");
      assert(gtmStage2.pText.includes("Rewrite, approve and send"), "Person copy updated to 'Rewrite, approve and send...'", "GTM-Interactive");
      assert(gtmStage2.activeColCount >= 1, "Underlying .loop matrix table column is highlighted (.vy-active-col)", "GTM-Interactive");

      // Test all other tabs (1, 3, 4, then back to 0)
      for (let s = 0; s < 5; s++) {
        await evalInPage(`document.getElementById('gtmTab${s}').click()`);
      }
      await evalInPage("document.getElementById('gtmTab0').click()");
      const backToZero = await evalInPage("document.getElementById('gtmAgentStage').textContent");
      assert(backToZero === "Signals", "GTM tabs cycling restored cleanly to stage 0", "GTM-Interactive");

      // 7. Test Real-time FAQ Search & Filtering (#faq)
      const faqInit = await evalInPage(`
        (function() {
          var input = document.getElementById('faqSearchInput');
          var list = document.getElementById('faqList');
          var details = list ? list.querySelectorAll('details').length : 0;
          return { hasInput: !!input, detailsCount: details };
        })()
      `);
      assert(faqInit.hasInput === true, "FAQ search input (#faqSearchInput) exists", "FAQ-Search");
      assert(faqInit.detailsCount === 9, `FAQ list contains exactly 9 questions (Found: ${faqInit.detailsCount})`, "FAQ-Search");

      // Test searching a matching term: "rates"
      await evalInPage(`
        (function() {
          var input = document.getElementById('faqSearchInput');
          input.value = 'rates';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        })()
      `);
      await new Promise(r => setTimeout(r, 100));

      const ratesSearch = await evalInPage(`
        (function() {
          var list = document.getElementById('faqList');
          var visible = Array.from(list.querySelectorAll('details')).filter(d => d.style.display !== 'none');
          var count = document.getElementById('faqCount').textContent;
          var clearBtn = document.getElementById('faqClearBtn').style.display;
          return {
            visibleCount: visible.length,
            countText: count,
            clearVisible: clearBtn !== 'none'
          };
        })()
      `);
      assert(ratesSearch.visibleCount === 1, `Searching 'rates' filters to exactly 1 question (Found: ${ratesSearch.visibleCount})`, "FAQ-Search");
      assert(ratesSearch.countText.includes("1 of 9"), `FAQ count displays: "${ratesSearch.countText}"`, "FAQ-Search");
      assert(ratesSearch.clearVisible === true, "Clear button (#faqClearBtn) is visible during active search", "FAQ-Search");

      // Adversarial Test: Special Regex characters in search query without escaping
      await evalInPage(`
        (function() {
          var input = document.getElementById('faqSearchInput');
          input.value = '[a-z]+ (.*) ?? $50';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        })()
      `);
      await new Promise(r => setTimeout(r, 100));

      const specialCharSearch = await evalInPage(`
        (function() {
          var empty = document.getElementById('faqEmpty');
          var emptyVisible = empty && empty.style.display !== 'none';
          var queryText = document.getElementById('faqQueryText').textContent;
          return { emptyVisible: emptyVisible, queryText: queryText };
        })()
      `);
      assert(specialCharSearch.emptyVisible === true, "Searching regex characters safely displays empty state (#faqEmpty) without throwing", "FAQ-Search");
      assert(specialCharSearch.queryText === '[a-z]+ (.*) ?? $50', "Empty state reflects exact search query", "FAQ-Search");

      // Test Clear Button
      await evalInPage("document.getElementById('faqClearBtn').click()");
      await new Promise(r => setTimeout(r, 100));

      const clearedSearch = await evalInPage(`
        (function() {
          var list = document.getElementById('faqList');
          var visible = Array.from(list.querySelectorAll('details')).filter(d => d.style.display !== 'none');
          var count = document.getElementById('faqCount').textContent;
          return { visibleCount: visible.length, countText: count };
        })()
      `);
      assert(clearedSearch.visibleCount === 9, "Clicking clear button restores all 9 questions", "FAQ-Search");
      assert(clearedSearch.countText.includes("Showing all 9 questions"), "FAQ count badge resets to 'Showing all 9 questions'", "FAQ-Search");

      // Test Reset Button from Empty State
      await evalInPage(`
        (function() {
          var input = document.getElementById('faqSearchInput');
          input.value = 'nonexistentxyz';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        })()
      `);
      await new Promise(r => setTimeout(r, 100));
      await evalInPage("document.getElementById('faqResetBtn').click()");
      await new Promise(r => setTimeout(r, 100));

      const resetSearch = await evalInPage(`
        (function() {
          var list = document.getElementById('faqList');
          return Array.from(list.querySelectorAll('details')).filter(d => d.style.display !== 'none').length;
        })()
      `);
      assert(resetSearch === 9, "Clicking empty state reset button restores all 9 questions", "FAQ-Search");

      // Final check on console/page errors throughout the entire test
      assert(consoleErrors.length === 0, `Cumulative console errors: 0 throughout all interactions (Found: ${consoleErrors.length})`, "Console-Health");
      assert(pageErrors.length === 0, `Cumulative page exceptions: 0 throughout all interactions (Found: ${pageErrors.length})`, "Console-Health");

      ws.close();
    } finally {
      browserProc.kill();
      server.close();
      if (fs.existsSync(userDataDir)) {
        try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
      }
      printSummaryAndExit();
    }
  });
}

function printSummaryAndExit() {
  console.log("\n==================================================================");
  console.log(`TOTAL AUDIT RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("==================================================================");

  if (failCount > 0) {
    console.error(`\nFAILED FINDINGS (${failCount}):`);
    findings.forEach(f => console.error(` - [${f.category}] ${f.testName}`));
    process.exit(1);
  } else {
    console.log("\nVERDICT CANDIDATE: ALL 5 CAPABILITIES & INTEGRITY TESTS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  }
}

runReviewAudit().catch(err => {
  console.error("FATAL ERROR IN REVIEW AUDIT:", err);
  process.exit(1);
});
