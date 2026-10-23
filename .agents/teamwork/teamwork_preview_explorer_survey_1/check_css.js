const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', '..', '..', 'styles.css');
const css = fs.readFileSync(cssPath, 'utf-8');

const regex = /([^{}]+)\{([^}]+)\}/g;
let match;
while ((match = regex.exec(css)) !== null) {
  const selector = match[1].trim();
  const body = match[2].trim();
  if (selector.includes('svg') || selector.includes('route') || selector.includes('path') || selector.includes('use') || selector.includes('map')) {
    console.log(`SELECTOR: ${selector}`);
    console.log(`BODY: ${body}\n`);
  }
}
