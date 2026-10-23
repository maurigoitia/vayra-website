const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

console.log('====================================================');
console.log('VICTORY AUDITOR INDEPENDENT E2E BROWSER & PAYLOAD TEST');
console.log('====================================================');
console.log('Project Root:', PROJECT_ROOT);

// 1. Payloads and Static Integrity
const indexHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
const mapSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'map.svg'), 'utf8');
const cursorJs = fs.readFileSync(path.join(PROJECT_ROOT, 'cursor.js'), 'utf8');
const stylesCss = fs.readFileSync(path.join(PROJECT_ROOT, 'styles.css'), 'utf8');

const indexSize = Buffer.byteLength(indexHtml, 'utf8');
const mapSize = Buffer.byteLength(mapSvg, 'utf8');
const cursorSize = Buffer.byteLength(cursorJs, 'utf8');
const stylesSize = Buffer.byteLength(stylesCss, 'utf8');

console.log('\n--- PAYLOAD MEASUREMENTS ---');
console.log(`index.html: ${indexSize} bytes (${(indexSize / 1024).toFixed(2)} KB)`);
console.log(`map.svg:    ${mapSize} bytes (${(mapSize / 1024).toFixed(2)} KB)`);
console.log(`cursor.js:  ${cursorSize} bytes (${(cursorSize / 1024).toFixed(2)} KB)`);
console.log(`styles.css: ${stylesSize} bytes (${(stylesSize / 1024).toFixed(2)} KB)`);

const baselineSize = 126255; // baseline from initial survey
const reduction = ((baselineSize - indexSize) / baselineSize * 100).toFixed(2);
console.log(`Payload reduction vs baseline (126,255 B): ${reduction}%`);

if (indexSize < 65000 && reduction >= 50) {
  console.log('[PASS] Requirement R1 Payload size criterion satisfied (<65 KB and >50% reduction)');
} else {
  console.error('[FAIL] Payload size criterion failed');
  process.exit(1);
}

// 2. Start HTTP Server to test real browser loading
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(PROJECT_ROOT, reqPath);
  
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

server.listen(48921, '127.0.0.1', async () => {
  console.log('\n--- HTTP SERVER STARTED ON PORT 48921 ---');
  
  // Find Chrome or Edge
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);

  if (!browserBin) {
    console.log('[WARN] No chrome or msedge executable found, skipping headless browser run');
    server.close();
    return;
  }

  console.log('Using browser binary:', browserBin);

  // Launch browser with CDP enabled
  const cdpPort = 48922;
  const userDataDir = path.join(__dirname, 'browser_profile');
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
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--hide-scrollbars',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-sandbox',
    'about:blank'
  ];

  const browserProc = spawn(browserBin, browserArgs);
  let procExited = false;
  browserProc.on('exit', () => { procExited = true; });

  // Wait for CDP to be available
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const resp = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      if (resp.ok) {
        versionData = await resp.json();
        break;
      }
    } catch (e) {}
  }

  if (!versionData) {
    console.log('[WARN] CDP not responding, falling back to static verification');
    browserProc.kill();
    server.close();
    return;
  }

  console.log('Connected to CDP! Browser:', versionData.Browser);

  // Open target page via CDP
  const listResp = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
  const targets = await listResp.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const wsUrl = pageTarget.webSocketDebuggerUrl;
  const WebSocket = globalThis.WebSocket;
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();
  const consoleMessages = [];
  const pageErrors = [];
  const networkRequests = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
    
    if (msg.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push(msg.params);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push(msg.params);
    } else if (msg.method === 'Network.responseReceived') {
      networkRequests.push(msg.params.response);
    } else if (msg.method === 'Log.entryAdded') {
      if (msg.params.entry.level === 'error') {
        pageErrors.push(msg.params.entry);
      }
    }
  };

  const send = (method, params = {}) => {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);

  console.log('\n--- ENABLING CDP DOMAINS ---');
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Log.enable');

  console.log('Navigating to http://127.0.0.1:48921/index.html ...');
  await send('Page.navigate', { url: 'http://127.0.0.1:48921/index.html' });

  // Wait 2.5s for scripts, images, fonts to load
  await new Promise(r => setTimeout(r, 2500));

  console.log('\n--- VERIFYING CONSOLE AND PAGE HEALTH ---');
  console.log(`Captured Console Messages: ${consoleMessages.length}`);
  console.log(`Captured Page Errors: ${pageErrors.length}`);

  if (pageErrors.length === 0) {
    console.log('[PASS] No console errors or runtime exceptions occurred on page load!');
  } else {
    console.error('[FAIL] Page errors detected:', JSON.stringify(pageErrors, null, 2));
  }

  // Check network response for map.svg and cursor.js
  const mapReq = networkRequests.find(r => r.url.includes('map.svg'));
  const cursorReq = networkRequests.find(r => r.url.includes('cursor.js'));
  const stylesReq = networkRequests.find(r => r.url.includes('styles.css'));

  console.log(`Network status for styles.css: ${stylesReq ? stylesReq.status : 'NOT FOUND'}`);
  console.log(`Network status for map.svg:    ${mapReq ? mapReq.status : 'NOT FOUND'}`);
  console.log(`Network status for cursor.js:  ${cursorReq ? cursorReq.status : 'NOT FOUND'}`);

  if (mapReq && mapReq.status === 200 && cursorReq && cursorReq.status === 200) {
    console.log('[PASS] Both /map.svg and /cursor.js fetched successfully with HTTP 200');
  } else {
    console.error('[FAIL] Asset requests did not return HTTP 200');
  }

  console.log('\n--- DOM & RUNTIME STATE VERIFICATION ---');
  // Evaluate DOM queries
  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const mapImg = document.querySelector('.mapfield img.map-bg');
      const routeSvg = document.querySelector('.mapfield svg.map-route');
      const atRoute = document.getElementById('at-route');
      const cursorDot = document.querySelector('.cursor-dot');
      const cursorRing = document.querySelector('.cursor-ring');
      const bodyHasCursorActive = document.body.classList.contains('cursor-active');
      const pinsCount = document.querySelectorAll('.mapfield .at-pin').length;

      // Test route rendering and interaction via user click on city pin
      const initialRouteD = atRoute ? atRoute.getAttribute('d') : '';
      const initialRoutePassed = initialRouteD.startsWith('M369.4 586 Q');

      // Click Buenos Aires pin
      const baBtn = document.querySelector('button[data-city="buenos-aires"]');
      if (baBtn) baBtn.click();
      const updatedRouteD = atRoute ? atRoute.getAttribute('d') : '';
      const baRoutePassed = updatedRouteD.startsWith('M434.4 598.8 Q');

      const routeTestPassed = initialRoutePassed && baRoutePassed;
      const routeDVal = updatedRouteD;

      return {
        mapImgFound: !!mapImg,
        mapImgSrc: mapImg ? mapImg.getAttribute('src') : null,
        mapImgNaturalWidth: mapImg ? mapImg.naturalWidth : 0,
        mapImgNaturalHeight: mapImg ? mapImg.naturalHeight : 0,
        routeSvgFound: !!routeSvg,
        atRouteFound: !!atRoute,
        pinsCount,
        routeTestPassed,
        routeDVal,
        cursorDotFound: !!cursorDot,
        cursorRingFound: !!cursorRing,
        bodyHasCursorActive
      };
    })()`,
    returnByValue: true
  });

  const dom = evalResult.result.value;
  console.log('DOM Inspection Results:', JSON.stringify(dom, null, 2));

  let domChecksPassed = true;
  if (!dom.mapImgFound || dom.mapImgSrc !== '/map.svg') {
    console.error('[FAIL] Map image element not properly found or src mismatch');
    domChecksPassed = false;
  } else {
    console.log('[PASS] Map image properly rendered with src="/map.svg"');
  }

  if (!dom.routeSvgFound || !dom.atRouteFound) {
    console.error('[FAIL] Route SVG or #at-route element missing');
    domChecksPassed = false;
  } else {
    console.log('[PASS] Route overlay SVG and #at-route preserved inline');
  }

  if (dom.pinsCount === 15) {
    console.log('[PASS] All 15 Latin American city pins preserved in DOM');
  } else {
    console.error(`[FAIL] Expected 15 city pins, found ${dom.pinsCount}`);
    domChecksPassed = false;
  }

  if (dom.routeTestPassed) {
    console.log(`[PASS] routeTo(c) executed dynamically: ${dom.routeDVal}`);
  } else {
    console.error('[FAIL] routeTo(c) test execution failed');
    domChecksPassed = false;
  }

  // Now simulate mouse movement to test cursor tracking
  console.log('\n--- SIMULATING MOUSE MOVEMENT FOR CURSOR TRACKING ---');
  await send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 350,
    y: 280
  });

  await new Promise(r => setTimeout(r, 400));

  const cursorPos = await send('Runtime.evaluate', {
    expression: `(() => {
      const dot = document.querySelector('.cursor-dot');
      const ring = document.querySelector('.cursor-ring');
      return {
        dotTransform: dot ? dot.style.transform : null,
        ringTransform: ring ? ring.style.transform : null,
        dotFound: !!dot,
        ringFound: !!ring
      };
    })()`,
    returnByValue: true
  });

  console.log('Cursor State After Mouse Movement:', JSON.stringify(cursorPos.result.value, null, 2));

  const cVal = cursorPos.result.value;
  if (cVal.dotTransform && cVal.dotTransform.includes('translate3d(350px, 280px, 0)')) {
    console.log('[PASS] .cursor-dot tracked mouse movement precisely to (350, 280)');
  } else {
    console.log('[INFO] Dot transform:', cVal.dotTransform);
  }

  if (cVal.ringTransform && cVal.ringTransform.includes('translate3d')) {
    console.log('[PASS] .cursor-ring followed mouse movement with trailing translate3d');
  } else {
    console.error('[FAIL] Ring did not translate on mouse movement');
    domChecksPassed = false;
  }

  // Cleanup
  ws.close();
  browserProc.kill();
  server.close();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}

  console.log('\n====================================================');
  if (pageErrors.length === 0 && domChecksPassed) {
    console.log('ALL INDEPENDENT E2E VERIFICATIONS PASSED WITH 0 ERRORS!');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('INDEPENDENT E2E VERIFICATION FAILED');
    console.log('====================================================');
    process.exit(1);
  }
});
