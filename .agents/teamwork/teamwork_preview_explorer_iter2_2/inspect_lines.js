const fs = require('fs');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const lines = indexHtml.split('\n');

console.log("=== INSPECTING LINES 385 to 425 OF index.html ===");
for (let i = 385; i <= 425; i++) {
  console.log(`${i}: ${lines[i - 1]}`);
}

console.log("\n=== INSPECTING LINES 765 to 790 OF index.html ===");
for (let i = 765; i <= 790; i++) {
  console.log(`${i}: ${lines[i - 1]}`);
}
