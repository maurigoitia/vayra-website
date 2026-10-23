const fs = require('fs');
const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

const scriptMatches = abstraHtml.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log(scriptMatches[1]); // Script 2
