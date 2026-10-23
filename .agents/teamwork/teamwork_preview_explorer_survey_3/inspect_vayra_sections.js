const fs = require('fs');

const vayraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/index.html', 'utf8');

// Parse sections in Vayra
const secRegex = /<(section|header|footer)\s*([^>]*)>([\s\S]*?)<\/\1>/gi;
let match;
let count = 0;
while ((match = secRegex.exec(vayraHtml)) !== null) {
  count++;
  const tag = match[1];
  const attrs = match[2];
  const inner = match[3];
  const idM = attrs.match(/id=[\"']([^\"']+)[\"']/i);
  const classM = attrs.match(/class=[\"']([^\"']+)[\"']/i);
  console.log(`\n================ VAYRA SECTION ${count}: <${tag}> id="${idM ? idM[1] : ''}" class="${classM ? classM[1] : ''}" ================`);
  
  // Extract all headings and text blocks
  const headings = [...inner.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(h => `${h[1]}: ${h[2].replace(/<[^>]+>/g, '').trim()}`);
  console.log('Headings:', headings);
  
  // Extract key elements
  const buttons = [...inner.matchAll(/<(?:button|a)[^>]*class=[\"'][^\"']*(?:btn|cta)[^\"']*[\"'][^>]*>([\s\S]*?)<\/(?:button|a)>/gi)].map(b => b[1].replace(/<[^>]+>/g, '').trim());
  if (buttons.length) console.log('Buttons/CTAs:', buttons);
  
  // Extract length and sample text
  const cleanText = inner.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('Text preview (first 250 chars):', cleanText.substring(0, 250) + '...');
}
