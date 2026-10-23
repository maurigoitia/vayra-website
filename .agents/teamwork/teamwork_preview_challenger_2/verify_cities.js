const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve('public/index.html'), 'utf8');

const expectedCities = [
  { city: "Mendoza, Argentina", quote: "Senior engineers between the vineyards and the Andes." },
  { city: "Buenos Aires, Argentina", quote: "Builders who move fast and never really stop." },
  { city: "Córdoba, Argentina", quote: "A university city full of engineers with solid fundamentals." },
  { city: "Rosario, Argentina", quote: "River city builders who ship steady, careful work." },
  { city: "Montevideo, Uruguay", quote: "Calm product teams who think before they build." },
  { city: "Asunción, Paraguay", quote: "A growing tech scene with people who want to own things." },
  { city: "Santiago, Chile", quote: "Engineers who think in systems, with the Andes out the window." },
  { city: "Lima, Peru", quote: "Builders who turn messy problems into clear products." },
  { city: "Bogotá, Colombia", quote: "Designers and engineers who care how things feel." },
  { city: "Medellín, Colombia", quote: "A city that reinvented itself, and builders who do the same." },
  { city: "Mexico City, Mexico", quote: "SDRs and marketers who sell in English and Spanish." },
  { city: "Guadalajara, Mexico", quote: "Mexico’s tech hub, close to US hours and US customers." },
  { city: "São Paulo, Brazil", quote: "GTM and engineering talent from the biggest market in the region." },
  { city: "Rio, Brazil", quote: "GTM people who know how to start a conversation." },
  { city: "Florianópolis, Brazil", quote: "Surf before standup, ship after." }
];

let allCitiesMatch = true;

expectedCities.forEach((item, idx) => {
  // Check quote
  const quoteFound = html.includes(item.quote) || html.includes(item.quote.replace(/’/g, "'"));
  console.log(`City #${idx + 1} (${item.city}): ${quoteFound ? 'MATCH' : 'MISSING'}`);
  if (!quoteFound) allCitiesMatch = false;
});

console.log('\nAll 15 Cities & Quotes match verbatim:', allCitiesMatch);
