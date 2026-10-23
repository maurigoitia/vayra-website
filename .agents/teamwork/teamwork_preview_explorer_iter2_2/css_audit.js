const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Users\\mauri\\.gemini\\antigravity\\scratch\\media_1792004477748_37e8ade1';
const indexHtmlPath = path.join(projectRoot, 'public', 'index.html');
const stylesCssPath = path.join(projectRoot, 'public', 'styles.css');

function analyzeBraces(cssContent, fileName) {
  let depth = 0;
  let inComment = false;
  let inString = false;
  let stringChar = '';
  const lines = cssContent.split('\n');
  const mediaStack = [];
  const report = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const line = lines[lineIdx];

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const c = line[charIdx];
      const nextC = charIdx + 1 < line.length ? line[charIdx + 1] : '';

      if (inComment) {
        if (c === '*' && nextC === '/') {
          inComment = false;
          charIdx++;
        }
        continue;
      }

      if (inString) {
        if (c === '\\') {
          charIdx++; // skip escaped char
        } else if (c === stringChar) {
          inString = false;
        }
        continue;
      }

      if (c === '/' && nextC === '*') {
        inComment = true;
        charIdx++;
        continue;
      }

      if (c === '"' || c === "'") {
        inString = true;
        stringChar = c;
        continue;
      }

      // Check media query start
      if (line.slice(charIdx).startsWith('@media')) {
        // Find header
        mediaStack.push({ line: lineNum, header: line.trim(), depthAtStart: depth });
      }

      if (c === '{') {
        depth++;
      } else if (c === '}') {
        depth--;
        // If closing a media query
        if (mediaStack.length > 0) {
          const top = mediaStack[mediaStack.length - 1];
          if (depth === top.depthAtStart) {
            const popped = mediaStack.pop();
            report.push(`[CLOSED MEDIA] from line ${popped.line} closed at line ${lineNum}: ${popped.header}`);
          }
        }
      }
    }
  }

  return {
    fileName,
    finalDepth: depth,
    unclosedMedia: mediaStack,
    closedMedia: report,
    inComment,
    inString
  };
}

console.log('=== CSS BRACE & MEDIA QUERY ANALYSIS ===');

// 1. Analyze index.html inline <style>
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const styleMatch = indexHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
if (styleMatch) {
  const inlineCss = styleMatch[1];
  const startLineOfStyle = indexHtml.slice(0, styleMatch.index).split('\n').length;
  console.log(`\nindex.html <style> found at line ${startLineOfStyle}, length ${inlineCss.length} chars`);
  const res = analyzeBraces(inlineCss, 'index.html inline <style>');
  console.log(`Final depth: ${res.finalDepth}`);
  console.log(`Unclosed media queries count: ${res.unclosedMedia.length}`);
  res.unclosedMedia.forEach(m => {
    console.log(`  Unclosed: line ${m.line + startLineOfStyle - 1}: ${m.header} (depthAtStart: ${m.depthAtStart})`);
  });
  console.log(`Closed media queries count: ${res.closedMedia.length}`);
  res.closedMedia.forEach(m => console.log(`  ${m}`));
} else {
  console.log('No <style> found in index.html!');
}

// 2. Analyze styles.css
if (fs.existsSync(stylesCssPath)) {
  const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');
  console.log(`\nstyles.css found, length ${stylesCss.length} chars`);
  const resCss = analyzeBraces(stylesCss, 'styles.css');
  console.log(`Final depth: ${resCss.finalDepth}`);
  console.log(`Unclosed media queries count: ${resCss.unclosedMedia.length}`);
  resCss.unclosedMedia.forEach(m => {
    console.log(`  Unclosed: line ${m.line}: ${m.header} (depthAtStart: ${m.depthAtStart})`);
  });
  console.log(`Closed media queries count: ${resCss.closedMedia.length}`);
  resCss.closedMedia.forEach(m => console.log(`  ${m}`));
}
