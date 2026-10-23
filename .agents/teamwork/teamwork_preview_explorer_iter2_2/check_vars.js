const fs = require('fs');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const stylesCss = fs.readFileSync('public/styles.css', 'utf8');

console.log("=== CHECKING CSS TOKENS AND VARIABLES ===");

function extractVarUsage(css) {
  const matches = [...css.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)];
  return [...new Set(matches.map(m => m[1]))];
}

function extractRootDefs(css) {
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  if (!rootMatch) return [];
  const defs = [...rootMatch[1].matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)];
  return [...new Set(defs.map(d => d[1]))];
}

// 1. In index.html
const styleMatch = indexHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
if (styleMatch) {
  const inlineCss = styleMatch[1];
  const rootDefs = extractRootDefs(inlineCss);
  const usedVars = extractVarUsage(inlineCss);

  console.log("\n[index.html <style>]");
  console.log("Defined in :root:", rootDefs);
  console.log("Used in CSS:", usedVars);

  const missing = usedVars.filter(v => !rootDefs.includes(v) && !['--gx', '--gy', '--mx', '--my', '--o'].includes(v));
  console.log("Missing/Undeclared in :root (excluding local vars):", missing);
}

// 2. In styles.css
const rootDefsCss = extractRootDefs(stylesCss);
const usedVarsCss = extractVarUsage(stylesCss);

console.log("\n[styles.css]");
console.log("Defined in :root:", rootDefsCss);
console.log("Used in CSS:", usedVarsCss);

const missingCss = usedVarsCss.filter(v => !rootDefsCss.includes(v) && !['--gx', '--gy', '--mx', '--my', '--o'].includes(v));
console.log("Missing/Undeclared in styles.css :root (excluding local vars):", missingCss);
