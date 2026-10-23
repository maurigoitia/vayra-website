const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..', '..');
const mapContent = fs.readFileSync(path.join(rootDir, 'map.svg'), 'utf8');

const lines = mapContent.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('<path')) {
    const idMatch = l.match(/\bid="([^"]+)"/);
    const dMatch = l.match(/\s+d="([^"]+)"/);
    if (idMatch && dMatch) {
      console.log(`Path #${idMatch[1]}: d length = ${dMatch[1].length} chars. Sample: ${dMatch[1].slice(0, 50)}...`);
    }
  }
});
