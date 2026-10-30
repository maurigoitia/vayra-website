const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

async function generate() {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0];
    
    // Choose a theme based on user requested topics
    const themes = [
        "Tech Events & Conferences: Latest takeaways from global tech events, what is coming, and how LATAM fits in.",
        "Fintech in LATAM: Innovations, banking APIs, crypto, and why US Fintechs are scaling with LATAM engineers.",
        "AI Agents & Alignment: News on autonomous agents, human alignment, and integrating agentic AI into products."
    ];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    
    const slug = `${dateStr}-vayra-insights-${Math.floor(Math.random()*1000)}`;
    const fileName = `${slug}.html`;

    const blogDir = path.join(__dirname, "../public/blog");
    const sitemapPath = path.join(__dirname, "../public/sitemap.xml");
    const blogIndexPath = path.join(__dirname, "../public/blog/index.html");

    if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

    let title = "Vayra Insights: " + theme.split(":")[0];
    let description = "Expert insights on " + theme.split(":")[0] + ".";
    let content = `<p>Every day, US companies scale with LATAM engineering to tackle these trends.</p>`;

    const apiKey = process.env.AI_API_KEY;
    if (apiKey) {
        try {
            console.log("Calling Gemini API for theme: " + theme);
            const prompt = `You are a tech blogger for Vayra, an elite LATAM nearshore engineering staffing agency. Write a highly engaging, SEO-optimized blog post in HTML format (no <html> or <body> tags, just <h2>, <p>, <ul>). 
Today Theme: ${theme}.
Discuss recent news, events, or trends on this topic. Tie it back to why building a dedicated, senior LATAM engineering team with Vayra helps companies stay ahead.
Output a JSON block at the start:
\`\`\`json
{"title": "Catchy Title", "description": "Short meta description"}
\`\`\`
Followed by the HTML content.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0].text;
                const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
                if (jsonMatch) {
                    const meta = JSON.parse(jsonMatch[1]);
                    title = meta.title || title;
                    description = meta.description || description;
                }
                content = text.replace(/\`\`\`json\n[\s\S]*?\n\`\`\`/, "").replace(/\`\`\`html/, "").replace(/\`\`\`/, "").trim();
            }
        } catch (e) {
            console.error("API Error:", e);
        }
    } else {
        console.log("No AI_API_KEY provided. Using fallback content.");
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Vayra</title>
    <meta name="description" content="${description}">
    <link rel="stylesheet" href="../styles.css">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0B0C0A; color: #F2F4EC; padding: 2rem; max-width: 800px; margin: auto; }
        h1 { color: #C6F432; font-size: 2.5rem; line-height: 1.1; margin-bottom: 0.5rem; }
        .back { color: #A8AD9E; text-decoration: none; margin-bottom: 2rem; display: inline-block; font-weight: 500; }
        .back:hover { color: #C6F432; }
        .content { line-height: 1.7; font-size: 1.1rem; color: #A8AD9E; }
        .content h2 { margin-top: 2.5rem; color: #F2F4EC; font-size: 1.8rem; }
        .content p { margin-bottom: 1.5rem; }
        .content ul { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .content li { margin-bottom: 0.5rem; }
        .date { color: #A8AD9E; font-size: 0.9rem; margin-bottom: 2rem; display: block; }
    </style>
</head>
<body>
    <a href="index.html" class="back">&larr; Back to all posts</a>
    <h1>${title}</h1>
    <span class="date">${dateStr}</span>
    <div class="content">
        ${content}
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(blogDir, fileName), htmlContent);
    console.log("Created: " + fileName);

    if (fs.existsSync(sitemapPath)) {
        let sitemap = fs.readFileSync(sitemapPath, "utf8");
        sitemap = sitemap.replace("</urlset>", `  <url>\n    <loc>https://vayra.team/blog/${fileName}</loc>\n    <lastmod>${dateStr}</lastmod>\n  </url>\n</urlset>`);
        fs.writeFileSync(sitemapPath, sitemap);
    }

    if (fs.existsSync(blogIndexPath)) {
        const dom = new JSDOM(fs.readFileSync(blogIndexPath, "utf8"));
        const ul = dom.window.document.querySelector("ul") || dom.window.document.querySelector(".blog-list");
        if (ul) {
            const li = dom.window.document.createElement("li");
            li.innerHTML = `<a href="${fileName}" style="color: #C6F432; text-decoration: none; font-size: 1.2rem; display: block; margin-bottom: 0.2rem;">${title}</a> <span style="color: #A8AD9E; font-size: 0.9rem;">${dateStr}</span>`;
            li.style.marginBottom = "1.5rem";
            ul.insertBefore(li, ul.firstChild);
            fs.writeFileSync(blogIndexPath, dom.serialize());
        }
    }
}
generate();
