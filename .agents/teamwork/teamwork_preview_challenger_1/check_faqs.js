const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../../public/index.html'), 'utf8');

const regex = /<details[\s\S]*?<summary>([\s\S]*?)<\/summary>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null) {
  count++;
  console.log(`\nFAQ #${count}:`);
  console.log('Q:', m[1].trim());
  console.log('A:', m[2].trim());
}
