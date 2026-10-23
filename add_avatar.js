const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf-8');
// Tighten letter spacing on headings
css = css.replace('h1,h2,h3{font-family:var(--f-display);line-height:1.05;letter-spacing:-.02em', 'h1,h2,h3{font-family:var(--f-display);line-height:1.05;letter-spacing:-.05em');

// Add styles for the AI avatar widget
const avatarCss = `
/* AI Avatar Widget */
.ai-avatar-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 90px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  border: 2px solid var(--ink-2);
  background: var(--ink-2);
}
.ai-avatar-widget:hover {
  transform: scale(1.05) translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05);
}
.ai-avatar-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #E5E7EB;
}
.ai-avatar-bubble {
  position: absolute;
  top: -40px;
  right: 0;
  background: var(--ink-2);
  color: var(--fg);
  padding: 8px 12px;
  border-radius: 12px;
  border-bottom-right-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}
.ai-avatar-widget:hover .ai-avatar-bubble {
  opacity: 1;
  transform: translateY(0);
}
.ai-avatar-close {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.ai-avatar-widget:hover .ai-avatar-close {
  opacity: 1;
}
`;

if (!css.includes('.ai-avatar-widget')) {
    css += '\n' + avatarCss;
}
fs.writeFileSync('styles.css', css);

let html = fs.readFileSync('index.html', 'utf-8');

const avatarHtml = `
<div class="ai-avatar-widget" id="ai-avatar" role="button" aria-label="Play greeting video">
  <div class="ai-avatar-bubble">Hey! Let me show you how Vayra works </div>
  <button class="ai-avatar-close" id="ai-avatar-close" aria-label="Close video widget">&times;</button>
  <!-- Simulated AI Video (Placeholder) -->
  <video class="ai-avatar-video" autoplay loop muted playsinline poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=300&fit=crop&crop=faces&q=80">
    <!-- Using a generic sample video -->
    <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
  </video>
</div>
`;

if (!html.includes('ai-avatar-widget')) {
    html = html.replace('</body>', avatarHtml + '\n</body>');
}

// Add simple close script
if (!html.includes('ai-avatar-close')) {
    html = html.replace('</body>', `
<script>
  document.getElementById('ai-avatar-close')?.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('ai-avatar').style.display = 'none';
  });
</script>
</body>`);
}

fs.writeFileSync('index.html', html);
console.log("Updated styles and injected AI avatar.");
