const fs = require('fs');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Simulate the fix: add '}\n' right after line 407
const lines = indexHtml.split('\n');
console.log("Original line 407:", lines[406]);
console.log("Original line 408:", lines[407]);

const fixedLines = [...lines];
// Insert '}' after line 407
fixedLines.splice(407, 0, '}');

const fixedHtml = fixedLines.join('\n');
const fixedStyleMatch = fixedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)[1];

// Analyze braces on fixed CSS
let depth = 0;
let inComment = false;
let inString = false;
let stringChar = '';
const fixedCssLines = fixedStyleMatch.split('\n');
const mediaStack = [];
const closedList = [];

for (let lineIdx = 0; lineIdx < fixedCssLines.length; lineIdx++) {
  const lineNum = lineIdx + 1;
  const line = fixedCssLines[lineIdx];

  for (let charIdx = 0; charIdx < line.length; charIdx++) {
    const c = line[charIdx];
    const nextC = charIdx + 1 < line.length ? line[charIdx + 1] : '';

    if (inComment) {
      if (c === '*' && nextC === '/') {
        inComment = false;
        charIdx++;
      }
      continue;
    }

    if (inString) {
      if (c === '\\') {
        charIdx++;
      } else if (c === stringChar) {
        inString = false;
      }
      continue;
    }

    if (c === '/' && nextC === '*') {
      inComment = true;
      charIdx++;
      continue;
    }

    if (c === '"' || c === "'") {
      inString = true;
      stringChar = c;
      continue;
    }

    if (line.slice(charIdx).startsWith('@media')) {
      mediaStack.push({ line: lineNum, header: line.trim(), depthAtStart: depth });
    }

    if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (mediaStack.length > 0) {
        const top = mediaStack[mediaStack.length - 1];
        if (depth === top.depthAtStart) {
          const popped = mediaStack.pop();
          closedList.push(`Line ${popped.line} -> Line ${lineNum}: ${popped.header}`);
        }
      }
    }
  }
}

console.log("\nAfter inserting '}' after line 407:");
console.log("Final depth:", depth);
console.log("Unclosed media queries count:", mediaStack.length);
console.log("Closed media queries count:", closedList.length);
closedList.forEach(m => console.log(" ", m));
