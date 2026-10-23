const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const newExit = `
<div class="exit" id="exit" role="dialog" aria-modal="true" aria-labelledby="exit-title" hidden>
  <div class="exit-card split-card">
    <button class="exit-x" id="exit-close" type="button" aria-label="Close">&times;</button>
    <div class="exit-video-col">
      <video autoplay loop muted playsinline poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=faces&q=80" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
        <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
      </video>
    </div>
    <div class="exit-form-col">
      <h2 id="exit-title" style="font-size: 32px; margin-bottom: 16px;">Before you go...</h2>
      <p style="margin-bottom: 24px; color: var(--paper-muted);">Hey, I'm Marto. I'd like to understand what you're looking for. Leave your details and we'll get back to you.</p>
      <div id="hubspot-form-container"></div>
      <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
      <script>
        hbspt.forms.create({
          region: "na1",
          portalId: "43876008",
          formId: "3d666d6a-543e-4638-9588-e9f02931d683",
          target: "#hubspot-form-container"
        });
      </script>
      <div class="exit-actions" style="margin-top: 16px;">
        <button class="exit-later" id="exit-later" type="button">No thanks, just looking</button>
      </div>
    </div>
  </div>
</div>
`;

html = html.replace(/<div class="exit" id="exit"[\s\S]*?<\/div>\s*<\/div>/, newExit);
fs.writeFileSync('public/index.html', html);

let css = fs.readFileSync('public/styles.css', 'utf8');
if(!css.includes('.split-card')) {
  css += `
.split-card {
  width: min(850px, 95%) !important;
  display: flex !important;
  flex-direction: row;
  gap: 32px;
  padding: 32px !important;
  align-items: center;
}
.exit-video-col {
  flex: 0 0 320px;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}
.exit-form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
@media (max-width: 768px) {
  .split-card {
    flex-direction: column;
    height: 90vh;
    overflow-y: auto;
  }
  .exit-video-col {
    flex: 0 0 250px;
    height: 250px;
    width: 100%;
  }
}
`;
  fs.writeFileSync('public/styles.css', css);
}

console.log('Updated index.html and styles.css for the split exit intent modal');
