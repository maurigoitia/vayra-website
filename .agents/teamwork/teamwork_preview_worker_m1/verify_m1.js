const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '../../../');
const mapSvgPath = path.join(rootDir, 'map.svg');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(rootDir, 'styles.css');
const cursorJsPath = path.join(rootDir, 'cursor.js');

let failures = [];
let passes = [];

function assert(condition, message) {
  if (condition) {
    passes.push(message);
    console.log(`[PASS] ${message}`);
  } else {
    failures.push(message);
    console.error(`[FAIL] ${message}`);
  }
}

console.log("=== MILESTONE 1 VERIFICATION AUDIT ===");

// 1. Verify map.svg
console.log("\n--- Checking map.svg ---");
assert(fs.existsSync(mapSvgPath), "map.svg exists in project root");
const mapSvgContent = fs.readFileSync(mapSvgPath, 'utf8');
const mapSvgSize = Buffer.byteLength(mapSvgContent, 'utf8');
console.log(`map.svg size: ${mapSvgSize} bytes`);
assert(mapSvgSize > 60000 && mapSvgSize < 75000, `map.svg size is appropriate (~65KB, actual: ${mapSvgSize} bytes)`);
assert(mapSvgContent.includes('xmlns="http://www.w3.org/2000/svg"'), "map.svg has xmlns attribute");
assert(mapSvgContent.includes('viewBox="0 0 600 800"'), "map.svg has viewBox 0 0 600 800");
assert(mapSvgContent.includes('id="m-us"'), "map.svg contains #m-us path");
assert(mapSvgContent.includes('id="m-other"'), "map.svg contains #m-other path");
assert(mapSvgContent.includes('id="m-city"'), "map.svg contains #m-city path");

// Check for duplicated 'd' attributes
const duplicateD = /\bd="[^"]*"\s+d="/.test(mapSvgContent) || /<path[^>]*\bd="[^"]*"[^>]*\bd="/.test(mapSvgContent);
assert(!duplicateD, "map.svg is free of duplicated d attribute syntax errors");

// 2. Verify index.html
console.log("\n--- Checking index.html ---");
assert(fs.existsSync(indexPath), "index.html exists in project root");
const indexContent = fs.readFileSync(indexPath, 'utf8');
const indexSize = Buffer.byteLength(indexContent, 'utf8');
console.log(`index.html size: ${indexSize} bytes (Baseline was 126,255 bytes)`);
const reductionPercent = ((126255 - indexSize) / 126255 * 100).toFixed(1);
console.log(`Payload reduction: ${reductionPercent}%`);
assert(indexSize < 65000, `index.html size is < 65 KB (actual: ${indexSize} bytes)`);
assert(reductionPercent >= 50.0, `index.html payload reduction >= 50% (actual: ${reductionPercent}%)`);

assert(!indexContent.includes('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'), "index.html does NOT contain inline defs block");
assert(indexContent.includes('<img class="map-bg" src="/map.svg"'), "index.html references /map.svg via <img class=\"map-bg\">");
assert(indexContent.includes('<svg class="map-route" viewBox="0 0 600 800" aria-hidden="true">'), "index.html contains <svg class=\"map-route\">");
assert(indexContent.includes('<path id="at-route"'), "index.html contains <path id=\"at-route\"> for dynamic routing");
assert(indexContent.includes('<script defer src="/cursor.js"></script>'), "index.html loads /cursor.js with defer");

// 3. Verify cursor.js
console.log("\n--- Checking cursor.js ---");
assert(fs.existsSync(cursorJsPath), "cursor.js exists in project root");
const cursorJsContent = fs.readFileSync(cursorJsPath, 'utf8');
assert(cursorJsContent.includes('cursor-dot'), "cursor.js creates cursor-dot");
assert(cursorJsContent.includes('cursor-ring'), "cursor.js creates cursor-ring");
assert(cursorJsContent.includes('cursor-ring-inner'), "cursor.js creates cursor-ring-inner");
assert(cursorJsContent.includes('requestAnimationFrame'), "cursor.js uses requestAnimationFrame");
assert(cursorJsContent.includes('pointermove'), "cursor.js listens to pointermove");
assert(cursorJsContent.includes('pointer-events') === false, "cursor.js doesn't mistakenly interfere with events");
assert(cursorJsContent.includes('prefers-reduced-motion'), "cursor.js respects prefers-reduced-motion");
assert(cursorJsContent.includes('pointer: fine'), "cursor.js respects fine pointer check");
assert(cursorJsContent.includes('touchstart'), "cursor.js has dynamic touch teardown");

// Syntax check cursor.js with node
try {
  execSync(`node -c "${cursorJsPath}"`, { stdio: 'pipe' });
  assert(true, "cursor.js syntax check passed with node -c");
} catch (e) {
  assert(false, `cursor.js syntax error: ${e.message}`);
}

// 4. Verify styles.css
console.log("\n--- Checking styles.css ---");
assert(fs.existsSync(cssPath), "styles.css exists in project root");
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.mapfield > svg, .mapfield > img'), "styles.css contains .mapfield > svg, .mapfield > img positioning");
assert(cssContent.includes('.mapfield > .map-route{pointer-events:none}'), "styles.css disables pointer-events on .map-route");
assert(cssContent.includes('.cursor-dot') && cssContent.includes('.cursor-ring'), "styles.css defines .cursor-dot and .cursor-ring");
assert(cssContent.includes('@media (hover: hover) and (pointer: fine)'), "styles.css scopes custom cursor to fine pointer");
assert(cssContent.includes('@media (prefers-reduced-motion: reduce)'), "styles.css includes reduced-motion overrides");

console.log("\n=== AUDIT SUMMARY ===");
console.log(`Passes: ${passes.length}`);
console.log(`Failures: ${failures.length}`);

if (failures.length > 0) {
  process.exit(1);
} else {
  console.log("ALL VERIFICATION CHECKS PASSED PERFECTLY!");
}
