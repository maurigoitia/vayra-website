const fs = require('fs');
const html = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

const idAb = html.match(/<[a-z0-9]+\s+[^>]*id=['"]ab['"][^>]*>/i);
console.log('Main wrapper:', idAb ? idAb[0] : 'None');

// Check navigation
const nav = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/i);
if (nav) console.log('Nav found, length:', nav[0].length);

// Check sections
const secs = [...html.matchAll(/<section[^>]*id=['"]([^'"]+)['"][^>]*>/gi)].map(m => m[1]);
console.log('Sections with IDs in Abstra:', secs);
