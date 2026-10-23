import re

def main():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. HTML Replacement
        old_calc_html = """<div class="calc">
            <h3>What a hire costs</h3>
            <div class="opt">
              <span class="opt-l" id="l-role">Role</span>
              <div class="roles" role="group" aria-labelledby="l-role">
                <button type="button" data-role="swe" aria-pressed="true">Software engineer</button>
                <button type="button" data-role="gtm" aria-pressed="false">GTM engineer</button>
                <button type="button" data-role="sdr" aria-pressed="false">SDR</button>
              </div>
            </div>
            <div class="opt">
              <span class="opt-l" id="l-level">Level</span>
              <div class="roles" role="group" aria-labelledby="l-level">
                <button type="button" data-level="semi" aria-pressed="false">Semi-senior</button>
                <button type="button" data-level="senior" aria-pressed="true">Senior</button>
                <button type="button" data-level="manager" aria-pressed="false">Manager</button>
              </div>
            </div>"""

        new_calc_html = """<div class="calc">
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
            </div>"""

        if old_calc_html in content:
            content = content.replace(old_calc_html, new_calc_html)
            print("Replaced old_calc_html")

        # We also need to remove the single count range
        old_count_html = """<div class="opt">
              <label class="opt-l" for="cnt-range">Team size: <output id="cnt" aria-live="polite">1</output> <span id="cnt-label">person</span></label>
              <input type="range" id="cnt-range" min="1" max="20" step="1" value="1">
            </div>"""
        if old_count_html in content:
            content = content.replace(old_count_html, "")
            print("Removed old_count_html")

        # 2. JS Replacement
        js_pattern = re.compile(r"var role = 'swe', level = 'senior', count = 1, per = 'year', benefitsPct = 30;.*?document\.querySelectorAll\('\[data-level\]'\)\.forEach\(function\(el\)\{ el\.addEventListener\('click', function\(\)\{ level = el\.getAttribute\('data-level'\); renderCalc\(\); \}\); \}\);\n\s*document\.querySelectorAll\('\[data-per\]'\)\.forEach\(function\(el\)\{ el\.addEventListener\('click', function\(\)\{ per = el\.getAttribute\('data-per'\); renderCalc\(\); \}\); \}\);\n\s*\$\('cnt-range'\)\.addEventListener\('input', function\(e\)\{ count = parseInt\(e\.target\.value, 10\) \|\| 1; renderCalc\(\); \}\);\n\s*var br = \$\('ben-range'\); if \(br\) br\.addEventListener\('input', function\(e\)\{ benefitsPct = parseInt\(e\.target\.value, 10\) \|\| 0; \$\('ben'\)\.textContent = benefitsPct; renderCalc\(\); \}\);", re.DOTALL)

        new_js = """var teamCounts = { swe: 1, gtm: 0, sdr: 0 };
    var teamLevels = { swe: 'senior', gtm: 'senior', sdr: 'senior' };
    var per = 'year', benefitsPct = 30;
    var ROLE_NAMES = {swe:'software engineer', gtm:'GTM engineer', sdr:'SDR'};
    var LEVELS = {semi:'Semi-senior', senior:'Senior', manager:'Manager'};
    var SWE_SCALE = {semi:0.8, senior:1, manager:1.3};
    var GTM_US = {semi:110000, senior:145000, manager:180000};
    var SDR_US = {semi:60000, senior:85000, manager:110000};
    var RATES = { swe:{semi:{h:50}, senior:{h:70}, manager:{h:100}}, gtm:{semi:{h:50}, senior:{h:70}, manager:{h:100}}, sdr:{semi:{m:3000}, senior:{m:4500}, manager:{m:6000}} };
    var HOURS = 160;
    var PERSON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/></svg>';
    var NOTES = {swe:'US rates vary by city. We default to New York, but you can choose another hub.', gtm:'US rates vary by city, we use a national average here.', sdr:'US rates vary by city, we use a national average here.'};

    function usSalary(r, l) {
      if (r === 'swe') return coast.swe * SWE_SCALE[l];
      if (r === 'gtm') return GTM_US[l];
      return SDR_US[l];
    }
    function vayraYear(r, l) { var rt = RATES[r][l]; return rt.h ? rt.h * HOURS * 12 : rt.m * 12; }

    var anims = {};
    function tween(id, val){
      var el = $(id), start = parseFloat(el.getAttribute('data-v')) || 0, change = val - start, startTime = null, duration = Math.min(800, Math.max(300, Math.abs(change)/100));
      if (anims[id]) cancelAnimationFrame(anims[id]);
      if (Math.abs(change) < 1) { el.textContent = fmt(val); el.setAttribute('data-v', val); return; }
      function step(ts){
        if (!startTime) startTime = ts;
        var progress = Math.min(1, (ts - startTime) / duration);
        var cur = start + change * (0.5 - Math.cos(progress * Math.PI) / 2);
        el.textContent = fmt(cur);
        if (progress < 1) { anims[id] = requestAnimationFrame(step); } else { el.setAttribute('data-v', val); }
      }
      requestAnimationFrame(step);
    }

    var fmt = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };

    function quoteHref(){
      var who = Object.keys(teamCounts).filter(function(r){ return teamCounts[r]>0; }).map(function(r){ return teamCounts[r] + ' ' + ROLE_NAMES[r] + (teamCounts[r]>1?'s':'') + ' (' + LEVELS[teamLevels[r]].toLowerCase() + ')'; }).join(', ');
      if (!who) who = 'a team';
      var body = 'Hi Vayra,\\n\\nWe are looking for: ' + who + '\\nOur team is in: ' + coast.city + ' (' + coast.region + ')\\nIdeal start date: \\n\\nThanks,\\n';
      return 'mailto:hello@vayra.team?subject=' + encodeURIComponent('Quote: ' + who) + '&body=' + encodeURIComponent(body);
    }
    
    function people(ratio){
      var box = $('people');
      if(box) {
         box.innerHTML = '';
      }
    }

    function renderCalc(){
      var div = per === 'month' ? 12 : 1;
      var totalUS = 0, totalLA = 0;
      var totalCount = 0;
      Object.keys(teamCounts).forEach(function(r) {
         var c = teamCounts[r];
         var l = teamLevels[r];
         totalCount += c;
         if(c > 0) {
           var usOne = usSalary(r, l) / (1 - (benefitsPct/100));
           var laOne = vayraYear(r, l);
           totalUS += (usOne * c / div);
           totalLA += (laOne * c / div);
         }
      });
      
      $('t-us').textContent = 'US team cost, salary + benefits (' + totalCount + ' people)';
      $('t-la').textContent = 'Vayra team total (' + totalCount + ' people)';
      tween('v-us', totalUS); tween('v-la', totalLA); tween('v-gap', Math.max(0, totalUS - totalLA));
      var gapL = $('gap-l'); if(gapL) gapL.textContent = 'You save up to, ' + (per === 'month' ? 'per month' : 'per year');
      
      var br = $('ben-range'); if(br) { br.value = benefitsPct; br.style.setProperty('--p', (benefitsPct / 60 * 100) + '%'); }
      document.querySelectorAll('[data-per]').forEach(function(el){ el.setAttribute('aria-pressed', el.getAttribute('data-per') === per ? 'true' : 'false'); });
      $('b-us').style.width = '100%'; $('b-la').style.width = totalUS > 0 ? Math.min(100, totalLA/totalUS*100).toFixed(1) + '%' : '0%';
      
      var eqText = $('eq-text');
      if (eqText) eqText.innerHTML = 'Build your ideal combination of engineers and GTM pros above to see how the costs compare.';
      people(1);

      // Update DOM counts
      Object.keys(teamCounts).forEach(function(r) {
         var el = $('count-' + r);
         if(el) el.textContent = teamCounts[r];
      });

      var href = quoteHref(); var qb = $('quote-btn'); if(qb) qb.setAttribute('href', href); var xq = $('exit-quote'); if (xq) xq.setAttribute('href', href);
    }
    calcReady = true;

    // Attach team builder events
    document.querySelectorAll('.ctrl-btn.plus').forEach(function(btn){
       btn.addEventListener('click', function(){
          var target = btn.getAttribute('data-target');
          teamCounts[target]++;
          renderCalc();
       });
    });
    document.querySelectorAll('.ctrl-btn.minus').forEach(function(btn){
       btn.addEventListener('click', function(){
          var target = btn.getAttribute('data-target');
          if(teamCounts[target] > 0) teamCounts[target]--;
          renderCalc();
       });
    });
    document.querySelectorAll('.level-select').forEach(function(sel){
       sel.addEventListener('change', function(){
          var target = sel.getAttribute('data-role-id');
          teamLevels[target] = sel.value;
          renderCalc();
       });
    });

    document.querySelectorAll('[data-per]').forEach(function(el){ el.addEventListener('click', function(){ per = el.getAttribute('data-per'); renderCalc(); }); });
    var br = $('ben-range'); if (br) br.addEventListener('input', function(e){ benefitsPct = parseInt(e.target.value, 10) || 0; var bel=$('ben'); if(bel) bel.textContent = benefitsPct; renderCalc(); });"""
        
        # Make sure the match works
        match = js_pattern.search(content)
        if match:
            content = content[:match.start()] + new_js + content[match.end():]
            print("Replaced JS!")
        else:
            print("Could not match JS pattern")
        
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("Done.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
