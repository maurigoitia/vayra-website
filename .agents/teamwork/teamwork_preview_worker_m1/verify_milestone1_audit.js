const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '../../../');
const indexPath = path.join(rootDir, 'public', 'index.html');
const stylesPath = path.join(rootDir, 'public', 'styles.css');

let passes = 0;
let failures = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passes++;
  } else {
    console.error(`[FAIL] ${description}`);
    failures++;
  }
}

console.log("==================================================");
console.log("  MILESTONE 1 VERIFICATION & AUDIT SUITE");
console.log("==================================================");

// 1. Files existence
assert(fs.existsSync(indexPath), "public/index.html exists");
assert(fs.existsSync(stylesPath), "public/styles.css exists");

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

// 2. Validate JSON-LD structured data syntax
console.log("\n--- Validating JSON-LD Blocks ---");
const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
let match;
let jsonLdCount = 0;
while ((match = jsonLdRegex.exec(indexHtml)) !== null) {
  jsonLdCount++;
  try {
    const parsed = JSON.parse(match[1]);
    assert(true, `JSON-LD block #${jsonLdCount} is valid JSON (${parsed['@type'] || 'graph'})`);
  } catch (err) {
    assert(false, `JSON-LD block #${jsonLdCount} parse error: ${err.message}`);
  }
}
assert(jsonLdCount >= 1, `Found ${jsonLdCount} JSON-LD blocks`);

// 3. Validate Embedded JavaScript Syntax
console.log("\n--- Validating Embedded Scripts Syntax ---");
const scriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g;
let scriptMatch;
let inlineScriptCount = 0;
while ((scriptMatch = scriptRegex.exec(indexHtml)) !== null) {
  const attrs = scriptMatch[1];
  const code = scriptMatch[2].trim();
  if (attrs.includes('application/ld+json') || !code) continue;
  inlineScriptCount++;
  
  const tempScriptPath = path.join(__dirname, `_temp_script_${inlineScriptCount}.js`);
  fs.writeFileSync(tempScriptPath, code, 'utf8');
  try {
    execSync(`node -c "${tempScriptPath}"`, { stdio: 'pipe' });
    assert(true, `Inline <script #${inlineScriptCount}> passed syntax validation (node -c)`);
  } catch (err) {
    assert(false, `Inline <script #${inlineScriptCount}> syntax error: ${err.message}`);
  } finally {
    if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
  }
}
assert(inlineScriptCount >= 2, `Validated ${inlineScriptCount} inline scripts (console animation + vy-enhancements)`);

// 4. Verify 5 Core Capabilities & Element IDs
console.log("\n--- Verifying Core Capabilities & DOM IDs ---");

// Capability 1: Hero Flashlight & Custom Pointer
assert(indexHtml.includes('id="heroSection"'), "Hero has id='heroSection'");
assert(indexHtml.includes('id="vyCursorDot"'), "Cursor dot #vyCursorDot exists");
assert(indexHtml.includes('id="vyCursorRing"'), "Cursor ring #vyCursorRing exists");
assert(indexHtml.includes('data-spotlight'), "data-spotlight attributes applied to interactive cards");

// Capability 2: Talent Rail Horizontal Carousel
assert(indexHtml.includes('id="talentRail"'), "Talent rail #talentRail exists");
assert(indexHtml.includes('id="railPrev"'), "Talent rail button #railPrev exists");
assert(indexHtml.includes('id="railNext"'), "Talent rail button #railNext exists");
assert(indexHtml.includes('vy-pcard'), "Talent cards have .vy-pcard class");

// Capability 3: Interactive Split Process Panels / Tabs
assert(indexHtml.includes('id="gtmInteractive"'), "GTM interactive container #gtmInteractive exists");
assert(indexHtml.includes('id="gtmPanel"'), "GTM inspector panel #gtmPanel exists");
assert(indexHtml.includes('id="gtmAgentStage"'), "#gtmAgentStage readout exists");
assert(indexHtml.includes('id="gtmAgentText"'), "#gtmAgentText readout exists");
assert(indexHtml.includes('id="gtmPersonStage"'), "#gtmPersonStage readout exists");
assert(indexHtml.includes('id="gtmPersonText"'), "#gtmPersonText readout exists");
for (let i = 0; i < 5; i++) {
  assert(indexHtml.includes(`id="gtmTab${i}"`), `#gtmTab${i} button exists`);
}

// Capability 4: Scroll Reveal Engine
assert(indexHtml.includes('class="vy-rv"') || indexHtml.includes(' vy-rv'), ".vy-rv scroll reveal classes are present on landmarks");
assert(indexHtml.includes("document.documentElement.classList.add('js')"), "JS enablement class added to html element");
assert(indexHtml.includes('IntersectionObserver'), "IntersectionObserver reveal engine implemented");
assert(indexHtml.includes('prefers-reduced-motion'), "prefers-reduced-motion fallback implemented");

// Capability 5: Real-time FAQ Search & Filtering
assert(indexHtml.includes('id="faqSearchInput"'), "FAQ input #faqSearchInput exists");
assert(indexHtml.includes('id="faqClearBtn"'), "FAQ clear button #faqClearBtn exists");
assert(indexHtml.includes('id="faqCount"'), "FAQ count indicator #faqCount exists");
assert(indexHtml.includes('id="faqList"'), "FAQ list container #faqList exists");
assert(indexHtml.includes('id="faqEmpty"'), "FAQ empty state container #faqEmpty exists");
assert(indexHtml.includes('id="faqQueryText"'), "FAQ empty query readout #faqQueryText exists");
assert(indexHtml.includes('id="faqResetBtn"'), "FAQ reset button #faqResetBtn exists");

// 5. Verify 100% Copy Preservation (Strict Lock)
console.log("\n--- Verifying 100% Copy Preservation ---");
const lockedStrings = [
  // Hero
  "Senior GTM and engineering teams, <em>augmented with AI.</em>",
  "Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents. GTM engineers, SDRs and developers on your hours, with more done by every person.",
  "Get a quote",
  "See the GTM system",
  // What
  "What we do",
  "Teams that sell, build and ship with AI in the loop.",
  "GTM engineers and teams",
  "The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.",
  "Orchestrated teams",
  "A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.",
  "AI-augmented engineering",
  "Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.",
  "Add people to your team",
  "You lead. They join your Slack, your standups and your tools from day one.",
  "Hand us a goal",
  "A Vayra squad owns it, from discovery to production or from first signal to booked meeting.",
  // GTM
  "The GTM system",
  "Agents do the repetitive work. People own the pipeline.",
  "Every Vayra GTM team runs on the same loop. You can see who did what at each stage, and a person signs off before anything reaches a buyer.",
  "Watch hiring, funding and product news across your market.",
  "Enrich accounts and contacts with what matters.",
  "Draft first lines and sequences per account.",
  "Summarize replies and calls into clean notes.",
  "Keep the CRM updated without anyone chasing it.",
  "Decide which signals are worth acting on.",
  "Check every account against your real ICP.",
  "Rewrite, approve and send in your voice.",
  "Run the calls and build the relationship.",
  "Report to you on what is moving and why.",
  "GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week.",
  // How
  "How we work",
  "You only meet people we would hire ourselves.",
  "We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.",
  "Your hours, not ours.",
  "Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.",
  "We stay after the hire.",
  "We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together.",
  // FAQ - all 9 questions and answers
  "What is Vayra?",
  "Vayra builds AI-augmented GTM and engineering teams from Latin America for US companies. Senior people work alongside orchestrated AI agents, on US hours.",
  "How much does senior talent in Latin America cost?",
  "Vayra rates start at about $50 an hour for a semi-senior software or GTM engineer and $3,000 a month for an SDR. Senior and manager levels cost more. For comparison, the US median pay for software developers is $135,980 a year before benefits (BLS OEWS, May 2025).",
  "What does AI-augmented mean?",
  "Every person works with AI tools and agents as part of the daily work, and knows when to trust them and when to check.",
  "What is an orchestrated team?",
  "Senior people plus AI agents organized around one goal, with a clear owner for every decision.",
  "What do GTM engineers do?",
  "They build the system behind your pipeline: data, enrichment, sequences, CRM and the automations that connect them.",
  "Which roles can Vayra provide?",
  "GTM engineers, SDRs, marketing and ops people, and software engineers for web, mobile, data and cloud.",
  "Can I start with one person?",
  "Yes. Start with one and grow from there.",
  "Extend my team or hand you a goal?",
  "If you already have a lead and a plan, add people to your team. If you need something built or a pipeline running end to end, hand us the goal.",
  "Where are your people based?",
  "Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones."
];

let copyFailures = 0;
lockedStrings.forEach(str => {
  if (!indexHtml.includes(str)) {
    assert(false, `Missing locked copy: "${str.substring(0, 40)}..."`);
    copyFailures++;
  }
});
if (copyFailures === 0) {
  assert(true, `All ${lockedStrings.length} locked marketing strings verified verbatim in index.html`);
}

// 6. CSS Synchronization
console.log("\n--- Checking CSS Rules & Namespacing ---");
const cssKeywords = [
  '.vy-cursor-dot',
  '.vy-cursor-ring',
  '[data-spotlight]',
  '.vy-rail',
  '.vy-rail-btn',
  '.vy-pcard',
  '.vy-gtm-tab',
  '.vy-gtm-panel',
  '.vy-faq-input',
  '.vy-rv'
];

cssKeywords.forEach(kw => {
  const inIndex = indexHtml.includes(kw);
  const inStyles = stylesCss.includes(kw);
  assert(inIndex, `index.html contains CSS rule: ${kw}`);
  assert(inStyles, `styles.css contains CSS rule: ${kw}`);
});

console.log("\n==================================================");
console.log(`TOTAL AUDIT RESULTS: ${passes} PASSED, ${failures} FAILED`);
console.log("==================================================");

if (failures > 0) {
  process.exit(1);
} else {
  console.log("\nSUCCESS: All Milestone 1 requirements verified with 100% compliance!");
}
