const fs = require('fs');
const html = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/index.html', 'utf8');

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('\\"sec\\"')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
