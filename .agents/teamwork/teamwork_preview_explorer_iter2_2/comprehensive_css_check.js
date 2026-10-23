const fs = require('fs');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const stylesCss = fs.readFileSync('public/styles.css', 'utf8');

const inlineCss = indexHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)[1];

function parseCssRules(css) {
  // Simple state machine to extract rules and at-rules
  let depth = 0;
  let inComment = false;
  let inString = false;
  let stringChar = '';
  let currentSelector = '';
  let currentBlock = '';
  const rules = [];
  const atRules = [];
  let currentAtRule = null;

  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    const nextC = i + 1 < css.length ? css[i + 1] : '';

    if (inComment) {
      if (c === '*' && nextC === '/') {
        inComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (c === '\\') {
        i++;
      } else if (c === stringChar) {
        inString = false;
      }
      continue;
    }
    if (c === '/' && nextC === '*') {
      inComment = true;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      stringChar = c;
      continue;
    }

    if (c === '{') {
      depth++;
      if (depth === 1) {
        if (currentSelector.trim().startsWith('@')) {
          currentAtRule = {
            header: currentSelector.trim(),
            startChar: i,
            subRules: []
          };
        } else {
          rules.push({
            selector: currentSelector.trim(),
            atRule: null,
            depth
          });
        }
        currentSelector = '';
      } else if (depth === 2 && currentAtRule) {
        currentAtRule.subRules.push({
          selector: currentSelector.trim(),
          atRule: currentAtRule.header,
          depth
        });
        currentSelector = '';
      }
    } else if (c === '}') {
      depth--;
      if (depth === 0 && currentAtRule) {
        atRules.push(currentAtRule);
        currentAtRule = null;
      }
      currentSelector = '';
    } else {
      currentSelector += c;
    }
  }

  return { rules, atRules, finalDepth: depth };
}

console.log("=== COMPREHENSIVE CSS PARSER ===");
const parsedInline = parseCssRules(inlineCss);
console.log("Inline CSS top-level rules count:", parsedInline.rules.length);
console.log("Inline CSS top-level at-rules count:", parsedInline.atRules.length);
console.log("Inline CSS final depth:", parsedInline.finalDepth);

parsedInline.atRules.forEach((at, idx) => {
  console.log(`\nAt-Rule #${idx + 1}: ${at.header}`);
  console.log(`  Sub-rules count: ${at.subRules.length}`);
  at.subRules.slice(0, 10).forEach(sr => console.log(`    - ${sr.selector}`));
  if (at.subRules.length > 10) console.log(`    ... and ${at.subRules.length - 10} more`);
});

const parsedCss = parseCssRules(stylesCss);
console.log("\nstyles.css top-level rules count:", parsedCss.rules.length);
console.log("styles.css top-level at-rules count:", parsedCss.atRules.length);
console.log("styles.css final depth:", parsedCss.finalDepth);
parsedCss.atRules.forEach((at, idx) => {
  console.log(`\nstyles.css At-Rule #${idx + 1}: ${at.header}`);
  console.log(`  Sub-rules count: ${at.subRules.length}`);
});
