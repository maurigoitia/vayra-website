const fs = require('fs');
const path = require('path');

const survey = fs.readFileSync(path.resolve('.agents/teamwork/teamwork_preview_explorer_survey_2/survey_vayra.md'), 'utf8');
let html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

// Strip non-content blocks
html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
html = html.replace(/<style\b[\s\S]*?<\/style>/gi, '');
html = html.replace(/<svg\b[\s\S]*?<\/svg>/gi, '');
html = html.replace(/<!--[\s\S]*?-->/g, '');

const textMatches = html.match(/>([^<]+)</g) || [];
const uncataloged = new Set();

textMatches.forEach(tag => {
  let s = tag.substring(1, tag.length - 1).trim();
  // Filter out pure whitespace, punctuation, entities, short noise
  if (s.length > 2 && !/^[0-9\s.,;:+\-/*%&;]+$/.test(s)) {
    // Check if in survey_vayra.md (accounting for entity variation)
    let sNorm = s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'").replace(/&minus;/g, '-');
    let surveyNorm = survey.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'");
    if (!surveyNorm.includes(sNorm)) {
      uncataloged.add(s);
    }
  }
});

console.log('--- Uncataloged visible text items count:', uncataloged.size);
uncataloged.forEach(item => {
  console.log(`UNCATALOGED: "${item}"`);
});
