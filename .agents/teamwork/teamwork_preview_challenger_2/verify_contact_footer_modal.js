const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

const items = [
  // Contact
  "Talk to us",
  "Tell us what you are building.",
  "A short call is enough to see if we are a good fit.",
  "hello@vayra.team",
  "Copy email",
  "Email us for a quote",
  "Copied: ",
  "Selected. Press Ctrl+C or Cmd+C to copy.",
  // Footer
  "AI-augmented teams from Latin America",
  "&copy; 2026 Vayra",
  // Exit Modal
  "Scaling your engineering or GTM team?",
  "Your growth shouldn&#39;t be bottlenecked by hiring cycles. We deploy top 1% LATAM engineers and AI-augmented GTM teams in 48 hours. Drop your email to see our vetted talent.",
  "No thanks, just looking"
];

let allMatch = true;
items.forEach((text, idx) => {
  const match = html.includes(text);
  console.log(`Item #${idx+1} ("${text.substring(0, 30)}..."): ${match ? 'MATCH' : 'MISSING'}`);
  if (!match) allMatch = false;
});

console.log('\nAll Contact, Footer, Modal items match verbatim:', allMatch);
