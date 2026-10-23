const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '../../../index.html');
let content = fs.readFileSync(indexPath, 'utf8');

console.log("Original index.html byte size:", Buffer.byteLength(content, 'utf8'));

// 1. Check for the <defs> block
const defsRegex = /\r?\n\s*<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>[\s\S]*?<\/defs><\/svg>/;
if (!defsRegex.test(content)) {
  console.error("Could not find <defs> block in index.html");
  process.exit(1);
}

// 2. Check for the mapfield svg block
const mapSvgRegex = /<svg viewBox="0 0 600 800" role="img" aria-label="Map of the Americas with the Latin American cities where Vayra talent lives">[\s\S]*?<use href="#m-us"[\s\S]*?<use href="#m-other"[\s\S]*?<use href="#m-city"[\s\S]*?<path id="at-route" d="" fill="none" stroke="#FFB547" stroke-width="1.6" stroke-dasharray="4 6" stroke-linecap="round" opacity="\.85"\/>\s*<\/svg>/;

if (!mapSvgRegex.test(content)) {
  console.error("Could not find mapfield SVG block in index.html");
  process.exit(1);
}

// Replacement for mapfield:
const newMapField = `<img class="map-bg" src="/map.svg" alt="Map of the Americas with the Latin American cities where Vayra talent lives" width="600" height="800" loading="eager" decoding="async">
            <svg class="map-route" viewBox="0 0 600 800" aria-hidden="true">
              <path id="at-route" d="" fill="none" stroke="#FFB547" stroke-width="1.6" stroke-dasharray="4 6" stroke-linecap="round" opacity=".85"/>
            </svg>`;

// Apply replacements
content = content.replace(defsRegex, '');
content = content.replace(mapSvgRegex, newMapField);

fs.writeFileSync(indexPath, content, 'utf8');
console.log("Successfully updated index.html! New size:", Buffer.byteLength(content, 'utf8'));
