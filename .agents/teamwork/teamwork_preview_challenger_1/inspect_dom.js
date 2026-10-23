const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../../public/index.html'), 'utf8');

console.log('--- Checking exit modal ---');
const exitIdx = html.indexOf('id="exit"');
if (exitIdx !== -1) {
  console.log(html.substring(exitIdx - 50, exitIdx + 1200));
} else {
  console.log('No id="exit" found, searching for id="exit');
  const m = html.match(/id=["']exit[^"']*["']/g);
  console.log('Matched IDs:', m);
}

console.log('\n--- Checking IDs referenced in script ---');
const idsToCheck = ['exit', 'exit-close', 'exit-later', 'exit-copy', 'exit-copied', 'quote-btn', 'exit-quote'];
idsToCheck.forEach(id => {
  const has = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
  console.log(`id="${id}": ${has}`);
});

console.log('\n--- Checking FAQ contents ---');
const faqSectionIdx = html.indexOf('id="faq"');
if (faqSectionIdx !== -1) {
  const faqChunk = html.substring(faqSectionIdx, faqSectionIdx + 4000);
  console.log('FAQ chunk (first 1500 chars):');
  console.log(faqChunk.substring(0, 1500));
}
