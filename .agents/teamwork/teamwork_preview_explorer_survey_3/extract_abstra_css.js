const fs = require('fs');

const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

// Extract style contents
const style1 = abstraHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)[1];

function findRules(keywords) {
  const parts = style1.split('}');
  const found = [];
  for (const p of parts) {
    for (const kw of keywords) {
      if (p.includes(kw)) {
        found.push(p.trim() + '}');
        break;
      }
    }
  }
  return found;
}

console.log('=== RAIL CSS ===');
console.log(findRules(['.rail', '.pc ']).slice(0, 10).join('\n'));

console.log('\n=== REVEAL CSS ===');
console.log(findRules(['.rv']).slice(0, 6).join('\n'));

console.log('\n=== PROCESS / MD-PANEL CSS ===');
console.log(findRules(['.md-step', '.md-panel']).slice(0, 8).join('\n'));

console.log('\n=== SOL / CELL SPOTLIGHT CSS ===');
console.log(findRules(['.sol', '.cell']).slice(0, 8).join('\n'));

console.log('\n=== HERO GLOW CSS ===');
console.log(findRules(['--gx', '--gy']).slice(0, 6).join('\n'));
