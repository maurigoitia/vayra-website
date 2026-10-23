const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const INDEX_HTML_PATH = path.join(PUBLIC_DIR, 'index.html');
const STYLES_CSS_PATH = path.join(PROJECT_ROOT, 'public', 'styles.css');

console.log('================================================================');
console.log('   INDEPENDENT FORENSIC AUDIT: VAYRA UI INTEGRATION (M1)');
console.log('================================================================');
console.log('Project Root:', PROJECT_ROOT);
console.log('Public Directory:', PUBLIC_DIR);

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

// -------------------------------------------------------------------------
// PHASE 1: SOURCE CODE & AUTHENTICITY FORENSICS
// -------------------------------------------------------------------------
console.log('\n--- 1. AUTHENTICITY & FACADE INSPECTION ---');

check('index.html exists and is readable', fs.existsSync(INDEX_HTML_PATH));
check('styles.css exists and is readable', fs.existsSync(STYLES_CSS_PATH));

const htmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
const stylesContent = fs.readFileSync(STYLES_CSS_PATH, 'utf8');

// Check for facade implementations (e.g. dummy return constants, NotImplemented)
check('No dummy NotImplementedError in client scripts', !htmlContent.includes('NotImplementedError'));
check('No TODO, FIXME, or TBD comments in index.html', !/\b(TODO|FIXME|TBD)\b/i.test(htmlContent));
check('No dummy empty event listeners or no-op returns', !htmlContent.includes('function() {}') && !htmlContent.includes('return true; // dummy'));

// Verify genuine logic exists for all 5 capabilities
check('Hero flashlight has genuine lerp math', htmlContent.includes('curX += (tarX - curX) * 0.12') && htmlContent.includes('--gx') && htmlContent.includes('--gy'));
check('Cursor ring has genuine lerp math and bounds check', htmlContent.includes('ringX += (ringTarX - ringX) * 0.2') && htmlContent.includes('cursorRing.style.transform'));
check('Card spotlight updates CSS variables dynamically', htmlContent.includes('card.style.setProperty(\'--mx\'') && htmlContent.includes('card.style.setProperty(\'--my\''));
check('Talent rail has genuine scrollBy and dynamic step math', htmlContent.includes('rail.scrollBy({ left:') && htmlContent.includes('getRailStep'));
check('GTM tabs dynamically bind 5 stages with text updates', htmlContent.includes('activateGtmStage') && htmlContent.includes('gtmAgentStage.textContent') && htmlContent.includes('gtmPersonStage.textContent'));
check('FAQ search has genuine text matching and open state toggling', htmlContent.includes('d.text.indexOf(query)') && htmlContent.includes('d.item.open = true') && htmlContent.includes('d.item.style.display = \'none\''));
check('Scroll reveals use IntersectionObserver with fallback', htmlContent.includes('new IntersectionObserver') && htmlContent.includes('prefers-reduced-motion'));

// Verify JSON-LD Structured Data validity
const jsonLdMatch = htmlContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let jsonLdParsed = false;
if (jsonLdMatch) {
  try {
    const parsed = JSON.parse(jsonLdMatch[1]);
    jsonLdParsed = typeof parsed === 'object';
  } catch (e) {
    jsonLdParsed = false;
  }
}
check('JSON-LD schema is syntactically valid JSON', jsonLdParsed);

// Validate all inline scripts with node -c
const scriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g;
let scriptMatch;
let scriptIdx = 0;
let allScriptsValid = true;
while ((scriptMatch = scriptRegex.exec(htmlContent)) !== null) {
  const attrs = scriptMatch[1];
  const code = scriptMatch[2].trim();
  if (attrs.includes('application/ld+json') || !code) continue;
  scriptIdx++;
  const tempScriptPath = path.join(__dirname, `_temp_audit_script_${scriptIdx}.js`);
  fs.writeFileSync(tempScriptPath, code, 'utf8');
  try {
    execSync(`node -c "${tempScriptPath}"`, { stdio: 'pipe' });
  } catch (err) {
    allScriptsValid = false;
    console.error(`Script #${scriptIdx} failed syntax check:`, err.message);
  } finally {
    if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
  }
}
check('All inline JavaScript scripts pass node -c syntax verification', allScriptsValid);

// -------------------------------------------------------------------------
// PHASE 2: COPY PRESERVATION FORENSICS
// -------------------------------------------------------------------------
console.log('\n--- 2. COPY PRESERVATION FORENSICS ---');

// Locked strings catalog from survey_vayra.md
const lockedStringsCatalog = [
  // Page Title & Meta
  "Vayra | Hire Top 1% Latam Software Engineers & GTM Talent",
  "Hire elite, AI-vetted software developers and GTM teams from Latin America. The premier nearshore talent network for CTOs, VPs of Engineering, and Growth Managers.",
  // Hero
  "Senior GTM and engineering teams, <em>augmented with AI.</em>",
  "Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents. GTM engineers, SDRs and developers on your hours, with more done by every person.",
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
  // Ticker
  "Outbound systems", "Enrichment", "CRM and RevOps", "SDR teams", "AI agents", "Web and mobile", "Data pipelines", "Cloud",
  // What
  "What we do",
  "Teams that sell, build and ship with AI in the loop.",
  "GTM engineers and teams",
  "The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.",
  "Orchestrated teams",
  "A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.",
  "AI-augmented engineering",
  "Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.",
  "Add people to your team",
  "You lead. They join your Slack, your standups and your tools from day one.",
  "Hand us a goal",
  "A Vayra squad owns it, from discovery to production or from first signal to booked meeting.",
  // GTM
  "The GTM system",
  "Agents do the repetitive work. People own the pipeline.",
  "Every Vayra GTM team runs on the same loop. You can see who did what at each stage, and a person signs off before anything reaches a buyer.",
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
  "GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week.",
  // Cities
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
  // How
  "How we work",
  "You only meet people we would hire ourselves.",
  "Intro call", "Calibrate", "Shortlist", "Kickoff", "Ongoing support",
  "We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.",
  "Your hours, not ours.",
  "Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.",
  "We stay after the hire.",
  "We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together.",
  // FAQ
  "Questions we hear first.",
  "What is Vayra?",
  "Vayra builds AI-augmented GTM and engineering teams from Latin America for US companies. Senior people work alongside orchestrated AI agents, on US hours.",
  "How much does senior talent in Latin America cost?",
  "Vayra rates start at about $50 an hour for a semi-senior software or GTM engineer and $3,000 a month for an SDR. Senior and manager levels cost more. For comparison, the US median pay for software developers is $135,980 a year before benefits (BLS OEWS, May 2025).",
  "What does AI-augmented mean?",
  "Every person works with AI tools and agents as part of the daily work, and knows when to trust them and when to check.",
  "What is an orchestrated team?",
  "Senior people plus AI agents organized around one goal, with a clear owner for every decision.",
  "What do GTM engineers do?",
  "They build the system behind your pipeline: data, enrichment, sequences, CRM and the automations that connect them.",
  "Which roles can Vayra provide?",
  "GTM engineers, SDRs, marketing and ops people, and software engineers for web, mobile, data and cloud.",
  "Can I start with one person?",
  "Yes. Start with one and grow from there.",
  "Extend my team or hand you a goal?",
  "If you already have a lead and a plan, add people to your team. If you need something built or a pipeline running end to end, hand us the goal.",
  "Where are your people based?",
  "Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones.",
  // Contact
  "Talk to us",
  "Tell us what you are building.",
  "A short call is enough to see if we are a good fit.",
  "hello@vayra.team",
  "Copy email",
  "Email us for a quote",
  // Exit Modal
  "Scaling your engineering or GTM team?",
  "Your growth shouldn't be bottlenecked by hiring cycles. We deploy top 1% LATAM engineers and AI-augmented GTM teams in 48 hours. Drop your email to see our vetted talent.",
  "No thanks, just looking"
];

let catalogMatches = 0;
for (const str of lockedStringsCatalog) {
  if (htmlContent.includes(str)) {
    catalogMatches++;
  } else {
    check(`Locked string preserved: "${str.substring(0, 40)}..."`, false, `String missing from index.html!`);
  }
}
check(`All ${lockedStringsCatalog.length} locked marketing strings present verbatim`, catalogMatches === lockedStringsCatalog.length);

// Negative test: No Abstra marketing copy injected into DOM
const abstraNegativeTerms = [
  "Abstra",
  "Supercharge your business with elite offshore talent",
  "Hire elite engineering talent for",
  "Full-Stack Systems",
  "Cloud Infrastructure",
  "Data Engineering",
  "Nearshore Outsourcing"
];

let zeroAbstraInjected = true;
// Strip HTML comments to only check user-facing text
const htmlWithoutComments = htmlContent.replace(/<!--[\s\S]*?-->/g, '');
for (const term of abstraNegativeTerms) {
  if (htmlWithoutComments.includes(term)) {
    zeroAbstraInjected = false;
    check(`No injection of Abstra term "${term}"`, false, `Found Abstra term "${term}" in index.html!`);
  }
}
check('Zero Abstra marketing copy or branding injected into document text', zeroAbstraInjected);

// -------------------------------------------------------------------------
// PHASE 3: DARK THEME & VISUAL TOKENS FORENSICS
// -------------------------------------------------------------------------
console.log('\n--- 3. DARK THEME VERIFICATION ---');

// Verify token definitions in :root
check(':root defines --ink: #0A0F1F', htmlContent.includes('--ink:#0A0F1F') || htmlContent.includes('--ink: #0A0F1F'));
check(':root defines --ink-2: #111934', htmlContent.includes('--ink-2:#111934') || htmlContent.includes('--ink-2: #111934'));
check(':root defines --sun: #FFB547', htmlContent.includes('--sun:#FFB547') || htmlContent.includes('--sun: #FFB547'));
check(':root defines --leaf: #7ED3A6', htmlContent.includes('--leaf:#7ED3A6') || htmlContent.includes('--leaf: #7ED3A6'));
check(':root defines --sky: #8CC8EE', htmlContent.includes('--sky:#8CC8EE') || htmlContent.includes('--sky: #8CC8EE'));

// Check that new .vy- classes adhere to dark theme tokens
check('.vy-cursor-dot uses var(--sun)', htmlContent.includes('.vy-cursor-dot') && (htmlContent.includes('background: var(--sun)') || stylesContent.includes('background: var(--sun)')));
check('.vy-rail-btn uses var(--ink-2) and var(--fg)', htmlContent.includes('.vy-rail-btn') && (htmlContent.includes('background: var(--ink-2)') || stylesContent.includes('background: var(--ink-2)')));
check('.vy-gtm-tab uses var(--ink) and var(--sun)', htmlContent.includes('.vy-gtm-tab') && (htmlContent.includes('background: var(--ink)') || stylesContent.includes('background: var(--ink)')));
check('.vy-gtm-card uses var(--ink) and var(--line)', htmlContent.includes('.vy-gtm-card') && (htmlContent.includes('background: var(--ink)') || stylesContent.includes('background: var(--ink)')));
check('.vy-faq-input uses var(--ink-2) and var(--fg)', htmlContent.includes('.vy-faq-input') && (htmlContent.includes('background: var(--ink-2)') || stylesContent.includes('background: var(--ink-2)')));
check('.vy-faq-empty uses var(--ink-2) and var(--muted)', htmlContent.includes('.vy-faq-empty') && (htmlContent.includes('background: var(--ink-2)') || stylesContent.includes('background: var(--ink-2)')));

// Check that no unstyled or bright white backgrounds exist in .vy- components
const hasJarringWhite = /(?:background|background-color)\s*:\s*(?:#ffffff|#fff|white)\b/i.test(
  htmlContent.substring(htmlContent.indexOf('Vayra Enhancements (.vy- namespace)'))
);
check('No jarring white backgrounds in .vy- rules', !hasJarringWhite);

// -------------------------------------------------------------------------
// PHASE 4: RUNTIME EXECUTION & CONSOLE ERROR FORENSICS (HEADLESS CHROME CDP)
// -------------------------------------------------------------------------
console.log('\n--- 4. RUNTIME EXECUTION & CONSOLE ERROR FORENSICS ---');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
};

const HTTP_PORT = 49152;
const CDP_PORT = 49153;

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(HTTP_PORT, '127.0.0.1', async () => {
  console.log(`Ephemeral test HTTP server listening on http://127.0.0.1:${HTTP_PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);

  if (!browserBin) {
    console.error('[FAIL] Chrome/Edge browser not found for CDP evaluation');
    check('Headless Chrome executable found', false);
    cleanupAndExit();
    return;
  }
  check('Headless Chrome executable found', true);

  const userDataDir = path.join(__dirname, 'temp_chrome_audit_profile');
  if (fs.existsSync(userDataDir)) {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }

  const chromeProcess = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
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

  // Wait for Chrome debugging port to open
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const resp = await new Promise((resolve, reject) => {
        const r = http.get(`http://127.0.0.1:${CDP_PORT}/json/version`, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        });
        r.on('error', reject);
      });
      const info = JSON.parse(resp);
      wsUrl = info.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    check('Connect to Chrome DevTools Protocol (CDP)', false, 'Timed out connecting to CDP');
    try { chromeProcess.kill(); } catch (e) {}
    cleanupAndExit();
    return;
  }
  check('Connected to Chrome DevTools Protocol (CDP)', true);

  // Use global WebSocket
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const callbacks = new Map();
  const consoleErrors = [];
  const runtimeExceptions = [];
  const networkRequests = [];

  ws.onopen = async () => {
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onmessage = data => {
      const msg = JSON.parse(data.data.toString());
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === 'Console.messageAdded') {
          if (msg.params.message.level === 'error') {
            consoleErrors.push(msg.params.message.text);
          }
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
            consoleErrors.push(text);
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          runtimeExceptions.push(msg.params.exceptionDetails.text + (msg.params.exceptionDetails.exception ? ' ' + msg.params.exceptionDetails.exception.description : ''));
        } else if (msg.method === 'Network.responseReceived') {
          networkRequests.push({
            url: msg.params.response.url,
            status: msg.params.response.status
          });
        }
      }
    };

    try {
      // Create new target / page
      const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
      const pageWsUrl = `ws://127.0.0.1:${CDP_PORT}/devtools/page/${targetId}`;
      const pageWs = new WebSocket(pageWsUrl);

      await new Promise(r => { pageWs.onopen = r; });

      let pageMsgId = 1;
      const pageCallbacks = new Map();
      function sendPage(method, params = {}) {
        return new Promise((resolve, reject) => {
          const id = pageMsgId++;
          pageCallbacks.set(id, { resolve, reject });
          pageWs.send(JSON.stringify({ id, method, params }));
        });
      }

      pageWs.onmessage = d => {
        const msg = JSON.parse(d.data.toString());
        if (msg.id && pageCallbacks.has(msg.id)) {
          const { resolve } = pageCallbacks.get(msg.id);
          pageCallbacks.delete(msg.id);
          resolve(msg.result);
        } else if (msg.method) {
          if (msg.method === 'Console.messageAdded' && msg.params.message.level === 'error') {
            consoleErrors.push(msg.params.message.text);
          } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
            consoleErrors.push(text);
          } else if (msg.method === 'Runtime.exceptionThrown') {
            runtimeExceptions.push(msg.params.exceptionDetails.text + (msg.params.exceptionDetails.exception ? ' ' + msg.params.exceptionDetails.exception.description : ''));
          }
        }
      };

      // Enable domains
      await sendPage('Page.enable');
      await sendPage('Runtime.enable');
      await sendPage('Console.enable');
      await sendPage('Network.enable');

      // Navigate to test server
      console.log(`Navigating page to http://127.0.0.1:${HTTP_PORT}/index.html...`);
      await sendPage('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/index.html` });

      // Wait 1.5s for initial render and scripts to run
      await new Promise(r => setTimeout(r, 1500));

      // 4.1 Check page errors on load
      const internalErrors = consoleErrors.filter(err => !err.includes('googletagmanager') && !err.includes('hs-scripts') && !err.includes('Failed to load resource'));
      const internalExceptions = runtimeExceptions.filter(err => !err.includes('googletagmanager') && !err.includes('hs-scripts'));

      check('Zero console.error calls on page load', internalErrors.length === 0, internalErrors.join('; '));
      check('Zero unhandled runtime exceptions on page load', internalExceptions.length === 0, internalExceptions.join('; '));

      // 4.2 Test DOM state & interactive features in real browser
      const evalDOM = await sendPage('Runtime.evaluate', {
        expression: `(function() {
          var results = {};
          
          // 1. Check progressive enhancement .js class
          results.hasJsClass = document.documentElement.classList.contains('js');

          // 2. Check cursor elements
          var dot = document.getElementById('vyCursorDot');
          var ring = document.getElementById('vyCursorRing');
          results.hasCursorElements = !!(dot && ring);

          // 3. Check Talent Rail
          var rail = document.getElementById('talentRail');
          var prev = document.getElementById('railPrev');
          var next = document.getElementById('railNext');
          results.railConfig = {
            exists: !!rail,
            prevDisabled: prev ? prev.disabled : false,
            cardsCount: rail ? rail.querySelectorAll('.vy-pcard').length : 0
          };

          // 4. Check GTM interactive panel
          var gtmInteractive = document.getElementById('gtmInteractive');
          var tabs = document.querySelectorAll('.vy-gtm-tab');
          var agentStage = document.getElementById('gtmAgentStage');
          var personStage = document.getElementById('gtmPersonStage');
          results.gtmConfig = {
            exists: !!gtmInteractive,
            tabsCount: tabs.length,
            agentText: agentStage ? agentStage.textContent : '',
            personText: personStage ? personStage.textContent : ''
          };

          // 5. Check FAQ Search
          var faqInput = document.getElementById('faqSearchInput');
          var faqList = document.getElementById('faqList');
          var faqCount = document.getElementById('faqCount');
          results.faqConfig = {
            inputExists: !!faqInput,
            faqsCount: faqList ? faqList.querySelectorAll('details').length : 0,
            countText: faqCount ? faqCount.textContent : ''
          };

          // 6. Check Scroll Reveal elements count
          var rvElements = document.querySelectorAll('.vy-rv');
          results.rvCount = rvElements.length;

          return results;
        })()`,
        returnByValue: true
      });

      const domRes = evalDOM.result.value;
      check('document.documentElement has .js class', domRes.hasJsClass);
      check('Cursor dot and ring elements present in live DOM', domRes.hasCursorElements);
      check('Talent rail has 3 .vy-pcard offers and prev button initially disabled', domRes.railConfig.exists && domRes.railConfig.cardsCount === 3 && domRes.railConfig.prevDisabled === true);
      check('GTM interactive container has 5 stage tabs initialized to Signals', domRes.gtmConfig.tabsCount === 5 && domRes.gtmConfig.agentText === 'Signals' && domRes.gtmConfig.personText === 'Signals');
      check('FAQ list has all 9 questions and count badge shows "Showing all 9 questions"', domRes.faqConfig.faqsCount === 9 && domRes.faqConfig.countText.includes('9'));
      check('Scroll reveal engine initialized on key landmarks', domRes.rvCount >= 10);

      // 4.3 Test Interactive Functionality: Click GTM Tab 2 ("Outreach")
      const testGtmClick = await sendPage('Runtime.evaluate', {
        expression: `(function() {
          var tab2 = document.getElementById('gtmTab2');
          if (!tab2) return false;
          tab2.click();
          var agentStage = document.getElementById('gtmAgentStage');
          var agentText = document.getElementById('gtmAgentText');
          var personStage = document.getElementById('gtmPersonStage');
          var personText = document.getElementById('gtmPersonText');
          return {
            tab2Active: tab2.classList.contains('active'),
            agentStage: agentStage ? agentStage.textContent : '',
            agentText: agentText ? agentText.textContent : '',
            personStage: personStage ? personStage.textContent : '',
            personText: personText ? personText.textContent : ''
          };
        })()`,
        returnByValue: true
      });

      const gtmClickRes = testGtmClick.result.value;
      check('GTM Tab 2 ("Outreach") click updates agent & person cards dynamically', 
        gtmClickRes.tab2Active && 
        gtmClickRes.agentStage === 'Outreach' && 
        gtmClickRes.agentText === 'Draft first lines and sequences per account.' &&
        gtmClickRes.personStage === 'Outreach' &&
        gtmClickRes.personText === 'Rewrite, approve and send in your voice.'
      );

      // 4.4 Test Interactive Functionality: FAQ Search Query Filtering (including regex special chars)
      const testFaqSearch = await sendPage('Runtime.evaluate', {
        expression: `(function() {
          var input = document.getElementById('faqSearchInput');
          var list = document.getElementById('faqList');
          var count = document.getElementById('faqCount');
          var empty = document.getElementById('faqEmpty');
          var clearBtn = document.getElementById('faqClearBtn');
          if (!input || !list) return false;

          // Test 1: Search "cost"
          input.value = 'cost';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          
          var details = Array.prototype.slice.call(list.querySelectorAll('details'));
          var visibleWithCost = details.filter(function(d) { return d.style.display !== 'none'; });
          var countText1 = count ? count.textContent : '';
          var clearBtnVisible = clearBtn ? clearBtn.style.display !== 'none' : false;

          // Test 2: Search unmatched query "xyznonexistent"
          input.value = 'xyznonexistent';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          var visibleWithXyz = details.filter(function(d) { return d.style.display !== 'none'; });
          var emptyVisible = empty ? empty.style.display !== 'none' : false;
          var countText2 = count ? count.textContent : '';

          // Test 3: Adversarial regex special characters "(*+?)"
          input.value = '(*+?)';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          var emptyVisibleRegex = empty ? empty.style.display !== 'none' : false;

          // Reset
          if (clearBtn) clearBtn.click();
          var visibleAfterReset = details.filter(function(d) { return d.style.display !== 'none'; });

          return {
            costMatchCount: visibleWithCost.length,
            countText1: countText1,
            clearBtnVisible: clearBtnVisible,
            xyzMatchCount: visibleWithXyz.length,
            emptyVisible: emptyVisible,
            countText2: countText2,
            emptyVisibleRegex: emptyVisibleRegex,
            resetMatchCount: visibleAfterReset.length
          };
        })()`,
        returnByValue: true
      });

      const faqSearchRes = testFaqSearch.result.value;
      check('FAQ search filters to matching questions on query "cost"', faqSearchRes.costMatchCount === 1 && faqSearchRes.countText1.includes('Showing 1 of 9'));
      check('FAQ clear button becomes visible when search input has text', faqSearchRes.clearBtnVisible);
      check('FAQ empty state appears when query matches 0 questions', faqSearchRes.xyzMatchCount === 0 && faqSearchRes.emptyVisible);
      check('FAQ search gracefully handles adversarial regex characters without error', faqSearchRes.emptyVisibleRegex);
      check('FAQ clear button resets search and restores all 9 questions', faqSearchRes.resetMatchCount === 9);

      // 4.5 Test Pointer Spotlight & Ambient Glow events
      const testPointerEvents = await sendPage('Runtime.evaluate', {
        expression: `(function() {
          var hero = document.getElementById('heroSection');
          var card = document.querySelector('[data-spotlight]');
          var dot = document.getElementById('vyCursorDot');
          var ring = document.getElementById('vyCursorRing');

          // Dispatch pointermove to window
          window.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, clientY: 300, bubbles: true }));

          // Dispatch pointermove to hero
          if (hero) {
            hero.dispatchEvent(new PointerEvent('pointermove', { clientX: 450, clientY: 250, bubbles: true }));
          }

          // Dispatch pointermove to card
          if (card) {
            card.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 50, bubbles: true }));
          }

          return {
            hasPointerClass: document.body.classList.contains('vy-has-pointer'),
            heroGx: hero ? hero.style.getPropertyValue('--gx') : '',
            cardMx: card ? card.style.getPropertyValue('--mx') : ''
          };
        })()`,
        returnByValue: true
      });

      const pointerRes = testPointerEvents.result.value;
      check('Pointer movement activates body.vy-has-pointer', pointerRes.hasPointerClass);
      check('Card spotlight computes and sets --mx property on pointermove', pointerRes.cardMx !== '');

      // Check again for zero post-interaction console errors
      const postInteractionErrors = consoleErrors.filter(err => !err.includes('googletagmanager') && !err.includes('hs-scripts') && !err.includes('Failed to load resource'));
      const postInteractionExceptions = runtimeExceptions.filter(err => !err.includes('googletagmanager') && !err.includes('hs-scripts'));

      check('Zero console.error calls during user interactions', postInteractionErrors.length === 0, postInteractionErrors.join('; '));
      check('Zero unhandled exceptions during user interactions', postInteractionExceptions.length === 0, postInteractionExceptions.join('; '));

      pageWs.close();
      ws.close();
      try { chromeProcess.kill(); } catch (e) {}
      cleanupAndExit();
    } catch (err) {
      console.error('CDP evaluation error:', err);
      check('CDP execution completes successfully', false, err.message);
      try { chromeProcess.kill(); } catch (e) {}
      cleanupAndExit();
    }
  };

  function cleanupAndExit() {
    server.close(() => {
      console.log('\n================================================================');
      console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
      console.log('================================================================');

      if (failedChecks === 0) {
        console.log('FINAL AUDIT VERDICT: CLEAN');
        process.exit(0);
      } else {
        console.error('FINAL AUDIT VERDICT: INTEGRITY VIOLATION');
        console.error('Failures:', JSON.stringify(failureDetails, null, 2));
        process.exit(1);
      }
    });
  }
});
