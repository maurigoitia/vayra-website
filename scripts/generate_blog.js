const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// 1. Determine dates and file names
const date = new Date();
const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
const slug = `${dateStr}-latam-tech-trends`;
const fileName = `${slug}.html`;

const blogDir = path.join(__dirname, '../public/blog');
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const blogIndexPath = path.join(__dirname, '../public/blog/index.html');

if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
}

// 2. Fetch mock trends / Generate Content (This connects to AI)
// For now, if no API key is provided, it generates a smart template.
// A full AI integration would require the AI_API_KEY from env.
const title = "Top LatAm Tech Trends: " + dateStr;
const description = "Discover the latest software engineering and nearshore trends emerging from Latin America today.";
const content = `
    <h2>The Rise of LatAm Engineering</h2>
    <p>Every day, more US companies are discovering the unparalleled value of nearshore engineering in Latin America. Today's trends show a massive increase in AI adoption and full-stack development across major hubs like Buenos Aires, Bogota, and Mexico City.</p>
    <h2>Why it matters?</h2>
    <p>Aligning timezones and cultural proximity allows agile teams to ship faster. At Vayra, we continuously monitor these trends to bring you the top 1% of talent.</p>
`;

// 3. Create the HTML file for the blog post
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Vayra</title>
    <meta name="description" content="${description}">
    <link rel="stylesheet" href="../styles.css">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0E100D; color: #F5F6F2; padding: 2rem; max-width: 800px; margin: auto; }
        h1 { color: #C6F432; }
        .back { color: #F5F6F2; text-decoration: none; margin-bottom: 2rem; display: inline-block; opacity: 0.7; }
        .back:hover { opacity: 1; }
        .content { line-height: 1.6; }
    </style>
</head>
<body>
    <a href="index.html" class="back">&larr; Back to Blog</a>
    <h1>${title}</h1>
    <div class="content">
        ${content}
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(blogDir, fileName), htmlContent);
console.log(`Created new blog post: ${fileName}`);

// 4. Update Sitemap
if (fs.existsSync(sitemapPath)) {
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const newUrlEntry = `
  <url>
    <loc>https://vayra.team/blog/${fileName}</loc>
    <lastmod>${dateStr}</lastmod>
  </url>
</urlset>`;
    sitemap = sitemap.replace('</urlset>', newUrlEntry);
    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`Updated sitemap.xml with ${fileName}`);
}

// 5. Update Blog Index (using JSDOM to parse and inject)
if (fs.existsSync(blogIndexPath)) {
    const indexHtml = fs.readFileSync(blogIndexPath, 'utf8');
    const dom = new JSDOM(indexHtml);
    const document = dom.window.document;
    const ul = document.querySelector('ul') || document.querySelector('.blog-list');
    
    if (ul) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${fileName}">${title}</a> - <span>${dateStr}</span>`;
        ul.insertBefore(li, ul.firstChild);
        fs.writeFileSync(blogIndexPath, dom.serialize());
        console.log(`Updated blog/index.html with link to ${fileName}`);
    }
}
