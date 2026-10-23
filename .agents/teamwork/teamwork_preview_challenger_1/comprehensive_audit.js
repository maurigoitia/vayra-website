const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const PORT = 8126;
const CHROME_PORT = 9225;

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chromePath = chromeCandidates.find(p => fs.existsSync(p));

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not Found');
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  const browserProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CHROME_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    `http://localhost:${PORT}/index.html`
  ]);

  try {
    await new Promise(r => setTimeout(r, 1200));
    const res = await fetch(`http://localhost:${CHROME_PORT}/json`);
    const list = await res.json();
    const target = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const caughtExceptions = [];
    const consoleErrors = [];
    let msgId = 1;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        caughtExceptions.push(msg.params);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const m = JSON.parse(evt.data);
          if (m.id === id) {
            ws.removeEventListener('message', handler);
            if (m.error) reject(m.error);
            else resolve(m.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    // Wait for load and initialization
    await new Promise(r => setTimeout(r, 800));

    // Evaluate full interactive sweep
    const sweepResults = await send('Runtime.evaluate', {
      expression: `(async () => {
        const report = {
          carousel: {},
          faq: {},
          gtm: {},
          mouseInteraction: {},
          reducedMotion: {},
          touchDegradation: {}
        };

        // 1. CAROUSEL
        const rail = document.getElementById('talentRail');
        const prev = document.getElementById('railPrev');
        const next = document.getElementById('railNext');
        report.carousel.exists = !!(rail && prev && next);
        if (report.carousel.exists) {
          report.carousel.initialPrevDisabled = prev.disabled;
          // Stress clicks next 30 times
          for (let i = 0; i < 30; i++) next.click();
          await new Promise(r => setTimeout(r, 700));
          report.carousel.afterNextScroll = rail.scrollLeft;
          report.carousel.nextDisabled = next.disabled;
          // Stress clicks prev 30 times
          for (let i = 0; i < 30; i++) prev.click();
          await new Promise(r => setTimeout(r, 700));
          report.carousel.finalScroll = rail.scrollLeft;
          report.carousel.prevDisabled = prev.disabled;
        }

        // 2. GTM TABS
        const tabs = Array.from(document.querySelectorAll('.vy-gtm-tab'));
        report.gtm.tabCount = tabs.length;
        report.gtm.transitions = [];
        for (let i = 0; i < tabs.length; i++) {
          tabs[i].click();
          report.gtm.transitions.push({
            tabIndex: i,
            isActive: tabs[i].classList.contains('active'),
            ariaSelected: tabs[i].getAttribute('aria-selected'),
            agentStageText: document.getElementById('gtmAgentStage')?.textContent,
            personStageText: document.getElementById('gtmPersonStage')?.textContent
          });
        }

        // 3. FAQ SEARCH & INTERACTION
        const faqInput = document.getElementById('faqSearchInput');
        const clearBtn = document.getElementById('faqClearBtn');
        const count = document.getElementById('faqCount');
        const empty = document.getElementById('faqEmpty');
        const queryText = document.getElementById('faqQueryText');
        const details = Array.from(document.querySelectorAll('#faqList details'));

        function search(q) {
          faqInput.value = q;
          faqInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        report.faq.totalQuestions = details.length;
        
        // Search for placeholder suggestions
        search('pricing');
        report.faq.searchPricingMatches = details.filter(d => d.style.display !== 'none').length;
        report.faq.searchPricingEmptyVisible = (empty.style.display === 'block');

        search('LATAM');
        report.faq.searchLatamMatches = details.filter(d => d.style.display !== 'none').length;

        search('SDRs');
        report.faq.searchSdrsMatches = details.filter(d => d.style.display !== 'none').length;

        search('cost');
        report.faq.searchCostMatches = details.filter(d => d.style.display !== 'none').length;

        // Clear button
        clearBtn.click();
        report.faq.afterClearInput = faqInput.value;
        report.faq.afterClearVisible = details.filter(d => d.style.display !== 'none').length;

        // Click on all FAQ details summaries to test accordion behavior
        let accordionFails = 0;
        details.forEach(d => {
          const s = d.querySelector('summary');
          if (s) {
            s.click();
            s.click();
          } else {
            accordionFails++;
          }
        });
        report.faq.accordionErrors = accordionFails;

        // 4. MOUSE SPOTLIGHT & HOVER
        const spotlightCards = Array.from(document.querySelectorAll('[data-spotlight]'));
        report.mouseInteraction.spotlightCount = spotlightCards.length;
        spotlightCards.forEach(c => {
          c.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, clientY: 150, bubbles: true }));
        });
        report.mouseInteraction.sampleCardMx = spotlightCards[0]?.style.getPropertyValue('--mx');
        report.mouseInteraction.sampleCardMy = spotlightCards[0]?.style.getPropertyValue('--my');

        return report;
      })()`,
      returnByValue: true,
      awaitPromise: true
    });

    console.log('Sweep results:\n', JSON.stringify(sweepResults.result?.value, null, 2));
    console.log('\nCaught exceptions:\n', JSON.stringify(caughtExceptions, null, 2));

    ws.close();
  } catch (err) {
    console.error('Audit run error:', err);
  } finally {
    browserProc.kill();
    server.close();
  }
});
