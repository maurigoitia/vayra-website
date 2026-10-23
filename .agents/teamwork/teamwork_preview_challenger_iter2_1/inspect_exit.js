const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
console.log('has exit-later:', html.includes('id="exit-later"'));
console.log('has exit-close:', html.includes('id="exit-close"'));
console.log('has exit-copy:', html.includes('id="exit-copy"'));
console.log('has quote-btn:', html.includes('id="quote-btn"'));
