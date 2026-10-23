const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', '..', '..', 'index.html');
const text = fs.readFileSync(htmlPath, 'utf-8');
const lines = text.split(/\r?\n/);

lines.forEach((line, idx) => {
  if (line.includes('<svg')) {
    console.log(`Line ${idx+1}: ${line.slice(0, 100)}`);
  }
});
