const fs = require('fs');
const abstraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/brain/e4e43392-f5ae-4a46-970b-95909214e373/.user_uploaded/media_1792069901266_eba27c2d.html', 'utf8');

// Find talent section
const talentMatch = abstraHtml.match(/<section[^>]*id=[\"']ab-talent[\"'][^>]*>([\s\S]*?)<\/section>/i);
if (talentMatch) {
  console.log('Talent section found! Length:', talentMatch[0].length);
  // Look at rail markup
  const railMarkup = talentMatch[1].match(/<div[^>]*class=[\"']rail[\"'][^>]*>([\s\S]*?)<\/div>/i);
  if (railMarkup) {
    console.log('Rail container inner length:', railMarkup[1].length);
    // Count cards
    const cards = railMarkup[1].match(/<div[^>]*class=[\"'][^\"']*pcard[^\"']*[\"'][^>]*>/gi) || [];
    console.log('Pcard count:', cards.length);
    // Sample first card
    const firstCard = railMarkup[1].match(/<div[^>]*class=[\"'][^\"']*pcard[^\"']*[\"'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
    if (firstCard) console.log('First card sample:\n', firstCard[0].substring(0, 800));
  }
  // Look at controls
  const controls = talentMatch[1].match(/<div[^>]*class=[\"'][^\"']*(?:ctrl|nav|btn|arrow)[^\"']*[\"'][^>]*>[\s\S]*?<\/div>/gi) || [];
  console.log('Controls found:', controls);
}

// Find CSS for .rail and .pcard in Abstra
const styles = abstraHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
styles.forEach((st, idx) => {
  const css = st.replace(/<\/?style[^>]*>/gi, '');
  const railCss = css.match(/\.(?:rail|pcard|pc\b)[^{]*\{[^}]*\}/gi) || [];
  console.log(`Style ${idx+1} matching rail/pcard rules:`, railCss.slice(0, 8));
});
