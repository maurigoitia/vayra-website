const fs = require('fs');
const html = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/index.html', 'utf8');

// Function to extract text from an element
function extractText(str) {
  return str.replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<svg[\s\S]*?<\/svg>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&rarr;/g, '->')
            .replace(/&amp;/g, '&')
            .replace(/&copy;/g, '(c)')
            .replace(/\s+/g, ' ')
            .trim();
}

console.log('=== VAYRA COMPLETE SECTION INVENTORY ===');

// Match sections
const secMatches = [...html.matchAll(/<(header|section|footer)\b([^>]*)>([\s\S]*?)<\/\1>/gi)];
secMatches.forEach((m, idx) => {
  const tag = m[1];
  const attrs = m[2];
  const inner = m[3];
  const idM = attrs.match(/id=['"]([^'"]+)['"]/);
  const classM = attrs.match(/class=['"]([^'"]+)['"]/);
  const id = idM ? idM[1] : `unnamed-${idx}`;
  const cls = classM ? classM[1] : '';
  
  console.log(`\n### [${idx+1}] <${tag}> id="${id}" class="${cls}"`);
  
  // Headings
  const headings = [...inner.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(h => `${h[1].toUpperCase()}: ${extractText(h[2])}`);
  if (headings.length) console.log('Headings:', headings);
  
  // Text preview
  const text = extractText(inner);
  console.log(`Text count: ${text.length} chars`);
  console.log('Text full:\n', text);
});
