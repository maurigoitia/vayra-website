const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../..');
const htmlPath = path.join(projectRoot, 'public/index.html');
const surveyPath = path.join(projectRoot, '.agents/teamwork/teamwork_preview_explorer_survey_2/survey_vayra.md');
const abstraPath = 'C:\\Users\\mauri\\Downloads\\Abstra-Home-v2_1.html';

const html = fs.readFileSync(htmlPath, 'utf8');
const survey = fs.readFileSync(surveyPath, 'utf8');

console.log('================================================================');
console.log('CHALLENGER 2 - ITERATION 2: EXHAUSTIVE ADVERSARIAL COPY AUDIT');
console.log('Target: public/index.html (' + html.length + ' bytes)');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function assertContent(category, name, targetText, allowEntityEquivalence = true) {
  totalChecks++;
  
  let found = html.includes(targetText);
  if (!found && allowEntityEquivalence) {
    const norm = (s) => s
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rarr;/g, '→')
      .replace(/&copy;/g, '©')
      .replace(/&#10003;/g, '✓')
      .replace(/&times;/g, '×')
      .replace(/&larr;/g, '←')
      .replace(/’/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    found = norm(html).includes(norm(targetText));
  }

  if (found) {
    passedChecks++;
    // console.log(`[PASS] [${category}] ${name}`);
  } else {
    failedChecks++;
    failures.push({ category, name, targetText });
    console.error(`[FAIL] [${category}] ${name}: Missing target text -> "${targetText.substring(0, 80)}..."`);
  }
}

// -------------------------------------------------------------
// PART 1: PAGE METADATA & SEO
// -------------------------------------------------------------
console.log('--- Checking 1. Page Metadata & SEO ---');
assertContent('Metadata', 'Title tag', '<title>Vayra | Hire Top 1% Latam Software Engineers & GTM Talent</title>');
assertContent('Metadata', 'Meta description', 'Hire elite, AI-vetted software developers and GTM teams from Latin America. The premier nearshore talent network for CTOs, VPs of Engineering, and Growth Managers.');
assertContent('Metadata', 'OG Title', 'content="Vayra | Hire Top 1% Latam Software Engineers & GTM Talent"');
assertContent('Metadata', 'OG Description', 'content="Hire elite, AI-vetted software developers and GTM teams from Latin America. The premier nearshore talent network for CTOs, VPs of Engineering, and Growth Managers."');
assertContent('Metadata', 'OG Image Alt', 'Vayra. Elite AI-vetted Engineering and GTM nearshore teams.');

// -------------------------------------------------------------
// PART 2: HEADER & NAVIGATION
// -------------------------------------------------------------
console.log('--- Checking 2. Header & Navigation ---');
assertContent('Navigation', 'Brand text', 'Vayra');
assertContent('Navigation', 'Nav What we do', 'What we do');
assertContent('Navigation', 'Nav GTM system', 'GTM system');
assertContent('Navigation', 'Nav Cities', 'Cities');
assertContent('Navigation', 'Nav How we work', 'How we work');
assertContent('Navigation', 'Nav FAQ', 'FAQ');
assertContent('Navigation', 'Nav CTA Button', 'Get a quote');

// -------------------------------------------------------------
// PART 3: HERO SECTION & TERMINAL
// -------------------------------------------------------------
console.log('--- Checking 3. Hero Section & Interactive Terminal ---');
assertContent('Hero', 'Route badge', 'LATAM &rarr; US');
assertContent('Hero', 'H1 main title', 'Senior GTM and engineering teams, <em>augmented with AI.</em>');
assertContent('Hero', 'Lede text', 'Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents. GTM engineers, SDRs and developers on your hours, with more done by every person.');
assertContent('Hero', 'Primary CTA button', 'Get a quote <span class="arr">&rarr;</span>');
assertContent('Hero', 'Ghost CTA button', 'See the GTM system');
assertContent('Hero Terminal', 'Console header title', 'gtm-team / live');
assertContent('Hero Terminal', 'Terminal command', 'vayra orchestrate --team gtm --icp "your best customers"');
assertContent('Hero Terminal', 'Row 1 Signals', 'hiring and funding news found');
assertContent('Hero Terminal', 'Row 2 Research', 'accounts and contacts enriched');
assertContent('Hero Terminal', 'Row 3 Drafts', 'first lines written per account');
assertContent('Hero Terminal', 'Row 4 GTM Engineer', 'reviewed, edited, approved');
assertContent('Hero Terminal', 'Row 5 SDR', 'conversations started, calls booked');
assertContent('Hero Terminal', 'Terminal status checkmark', '&#10003; pipeline updated in your CRM');

// -------------------------------------------------------------
// PART 4: TICKER MARQUEE
// -------------------------------------------------------------
console.log('--- Checking 4. Ticker Marquee Chips ---');
const tickerChips = [
  'Outbound systems', 'Enrichment', 'CRM and RevOps', 'SDR teams',
  'AI agents', 'Web and mobile', 'Data pipelines', 'Cloud'
];
tickerChips.forEach(chip => {
  assertContent('Ticker', `Chip: ${chip}`, chip);
});

// -------------------------------------------------------------
// PART 5: WHAT WE DO SECTION (#what)
// -------------------------------------------------------------
console.log('--- Checking 5. Section: What We Do (#what) ---');
assertContent('What', 'Eyebrow', 'What we do');
assertContent('What', 'H2', 'Teams that sell, build and ship with AI in the loop.');
assertContent('What', 'Card 1 Tag', 'GTM');
assertContent('What', 'Card 1 H3', 'GTM engineers and teams');
assertContent('What', 'Card 1 Body', 'The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.');
assertContent('What', 'Card 1 Chips', 'Outbound');
assertContent('What', 'Card 1 Chip RevOps', 'RevOps');
assertContent('What', 'Card 2 Tag', 'Orchestrated');
assertContent('What', 'Card 2 H3', 'Orchestrated teams');
assertContent('What', 'Card 2 Body', 'A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.');
assertContent('What', 'Card 2 Chips', 'Workflows');
assertContent('What', 'Card 2 Chip Human review', 'Human review');
assertContent('What', 'Card 3 Tag', 'Engineering');
assertContent('What', 'Card 3 H3', 'AI-augmented engineering');
assertContent('What', 'Card 3 Body', 'Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.');
assertContent('What', 'Start label', 'Two ways to start');
assertContent('What', 'Start Option 1 H4', 'Add people to your team');
assertContent('What', 'Start Option 1 Body', 'You lead. They join your Slack, your standups and your tools from day one.');
assertContent('What', 'Start Option 2 H4', 'Hand us a goal');
assertContent('What', 'Start Option 2 Body', 'A Vayra squad owns it, from discovery to production or from first signal to booked meeting.');

// -------------------------------------------------------------
// PART 6: THE GTM SYSTEM (#gtm)
// -------------------------------------------------------------
console.log('--- Checking 6. Section: The GTM System (#gtm) ---');
assertContent('GTM', 'Eyebrow', 'The GTM system');
assertContent('GTM', 'H2', 'Agents do the repetitive work. People own the pipeline.');
assertContent('GTM', 'Lede', 'Every Vayra GTM team runs on the same loop. You can see who did what at each stage, and a person signs off before anything reaches a buyer.');
assertContent('GTM', 'Col 1 Signals', 'Signals');
assertContent('GTM', 'Col 2 Research', 'Research');
assertContent('GTM', 'Col 3 Outreach', 'Outreach');
assertContent('GTM', 'Col 4 Conversations', 'Conversations');
assertContent('GTM', 'Col 5 Pipeline', 'Pipeline');
assertContent('GTM Agent', 'Signals', 'Watch hiring, funding and product news across your market.');
assertContent('GTM Agent', 'Research', 'Enrich accounts and contacts with what matters.');
assertContent('GTM Agent', 'Outreach', 'Draft first lines and sequences per account.');
assertContent('GTM Agent', 'Conversations', 'Summarize replies and calls into clean notes.');
assertContent('GTM Agent', 'Pipeline', 'Keep the CRM updated without anyone chasing it.');
assertContent('GTM People', 'Signals', 'Decide which signals are worth acting on.');
assertContent('GTM People', 'Research', 'Check every account against your real ICP.');
assertContent('GTM People', 'Outreach', 'Rewrite, approve and send in your voice.');
assertContent('GTM People', 'Conversations', 'Run the calls and build the relationship.');
assertContent('GTM People', 'Pipeline', 'Report to you on what is moving and why.');
assertContent('GTM', 'Footnote', 'GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week.');

// -------------------------------------------------------------
// PART 7: WHERE YOUR TEAM LIVES (#cities)
// -------------------------------------------------------------
console.log('--- Checking 7. Section: Where Your Team Lives (#cities) ---');
assertContent('Cities', 'Eyebrow', 'Where your team lives');
assertContent('Cities', 'H2', '15 cities, one shared workday.');
assertContent('Cities', 'Lede', 'Pick where you are in the US and see what your team is doing right now.');
assertContent('Cities', 'US Label', 'Where are you in the US?');
assertContent('Cities', 'LATAM Label', 'Pick a city in Latin America');

const citiesAndQuotes = [
  { city: 'Mendoza', quote: 'Senior engineers between the vineyards and the Andes.' },
  { city: 'Buenos Aires', quote: 'Builders who move fast and never really stop.' },
  { city: 'Córdoba', quote: 'A university city full of engineers with solid fundamentals.' },
  { city: 'Rosario', quote: 'River city builders who ship steady, careful work.' },
  { city: 'Montevideo', quote: 'Calm product teams who think before they build.' },
  { city: 'Asunción', quote: 'A growing tech scene with people who want to own things.' },
  { city: 'Santiago', quote: 'Engineers who think in systems, with the Andes out the window.' },
  { city: 'Lima', quote: 'Builders who turn messy problems into clear products.' },
  { city: 'Bogotá', quote: 'Designers and engineers who care how things feel.' },
  { city: 'Medellín', quote: 'A city that reinvented itself, and builders who do the same.' },
  { city: 'Mexico City', quote: 'SDRs and marketers who sell in English and Spanish.' },
  { city: 'Guadalajara', quote: "Mexico’s tech hub, close to US hours and US customers." },
  { city: 'São Paulo', quote: 'GTM and engineering talent from the biggest market in the region.' },
  { city: 'Rio', quote: 'GTM people who know how to start a conversation.' },
  { city: 'Florianópolis', quote: 'Surf before standup, ship after.' }
];

citiesAndQuotes.forEach(({ city, quote }) => {
  assertContent('Cities', `City: ${city}`, city);
  assertContent('Cities', `Quote: ${city}`, quote);
});

assertContent('Cities', 'Map caption', 'Latin America on US hours');
assertContent('Cities', 'Map link', 'vayra.team');

// -------------------------------------------------------------
// PART 8: HOW WE WORK (#how)
// -------------------------------------------------------------
console.log('--- Checking 8. Section: How We Work (#how) ---');
assertContent('How', 'Eyebrow', 'How we work');
assertContent('How', 'H2', 'You only meet people we would hire ourselves.');
const steps = ['Intro call', 'Calibrate', 'Shortlist', 'Kickoff', 'Ongoing support'];
steps.forEach(step => assertContent('How', `Step: ${step}`, step));
assertContent('How', 'Description', 'We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.');
assertContent('How Trust 1', 'Eyebrow', 'Time zones');
assertContent('How Trust 1', 'H3', 'Your hours, not ours.');
assertContent('How Trust 1', 'Body', 'Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.');
assertContent('How Trust 2', 'Eyebrow', 'After the hire');
assertContent('How Trust 2', 'H3', 'We stay after the hire.');
assertContent('How Trust 2', 'Body', 'We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together.');

// -------------------------------------------------------------
// PART 9: FAQ SECTION (#faq)
// -------------------------------------------------------------
console.log('--- Checking 9. Section: FAQ (#faq) ---');
assertContent('FAQ', 'Eyebrow', 'FAQ');
assertContent('FAQ', 'H2', 'Questions we hear first.');

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

faqs.forEach((faq, idx) => {
  assertContent('FAQ', `Q${idx + 1}: ${faq.q}`, faq.q);
  assertContent('FAQ', `A${idx + 1}`, faq.a);
});

// -------------------------------------------------------------
// PART 10: TALK TO US / CONTACT (#contact)
// -------------------------------------------------------------
console.log('--- Checking 10. Section: Talk To Us (#contact) ---');
assertContent('Contact', 'Eyebrow', 'Talk to us');
assertContent('Contact', 'H2', 'Tell us what you are building.');
assertContent('Contact', 'Lede', 'A short call is enough to see if we are a good fit.');
assertContent('Contact', 'Email address', 'hello@vayra.team');
assertContent('Contact', 'Copy button', 'Copy email');
assertContent('Contact', 'Email button', 'Email us for a quote');
assertContent('Contact', 'Copy toast message 1', "'Copied: ' + text");
assertContent('Contact', 'Copy toast fallback', 'Selected. Press Ctrl+C or Cmd+C to copy.');

// -------------------------------------------------------------
// PART 11: FOOTER
// -------------------------------------------------------------
console.log('--- Checking 11. Footer ---');
assertContent('Footer', 'Brand', 'Vayra');
assertContent('Footer', 'Tagline', 'AI-augmented teams from Latin America');
assertContent('Footer', 'Copyright', '&copy; 2026 Vayra');

// -------------------------------------------------------------
// PART 12: EXIT MODAL
// -------------------------------------------------------------
console.log('--- Checking 12. Exit Modal ---');
assertContent('Modal', 'H2', 'Scaling your engineering or GTM team?');
assertContent('Modal', 'Paragraph', "Your growth shouldn't be bottlenecked by hiring cycles. We deploy top 1% LATAM engineers and AI-augmented GTM teams in 48 hours. Drop your email to see our vetted talent.");
assertContent('Modal', 'Dismiss button', 'No thanks, just looking');

// -------------------------------------------------------------
// PART 13: ADVERSARIAL ABSTRA LEAKAGE & COMMENT SANITIZATION AUDIT
// -------------------------------------------------------------
console.log('\n--- Checking 13. Adversarial Abstra Leakage & Comment Sanitization ---');

// 1. Literal "Abstra" in entire file
const allAbstraMatches = [...html.matchAll(/abstra/gi)];
totalChecks++;
if (allAbstraMatches.length === 0) {
  passedChecks++;
  console.log('[PASS] ZERO occurrences of "Abstra" anywhere in public/index.html (HTML, CSS, JS, comments)!');
} else {
  failedChecks++;
  failures.push({ category: 'Abstra Leak', name: 'Literal Abstra occurrences', count: allAbstraMatches.length });
  console.error(`[FAIL] Found ${allAbstraMatches.length} occurrences of "Abstra" in index.html!`);
}

// 2. Scan all comments in index.html
const comments = [...html.matchAll(/<!--([\s\S]*?)-->/g)].map(m => m[1]);
console.log(`Found ${comments.length} HTML comments in index.html.`);
let commentsClean = true;
comments.forEach((c, i) => {
  if (/abstra/i.test(c)) {
    commentsClean = false;
    console.error(`[FAIL] Comment #${i+1} contains "abstra": <!--${c}-->`);
  }
});
totalChecks++;
if (commentsClean) {
  passedChecks++;
  console.log('[PASS] All HTML comments are clean of foreign/Abstra references.');
} else {
  failedChecks++;
  failures.push({ category: 'Comments', name: 'Comment contains Abstra' });
}

// 3. Check for specific Abstra case studies / personas / slogans
const foreignTerms = [
  'Alex Rivera', 'Sofia Chen', 'Mateo Rossi', 'Camila Duarte', 'Lucas Silva',
  'Valentina Torres', 'Fintech scaleup', 'Healthtech unicorn', 'Series A',
  'Series B', 'Y Combinator', 'YC W', 'YC S', 'trusted by 500+', 'loved by founders',
  'Frontend Architect', 'Staff Platform Engineer', 'Lead ML Engineer',
  'Design system for builders', 'High-velocity teams', 'Silicon Valley standards'
];
foreignTerms.forEach(term => {
  totalChecks++;
  if (html.includes(term)) {
    failedChecks++;
    failures.push({ category: 'Abstra Leak', name: `Foreign term: ${term}` });
    console.error(`[FAIL] Foreign term leaked into index.html: "${term}"`);
  } else {
    passedChecks++;
  }
});

// -------------------------------------------------------------
// SUMMARY & VERDICT
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`AUDIT RESULTS: ${passedChecks}/${totalChecks} PASSED, ${failedChecks} FAILED`);
console.log('================================================================');

if (failedChecks === 0) {
  console.log('VERDICT: APPROVE');
  console.log('All locked copy items verified 100% verbatim.');
  console.log('Zero Abstra leaks or foreign terminology detected.');
  console.log('All comments completely sanitized.');
  process.exit(0);
} else {
  console.log('VERDICT: REQUEST_CHANGES');
  console.log('Failures:', failures);
  process.exit(1);
}
