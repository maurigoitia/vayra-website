const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../../public/index.html'), 'utf8');

const queries = ['pricing', 'LATAM', 'SDRs', 'cost', 'rates', 'engineering', 'orchestrated'];
const faqs = [];
const regex = /<details[\s\S]*?<summary>([\s\S]*?)<\/summary>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi;
let m;
while ((m = regex.exec(html)) !== null) {
  faqs.push((m[1] + ' ' + m[2]).toLowerCase());
}

console.log('Total FAQs parsed:', faqs.length);
queries.forEach(q => {
  const matches = faqs.filter(f => f.includes(q.toLowerCase()));
  console.log(`Query: "${q}" -> Matches: ${matches.length}`);
});
