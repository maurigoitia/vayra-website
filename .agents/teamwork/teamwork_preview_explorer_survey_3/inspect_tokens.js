const fs = require('fs');

const vayraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/index.html', 'utf8');
const vayraCss = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/styles.css', 'utf8');
const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

console.log('=== VAYRA CSS TOKENS (:root) ===');
const rootMatch = vayraCss.match(/:root\s*\{([^}]+)\}/);
if (rootMatch) {
  console.log(rootMatch[1].split(';').map(s => s.trim()).filter(Boolean).join('\n'));
}

console.log('\n=== ABSTRA SCRIPTS & LIBS ===');
const scriptMatches = abstraHtml.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log('Abstra Script tags count:', scriptMatches.length);
scriptMatches.forEach((s, i) => {
  const src = s.match(/src=[\"']([^\"']+)[\"']/i);
  if (src) console.log(`Script ${i+1} src:`, src[1]);
  else console.log(`Script ${i+1} inline (len ${s.length}):`, s.substring(0, 150).replace(/\n/g, ' '));
});

console.log('\n=== VAYRA SCRIPTS ===');
const vayraScriptMatches = vayraHtml.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log('Vayra Script tags count:', vayraScriptMatches.length);
vayraScriptMatches.forEach((s, i) => {
  const src = s.match(/src=[\"']([^\"']+)[\"']/i);
  if (src) console.log(`Vayra Script ${i+1} src:`, src[1]);
  else console.log(`Vayra Script ${i+1} inline (len ${s.length}):`, s.substring(0, 150).replace(/\n/g, ' '));
});
