const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

const loopItems = [
  // Agents
  { role: "Agents - Signals", text: "Watch hiring, funding and product news across your market." },
  { role: "Agents - Research", text: "Enrich accounts and contacts with what matters." },
  { role: "Agents - Outreach", text: "Draft first lines and sequences per account." },
  { role: "Agents - Conversations", text: "Summarize replies and calls into clean notes." },
  { role: "Agents - Pipeline", text: "Keep the CRM updated without anyone chasing it." },
  // People
  { role: "People - Signals", text: "Decide which signals are worth acting on." },
  { role: "People - Research", text: "Check every account against your real ICP." },
  { role: "People - Outreach", text: "Rewrite, approve and send in your voice." },
  { role: "People - Conversations", text: "Run the calls and build the relationship." },
  { role: "People - Pipeline", text: "Report to you on what is moving and why." },
  // Footnote
  { role: "GTM Footnote", text: "GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week." }
];

let allLoopMatch = true;
loopItems.forEach((item, idx) => {
  const match = html.includes(item.text);
  console.log(`${item.role}: ${match ? 'MATCH' : 'MISSING'}`);
  if (!match) allLoopMatch = false;
});

console.log('\nAll GTM Loop entries match verbatim:', allLoopMatch);
