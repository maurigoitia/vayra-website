const fs = require('fs');
const cp = require('child_process');

const origHtml = cp.execSync('git show :public/index.html', { encoding: 'utf8' });
const currHtml = fs.readFileSync('public/index.html', 'utf8');

function extractVisibleText(html) {
  // Strip scripts, styles, svg paths, comments
  const stripped = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const textNodes = [...stripped.matchAll(/>([^<]+)</g)]
    .map(m => m[1].trim())
    .filter(t => t.length > 2 && !/^[0-9\s:.,+\-/*%]+$/.test(t))
    .map(t => t.replace(/\s+/g, ' '));

  return [...new Set(textNodes)];
}

const origText = extractVisibleText(origHtml);
const currText = extractVisibleText(currHtml);

console.log('Original visible text count:', origText.length);
console.log('Current visible text count:', currText.length);

const missingText = origText.filter(t => !currHtml.includes(t));
console.log('Missing text items from original HTML:', missingText.length);
if (missingText.length > 0) {
  console.log('Missing items:', missingText);
}

const addedText = currText.filter(t => !origHtml.includes(t));
console.log('Added text items in current HTML:', addedText.length);
console.log('Added items list:');
addedText.forEach((t, i) => console.log(`  ${i+1}. "${t}"`));
