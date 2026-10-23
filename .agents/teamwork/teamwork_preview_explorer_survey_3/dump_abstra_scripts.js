const fs = require('fs');
const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

const scriptMatches = abstraHtml.match(/<script[\s\S]*?<\/script>/gi) || [];
scriptMatches.forEach((s, i) => {
  console.log(`\n================ SCRIPT ${i+1} (${s.length} bytes) ================`);
  console.log(s.substring(0, 500));
  if (s.length > 500) {
    console.log('... [middle omitted] ...');
    console.log(s.substring(s.length - 200));
  }
});
