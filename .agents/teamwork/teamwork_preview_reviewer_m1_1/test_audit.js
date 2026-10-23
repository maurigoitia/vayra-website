const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../../');
const mapSvgPath = path.join(rootDir, 'map.svg');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(rootDir, 'styles.css');
const cursorJsPath = path.join(rootDir, 'cursor.js');

console.log('Testing files in:', rootDir);

// 1. Verify map.svg path attributes
const svgContent = fs.readFileSync(mapSvgPath, 'utf8');
['m-us', 'm-other', 'm-city'].forEach(id => {
  const hasId = svgContent.includes(`id="${id}"`);
  console.log(`Checking path ${id}: ${hasId}`);
  if (!hasId) throw new Error(`Missing ${id}`);
});

// 2. Check XML structure
if (!svgContent.trim().startsWith('<svg') || !svgContent.trim().endsWith('</svg>')) {
  throw new Error('map.svg is not properly enclosed in <svg></svg>');
}

// 3. Check CSS for cursor-related properties
const cssContent = fs.readFileSync(cssPath, 'utf8');
const checks = [
  { name: 'pointer-events: none on cursor', test: cssContent.includes('pointer-events: none;') },
  { name: 'will-change: transform', test: cssContent.includes('will-change: transform;') },
  { name: 'translate3d used in cursor.js', test: fs.readFileSync(cursorJsPath, 'utf8').includes('translate3d') },
  { name: 'map-route pointer-events: none', test: cssContent.includes('.mapfield > .map-route{pointer-events:none}') },
  { name: 'cursor-active cursor none', test: cssContent.includes('cursor: none !important;') },
  { name: 'input text cursor preserved', test: cssContent.includes('cursor: text !important;') },
  { name: 'reduced motion fallback in css', test: cssContent.includes('(prefers-reduced-motion: reduce)') },
  { name: 'touch / coarse pointer fallback in css', test: cssContent.includes('(pointer: coarse)') }
];

checks.forEach(c => {
  console.log(`[${c.test ? 'PASS' : 'FAIL'}] ${c.name}`);
  if (!c.test) throw new Error(`Failed check: ${c.name}`);
});

console.log('All detailed checks passed!');
