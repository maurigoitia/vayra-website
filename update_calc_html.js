const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');

const calcRegex = /<div class="calc">[\s\S]*?<div class="opt two">/;

const new_calc_html = `<div class="calc">
          <h3>What your team costs</h3>
          
          <div class="team-builder">
            <div class="opt-l" style="margin-bottom: 16px;">Add roles to your team</div>
            
            <div class="team-role" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
              <div class="team-role-info" style="display:flex; flex-direction:column; gap:4px;">
                <strong style="color:var(--fg);">Software engineer</strong>
                <select class="level-select dark" data-role-id="swe" style="background:var(--ink-2); color:var(--fg); border:1px solid var(--line); border-radius:6px; padding:4px;">
                  <option value="semi">Semi-senior</option>
                  <option value="senior" selected>Senior</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div class="counter-ctrl" style="display:flex; align-items:center; gap:12px; background:var(--ink-2); padding:4px; border-radius:999px; border:1px solid var(--line);">
                <button type="button" class="ctrl-btn minus" data-target="swe" style="width:28px; height:28px; border-radius:50%; border:none; background:transparent; color:var(--fg); cursor:pointer;">&minus;</button>
                <span class="count-display" id="count-swe" style="min-width:16px; text-align:center; font-weight:600;">1</span>
                <button type="button" class="ctrl-btn plus" data-target="swe" style="width:28px; height:28px; border-radius:50%; border:none; background:transparent; color:var(--fg); cursor:pointer;">+</button>
              </div>
            </div>
            
            <div class="team-role" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
              <div class="team-role-info" style="display:flex; flex-direction:column; gap:4px;">
                <strong style="color:var(--fg);">GTM engineer</strong>
                <select class="level-select dark" data-role-id="gtm" style="background:var(--ink-2); color:var(--fg); border:1px solid var(--line); border-radius:6px; padding:4px;">
                  <option value="semi">Semi-senior</option>
                  <option value="senior" selected>Senior</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div class="counter-ctrl" style="display:flex; align-items:center; gap:12px; background:var(--ink-2); padding:4px; border-radius:999px; border:1px solid var(--line);">
                <button type="button" class="ctrl-btn minus" data-target="gtm" style="width:28px; height:28px; border-radius:50%; border:none; background:transparent; color:var(--fg); cursor:pointer;">&minus;</button>
                <span class="count-display" id="count-gtm" style="min-width:16px; text-align:center; font-weight:600;">0</span>
                <button type="button" class="ctrl-btn plus" data-target="gtm" style="width:28px; height:28px; border-radius:50%; border:none; background:transparent; color:var(--fg); cursor:pointer;">+</button>
              </div>
            </div>
            
            <div class="team-role" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
              <div class="team-role-info" style="display:flex; flex-direction:column; gap:4px;">
                <strong style="color:var(--fg);">SDR</strong>
                <select class="level-select dark" data-role-id="sdr" style="background:var(--ink-2); color:var(--fg); border:1px solid var(--line); border-radius:6px; padding:4px;">
                  <option value="semi">Semi-senior</option>
                  <option value="senior" selected>Senior</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div class="counter-ctrl" style="display:flex; align-items:center; gap:12px; background:var(--ink-2); padding:4px; border-radius:999px; border:1px solid var(--line);">
                <button type="button" class="ctrl-btn minus" data-target="sdr" style="width:28px; height:28px; border-radius:50%; border:none; background:transparent; color:var(--fg); cursor:pointer;">&minus;</button>
                <span class="count-display" id="count-sdr" style="min-width:16px; text-align:center; font-weight:600;">0</span>
                <button type="button" class="ctrl-btn plus" data-target="sdr" style="width:28px; height:28px; border-radius:50%; border:none; background:transparent; color:var(--fg); cursor:pointer;">+</button>
              </div>
            </div>
          </div>
          <div class="opt two">`;

if (calcRegex.test(content)) {
    content = content.replace(calcRegex, new_calc_html);
    console.log("Replaced calc html");
}

const cntRegex = /<div class="opt">\s*<label class="opt-l" for="cnt-range">Team size:[\s\S]*?<\/div>/;
if (cntRegex.test(content)) {
    content = content.replace(cntRegex, "");
    console.log("Removed old count html");
}

fs.writeFileSync('index.html', content);
console.log("Done");
