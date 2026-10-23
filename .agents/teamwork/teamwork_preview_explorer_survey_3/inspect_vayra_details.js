const fs = require('fs');
const vayraHtml = fs.readFileSync('C:/Users/mauri/.gemini/antigravity/scratch/media_1792004477748_37e8ade1/public/index.html', 'utf8');

const sections = ['what', 'gtm', 'cities', 'how', 'faq', 'contact'];
sections.forEach(id => {
  const reg = new RegExp(`<section[^>]*id=['"]${id}['"][^>]*>([\\s\\S]*?)<\\/section>`, 'i');
  const m = vayraHtml.match(reg);
  if (m) {
    console.log(`\n================ SECTION: #${id} (length ${m[0].length}) ================`);
    console.log(m[0].substring(0, 1200));
    if (m[0].length > 1200) {
      console.log('... [content continues] ...');
    }
  } else {
    console.log(`Section #${id} NOT FOUND!`);
  }
});
