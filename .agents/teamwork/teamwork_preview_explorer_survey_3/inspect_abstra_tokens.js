const fs = require('fs');
const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

console.log('=== ABSTRA HEAD & CSS TOKENS ===');
const styleMatches = abstraHtml.match(/<style[\s\S]*?<\/style>/gi) || [];
console.log('Style tags count:', styleMatches.length);
styleMatches.forEach((st, i) => {
  console.log(`Style ${i+1} length: ${st.length}`);
  const rootM = st.match(/:root\s*\{([^}]+)\}/);
  if (rootM) {
    console.log(`Style ${i+1} :root:\n`, rootM[1].split(';').map(s=>s.trim()).filter(Boolean).join('\n'));
  }
});
