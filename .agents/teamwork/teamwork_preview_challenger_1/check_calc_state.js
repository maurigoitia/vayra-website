const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const PORT = 8125;
const CHROME_PORT = 9224;

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
  res.writeHead(200);
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
    await new Promise(r => setTimeout(r, 1500));
    const res = await fetch(`http://localhost:${CHROME_PORT}/json`);
    const list = await res.json();
    const target = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    function evalCdp(expr) {
      return new Promise((res, rej) => {
        const id = msgId++;
        const onMsg = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === id) {
            ws.removeEventListener('message', onMsg);
            if (msg.error) rej(msg.error);
            else res(msg.result?.result?.value);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
      });
    }

    const calcState = await evalCdp(`(() => {
      const usCost = document.getElementById('c-us')?.textContent;
      const laCost = document.getElementById('c-la')?.textContent;
      const saveAnn = document.getElementById('c-save')?.textContent;
      const equivText = document.querySelector('.equiv p')?.textContent;
      return { usCost, laCost, saveAnn, equivText };
    })()`);

    console.log('Calculator state in live DOM:', calcState);

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    browserProc.kill();
    server.close();
  }
});
