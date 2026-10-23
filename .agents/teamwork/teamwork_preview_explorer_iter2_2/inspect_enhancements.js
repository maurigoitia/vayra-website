const fs = require('fs');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const lines = indexHtml.split('\n');

// Extract lines 408 to 782
const vySection = lines.slice(407, 781).join('\n');

// Parse rules in vySection
let depth = 0;
let inComment = false;
let inString = false;
let stringChar = '';
let currentSelector = '';
let currentProperties = '';
const rules = [];

for (let i = 0; i < vySection.length; i++) {
  const c = vySection[i];
  const nextC = i + 1 < vySection.length ? vySection[i + 1] : '';

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
      if (currentSelector.trim().startsWith('@media')) {
        rules.push({ type: 'media', query: currentSelector.trim() });
      } else {
        rules.push({ type: 'rule', selector: currentSelector.trim() });
      }
      currentSelector = '';
    } else if (depth === 2) {
      rules.push({ type: 'media-subrule', selector: currentSelector.trim() });
      currentSelector = '';
    }
  } else if (c === '}') {
    depth--;
    currentSelector = '';
  } else {
    currentSelector += c;
  }
}

console.log("=== VAYRA ENHANCEMENTS SELECTORS (lines 408 - 781) ===");
rules.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.type}] ${r.selector || r.query}`);
});
