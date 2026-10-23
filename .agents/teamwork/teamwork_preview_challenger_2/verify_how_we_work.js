const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

const howItems = [
  "How we work",
  "You only meet people we would hire ourselves.",
  "Intro call",
  "Calibrate",
  "Shortlist",
  "Kickoff",
  "Ongoing support",
  "We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.",
  "Time zones",
  "Your hours, not ours.",
  "Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.",
  "After the hire",
  "We stay after the hire.",
  "We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together."
];

let allMatch = true;
howItems.forEach((text, idx) => {
  const match = html.includes(text);
  console.log(`Item #${idx+1} ("${text.substring(0, 30)}..."): ${match ? 'MATCH' : 'MISSING'}`);
  if (!match) allMatch = false;
});

console.log('\nAll How We Work items match verbatim:', allMatch);
