const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const INDEX_HTML_PATH = path.join(PUBLIC_DIR, 'index.html');
const STYLES_CSS_PATH = path.join(PUBLIC_DIR, 'styles.css');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function check(name, condition, errorMsg = '') {
  totalChecks++;
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passedChecks++;
  } else {
    console.error(`  [FAIL] ${name} ${errorMsg ? '--> ' + errorMsg : ''}`);
    failedChecks++;
    failureDetails.push({ name, errorMsg });
  }
}

async function runIndependentAudit() {
  console.log('================================================================');
  console.log('   FORENSIC AUDITOR INDEPENDENT SUITE: M1 ITERATION 2');
  console.log('================================================================');
  console.log('Project Root:', PROJECT_ROOT);
  console.log('Index HTML:', INDEX_HTML_PATH);

  // 1. FILE INTEGRITY & REMEDIATION STRUCTURE
  console.log('\n--- 1. FILE INTEGRITY & REMEDIATION STRUCTURE ---');
  check('index.html exists and is readable', fs.existsSync(INDEX_HTML_PATH));
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // Verify remediation at former line 1325:19
  check('Remediated exitClose listener is guarded', html.includes('var exitClose = $(\'exit-close\');') && html.includes('if (exitClose) exitClose.addEventListener'));
  check('Remediated exitLater listener is guarded', html.includes('var exitLater = $(\'exit-later\');') && html.includes('if (exitLater) exitLater.addEventListener'));
  check('Remediated exitCopy listener is guarded', html.includes('var exitCopy = $(\'exit-copy\');') && html.includes('if (exitCopy) {'));
  check('Remediated quoteBtn listener is guarded', html.includes('var quoteBtn = $(\'quote-btn\');') && html.includes('if (quoteBtn) quoteBtn.addEventListener'));
  check('renderCalc invocation is guarded and intact', html.includes('if (typeof renderCalc === \'function\') {') && html.includes('renderCalc();'));

  // Verify no stubs or dummy facades
  check('No NotImplementedError', !html.includes('NotImplementedError'));
  check('No unaddressed TODO/FIXME/TBD stubs', !/\b(TODO|FIXME|TBD)\b/i.test(html));
  check('No dummy no-op event listeners', !html.includes('function() {}') && !html.includes('return true; // dummy'));

  // Verify all scripts pass node -c syntax check
  const scriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g;
  let scriptMatch;
  let scriptIdx = 0;
  let allScriptsSyntaxOk = true;
  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const attrs = scriptMatch[1];
    const code = scriptMatch[2].trim();
    if (attrs.includes('application/ld+json') || !code) continue;
    scriptIdx++;
    const tempFile = path.join(__dirname, `_syntax_check_${scriptIdx}.js`);
    fs.writeFileSync(tempFile, code, 'utf8');
    try {
      execSync(`node -c "${tempFile}"`, { stdio: 'pipe' });
    } catch (e) {
      allScriptsSyntaxOk = false;
      console.error(`Syntax error in script ${scriptIdx}:`, e.message);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }
  check('All inline script blocks pass node -c syntax validation', allScriptsSyntaxOk);

  // 2. COPY PRESERVATION FORENSICS (Comprehensive checks against survey_vayra.md)
  console.log('\n--- 2. COPY PRESERVATION FORENSICS ---');
  const lockedMarketingPhrases = [
    'Vayra | Hire Top 1% Latam Software Engineers & GTM Talent',
    'Hire elite, AI-vetted software developers and GTM teams from Latin America',
    'Senior GTM and engineering teams,',
    'augmented with AI.',
    'Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents.',
    'Get a quote',
    'See the GTM system',
    'gtm-team / live',
    'vayra orchestrate --team gtm --icp "your best customers"',
    'hiring and funding news found',
    'accounts and contacts enriched',
    'first lines written per account',
    'reviewed, edited, approved',
    'conversations started, calls booked',
    'pipeline updated in your CRM',
    'Outbound systems',
    'Enrichment',
    'CRM and RevOps',
    'SDR teams',
    'AI agents',
    'Web and mobile',
    'Data pipelines',
    'Cloud',
    'Teams that sell, build and ship with AI in the loop.',
    'GTM engineers and teams',
    'The people and the system behind your pipeline.',
    'Orchestrated teams',
    'A small senior team plus AI agents, set up around one goal.',
    'AI-augmented engineering',
    'Senior engineers who build with AI in every part of the work:',
    'Two ways to start',
    'Add people to your team',
    'Hand us a goal',
    'Agents do the repetitive work. People own the pipeline.',
    'Every Vayra GTM team runs on the same loop.',
    'Watch hiring, funding and product news across your market.',
    'Enrich accounts and contacts with what matters.',
    'Draft first lines and sequences per account.',
    'Summarize replies and calls into clean notes.',
    'Keep the CRM updated without anyone chasing it.',
    'Decide which signals are worth acting on.',
    'Check every account against your real ICP.',
    'Rewrite, approve and send in your voice.',
    'Run the calls and build the relationship.',
    'Report to you on what is moving and why.',
    '15 cities, one shared workday.',
    'Pick where you are in the US and see what your team is doing right now.',
    'You only meet people we would hire ourselves.',
    'Your hours, not ours.',
    'We stay after the hire.',
    'Questions we hear first.',
    'What is Vayra?',
    'How much does senior talent in Latin America cost?',
    'What does AI-augmented mean?',
    'What is an orchestrated team?',
    'What do GTM engineers do?',
    'Which roles can Vayra provide?',
    'Can I start with one person?',
    'Extend my team or hand you a goal?',
    'Where are your people based?',
    'Tell us what you are building.',
    'hello@vayra.team',
    'Scaling your engineering or GTM team?',
    'Your growth shouldn\'t be bottlenecked by hiring cycles.',
    'No thanks, just looking'
  ];

  let copyOk = true;
  for (const phrase of lockedMarketingPhrases) {
    if (!html.includes(phrase)) {
      copyOk = false;
      check(`Locked marketing phrase: "${phrase.slice(0, 35)}..."`, false, 'Missing from index.html');
    }
  }
  if (copyOk) {
    check(`All ${lockedMarketingPhrases.length} locked marketing phrases present verbatim`, true);
  }

  // Verify zero Abstra contamination in document
  const prohibitedAbstraTerms = ['abstra.io', 'abstra cloud', 'abstra workflow', 'join abstra', 'abstra python', 'abstra form'];
  let noContamination = true;
  const bodyTextWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '').toLowerCase();
  for (const term of prohibitedAbstraTerms) {
    if (bodyTextWithoutComments.includes(term)) {
      noContamination = false;
      check(`Prohibited term: "${term}"`, false, 'Found in index.html');
    }
  }
  if (noContamination) {
    check('Zero Abstra branding or text contamination found in HTML', true);
  }

  // 3. DARK THEME VERIFICATION
  console.log('\n--- 3. DARK THEME VERIFICATION ---');
  check(':root defines --ink: #0A0F1F', html.includes('--ink: #0A0F1F') || html.includes('--ink:#0A0F1F'));
  check(':root defines --ink-2: #111934', html.includes('--ink-2: #111934') || html.includes('--ink-2:#111934'));
  check(':root defines --sun: #FFB547', html.includes('--sun: #FFB547') || html.includes('--sun:#FFB547'));
  check(':root defines --leaf: #7ED3A6', html.includes('--leaf: #7ED3A6') || html.includes('--leaf:#7ED3A6'));
  check(':root defines --sky: #8CC8EE', html.includes('--sky: #8CC8EE') || html.includes('--sky:#8CC8EE'));

  const vyStyleIdx = html.indexOf('Vayra Enhancements (.vy- namespace)');
  const vyStyleBlock = vyStyleIdx >= 0 ? html.substring(vyStyleIdx, html.indexOf('</style>', vyStyleIdx)) : '';
  const whiteBgRegex = /(?:background|background-color)\s*:\s*(?:#fff|#ffffff|white)\b/i;
  check('No bright white background rules in .vy- styles', !whiteBgRegex.test(vyStyleBlock));

  // 4. RUNTIME CHROME CDP FORENSIC EXECUTION
  console.log('\n--- 4. RUNTIME CHROME CDP FORENSIC EXECUTION ---');
  const HTTP_PORT = 49180;
  const CDP_PORT = 49181;

  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.mp4': 'video/mp4'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || !reqPath) reqPath = '/index.html';
    const filePath = path.join(PUBLIC_DIR, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise(r => server.listen(HTTP_PORT, '127.0.0.1', r));
  console.log(`Independent test HTTP server listening on http://127.0.0.1:${HTTP_PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);
  check('Chrome/Edge executable found', !!browserBin);

  const profileDir = path.join(__dirname, 'temp_chrome_independent_profile_iter2');
  if (fs.existsSync(profileDir)) {
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
  }

  const chromeProc = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--mute-audio',
    'about:blank'
  ], { stdio: 'ignore' });

  // Connect CDP
  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const resp = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${CDP_PORT}/json/version`, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(d));
        });
        req.on('error', reject);
      });
      const data = JSON.parse(resp);
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  check('Connected to Chrome DevTools Protocol', !!wsUrl);

  const browserWs = new WebSocket(wsUrl);
  let bMsgId = 1;
  const bCallbacks = new Map();

  function bSend(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = bMsgId++;
      bCallbacks.set(id, { resolve, reject });
      browserWs.send(JSON.stringify({ id, method, params }));
    });
  }

  browserWs.onmessage = e => {
    const msg = JSON.parse(e.data.toString());
    if (msg.id && bCallbacks.has(msg.id)) {
      const { resolve } = bCallbacks.get(msg.id);
      bCallbacks.delete(msg.id);
      resolve(msg.result);
    }
  };

  await new Promise(r => { browserWs.onopen = r; });

  const { targetId } = await bSend('Target.createTarget', { url: 'about:blank' });
  const pageWsUrl = `ws://127.0.0.1:${CDP_PORT}/devtools/page/${targetId}`;
  const pageWs = new WebSocket(pageWsUrl);

  let pMsgId = 1;
  const pCallbacks = new Map();
  const runtimeExceptions = [];
  const consoleErrors = [];

  function pSend(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = pMsgId++;
      pCallbacks.set(id, { resolve, reject });
      pageWs.send(JSON.stringify({ id, method, params }));
    });
  }

  pageWs.onmessage = e => {
    const msg = JSON.parse(e.data.toString());
    if (msg.id && pCallbacks.has(msg.id)) {
      const { resolve } = pCallbacks.get(msg.id);
      pCallbacks.delete(msg.id);
      resolve(msg.result);
    } else if (msg.method) {
      if (msg.method === 'Console.messageAdded' && msg.params.message.level === 'error') {
        consoleErrors.push(msg.params.message.text);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.text + (msg.params.exceptionDetails.exception ? ' ' + msg.params.exceptionDetails.exception.description : '');
        runtimeExceptions.push(desc);
      }
    }
  };

  await new Promise(r => { pageWs.onopen = r; });

  await pSend('Page.enable');
  await pSend('Runtime.enable');
  await pSend('Console.enable');

  console.log(`Navigating to http://127.0.0.1:${HTTP_PORT}/index.html...`);
  await pSend('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/index.html` });

  // Wait 1.5 seconds for complete document lifecycle
  await new Promise(r => setTimeout(r, 1500));

  // Check 1: Initial load exceptions & errors
  const filterErrors = list => list.filter(e => !e.includes('googletagmanager') && !e.includes('hs-scripts') && !e.includes('Failed to load resource'));
  const initialExceptions = filterErrors(runtimeExceptions);
  const initialErrors = filterErrors(consoleErrors);

  check('Zero unhandled exceptions on initial page load', initialExceptions.length === 0, initialExceptions.join('; '));
  check('Zero console errors on initial page load', initialErrors.length === 0, initialErrors.join('; '));
  check('Specific verification: line 1325:19 TypeError is completely gone', !initialExceptions.some(e => e.includes('1325') || e.includes('Cannot read properties of null')));

  // Check 2: Verify Exit Modal Interactions
  console.log('Testing Exit Modal interactions...');
  const modalTest = await pSend('Runtime.evaluate', {
    expression: `(function() {
      var exitEl = document.getElementById('exit');
      var closeBtn = document.getElementById('exit-close');
      var laterBtn = document.getElementById('exit-later');
      if (!exitEl) return { exists: false };

      // Manually open modal
      exitEl.hidden = false;
      var wasOpen = !exitEl.hidden;

      // Click closeBtn
      if (closeBtn) closeBtn.click();
      var closedByClose = exitEl.hidden;

      // Open again and click laterBtn
      exitEl.hidden = false;
      if (laterBtn) laterBtn.click();
      var closedByLater = exitEl.hidden;

      // Open again and dispatch Escape key
      exitEl.hidden = false;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      var closedByEsc = exitEl.hidden;

      return {
        exists: true,
        wasOpen: wasOpen,
        closedByClose: closedByClose,
        closedByLater: closedByLater,
        closedByEsc: closedByEsc
      };
    })()`,
    returnByValue: true
  });
  const mRes = modalTest.result.value;
  check('Exit modal opens and closes cleanly via exit-close', mRes.exists && mRes.closedByClose);
  check('Exit modal closes cleanly via exit-later', mRes.closedByLater);
  check('Exit modal closes cleanly via Escape key', mRes.closedByEsc);

  // Check 3: City selector interaction & Timezone calculator
  console.log('Testing City Selector & Atlas interactions...');
  const cityTest = await pSend('Runtime.evaluate', {
    expression: `(function() {
      var usSelectors = document.querySelectorAll('[data-usselect]');
      var cityPins = document.querySelectorAll('[data-city]');
      var bandYou = document.getElementById('band-you');
      var bandTeam = document.getElementById('band-team');
      var sharedEl = document.getElementById('shared');
      var sayEl = document.getElementById('say');

      if (usSelectors.length > 0) {
        usSelectors[0].value = 'chi';
        usSelectors[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (cityPins.length > 1) {
        cityPins[1].click();
      }

      return {
        hasUsSelectors: usSelectors.length > 0,
        hasCityPins: cityPins.length > 0,
        hasBands: !!(bandYou && bandTeam),
        sharedText: sharedEl ? sharedEl.textContent : '',
        sayHtml: sayEl ? sayEl.innerHTML : ''
      };
    })()`,
    returnByValue: true
  });
  const cRes = cityTest.result.value;
  check('City selector & Shared Workday Atlas calculate without errors', cRes.hasUsSelectors && cRes.hasCityPins && cRes.hasBands && cRes.sharedText !== '');

  // Check 4: Talent Rail & GTM Tabs full cycle (using 0-indexed gtmTab0..gtmTab4)
  console.log('Testing Talent Rail & GTM Tabs full cycle...');
  const railGtmTest = await pSend('Runtime.evaluate', {
    expression: `(function() {
      // Talent rail next/prev
      var rail = document.getElementById('talentRail');
      var next = document.getElementById('railNext');
      var prev = document.getElementById('railPrev');
      if (next) next.click();
      if (next) next.click();
      if (prev) prev.click();

      // GTM Tabs 0 to 4
      var tabs = [0, 1, 2, 3, 4].map(function(n) { return document.getElementById('gtmTab' + n); });
      tabs.forEach(function(t) { if (t) t.click(); });

      // FAQ accordion open/close
      var details = document.querySelectorAll('#faqList details');
      if (details[0]) details[0].open = true;
      if (details[1]) details[1].open = true;

      return {
        railExists: !!rail,
        tabsClicked: tabs.filter(Boolean).length,
        faqsToggled: details.length
      };
    })()`,
    returnByValue: true
  });
  const rgRes = railGtmTest.result.value;
  check('Talent Rail & All 5 GTM Stage Tabs cycle with zero errors', rgRes.railExists && rgRes.tabsClicked === 5);

  // Check 5: Post-interaction errors and exceptions
  const postExceptions = filterErrors(runtimeExceptions);
  const postErrors = filterErrors(consoleErrors);

  check('Zero unhandled exceptions across all interactive stress tests', postExceptions.length === 0, postExceptions.join('; '));
  check('Zero console errors across all interactive stress tests', postErrors.length === 0, postErrors.join('; '));

  // Clean up
  pageWs.close();
  browserWs.close();
  try { chromeProc.kill(); } catch (e) {}

  await new Promise(r => server.close(r));
  if (fs.existsSync(profileDir)) {
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
  }

  console.log('\n================================================================');
  console.log(`INDEPENDENT AUDIT COMPLETE: ${totalChecks} CHECKS | ${passedChecks} PASSED | ${failedChecks} FAILED`);
  console.log('================================================================');

  if (failedChecks === 0) {
    console.log('FINAL AUDIT VERDICT: CLEAN');
    process.exit(0);
  } else {
    console.error('FINAL AUDIT VERDICT: INTEGRITY VIOLATION');
    process.exit(1);
  }
}

runIndependentAudit().catch(err => {
  console.error('Fatal independent audit error:', err);
  process.exit(1);
});
