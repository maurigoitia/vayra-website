const fs = require('fs');
const path = require('path');

// Simulate the proposed FAQ filtering logic
const faqs = [
  { q: "What is Vayra?", a: "Vayra builds AI-augmented GTM and engineering teams from Latin America for US companies. Senior people work alongside orchestrated AI agents, on US hours." },
  { q: "How much does senior talent in Latin America cost?", a: "Vayra rates start at about $50 an hour for a semi-senior software or GTM engineer and $3,000 a month for an SDR. Senior and manager levels cost more. For comparison, the US median pay for software developers is $135,980 a year before benefits (BLS OEWS, May 2025)." },
  { q: "What does AI-augmented mean?", a: "Every person works with AI tools and agents as part of the daily work, and knows when to trust them and when to check." },
  { q: "What is an orchestrated team?", a: "Senior people plus AI agents organized around one goal, with a clear owner for every decision." },
  { q: "What do GTM engineers do?", a: "They build the system behind your pipeline: data, enrichment, sequences, CRM and the automations that connect them." },
  { q: "Which roles can Vayra provide?", a: "GTM engineers, SDRs, marketing and ops people, and software engineers for web, mobile, data and cloud." },
  { q: "Can I start with one person?", a: "Yes. Start with one and grow from there." },
  { q: "Extend my team or hand you a goal?", a: "If you already have a lead and a plan, add people to your team. If you need something built or a pipeline running end to end, hand us the goal." },
  { q: "Where are your people based?", a: "Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones." }
];

const faqData = faqs.map((f, i) => ({
  id: i + 1,
  text: (f.q + " " + f.a).toLowerCase()
}));

const SYNONYMS = {
  'pricing': ['cost', 'rates'],
  'price': ['cost', 'rates'],
  'latam': ['latin america'],
  'timezones': ['time zones'],
  'timezone': ['time zones'],
  'developers': ['software developers', 'software engineers'],
  'developer': ['software developer', 'software engineer']
};

function searchFaqs(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return { count: faqData.length, matches: faqData.map(d => d.id) };
  }

  let queryTokens = [query];
  if (SYNONYMS[query]) {
    queryTokens = queryTokens.concat(SYNONYMS[query]);
  }
  for (const synKey in SYNONYMS) {
    if (query.indexOf(synKey) !== -1 && query !== synKey) {
      queryTokens = queryTokens.concat(SYNONYMS[synKey]);
    }
  }

  const matched = faqData.filter(d => {
    return queryTokens.some(term => d.text.indexOf(term) !== -1);
  });

  return { count: matched.length, matches: matched.map(d => d.id), terms: queryTokens };
}

const tests = [
  // Placeholder suggestions
  'rates',
  'Latin America',
  'timezones',
  'cost',
  // Colloquial / Challenger queries
  'pricing',
  'LATAM',
  'time zones',
  'SDRs',
  'orchestrated',
  'engineering',
  // Empty
  '',
  // Adversarial special characters
  '(.*)+?[\\^$|#@!'
];

console.log('--- Proposed FAQ Search Logic Validation ---');
let allPassed = true;
tests.forEach(t => {
  const res = searchFaqs(t);
  console.log(`Query: "${t}" -> Matches: ${res.count} (IDs: ${res.matches.join(',')})`);
  if (t !== '(.*)+?[\\^$|#@!' && res.count === 0 && t !== '') {
    allPassed = false;
  }
});

console.log('\nAll intended search queries matched positively:', allPassed);
