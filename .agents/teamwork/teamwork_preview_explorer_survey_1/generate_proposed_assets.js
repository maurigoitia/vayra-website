const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', '..', '..', 'index.html');
const text = fs.readFileSync(htmlPath, 'utf-8');
const lines = text.split(/\r?\n/);

console.log('line 171 prefix:', lines[171].slice(0, 50));
console.log('line 172 prefix:', lines[172].slice(0, 50));
console.log('line 173 prefix:', lines[173].slice(0, 50));

const mUs = lines[171].trim();
const mOther = lines[172].trim();
const mCity = lines[173].trim();

// Extract d attributes (use indexOf to be safe against regex backtracking on 32k strings)
const extractD = (line) => {
  const start = line.indexOf('d="');
  if (start === -1) return '';
  const end = line.lastIndexOf('"');
  return line.substring(start + 3, end);
};

const dUs = extractD(mUs);
const dOther = extractD(mOther);
const dCity = extractD(mCity);
console.log('dUs length:', dUs.length);
console.log('dOther length:', dOther.length);
console.log('dCity length:', dCity.length);

// Strategy A: Complete standalone SVG (with fills and strokes as defined on <use>)
const standaloneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800" role="img" aria-label="Map of the Americas with the Latin American cities where Vayra talent lives">
  <path id="m-us" d="${dUs}" fill="#141D38" stroke="#0A0F1F" stroke-width=".8"/>
  <path id="m-other" d="${dOther}" fill="#1A2447" stroke="#0A0F1F" stroke-width=".8"/>
  <path id="m-city" d="${dCity}" fill="#26355F" stroke="#0A0F1F" stroke-width=".8"/>
</svg>
`;

fs.writeFileSync(path.join(__dirname, 'proposed_map_standalone.svg'), standaloneSvg);

// Strategy B: Defs/symbols SVG for external <use>
const defsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <defs>
    <path id="m-us" d="${dUs}"/>
    <path id="m-other" d="${dOther}"/>
    <path id="m-city" d="${dCity}"/>
  </defs>
</svg>
`;

fs.writeFileSync(path.join(__dirname, 'proposed_map_defs.svg'), defsSvg);

console.log('Standalone SVG size:', Buffer.byteLength(standaloneSvg, 'utf-8'), 'bytes');
console.log('Defs SVG size:', Buffer.byteLength(defsSvg, 'utf-8'), 'bytes');

// Check gzip size
const zlib = require('zlib');
const gzStandalone = zlib.gzipSync(Buffer.from(standaloneSvg));
console.log('Standalone SVG gzipped size:', gzStandalone.length, 'bytes');
