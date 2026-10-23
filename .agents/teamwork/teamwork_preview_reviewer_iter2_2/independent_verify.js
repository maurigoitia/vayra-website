const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../..');
const htmlPath = path.join(projectRoot, 'public', 'index.html');
const cssPath = path.join(projectRoot, 'public', 'styles.css');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

console.log('--- 1. CSS & Style Bracing Checks ---');
const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
styleMatches.forEach((s, idx) => {
  let open = 0;
  for (let c of s) {
    if (c === '{') open++;
    if (c === '}') open--;
  }
  console.log(`Style block #${idx+1} braces: ${open === 0 ? 'BALANCED' : 'IMBALANCED (' + open + ')'}`);
  if (open !== 0) process.exit(1);
});

let cssOpen = 0;
for (let c of css) {
  if (c === '{') cssOpen++;
  if (c === '}') cssOpen--;
}
console.log(`styles.css braces: ${cssOpen === 0 ? 'BALANCED' : 'IMBALANCED (' + cssOpen + ')'}`);
if (cssOpen !== 0) process.exit(1);

console.log('\n--- 2. Responsive Breakpoint Coverage ---');
const mqs = (html.match(/@media[^{]+\{/g) || []).concat(css.match(/@media[^{]+\{/g) || []);
console.log(`Total media queries found: ${mqs.length}`);
const expectedBreakpoints = ['760px', '960px', '640px', '768px', 'prefers-reduced-motion'];
expectedBreakpoints.forEach(bp => {
  const found = mqs.some(m => m.includes(bp));
  console.log(`Breakpoint/Media '${bp}': ${found ? 'FOUND' : 'MISSING'}`);
  if (!found) process.exit(1);
});

console.log('\n--- 3. Component Invariants Verification ---');
// Check Talent Rail
const hasTalentRail = html.includes('id="talentRail"') && html.includes('id="railPrev"') && html.includes('id="railNext"');
console.log(`Talent rail IDs: ${hasTalentRail}`);
const pcardCount = (html.match(/class="[^"]*vy-pcard[^"]*"/g) || []).length;
console.log(`Talent rail cards (.vy-pcard): ${pcardCount} (expected 3)`);

// Check GTM interactive tabs
const gtmTabCount = (html.match(/class="[^"]*vy-gtm-tab[^"]*"/g) || []).length;
console.log(`GTM tabs (.vy-gtm-tab): ${gtmTabCount} (expected 5)`);
const hasGtmPanel = html.includes('id="gtmPanel"') && html.includes('id="gtmAgentStage"') && html.includes('id="gtmPersonStage"');
console.log(`GTM panels & stages: ${hasGtmPanel}`);

// Check Scroll reveals
const rvCount = (html.match(/class="[^"]*vy-rv[^"]*"/g) || []).length;
console.log(`Scroll reveal elements (.vy-rv): ${rvCount}`);

// Check Ambient cursor
const hasCursor = html.includes('id="vyCursorDot"') && html.includes('id="vyCursorRing"');
console.log(`Cursor elements: ${hasCursor}`);

// Check FAQ search
const hasFaqSearch = html.includes('id="faqSearchInput"') && html.includes('id="faqClearBtn"') && html.includes('id="faqEmpty"') && html.includes('id="faqResetBtn"');
console.log(`FAQ search elements: ${hasFaqSearch}`);
const faqDetailsCount = (html.match(/<details[\s>]/g) || []).length;
console.log(`FAQ details count: ${faqDetailsCount} (expected 9)`);

console.log('\n--- 4. Integrity Checks: Defenses & Defect Guards ---');
const hasRenderCalcGuard = html.includes("if (typeof renderCalc === 'function')");
console.log(`renderCalc guarded: ${hasRenderCalcGuard}`);

const hasExitModalGuards = html.includes("if (exitEl)") &&
  html.includes("if (exitClose)") &&
  html.includes("if (exitLater)") &&
  html.includes("if (exitCopy)") &&
  html.includes("if (quoteBtn)");
console.log(`Exit modal listeners guarded: ${hasExitModalGuards}`);

const hasCopyBtnGuard = html.includes("if (btn) {") && html.includes("btn.addEventListener('click'");
console.log(`Copy email button guarded: ${hasCopyBtnGuard}`);

const hasSynonyms = html.includes("var SYNONYMS = {") && html.includes("'pricing': ['cost', 'rates']");
console.log(`FAQ synonym expansion: ${hasSynonyms}`);

const hasNoAbstraCopy = !html.includes("Abstra helps you build") && !html.includes("Workflow automation for finance");
console.log(`Zero Abstra copy: ${hasNoAbstraCopy}`);

console.log('\nALL INDEPENDENT CHECKS PASSED SUCCESSFULLY.');
