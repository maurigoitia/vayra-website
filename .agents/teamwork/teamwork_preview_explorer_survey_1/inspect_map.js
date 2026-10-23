const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', '..', '..', 'index.html');
const raw = fs.readFileSync(htmlPath);
const text = raw.toString('utf-8');
const lines = text.split(/\r?\n/);

console.log('Total file size (bytes):', raw.length);
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('<defs>') || line.includes('id="m-us"') || line.includes('id="m-other"') || line.includes('id="m-city"') || line.includes('</defs>') || line.includes('class="mapfield"') || line.includes('id="at-route"')) {
    console.log(`Line ${idx + 1} (${Buffer.byteLength(line, 'utf-8')} bytes): ${line.substring(0, 60)}...`);
  }
});

// Calculate size of defs
let defsSize = 0;
for (let i = 170; i < 175; i++) {
  defsSize += Buffer.byteLength(lines[i], 'utf-8') + 1; // approx + newline
}
console.log(`Lines 171-175 approx bytes: ${defsSize} (${(defsSize / raw.length * 100).toFixed(2)}% of index.html)`);

// Also check lines 180-185
let mapSvgSize = 0;
for (let i = 179; i < 185; i++) {
  mapSvgSize += Buffer.byteLength(lines[i], 'utf-8') + 1;
}
console.log(`Lines 180-185 approx bytes: ${mapSvgSize}`);
