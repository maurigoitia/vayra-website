const fs = require('fs');
const path = require('path');

const survey = fs.readFileSync(path.resolve('.agents/teamwork/teamwork_preview_explorer_survey_2/survey_vayra.md'), 'utf8');
const html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

const expectedFaqs = [
  {
    q: "What is Vayra?",
    a: "Vayra builds AI-augmented GTM and engineering teams from Latin America for US companies. Senior people work alongside orchestrated AI agents, on US hours."
  },
  {
    q: "How much does senior talent in Latin America cost?",
    a: "Vayra rates start at about $50 an hour for a semi-senior software or GTM engineer and $3,000 a month for an SDR. Senior and manager levels cost more. For comparison, the US median pay for software developers is $135,980 a year before benefits (BLS OEWS, May 2025)."
  },
  {
    q: "What does AI-augmented mean?",
    a: "Every person works with AI tools and agents as part of the daily work, and knows when to trust them and when to check."
  },
  {
    q: "What is an orchestrated team?",
    a: "Senior people plus AI agents organized around one goal, with a clear owner for every decision."
  },
  {
    q: "What do GTM engineers do?",
    a: "They build the system behind your pipeline: data, enrichment, sequences, CRM and the automations that connect them."
  },
  {
    q: "Which roles can Vayra provide?",
    a: "GTM engineers, SDRs, marketing and ops people, and software engineers for web, mobile, data and cloud."
  },
  {
    q: "Can I start with one person?",
    a: "Yes. Start with one and grow from there."
  },
  {
    q: "Extend my team or hand you a goal?",
    a: "If you already have a lead and a plan, add people to your team. If you need something built or a pipeline running end to end, hand us the goal."
  },
  {
    q: "Where are your people based?",
    a: "Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones."
  }
];

let allFaqsMatch = true;

expectedFaqs.forEach((faq, idx) => {
  const qFound = html.includes(faq.q);
  const aFound = html.includes(faq.a);
  console.log(`FAQ #${idx + 1}:`);
  console.log(`  Question "${faq.q}": ${qFound ? 'MATCH' : 'MISSING'}`);
  console.log(`  Answer matches: ${aFound ? 'MATCH' : 'MISSING'}`);
  if (!qFound || !aFound) allFaqsMatch = false;
});

console.log('\nAll 9 FAQs match verbatim:', allFaqsMatch);
