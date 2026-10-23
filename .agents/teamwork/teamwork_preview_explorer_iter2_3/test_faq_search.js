const fs = require('fs');
const path = require('path');

const indexPath = path.resolve('C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/index.html');
const content = fs.readFileSync(indexPath, 'utf8');

// Extract FAQ items
const faqRegex = /<details[\s\S]*?<\/details>/gi;
const matches = content.match(faqRegex);

console.log('Found FAQ items in index.html:', matches ? matches.length : 0);

if (matches) {
  const faqData = matches.map((m, idx) => {
    const summaryMatch = m.match(/<summary>(.*?)<\/summary>/i);
    const pMatch = m.match(/<p>(.*?)<\/p>/i);
    const summary = summaryMatch ? summaryMatch[1] : '';
    const p = pMatch ? pMatch[1] : '';
    const text = (summary + ' ' + p).toLowerCase();
    return { idx: idx + 1, summary, p, text };
  });

  console.log('\n--- FAQ Catalog ---');
  faqData.forEach(d => {
    console.log(`Q${d.idx}: ${d.summary}`);
  });

  const synonyms = {
    'pricing': ['cost', 'rates'],
    'price': ['cost', 'rates'],
    'latam': ['latin america'],
    'timezones': ['time zones'],
    'timezone': ['time zones']
  };

  function testSearch(rawQuery) {
    const q = rawQuery.trim().toLowerCase();
    // Synonym expansion
    const searchTerms = [q];
    if (synonyms[q]) {
      searchTerms.push(...synonyms[q]);
    }
    // Also if query contains synonym word
    for (const [syn, targets] of Object.entries(synonyms)) {
      if (q.includes(syn)) {
        targets.forEach(t => searchTerms.push(t));
      }
    }

    const matchedFaqs = faqData.filter(d => {
      return searchTerms.some(term => d.text.includes(term));
    });

    return {
      query: rawQuery,
      searchTerms: [...new Set(searchTerms)],
      matchCount: matchedFaqs.length,
      matchedQuestions: matchedFaqs.map(d => `Q${d.idx}`)
    };
  }

  console.log('\n--- Search Query Evaluation ---');
  const testQueries = [
    'rates',
    'Latin America',
    'timezones',
    'time zones',
    'cost',
    'pricing',
    'LATAM',
    'SDRs',
    'orchestrated',
    'engineering'
  ];

  testQueries.forEach(q => {
    const res = testSearch(q);
    console.log(`Query: "${q}" -> matches: ${res.matchCount} (${res.matchedQuestions.join(', ')}) [terms: ${res.searchTerms.join(', ')}]`);
  });
}
