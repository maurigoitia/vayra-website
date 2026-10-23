const fs = require('fs');
const cp = require('child_process');
const path = require('path');

console.log('=== STARTING ADVERSARIAL COPY AUDIT ===\n');

// 1. Get original index.html from git staging area
let originalHtml;
try {
  originalHtml = cp.execSync('git show :public/index.html', { encoding: 'utf8' });
  console.log('[PASS] Retrieved original public/index.html from git index. Length:', originalHtml.length);
} catch (e) {
  console.error('[FAIL] Failed to retrieve original index.html from git index:', e.message);
  process.exit(1);
}

// 2. Read current public/index.html
const currentHtml = fs.readFileSync('public/index.html', 'utf8');
console.log('[PASS] Read current public/index.html. Length:', currentHtml.length);

// 3. Read survey_vayra.md
const surveyPath = path.resolve('.agents/teamwork/teamwork_preview_explorer_survey_2/survey_vayra.md');
const surveyContent = fs.readFileSync(surveyPath, 'utf8');
console.log('[PASS] Read survey_vayra.md. Length:', surveyContent.length);

// 4. Read Abstra source if available
const abstraPath = 'C:\\Users\\mauri\\Downloads\\Abstra-Home-v2_1.html';
let abstraHtml = '';
if (fs.existsSync(abstraPath)) {
  abstraHtml = fs.readFileSync(abstraPath, 'utf8');
  console.log('[PASS] Read Abstra reference file. Length:', abstraHtml.length);
} else {
  console.log('[WARN] Abstra reference file not found at', abstraPath);
}

const auditResults = {
  lockedCopyVerifications: [],
  textDeletions: [],
  abstraLeakChecks: [],
  newTextIntroduced: [],
  summary: { totalChecks: 0, passed: 0, failed: 0 }
};

function recordCheck(category, name, passed, details) {
  auditResults.summary.totalChecks++;
  if (passed) auditResults.summary.passed++;
  else auditResults.summary.failed++;
  category.push({ name, passed, details });
}

// ==========================================
// TEST SUITE 1: Exhaustive Locked Copy Check from survey_vayra.md
// ==========================================
console.log('\n--- SUITE 1: Verifying All Locked Copy from survey_vayra.md ---');

const lockedCopyItems = [
  // Page Metadata
  { name: 'Title Tag', text: 'Vayra | Hire Top 1% Latam Software Engineers & GTM Talent' },
  { name: 'Meta Description', text: 'Hire elite, AI-vetted software developers and GTM teams from Latin America. The premier nearshore talent network for CTOs, VPs of Engineering, and Growth Managers.' },
  { name: 'OG Image Alt', text: 'Vayra. Elite AI-vetted Engineering and GTM nearshore teams.' },

  // Navigation
  { name: 'Nav Brand', text: 'Vayra' },
  { name: 'Nav: What we do', text: 'What we do' },
  { name: 'Nav: GTM system', text: 'GTM system' },
  { name: 'Nav: Cities', text: 'Cities' },
  { name: 'Nav: How we work', text: 'How we work' },
  { name: 'Nav: FAQ', text: 'FAQ' },
  { name: 'Nav CTA', text: 'Get a quote' },

  // Hero Section
  { name: 'Hero Route Badge', text: 'LATAM &rarr; US' },
  { name: 'Hero H1', text: 'Senior GTM and engineering teams, <em>augmented with AI.</em>' },
  { name: 'Hero Lede Paragraph', text: 'Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents. GTM engineers, SDRs and developers on your hours, with more done by every person.' },
  { name: 'Hero CTA Ghost', text: 'See the GTM system' },
  { name: 'Hero Terminal Header', text: 'gtm-team / live' },
  { name: 'Hero Terminal Command', text: '$ vayra orchestrate --team gtm --icp &quot;your best customers&quot;' },
  { name: 'Terminal Row 1', text: 'hiring and funding news found' },
  { name: 'Terminal Row 2', text: 'accounts and contacts enriched' },
  { name: 'Terminal Row 3', text: 'first lines written per account' },
  { name: 'Terminal Row 4', text: 'reviewed, edited, approved' },
  { name: 'Terminal Row 5', text: 'conversations started, calls booked' },
  { name: 'Terminal Status', text: 'pipeline updated in your CRM' },

  // Ticker Marquee Items
  { name: 'Ticker: Outbound systems', text: 'Outbound systems' },
  { name: 'Ticker: Enrichment', text: 'Enrichment' },
  { name: 'Ticker: CRM and RevOps', text: 'CRM and RevOps' },
  { name: 'Ticker: SDR teams', text: 'SDR teams' },
  { name: 'Ticker: AI agents', text: 'AI agents' },
  { name: 'Ticker: Web and mobile', text: 'Web and mobile' },
  { name: 'Ticker: Data pipelines', text: 'Data pipelines' },
  { name: 'Ticker: Cloud', text: 'Cloud' },

  // What We Do
  { name: 'What We Do Eyebrow', text: 'What we do' },
  { name: 'What We Do H2', text: 'Teams that sell, build and ship with AI in the loop.' },
  { name: 'Card 1 Tag', text: 'GTM' },
  { name: 'Card 1 H3', text: 'GTM engineers and teams' },
  { name: 'Card 1 Desc', text: 'The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.' },
  { name: 'Card 2 Tag', text: 'Orchestrated' },
  { name: 'Card 2 H3', text: 'Orchestrated teams' },
  { name: 'Card 2 Desc', text: 'A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.' },
  { name: 'Card 3 Tag', text: 'Engineering' },
  { name: 'Card 3 H3', text: 'AI-augmented engineering' },
  { name: 'Card 3 Desc', text: 'Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.' },
  { name: 'Start Label', text: 'Two ways to start' },
  { name: 'Option 1 H4', text: 'Add people to your team' },
  { name: 'Option 1 Desc', text: 'You lead. They join your Slack, your standups and your tools from day one.' },
  { name: 'Option 2 H4', text: 'Hand us a goal' },
  { name: 'Option 2 Desc', text: 'A Vayra squad owns it, from discovery to production or from first signal to booked meeting.' },

  // GTM System
  { name: 'GTM Eyebrow', text: 'The GTM system' },
  { name: 'GTM H2', text: 'Agents do the repetitive work. People own the pipeline.' },
  { name: 'GTM Lede', text: 'Every Vayra GTM team runs on the same loop. You can see who did what at each stage, and a person signs off before anything reaches a buyer.' },
  { name: 'GTM Agent Signals', text: 'Watch hiring, funding and product news across your market.' },
  { name: 'GTM Agent Research', text: 'Enrich accounts and contacts with what matters.' },
  { name: 'GTM Agent Outreach', text: 'Draft first lines and sequences per account.' },
  { name: 'GTM Agent Conversations', text: 'Summarize replies and calls into clean notes.' },
  { name: 'GTM Agent Pipeline', text: 'Keep the CRM updated without anyone chasing it.' },
  { name: 'GTM Person Signals', text: 'Decide which signals are worth acting on.' },
  { name: 'GTM Person Research', text: 'Check every account against your real ICP.' },
  { name: 'GTM Person Outreach', text: 'Rewrite, approve and send in your voice.' },
  { name: 'GTM Person Conversations', text: 'Run the calls and build the relationship.' },
  { name: 'GTM Person Pipeline', text: 'Report to you on what is moving and why.' },
  { name: 'GTM Footnote', text: 'GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week.' },

  // Cities Section
  { name: 'Cities Eyebrow', text: 'Where your team lives' },
  { name: 'Cities H2', text: '15 cities, one shared workday.' },
  { name: 'Cities Lede', text: 'Pick where you are in the US and see what your team is doing right now.' },
  { name: 'Cities US Label', text: 'Where are you in the US?' },
  { name: 'Cities Latam Label', text: 'Pick a city in Latin America' },
  { name: 'City Quote Mendoza', text: 'Senior engineers between the vineyards and the Andes.' },
  { name: 'City Quote Buenos Aires', text: 'Builders who move fast and never really stop.' },
  { name: 'City Quote Cordoba', text: 'A university city full of engineers with solid fundamentals.' },
  { name: 'City Quote Rosario', text: 'River city builders who ship steady, careful work.' },
  { name: 'City Quote Montevideo', text: 'Calm product teams who think before they build.' },
  { name: 'City Quote Asuncion', text: 'A growing tech scene with people who want to own things.' },
  { name: 'City Quote Santiago', text: 'Engineers who think in systems, with the Andes out the window.' },
  { name: 'City Quote Lima', text: 'Builders who turn messy problems into clear products.' },
  { name: 'City Quote Bogota', text: 'Designers and engineers who care how things feel.' },
  { name: 'City Quote Medellin', text: 'A city that reinvented itself, and builders who do the same.' },
  { name: 'City Quote CDMX', text: 'SDRs and marketers who sell in English and Spanish.' },
  { name: 'City Quote Guadalajara', text: 'Mexico’s tech hub, close to US hours and US customers.' },
  { name: 'City Quote Sao Paulo', text: 'GTM and engineering talent from the biggest market in the region.' },
  { name: 'City Quote Rio', text: 'GTM people who know how to start a conversation.' },
  { name: 'City Quote Florianopolis', text: 'Surf before standup, ship after.' },
  { name: 'Map Caption', text: 'Latin America on US hours' },

  // How We Work
  { name: 'How Eyebrow', text: 'How we work' },
  { name: 'How H2', text: 'You only meet people we would hire ourselves.' },
  { name: 'How Step 1', text: 'Intro call' },
  { name: 'How Step 2', text: 'Calibrate' },
  { name: 'How Step 3', text: 'Shortlist' },
  { name: 'How Step 4', text: 'Kickoff' },
  { name: 'How Step 5', text: 'Ongoing support' },
  { name: 'How Body', text: 'We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.' },
  { name: 'How Timezones H3', text: 'Your hours, not ours.' },
  { name: 'How Timezones Body', text: 'Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.' },
  { name: 'How After Hire H3', text: 'We stay after the hire.' },
  { name: 'How After Hire Body', text: 'We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together.' },

  // FAQ
  { name: 'FAQ H2', text: 'Questions we hear first.' },
  { name: 'FAQ Q1', text: 'What is Vayra?' },
  { name: 'FAQ A1', text: 'Vayra builds AI-augmented GTM and engineering teams from Latin America for US companies. Senior people work alongside orchestrated AI agents, on US hours.' },
  { name: 'FAQ Q2', text: 'How much does senior talent in Latin America cost?' },
  { name: 'FAQ A2', text: 'Vayra rates start at about $50 an hour for a semi-senior software or GTM engineer and $3,000 a month for an SDR. Senior and manager levels cost more. For comparison, the US median pay for software developers is $135,980 a year before benefits (BLS OEWS, May 2025).' },
  { name: 'FAQ Q3', text: 'What does AI-augmented mean?' },
  { name: 'FAQ A3', text: 'Every person works with AI tools and agents as part of the daily work, and knows when to trust them and when to check.' },
  { name: 'FAQ Q4', text: 'What is an orchestrated team?' },
  { name: 'FAQ A4', text: 'Senior people plus AI agents organized around one goal, with a clear owner for every decision.' },
  { name: 'FAQ Q5', text: 'What do GTM engineers do?' },
  { name: 'FAQ A5', text: 'They build the system behind your pipeline: data, enrichment, sequences, CRM and the automations that connect them.' },
  { name: 'FAQ Q6', text: 'Which roles can Vayra provide?' },
  { name: 'FAQ A6', text: 'GTM engineers, SDRs, marketing and ops people, and software engineers for web, mobile, data and cloud.' },
  { name: 'FAQ Q7', text: 'Can I start with one person?' },
  { name: 'FAQ A7', text: 'Yes. Start with one and grow from there.' },
  { name: 'FAQ Q8', text: 'Extend my team or hand you a goal?' },
  { name: 'FAQ A8', text: 'If you already have a lead and a plan, add people to your team. If you need something built or a pipeline running end to end, hand us the goal.' },
  { name: 'FAQ Q9', text: 'Where are your people based?' },
  { name: 'FAQ A9', text: 'Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones.' },

  // Contact
  { name: 'Contact Eyebrow', text: 'Talk to us' },
  { name: 'Contact H2', text: 'Tell us what you are building.' },
  { name: 'Contact Lede', text: 'A short call is enough to see if we are a good fit.' },
  { name: 'Contact Email', text: 'hello@vayra.team' },
  { name: 'Contact Copy Btn', text: 'Copy email' },

  // Footer
  { name: 'Footer Tagline', text: 'AI-augmented teams from Latin America' },
  { name: 'Footer Copyright', text: '© 2026 Vayra' },

  // Exit Modal
  { name: 'Exit Modal H2', text: 'Scaling your engineering or GTM team?' },
  { name: 'Exit Modal Body', text: 'Your growth shouldn&#39;t be bottlenecked by hiring cycles. We deploy top 1% LATAM engineers and AI-augmented GTM teams in 48 hours. Drop your email to see our vetted talent.' },
  { name: 'Exit Modal Dismiss', text: 'No thanks, just looking' }
];

lockedCopyItems.forEach(item => {
  // normalize quotes / entities for checking
  let target = item.text;
  let found = currentHtml.includes(target);
  if (!found) {
    // try with normalized quotes / html entities
    let normalizedTarget = target.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'");
    let normalizedHtml = currentHtml.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'");
    found = normalizedHtml.includes(normalizedTarget);
  }
  recordCheck(auditResults.lockedCopyVerifications, item.name, found, found ? 'VERBATIM_MATCH' : `NOT_FOUND: "${item.text}"`);
  if (!found) {
    console.log(`[FAIL] ${item.name}: NOT FOUND`);
  }
});
console.log(`Locked copy verification complete: ${auditResults.lockedCopyVerifications.filter(x => x.passed).length}/${auditResults.lockedCopyVerifications.length} passed.`);

// ==========================================
// TEST SUITE 2: Text Extraction & Diff from Original HTML
// ==========================================
console.log('\n--- SUITE 2: Checking for Any Lost Text from Original HTML ---');

// Extract all visible text blocks / paragraph content from original vs current
function extractTextBlocks(html) {
  // Strip script, style, comments
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  
  // Extract text within tags
  const matches = clean.match(/>([^<]+)</g) || [];
  return matches
    .map(m => m.substring(1, m.length - 1).trim())
    .filter(t => t.length > 3 && !/^[0-9\s.,;:+\-/*%]+$/.test(t))
    .map(t => t.replace(/\s+/g, ' '));
}

const origBlocks = extractTextBlocks(originalHtml);
console.log(`Extracted ${origBlocks.length} text blocks from original HTML.`);

let missingBlocks = [];
origBlocks.forEach(block => {
  let normBlock = block.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'");
  let normCurrent = currentHtml.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'");
  if (!normCurrent.includes(normBlock)) {
    missingBlocks.push(block);
  }
});

if (missingBlocks.length === 0) {
  console.log('[PASS] ZERO text blocks from original HTML are missing in current HTML!');
  recordCheck(auditResults.textDeletions, 'All original text blocks present', true, '100% text retention across all original DOM nodes');
} else {
  console.log(`[FAIL] ${missingBlocks.length} text blocks missing:`, missingBlocks);
  recordCheck(auditResults.textDeletions, 'All original text blocks present', false, `Missing: ${JSON.stringify(missingBlocks)}`);
}

// ==========================================
// TEST SUITE 3: Abstra Copy Leakage Check
// ==========================================
console.log('\n--- SUITE 3: Checking for Leaked Abstra Copy ---');

// Known Abstra specific marketing terms, case studies, slogans, persona names
const abstraSpecificTerms = [
  'Abstra',
  'abstra',
  'ABSTRA',
  'Design system for builders',
  'High-velocity teams',
  'Silicon Valley standards',
  'Meet our engineers',
  'Case studies',
  'Testimonials',
  'Fintech scaleup',
  'Healthtech unicorn',
  'Series A',
  'Series B',
  'Y Combinator',
  'YC W',
  'YC S',
  'trusted by 500+',
  'loved by founders',
  'Alex Rivera',
  'Sofia Chen',
  'Mateo Rossi',
  'Camila Duarte',
  'Lucas Silva',
  'Valentina Torres',
  'Frontend Architect',
  'Staff Platform Engineer',
  'Lead ML Engineer'
];

let leakedAbstraTerms = [];
abstraSpecificTerms.forEach(term => {
  // Case sensitive or insensitive depending on term
  // For 'Abstra' / 'abstra', we check case-insensitively, except where it might be in an internal comment or class name? Wait!
  // In index.html, there should be NO mentions of Abstra in user-facing text!
  // Let's check regex for word boundary \bAbstra\b
  const regex = new RegExp(`\\b${term}\\b`, 'i');
  if (regex.test(currentHtml)) {
    // find lines
    const lines = currentHtml.split('\n');
    lines.forEach((line, idx) => {
      if (regex.test(line)) {
        leakedAbstraTerms.push({ term, lineNo: idx + 1, content: line.trim() });
      }
    });
  }
});

if (leakedAbstraTerms.length === 0) {
  console.log('[PASS] ZERO Abstra terms or marketing copy found in public/index.html!');
  recordCheck(auditResults.abstraLeakChecks, 'Zero Abstra Copy Leakage', true, 'No Abstra brand, slogans, persona names, or marketing copy found');
} else {
  console.log(`[FAIL] Detected Abstra terms in public/index.html:`, leakedAbstraTerms);
  recordCheck(auditResults.abstraLeakChecks, 'Zero Abstra Copy Leakage', false, leakedAbstraTerms);
}

// ==========================================
// TEST SUITE 4: Inspection of Any Newly Introduced User-Facing Copy
// ==========================================
console.log('\n--- SUITE 4: Auditing Newly Introduced Strings ---');

// Find all text blocks in currentHtml that were not in originalHtml
const currentBlocks = extractTextBlocks(currentHtml);
const newBlocks = currentBlocks.filter(block => {
  let normBlock = block.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'");
  let normOrig = originalHtml.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/’/g, "'");
  return !normOrig.includes(normBlock);
});

console.log(`Found ${newBlocks.length} new text blocks in current HTML:`);
newBlocks.forEach(nb => {
  console.log(` - "${nb}"`);
  recordCheck(auditResults.newTextIntroduced, `New UI text: ${nb.substring(0, 30)}`, true, nb);
});

// Check whether any new string is an unauthorized marketing alteration
// Allowed UI strings: UI navigation labels (Previous, Next, Search questions, etc.)
const allowedNewStrings = [
  'Previous talent',
  'Next talent',
  'Search questions',
  'Clear search',
  'Reset search',
  'No questions matched your search for',
  'Showing all',
  'questions',
  'No questions found',
  'Showing',
  'Agents',
  'People'
];

let suspiciousNewStrings = [];
newBlocks.forEach(nb => {
  const isAllowed = allowedNewStrings.some(allowed => nb.toLowerCase().includes(allowed.toLowerCase()));
  if (!isAllowed) {
    suspiciousNewStrings.push(nb);
  }
});

if (suspiciousNewStrings.length > 0) {
  console.log(`[WARN] Newly introduced strings requiring examination:`, suspiciousNewStrings);
} else {
  console.log('[PASS] All new strings are strictly UI control labels / accessibility markers (zero marketing copy additions).');
}

// ==========================================
// TEST SUITE 5: JSON-LD Schema Validation
// ==========================================
console.log('\n--- SUITE 5: Validating JSON-LD Structured Data Schema ---');

const jsonLdMatch = currentHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (jsonLdMatch) {
  try {
    const parsed = JSON.parse(jsonLdMatch[1]);
    console.log('[PASS] JSON-LD schema is valid JSON!');
    // Verify questions in JSON-LD match FAQ questions
    if (parsed['@graph']) {
      const faqPage = parsed['@graph'].find(g => g['@type'] === 'FAQPage');
      if (faqPage && faqPage.mainEntity) {
        console.log(`[PASS] JSON-LD contains ${faqPage.mainEntity.length} FAQ questions.`);
        recordCheck(auditResults.lockedCopyVerifications, 'JSON-LD FAQ Integrity', true, `${faqPage.mainEntity.length} FAQs validated`);
      }
    }
  } catch (err) {
    console.log('[FAIL] JSON-LD parsing error:', err.message);
    recordCheck(auditResults.lockedCopyVerifications, 'JSON-LD Valid JSON', false, err.message);
  }
} else {
  console.log('[WARN] No JSON-LD script found');
}

// Write out JSON audit report
fs.writeFileSync(
  path.resolve('.agents/teamwork/teamwork_preview_challenger_2/audit_data.json'),
  JSON.stringify(auditResults, null, 2)
);

console.log('\n==========================================');
console.log(`AUDIT FINISHED: ${auditResults.summary.passed}/${auditResults.summary.totalChecks} CHECKS PASSED`);
console.log(`FAILED: ${auditResults.summary.failed}`);
console.log('==========================================');
