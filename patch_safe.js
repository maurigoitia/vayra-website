const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const newSection = `
  <section class="sec wall" id="contact" aria-labelledby="contact-title" style="padding: 120px 0;">
    <div class="wrap" style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start;">
      <div class="sec-head" style="text-align: left; margin: 0;">
        <span class="eyebrow" style="color: var(--sun);">Timezones & Value</span>
        <h2 id="contact-title" style="margin-bottom: 24px;">The same workday, at a fraction of the cost.</h2>
        <p class="lede" style="margin-bottom: 40px; font-size: 20px; line-height: 1.5; color: rgba(255,255,255,0.8);">
          Hire top-tier GTM talent in Latin America who share your timezone, culture, and work ethic. Save up to 60% compared to US equivalents without compromising on quality or alignment.
        </p>
        <div class="benefits-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="benefit-card" style="padding: 24px; border: 1px solid var(--line); border-radius: 12px; background: rgba(255,255,255,0.02);">
            <div style="font-size: 32px; color: var(--sun); margin-bottom: 12px;">EST/PST</div>
            <div style="font-weight: 500; margin-bottom: 8px;">100% Timezone Aligned</div>
            <div style="font-size: 14px; color: rgba(255,255,255,0.6);">Your team is online when you are, from daily standups to client calls.</div>
          </div>
          <div class="benefit-card" style="padding: 24px; border: 1px solid var(--line); border-radius: 12px; background: rgba(255,255,255,0.02);">
            <div style="font-size: 32px; color: var(--sun); margin-bottom: 12px;">-60%</div>
            <div style="font-weight: 500; margin-bottom: 8px;">Cost Efficiency</div>
            <div style="font-size: 14px; color: rgba(255,255,255,0.6);">Reinvest your budget into growth with highly competitive compensation models.</div>
          </div>
        </div>
      </div>

      <div class="contact-form-wrapper" style="padding: 40px; border: 1px solid var(--line); border-radius: 16px; background: rgba(255,255,255,0.03);">
        <h3 style="margin-bottom: 24px; font-size: 24px;">Let's build your team</h3>
        <form id="native-contact-form" onsubmit="event.preventDefault(); this.innerHTML='<div style=\\'text-align:center; padding: 40px;\\'><h4 style=\\'color:var(--sun); margin-bottom: 16px;\\'>Thanks for reaching out!</h4><p>We\\'ll be in touch shortly.</p></div>';" style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label for="name" style="font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8);">Full Name</label>
            <input type="text" id="name" required style="padding: 12px 16px; border-radius: 8px; border: 1px solid var(--line); background: rgba(0,0,0,0.2); color: white; font-family: inherit; font-size: 16px;">
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label for="email" style="font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8);">Work Email</label>
            <input type="email" id="email" required style="padding: 12px 16px; border-radius: 8px; border: 1px solid var(--line); background: rgba(0,0,0,0.2); color: white; font-family: inherit; font-size: 16px;">
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label for="company" style="font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8);">Company</label>
            <input type="text" id="company" required style="padding: 12px 16px; border-radius: 8px; border: 1px solid var(--line); background: rgba(0,0,0,0.2); color: white; font-family: inherit; font-size: 16px;">
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label for="message" style="font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8);">How can we help?</label>
            <textarea id="message" rows="4" required style="padding: 12px 16px; border-radius: 8px; border: 1px solid var(--line); background: rgba(0,0,0,0.2); color: white; font-family: inherit; font-size: 16px; resize: vertical;"></textarea>
          </div>
          <button type="submit" class="btn" style="margin-top: 8px; width: 100%; justify-content: center; background: var(--sun); color: var(--ink); border: none; font-weight: 600;">Get Started</button>
        </form>
      </div>
    </div>
  </section>`;

const startIndex = html.indexOf('<section class="sec wall" id="cities"');
const endIndex = html.indexOf('</section>', startIndex) + '</section>'.length;

if (startIndex !== -1 && endIndex > startIndex) {
    const finalHtml = html.substring(0, startIndex) + newSection + html.substring(endIndex);
    fs.writeFileSync('public/index.html', finalHtml, 'utf8');
    console.log("Successfully replaced the #cities section.");
} else {
    console.error("Could not find the section.");
}
