const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../..');
const htmlPath = path.join(rootDir, 'index.html');
const mapSvgPath = path.join(rootDir, 'map.svg');

const html = fs.readFileSync(htmlPath, 'utf8');

const mUsMatch = html.match(/<path id="m-us" d="([^"]+)"\/>/);
const mOtherMatch = html.match(/<path id="m-other" d="([^"]+)"\/>/);
const mCityMatch = html.match(/<path id="m-city" d="([^"]+)"\/>/);

if (!mUsMatch || !mOtherMatch || !mCityMatch) {
  console.error('Could not find all paths in index.html!');
  process.exit(1);
}

console.log('Found path m-us: length =', mUsMatch[1].length);
console.log('Found path m-other: length =', mOtherMatch[1].length);
console.log('Found path m-city: length =', mCityMatch[1].length);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800" role="img" aria-label="Map of the Americas with the Latin American cities where Vayra talent lives">
  <path id="m-us" d="${mUsMatch[1]}" fill="#141D38" stroke="#0A0F1F" stroke-width=".8"/>
  <path id="m-other" d="${mOtherMatch[1]}" fill="#1A2447" stroke="#0A0F1F" stroke-width=".8"/>
  <path id="m-city" d="${mCityMatch[1]}" fill="#26355F" stroke="#0A0F1F" stroke-width=".8"/>
</svg>
`;

fs.writeFileSync(mapSvgPath, svgContent, 'utf8');
console.log('map.svg written successfully to:', mapSvgPath);
console.log('File size:', fs.statSync(mapSvgPath).size, 'bytes');
