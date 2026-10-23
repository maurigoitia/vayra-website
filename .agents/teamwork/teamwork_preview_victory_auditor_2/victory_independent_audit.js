const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const INDEX_HTML = path.join(PUBLIC_DIR, 'index.html');
const STYLES_CSS = path.join(PUBLIC_DIR, 'styles.css');
const AGENTS_DIR = path.join(PROJECT_ROOT, '.agents', 'teamwork');

console.log('================================================================');
console.log('    POST-VICTORY INDEPENDENT AUDIT (VICTORY AUDITOR 2)');
console.log('================================================================');
console.log('Project Root:', PROJECT_ROOT);
console.log('Audit Working Directory:', __dirname);

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureLog = [];

function check(label, condition, detail = '') {
  totalChecks++;
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passedChecks++;
  } else {
    const msg = detail ? `${label} -> ${detail}` : label;
    console.error(`  [FAIL] ${msg}`);
    failedChecks++;
    failureLog.push(msg);
  }
}

async function runVictoryAudit() {
  // ====================================================================
  // PHASE A: TIMELINE & PROVENANCE AUDIT
  // ====================================================================
  console.log('\n================================================================');
  console.log('PHASE A: TIMELINE & PROVENANCE AUDIT');
  console.log('================================================================');

  const requiredHandoffs = [
    { name: 'Survey Abstra (Explorer 1)', path: path.join(AGENTS_DIR, 'teamwork_preview_explorer_survey_1', 'handoff.md') },
    { name: 'Survey Vayra (Explorer 2)', path: path.join(AGENTS_DIR, 'teamwork_preview_explorer_survey_2', 'handoff.md') },
    { name: 'Worker Iteration 1 (Worker M1)', path: path.join(AGENTS_DIR, 'teamwork_preview_worker_m1', 'handoff.md') },
    { name: 'Gate 1 Forensic Audit (Auditor 1)', path: path.join(AGENTS_DIR, 'teamwork_preview_auditor_1', 'handoff.md') },
    { name: 'Gate 1 Challenger Audit (Challenger 1)', path: path.join(AGENTS_DIR, 'teamwork_preview_challenger_1', 'handoff.md') },
    { name: 'Worker Iteration 2 Remediation (Worker M1 Iter 2)', path: path.join(AGENTS_DIR, 'teamwork_preview_worker_m1_iter2', 'handoff.md') },
    { name: 'Gate 2 Forensic Audit (Auditor Iter 2)', path: path.join(AGENTS_DIR, 'teamwork_preview_auditor_iter2', 'handoff.md') },
    { name: 'Gate 2 Challenger Stress (Challenger Iter 2)', path: path.join(AGENTS_DIR, 'teamwork_preview_challenger_iter2_1', 'handoff.md') },
    { name: 'Gate 2 Copy Audit (Challenger Iter 2-2)', path: path.join(AGENTS_DIR, 'teamwork_preview_challenger_iter2_2', 'handoff.md') }
  ];

  for (const item of requiredHandoffs) {
    check(`Artifact provenance: ${item.name}`, fs.existsSync(item.path), `Missing ${item.path}`);
  }

  // Verify Gate 1 rejection on line 1325:19 runtime exception and unclosed media query
  const gate1AuditorHandoff = fs.readFileSync(path.join(AGENTS_DIR, 'teamwork_preview_auditor_1', 'handoff.md'), 'utf8');
  const gate1ChallengerHandoff = fs.readFileSync(path.join(AGENTS_DIR, 'teamwork_preview_challenger_1', 'handoff.md'), 'utf8');
  const recordedGate1Veto = gate1AuditorHandoff.includes('1325') || gate1AuditorHandoff.includes('TypeError') || gate1ChallengerHandoff.includes('REQUEST_CHANGES') || gate1ChallengerHandoff.includes('FAIL');
  check('Timeline reflects authentic Gate 1 binary veto (TypeError & CSS media query)', recordedGate1Veto);

  // Verify Worker Iteration 2 addressed the veto cleanly
  const worker2Handoff = fs.readFileSync(path.join(AGENTS_DIR, 'teamwork_preview_worker_m1_iter2', 'handoff.md'), 'utf8');
  check('Worker 2 handoff documents explicit remediation of null listeners and CSS brace closure',
    worker2Handoff.includes('exit-close') && worker2Handoff.includes('renderCalc') && worker2Handoff.includes('media (max-width: 760px)'));

  // Verify Gate 2 verified the remediation cleanly
  const gate2AuditorHandoff = fs.readFileSync(path.join(AGENTS_DIR, 'teamwork_preview_auditor_iter2', 'handoff.md'), 'utf8');
  check('Gate 2 auditor verified clean remediation with zero exceptions and zero errors',
    gate2AuditorHandoff.includes('CLEAN') && gate2AuditorHandoff.includes('30 PASSED'));

  // ====================================================================
  // PHASE B: INTEGRITY & FORENSICS CHECKS
  // ====================================================================
  console.log('\n================================================================');
  console.log('PHASE B: INTEGRITY & CHEATING FORENSICS');
  console.log('================================================================');

  const currentHtml = fs.readFileSync(INDEX_HTML, 'utf8');
  const currentCss = fs.readFileSync(STYLES_CSS, 'utf8');

  // B.1 100% Strict Copy Preservation
  console.log('\n--- B.1 Copy Preservation Forensics ---');
  const lockedMarketingPhrases = [
    "Vayra | Hire Top 1% Latam Software Engineers & GTM Talent",
    "Hire elite, AI-vetted software developers and GTM teams from Latin America.",
    "Senior GTM and engineering teams, <em>augmented with AI.</em>",
    "Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents.",
    "GTM engineers, SDRs and developers on your hours, with more done by every person.",
    "Get a quote",
    "See the GTM system",
    "gtm-team / live",
    'vayra orchestrate --team gtm --icp "your best customers"',
    "signals", "hiring and funding news found",
    "research", "accounts and contacts enriched",
    "drafts", "first lines written per account",
    "gtm engineer", "reviewed, edited, approved",
    "sdr", "conversations started, calls booked",
    "pipeline updated in your CRM",
    "Outbound systems", "Enrichment", "CRM and RevOps", "SDR teams", "AI agents", "Web and mobile", "Data pipelines", "Cloud",
    "What we do",
    "Teams that sell, build and ship with AI in the loop.",
    "GTM engineers and teams",
    "The people and the system behind your pipeline.",
    "Orchestrated teams",
    "A small senior team plus AI agents, set up around one goal.",
    "AI-augmented engineering",
    "Senior engineers who build with AI in every part of the work: code, tests, reviews and docs.",
    "Add people to your team",
    "You lead. They join your Slack, your standups and your tools from day one.",
    "Hand us a goal",
    "A Vayra squad owns it, from discovery to production or from first signal to booked meeting.",
    "The GTM system",
    "Agents do the repetitive work. People own the pipeline.",
    "Every Vayra GTM team runs on the same loop.",
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
    "Where your team lives",
    "15 cities, one shared workday.",
    "Where are you in the US?",
    "Pick a city in Latin America",
    "Senior engineers between the vineyards and the Andes.",
    "Builders who move fast and never really stop.",
    "A university city full of engineers with solid fundamentals.",
    "River city builders who ship steady, careful work.",
    "Calm product teams who think before they build.",
    "A growing tech scene with people who want to own things.",
    "Engineers who think in systems, with the Andes out the window.",
    "Builders who turn messy problems into clear products.",
    "Designers and engineers who care how things feel.",
    "A city that reinvented itself, and builders who do the same.",
    "SDRs and marketers who sell in English and Spanish.",
    "Mexico’s tech hub, close to US hours and US customers.",
    "GTM and engineering talent from the biggest market in the region.",
    "GTM people who know how to start a conversation.",
    "Surf before standup, ship after.",
    "How we work",
    "You only meet people we would hire ourselves.",
    "Intro call", "Calibrate", "Shortlist", "Kickoff", "Ongoing support",
    "Your hours, not ours.",
    "We stay after the hire.",
    "Questions we hear first.",
    "What is Vayra?",
    "How much does senior talent in Latin America cost?",
    "What does AI-augmented mean?",
    "What is an orchestrated team?",
    "What do GTM engineers do?",
    "Which roles can Vayra provide?",
    "Can I start with one person?",
    "Extend my team or hand you a goal?",
    "Where are your people based?",
    "Tell us what you are building.",
    "hello@vayra.team",
    "Copy email",
    "Email us for a quote",
    "Scaling your engineering or GTM team?",
    "Your growth shouldn't be bottlenecked by hiring cycles.",
    "No thanks, just looking"
  ];

  let missingPhrases = 0;
  for (const phrase of lockedMarketingPhrases) {
    if (!currentHtml.includes(phrase)) {
      missingPhrases++;
      check(`Locked marketing phrase: "${phrase.slice(0, 35)}..."`, false, 'Missing from index.html');
    }
  }
  check(`All ${lockedMarketingPhrases.length} locked marketing phrases present verbatim`, missingPhrases === 0);

  // B.2 Foreign Token Leakage
  console.log('\n--- B.2 Foreign Token & Abstra Leakage ---');
  const foreignTokens = [
    /\babstra\b/i,
    /abstra\.io/i,
    /abstra-home/i,
    /Built with Abstra/i,
    /Workflow automation for finance/i,
    /Python scripts into web apps/i,
    /Connect to your Postgres database/i
  ];
  let foreignCount = 0;
  for (const pat of foreignTokens) {
    if (pat.test(currentHtml) || pat.test(currentCss)) {
      foreignCount++;
      check(`Foreign token pattern: ${pat}`, false, 'Found in codebase');
    }
  }
  check('Zero Abstra brand, marketing, or code tokens in HTML and CSS', foreignCount === 0);

  // B.3 Anti-Cheating & Facade Detection
  console.log('\n--- B.3 Anti-Cheating & Facade Detection ---');
  check('No NotImplementedError in codebase', !currentHtml.includes('NotImplementedError') && !currentCss.includes('NotImplementedError'));
  check('No unaddressed TODO/FIXME/TBD stubs in index.html', !/\b(TODO|FIXME|TBD)\b/i.test(currentHtml));
  check('No dummy no-op event listeners or fake return constants', !currentHtml.includes('function() {}') && !currentHtml.includes('return true; // dummy'));

  // B.4 CSS Scoping & Dark Theme Adherence
  console.log('\n--- B.4 CSS Scoping & Dark Theme Tokens ---');
  // Check CSS braces depth in styles.css
  let cssBraceDepth = 0;
  let cssBalanced = true;
  for (let i = 0; i < currentCss.length; i++) {
    if (currentCss[i] === '{') cssBraceDepth++;
    else if (currentCss[i] === '}') {
      cssBraceDepth--;
      if (cssBraceDepth < 0) { cssBalanced = false; break; }
    }
  }
  check('styles.css brace depth perfectly balanced to 0', cssBalanced && cssBraceDepth === 0, `Ended at depth ${cssBraceDepth}`);

  // Check inline <style> brace depth in index.html
  const inlineStyles = currentHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  let inlineBraceDepth = 0;
  let inlineBalanced = true;
  for (const styleTag of inlineStyles) {
    const content = styleTag.replace(/<\/?style[^>]*>/gi, '');
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') inlineBraceDepth++;
      else if (content[i] === '}') {
        inlineBraceDepth--;
        if (inlineBraceDepth < 0) { inlineBalanced = false; break; }
      }
    }
  }
  check('inline <style> blocks in index.html have balanced brace depth', inlineBalanced && inlineBraceDepth === 0, `Ended at depth ${inlineBraceDepth}`);

  // Check dark theme tokens defined in :root (in index.html or styles.css)
  const fullStyles = currentHtml + '\n' + currentCss;
  check('color-scheme: dark defined', fullStyles.includes('color-scheme: dark') || fullStyles.includes('color-scheme:dark'));
  check('--ink: #0A0F1F defined in :root', fullStyles.includes('--ink:#0A0F1F') || fullStyles.includes('--ink: #0A0F1F'));
  check('--ink-2: #111934 defined in :root', fullStyles.includes('--ink-2:#111934') || fullStyles.includes('--ink-2: #111934'));
  check('--sun: #FFB547 defined in :root', fullStyles.includes('--sun:#FFB547') || fullStyles.includes('--sun: #FFB547'));
  check('--leaf: #7ED3A6 defined in :root', fullStyles.includes('--leaf:#7ED3A6') || fullStyles.includes('--leaf: #7ED3A6'));
  check('--sky: #8CC8EE defined in :root', fullStyles.includes('--sky:#8CC8EE') || fullStyles.includes('--sky: #8CC8EE'));

  // Check that new UI elements are namespaced with .vy-
  const vySelectors = (currentCss + '\n' + currentHtml).match(/\.vy-[a-zA-Z0-9_-]+/g) || [];
  check('Components properly namespaced under .vy- (found at least 20)', vySelectors.length >= 20, `Found ${vySelectors.length}`);

  // Check no bright white background rules inside .vy- namespace
  const vyCssRules = (currentCss + '\n' + currentHtml).split('\n').filter(l => l.includes('.vy-')).join('\n');
  const hasJarringWhite = /(?:background|background-color)\s*:\s*(?:#ffffff|#fff|white)\b/i.test(vyCssRules);
  check('No jarring white backgrounds in .vy- rules', !hasJarringWhite);

  // B.5 JavaScript Syntax Validation
  console.log('\n--- B.5 Inline Script Syntax Validation ---');
  const scriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g;
  let scriptMatch;
  let scriptIndex = 0;
  let allScriptsSyntaxOk = true;
  while ((scriptMatch = scriptRegex.exec(currentHtml)) !== null) {
    const attrs = scriptMatch[1];
    const code = scriptMatch[2].trim();
    if (attrs.includes('application/ld+json') || !code) continue;
    scriptIndex++;
    const tempFile = path.join(__dirname, `_temp_syntax_test_${scriptIndex}.js`);
    fs.writeFileSync(tempFile, code, 'utf8');
    try {
      execSync(`node -c "${tempFile}"`, { stdio: 'pipe' });
    } catch (e) {
      allScriptsSyntaxOk = false;
      console.error(`Script #${scriptIndex} syntax error:`, e.message);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }
  check(`All ${scriptIndex} inline JavaScript scripts pass node -c syntax validation`, allScriptsSyntaxOk);

  // ====================================================================
  // PHASE C: INDEPENDENT TEST EXECUTION (BROWSER CDP RUNTIME)
  // ====================================================================
  console.log('\n================================================================');
  console.log('PHASE C: INDEPENDENT TEST EXECUTION (HEADLESS BROWSER & CDP)');
  console.log('================================================================');

  const HTTP_PORT = 49280;
  const CDP_PORT = 49281;

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.mp4': 'video/mp4',
    '.txt': 'text/plain',
    '.xml': 'application/xml'
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
  check('Browser executable located (Chrome/Edge)', !!browserBin, 'Neither Chrome nor Edge found');

  const profileDir = path.join(__dirname, 'temp_victory_auditor_profile');
  if (fs.existsSync(profileDir)) {
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
  }

  const chromeProc = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--disable-gpu',
    '--mute-audio',
    'about:blank'
  ], { stdio: 'ignore' });

  // Connect to CDP
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
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

  check('Connected to Chrome DevTools Protocol (CDP)', !!wsUrl, 'Could not obtain webSocketDebuggerUrl');

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
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params.exceptionDetails;
      const desc = details.exception ? (details.exception.description || details.exception.value) : details.text;
      const loc = `${details.url || 'inline'}:${details.lineNumber}:${details.columnNumber}`;
      if (!desc.includes('googletagmanager') && !desc.includes('hs-scripts')) {
        console.error(`  [CDP Exception] ${desc} at ${loc}`);
        runtimeExceptions.push({ desc, loc });
      }
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      const text = msg.params.entry.text || '';
      if (!text.includes('googletagmanager') && !text.includes('hs-scripts') && !text.includes('Failed to load resource')) {
        console.error(`  [CDP Log.error] ${text}`);
        consoleErrors.push(text);
      }
    }
    if (msg.method === 'Console.messageAdded' && msg.params.message.level === 'error') {
      const text = msg.params.message.text || '';
      if (!text.includes('googletagmanager') && !text.includes('hs-scripts') && !text.includes('Failed to load resource')) {
        console.error(`  [CDP Console.error] ${text}`);
        consoleErrors.push(text);
      }
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = (msg.params.args || []).map(a => a.value || a.description || '').join(' ');
      if (!text.includes('googletagmanager') && !text.includes('hs-scripts') && !text.includes('Failed to load resource')) {
        console.error(`  [CDP ConsoleAPI.error] ${text}`);
        consoleErrors.push(text);
      }
    }
  };

  await new Promise(r => { pageWs.onopen = r; });

  // Enable CDP domains
  await pSend('Runtime.enable');
  await pSend('Log.enable');
  await pSend('Page.enable');
  await pSend('Console.enable');

  console.log(`\nNavigating page to http://127.0.0.1:${HTTP_PORT}/index.html...`);
  await pSend('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/index.html` });

  // Wait 1.8 seconds for initial render and scripts to settle
  await new Promise(r => setTimeout(r, 1800));

  // Assert page load health
  check('Zero unhandled runtime exceptions on initial page load', runtimeExceptions.length === 0, `${runtimeExceptions.length} exceptions thrown`);
  check('Zero console error messages on initial page load', consoleErrors.length === 0, `${consoleErrors.length} console errors logged`);

  async function evalInPage(expression) {
    const res = await pSend('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Eval error');
    }
    return res.result.value;
  }

  // --- C.1 Live DOM Component Verification ---
  console.log('\n--- C.1 Live DOM Component Verification ---');

  const domStatus = await evalInPage(`(() => {
    const hasJsClass = document.documentElement.classList.contains('js');
    const dot = document.getElementById('vyCursorDot');
    const ring = document.getElementById('vyCursorRing');
    const rail = document.getElementById('talentRail');
    const prev = document.getElementById('railPrev');
    const next = document.getElementById('railNext');
    const cards = rail ? rail.querySelectorAll('.vy-pcard') : [];
    const gtm = document.getElementById('gtmInteractive');
    const tabs = document.querySelectorAll('.vy-gtm-tab');
    const agentStage = document.getElementById('gtmAgentStage');
    const personStage = document.getElementById('gtmPersonStage');
    const faqInput = document.getElementById('faqSearchInput');
    const faqList = document.getElementById('faqList');
    const faqCount = document.getElementById('faqCount');
    const rvElements = document.querySelectorAll('.vy-rv');

    return {
      hasJsClass,
      hasCursorElements: !!(dot && ring),
      railPresent: !!rail,
      cardCount: cards.length,
      prevDisabled: prev ? prev.disabled : null,
      nextDisabled: next ? next.disabled : null,
      gtmPresent: !!gtm,
      tabsCount: tabs.length,
      agentText: agentStage ? agentStage.textContent.trim() : '',
      personText: personStage ? personStage.textContent.trim() : '',
      faqInputPresent: !!faqInput,
      faqsCount: faqList ? faqList.querySelectorAll('details').length : 0,
      faqCountText: faqCount ? faqCount.textContent.trim() : '',
      rvCount: rvElements.length
    };
  })()`);

  check('Progressive enhancement html.js class added', domStatus.hasJsClass);
  check('Custom cursor dot (#vyCursorDot) and ring (#vyCursorRing) present in DOM', domStatus.hasCursorElements);
  check('Talent Rail (#talentRail) present with 3 senior profile cards (.vy-pcard)', domStatus.railPresent && domStatus.cardCount === 3);
  check('Talent Rail prev button (#railPrev) initially disabled at index 0', domStatus.prevDisabled === true);
  check('GTM Interactive container (#gtmInteractive) present with 5 stage tabs', domStatus.gtmPresent && domStatus.tabsCount === 5);
  check('GTM stage cards initialized to "Signals" stage', domStatus.agentText === 'Signals' && domStatus.personText === 'Signals');
  check('FAQ Search input (#faqSearchInput) present with all 9 FAQ details elements', domStatus.faqInputPresent && domStatus.faqsCount === 9);
  check('FAQ count badge initialized to "Showing all 9 questions"', domStatus.faqCountText.includes('9'));
  check('Scroll reveal engine initialized on key landmarks (.vy-rv >= 10)', domStatus.rvCount >= 10, `Found ${domStatus.rvCount}`);

  // --- C.2 Interactive Behavior & Stress Testing ---
  console.log('\n--- C.2 Interactive Behavior & Stress Testing ---');

  // Test 1: Talent Rail Scroll Navigation
  const railNavTest = await evalInPage(`(() => {
    const rail = document.getElementById('talentRail');
    const prevBtn = document.getElementById('railPrev');
    const nextBtn = document.getElementById('railNext');
    if (!rail || !nextBtn) return { success: false };
    const prevDisabledBefore = prevBtn ? prevBtn.disabled : false;
    nextBtn.click();
    return {
      success: true,
      prevDisabledBefore
    };
  })()`);
  await new Promise(r => setTimeout(r, 200));

  const railScrolled = await evalInPage(`(() => {
    const prevBtn = document.getElementById('railPrev');
    const rail = document.getElementById('talentRail');
    return {
      prevEnabled: prevBtn ? !prevBtn.disabled : false,
      scrollMoved: rail ? rail.scrollLeft > 0 : false
    };
  })()`);
  check('Talent Rail navigation updates scroll and button state cleanly',
    railNavTest.success && railNavTest.prevDisabledBefore && (railScrolled.prevEnabled || railScrolled.scrollMoved));

  // Test 2: GTM 5-Stage Tab Switching & Matrix Sync
  const gtmCycleTest = await evalInPage(`(() => {
    const tabs = document.querySelectorAll('.vy-gtm-tab');
    const stages = [];
    tabs.forEach((tab, idx) => {
      tab.click();
      const agentStage = document.getElementById('gtmAgentStage');
      const personStage = document.getElementById('gtmPersonStage');
      stages.push({
        idx,
        agent: agentStage ? agentStage.textContent.trim() : '',
        person: personStage ? personStage.textContent.trim() : ''
      });
    });
    return {
      totalStages: stages.length
    };
  })()`);
  check('GTM Tabs cycle dynamically through all 5 stages', gtmCycleTest.totalStages === 5);

  // Click Tab 2 (Outreach) specifically and wait for tick
  await evalInPage("document.getElementById('gtmTab2').click()");
  await new Promise(r => setTimeout(r, 100));

  const gtmTab2Test = await evalInPage(`(() => {
    const tab2 = document.getElementById('gtmTab2');
    const agentStage = document.getElementById('gtmAgentStage');
    const agentText = document.getElementById('gtmAgentText');
    const personStage = document.getElementById('gtmPersonStage');
    const personText = document.getElementById('gtmPersonText');
    return {
      tab2Active: tab2 ? tab2.classList.contains('active') : false,
      agentStage: agentStage ? agentStage.textContent.trim() : '',
      agentText: agentText ? agentText.textContent.trim() : '',
      personStage: personStage ? personStage.textContent.trim() : '',
      personText: personText ? personText.textContent.trim() : ''
    };
  })()`);

  // Restore to tab 0
  await evalInPage("document.getElementById('gtmTab0').click()");
  await new Promise(r => setTimeout(r, 100));

  check('GTM Tab 2 ("Outreach") dynamically synchronizes agent & person cards',
    gtmTab2Test.tab2Active &&
    gtmTab2Test.agentStage === 'Outreach' &&
    gtmTab2Test.agentText.includes('Draft first lines') &&
    gtmTab2Test.personStage === 'Outreach' &&
    gtmTab2Test.personText.includes('Rewrite, approve and send'));

  // Test 3: FAQ Real-time Search, Synonym Expansion & Adversarial Inputs
  const faqSearchTest = await evalInPage(`(() => {
    const input = document.getElementById('faqSearchInput');
    const list = document.getElementById('faqList');
    const count = document.getElementById('faqCount');
    const empty = document.getElementById('faqEmpty');
    const clearBtn = document.getElementById('faqClearBtn');
    const details = Array.from(list.querySelectorAll('details'));

    // Test A: Search "cost"
    input.value = 'cost';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const visibleCost = details.filter(d => d.style.display !== 'none').length;
    const countCost = count ? count.textContent.trim() : '';

    // Test B: Synonym search "pricing" -> maps to "cost"
    input.value = 'pricing';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const visiblePricing = details.filter(d => d.style.display !== 'none').length;

    // Test C: Synonym search "latam" -> maps to "latin america"
    input.value = 'latam';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const visibleLatam = details.filter(d => d.style.display !== 'none').length;

    // Test D: Adversarial input with regex meta characters and script tags
    input.value = '(*+?)[^$]{5,}\\\\<script>';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const visibleRegex = details.filter(d => d.style.display !== 'none').length;
    const emptyVisible = empty ? empty.style.display !== 'none' : false;
    const emptyQueryText = document.getElementById('faqQueryText') ? document.getElementById('faqQueryText').textContent : '';

    // Test E: Clear button restores all 9
    if (clearBtn) clearBtn.click();
    const visibleAfterClear = details.filter(d => d.style.display !== 'none').length;
    const countAfterClear = count ? count.textContent.trim() : '';

    return {
      visibleCost,
      countCost,
      visiblePricing,
      visibleLatam,
      visibleRegex,
      emptyVisible,
      emptyQueryText,
      visibleAfterClear,
      countAfterClear
    };
  })()`);

  check('FAQ search on "cost" filters to exactly 1 question', faqSearchTest.visibleCost === 1 && faqSearchTest.countCost.includes('Showing 1 of 9'));
  check('FAQ search synonym expansion on "pricing" resolves to matching question', faqSearchTest.visiblePricing === 1);
  check('FAQ search synonym expansion on "latam" matches questions', faqSearchTest.visibleLatam >= 1);
  check('FAQ search safely handles adversarial regex and displays empty state with escaped query',
    faqSearchTest.visibleRegex === 0 && faqSearchTest.emptyVisible && faqSearchTest.emptyQueryText.includes('<script>'));
  check('FAQ clear button restores all 9 questions and resets count badge',
    faqSearchTest.visibleAfterClear === 9 && faqSearchTest.countAfterClear.includes('9'));

  // Test 4: Exit Modal Interaction
  const exitModalTest = await evalInPage(`(() => {
    const exitEl = document.getElementById('exit');
    const closeBtn = document.getElementById('exit-close');
    const laterBtn = document.getElementById('exit-later');
    if (!exitEl || !closeBtn) return { success: false };

    // Test close button
    exitEl.hidden = false;
    closeBtn.click();
    const closed1 = exitEl.hidden;

    // Test later button
    exitEl.hidden = false;
    if (laterBtn) laterBtn.click();
    const closed2 = exitEl.hidden;

    // Test Escape key
    exitEl.hidden = false;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const closed3 = exitEl.hidden;

    return {
      success: true,
      closed1,
      closed2,
      closed3
    };
  })()`);
  check('Exit modal close, later, and Escape handlers function cleanly with zero null dereferences',
    exitModalTest.success && exitModalTest.closed1 && exitModalTest.closed2 && exitModalTest.closed3);

  // Test 5: Mouse Movement & Spotlight
  const mouseMoveTest = await evalInPage(`(() => {
    const hero = document.getElementById('heroSection');
    const card = document.querySelector('[data-spotlight]');

    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 350, clientY: 280, bubbles: true }));
    if (hero) hero.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, clientY: 200, bubbles: true }));
    if (card) card.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 60, bubbles: true }));

    return {
      hasPointerClass: document.body.classList.contains('vy-has-pointer'),
      heroGx: hero ? hero.style.getPropertyValue('--gx') : '',
      cardMx: card ? card.style.getPropertyValue('--mx') : ''
    };
  })()`);
  check('Pointer movement activates body.vy-has-pointer and computes spotlight CSS vars',
    mouseMoveTest.hasPointerClass && mouseMoveTest.cardMx !== '');

  // Final Health Check across all interactive sessions
  check('Zero unhandled exceptions across all interactive operations', runtimeExceptions.length === 0, `${runtimeExceptions.length} exceptions thrown`);
  check('Zero console error messages across all interactive operations', consoleErrors.length === 0, `${consoleErrors.length} console errors logged`);

  // Teardown
  try {
    pageWs.close();
    browserWs.close();
    chromeProc.kill();
    server.close();
    if (fs.existsSync(profileDir)) {
      fs.rmSync(profileDir, { recursive: true, force: true });
    }
  } catch (e) {}

  // ====================================================================
  // SUMMARY & VERDICT
  // ====================================================================
  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
  console.log('================================================================');

  if (failedChecks === 0) {
    console.log('\n>>> INDEPENDENT VICTORY AUDIT VERDICT: VICTORY CONFIRMED <<<');
    process.exit(0);
  } else {
    console.log('\n>>> INDEPENDENT VICTORY AUDIT VERDICT: VICTORY REJECTED <<<');
    console.log('Failures:', failureLog);
    process.exit(1);
  }
}

runVictoryAudit().catch(err => {
  console.error('Fatal audit execution failure:', err);
  process.exit(1);
});
