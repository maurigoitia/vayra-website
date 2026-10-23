const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', '..', '..', 'index.html');
const raw = fs.readFileSync(htmlPath);
const text = raw.toString('utf-8');
const lines = text.split(/\r?\n/);

console.log('--- DEFS SVG (Lines 171-175) ---');
for (let i = 170; i < 175; i++) {
  const line = lines[i];
  console.log(`Line ${i+1}: length=${line.length}, bytes=${Buffer.byteLength(line, 'utf-8')}`);
  if (i === 170) console.log('  Content:', line);
  if (i >= 171 && i <= 173) {
    const match = line.match(/^\s*<path\s+id="([^"]+)"\s+d="([^"]*)"/);
    if (match) {
      console.log(`  Path ID: ${match[1]}, d length: ${match[2].length} chars`);
    } else {
      console.log('  Prefix:', line.slice(0, 100));
    }
  }
  if (i === 174) console.log('  Content:', line);
}

console.log('\n--- MAP SVG (Lines 180-185) ---');
for (let i = 179; i < 185; i++) {
  const line = lines[i];
  console.log(`Line ${i+1}: length=${line.length}, bytes=${Buffer.byteLength(line, 'utf-8')}`);
  console.log('  Content:', line);
}
