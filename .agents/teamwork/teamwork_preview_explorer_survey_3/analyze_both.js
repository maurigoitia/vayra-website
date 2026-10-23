const fs = require('fs');
const path = require('path');

const vayraPath = 'C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/index.html';
const abstraPath = 'C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html';

const vayraHtml = fs.readFileSync(vayraPath, 'utf8');
const abstraHtml = fs.readFileSync(abstraPath, 'utf8');

console.log('=== VAYRA SUMMARY ===');
console.log('Size:', vayraHtml.length);
const vayraSections = vayraHtml.match(/<section[\s\S]*?>/gi) || [];
console.log('Sections count:', vayraSections.length);
vayraSections.forEach((s, i) => console.log(`  Section ${i+1}:`, s.replace(/\s+/g, ' ')));

console.log('\n=== ABSTRA SUMMARY ===');
console.log('Size:', abstraHtml.length);
const abstraSections = abstraHtml.match(/<section[\s\S]*?>/gi) || [];
console.log('Sections count:', abstraSections.length);
abstraSections.forEach((s, i) => console.log(`  Section ${i+1}:`, s.replace(/\s+/g, ' ')));
