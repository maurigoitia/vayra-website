const fs = require('fs');
const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

// Dissect sections
const secRegex = /<section\s+([^>]*)>([\s\S]*?)<\/section>/gi;
let match;
let i = 0;
while ((match = secRegex.exec(abstraHtml)) !== null) {
  i++;
  const attrs = match[1];
  const inner = match[2];
  const idMatch = attrs.match(/id=[\"']([^\"']+)[\"']/i);
  const classMatch = attrs.match(/class=[\"']([^\"']+)[\"']/i);
  const hMatch = inner.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/is);
  const heading = hMatch ? hMatch[1].replace(/<[^>]+>/g, '').trim() : 'None';
  console.log(`\n--- Abstra Section ${i} ---`);
  console.log(`ID: ${idMatch ? idMatch[1] : 'none'}`);
  console.log(`Class: ${classMatch ? classMatch[1] : 'none'}`);
  console.log(`Heading: ${heading}`);
  console.log(`Inner length: ${inner.length}`);
  
  // Look for interesting subcomponents
  const rails = inner.match(/class=[\"'][^\"']*(?:rail|slider|carousel|scroll|track)[^\"']*[\"']/gi) || [];
  if (rails.length) console.log('  Rail/slider classes:', rails);
  const panels = inner.match(/class=[\"'][^\"']*(?:panel|tab|step|card|accordion)[^\"']*[\"']/gi) || [];
  if (panels.length) console.log('  Panel/step/card classes (sample):', panels.slice(0, 5));
}
