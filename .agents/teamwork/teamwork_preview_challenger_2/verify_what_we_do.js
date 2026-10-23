const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

const whatItems = [
  "Teams that sell, build and ship with AI in the loop.",
  "GTM engineers and teams",
  "The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.",
  "Outbound",
  "Enrichment",
  "CRM",
  "RevOps",
  "SDRs",
  "Orchestrated teams",
  "A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.",
  "Agents",
  "Workflows",
  "Human review",
  "AI-augmented engineering",
  "Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.",
  "Web",
  "Mobile",
  "Data",
  "Cloud",
  "Two ways to start",
  "Add people to your team",
  "You lead. They join your Slack, your standups and your tools from day one.",
  "Hand us a goal",
  "A Vayra squad owns it, from discovery to production or from first signal to booked meeting."
];

let allMatch = true;
whatItems.forEach((text, idx) => {
  const match = html.includes(text);
  console.log(`Item #${idx+1} ("${text.substring(0, 30)}..."): ${match ? 'MATCH' : 'MISSING'}`);
  if (!match) allMatch = false;
});

console.log('\nAll What We Do items match verbatim:', allMatch);
