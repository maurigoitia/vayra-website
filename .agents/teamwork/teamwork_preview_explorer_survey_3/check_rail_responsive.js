const fs = require('fs');
const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

const matches = abstraHtml.match(/[^{}]*\{[^{}]*\.rail[^{}]*\}/gi) || [];
// Search for media queries containing rail
const mqs = abstraHtml.match(/@media[^{]+\{[^{}]*\.rail[^{}]*\{[^}]*\}[^{}]*\}/gi) || [];
console.log('Media queries for rail:', mqs);

// Also look at controls #abPrev and #abNext
const prevNext = abstraHtml.match(/<button[^>]*(?:abPrev|abNext)[^>]*>[\s\S]*?<\/button>/gi) || [];
console.log('Prev/Next buttons in HTML:', prevNext);
