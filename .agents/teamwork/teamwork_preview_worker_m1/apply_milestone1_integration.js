const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../../');
const indexPath = path.join(rootDir, 'public', 'index.html');
const stylesPath = path.join(rootDir, 'public', 'styles.css');

console.log("Reading public/index.html...");
let html = fs.readFileSync(indexPath, 'utf8');

// 1. HERO UPDATE
// Target:
// <section class="hero" aria-labelledby="hero-title">
// Update to:
// <section class="hero" id="heroSection" aria-labelledby="hero-title">
// Add vy-rv to h1, cta, console. Add data-spotlight to console.
const oldHero = `<section class="hero" aria-labelledby="hero-title">
    <div class="wrap">
      <div>
        <span class="route"><i></i>LATAM &rarr; US</span>
        <h1 id="hero-title">Senior GTM and engineering teams, <em>augmented with AI.</em></h1>
        <p class="lede">Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents. GTM engineers, SDRs and developers on your hours, with more done by every person.</p>
        <div class="cta">
          <a class="btn btn-sun" href="#save">Get a quote <span class="arr">&rarr;</span></a>
          <a class="btn btn-ghost" href="#gtm">See the GTM system</a>
        </div>
      </div>

      <div class="console" aria-label="Example of an orchestrated GTM team at work">`;

const newHero = `<section class="hero" id="heroSection" aria-labelledby="hero-title">
    <div class="wrap">
      <div>
        <span class="route"><i></i>LATAM &rarr; US</span>
        <h1 id="hero-title" class="vy-rv">Senior GTM and engineering teams, <em>augmented with AI.</em></h1>
        <p class="lede">Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents. GTM engineers, SDRs and developers on your hours, with more done by every person.</p>
        <div class="cta vy-rv">
          <a class="btn btn-sun" href="#save">Get a quote <span class="arr">&rarr;</span></a>
          <a class="btn btn-ghost" href="#gtm">See the GTM system</a>
        </div>
      </div>

      <div class="console vy-rv" data-spotlight aria-label="Example of an orchestrated GTM team at work">`;

if (!html.includes(oldHero)) {
  console.error("ERROR: oldHero target not found in index.html");
  process.exit(1);
}
html = html.replace(oldHero, newHero);
console.log("[OK] Hero section updated.");

// 2. SECTION #what UPDATE
// Target:
// <section class="sec" id="what" aria-labelledby="what-title">
// ...
// </div>
// </section>
const oldWhat = `  <section class="sec" id="what" aria-labelledby="what-title">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">What we do</span>
        <h2 id="what-title">Teams that sell, build and ship with AI in the loop.</h2>
      </div>
      <div class="offers">
        <article class="offer lead">
          <span class="tag">GTM</span>
          <h3>GTM engineers and teams</h3>
          <p>The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.</p>
          <ul class="chips"><li>Outbound</li><li>Enrichment</li><li>CRM</li><li>RevOps</li><li>SDRs</li></ul>
        </article>
        <article class="offer">
          <span class="tag">Orchestrated</span>
          <h3>Orchestrated teams</h3>
          <p>A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.</p>
          <ul class="chips"><li>Agents</li><li>Workflows</li><li>Human review</li></ul>
        </article>
        <article class="offer">
          <span class="tag">Engineering</span>
          <h3>AI-augmented engineering</h3>
          <p>Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.</p>
          <ul class="chips"><li>Web</li><li>Mobile</li><li>Data</li><li>Cloud</li></ul>
        </article>
      </div>
      <div class="start">
        <span class="label">Two ways to start</span>
        <div class="opt">
          <h4>Add people to your team</h4>
          <p>You lead. They join your Slack, your standups and your tools from day one.</p>
        </div>
        <div class="opt">
          <h4>Hand us a goal</h4>
          <p>A Vayra squad owns it, from discovery to production or from first signal to booked meeting.</p>
        </div>
      </div>
    </div>
  </section>`;

const newWhat = `  <section class="sec" id="what" aria-labelledby="what-title">
    <div class="wrap vy-rail-wrap">
      <div class="vy-rail-head vy-rv">
        <div class="sec-head" style="margin-bottom:0">
          <span class="eyebrow">What we do</span>
          <h2 id="what-title">Teams that sell, build and ship with AI in the loop.</h2>
        </div>
        <div class="vy-rail-actions" aria-label="Talent carousel controls">
          <button class="vy-rail-btn" id="railPrev" type="button" aria-label="Previous offers" disabled>&larr;</button>
          <button class="vy-rail-btn" id="railNext" type="button" aria-label="Next offers">&rarr;</button>
        </div>
      </div>
      <div class="offers vy-rail" id="talentRail" tabindex="0" aria-label="Talent offers carousel">
        <article class="offer lead vy-pcard vy-rv" data-spotlight>
          <span class="tag">GTM</span>
          <h3>GTM engineers and teams</h3>
          <p>The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.</p>
          <ul class="chips"><li>Outbound</li><li>Enrichment</li><li>CRM</li><li>RevOps</li><li>SDRs</li></ul>
        </article>
        <article class="offer vy-pcard vy-rv" data-spotlight>
          <span class="tag">Orchestrated</span>
          <h3>Orchestrated teams</h3>
          <p>A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.</p>
          <ul class="chips"><li>Agents</li><li>Workflows</li><li>Human review</li></ul>
        </article>
        <article class="offer vy-pcard vy-rv" data-spotlight>
          <span class="tag">Engineering</span>
          <h3>AI-augmented engineering</h3>
          <p>Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.</p>
          <ul class="chips"><li>Web</li><li>Mobile</li><li>Data</li><li>Cloud</li></ul>
        </article>
      </div>
      <div class="start vy-rv">
        <span class="label">Two ways to start</span>
        <div class="opt" data-spotlight>
          <h4>Add people to your team</h4>
          <p>You lead. They join your Slack, your standups and your tools from day one.</p>
        </div>
        <div class="opt" data-spotlight>
          <h4>Hand us a goal</h4>
          <p>A Vayra squad owns it, from discovery to production or from first signal to booked meeting.</p>
        </div>
      </div>
    </div>
  </section>`;

if (!html.includes(oldWhat)) {
  console.error("ERROR: oldWhat target not found in index.html");
  process.exit(1);
}
html = html.replace(oldWhat, newWhat);
console.log("[OK] Section #what updated.");

// 3. SECTION #gtm UPDATE
// Target:
// <div class="loop" role="table" aria-label="Who does what at each GTM stage">
const oldGtmLoop = `      <div class="loop" role="table" aria-label="Who does what at each GTM stage">`;

const newGtmInteractive = `      <!-- Interactive Split Process Panels / 5-Stage Tabs -->
      <div class="vy-gtm-interactive vy-rv" id="gtmInteractive">
        <div class="vy-gtm-nav" role="tablist" aria-label="GTM Stages">
          <button class="vy-gtm-tab active" role="tab" aria-selected="true" data-stage="0" id="gtmTab0"><span class="vy-gtm-num">01</span> Signals</button>
          <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="1" id="gtmTab1"><span class="vy-gtm-num">02</span> Research</button>
          <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="2" id="gtmTab2"><span class="vy-gtm-num">03</span> Outreach</button>
          <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="3" id="gtmTab3"><span class="vy-gtm-num">04</span> Conversations</button>
          <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="4" id="gtmTab4"><span class="vy-gtm-num">05</span> Pipeline</button>
        </div>
        <div class="vy-gtm-panel" id="gtmPanel" aria-live="polite">
          <div class="vy-gtm-card vy-gtm-card-agent" data-spotlight>
            <div class="vy-gtm-card-head">
              <span class="who">agent</span>
              <span class="vy-gtm-stage-name" id="gtmAgentStage">Signals</span>
            </div>
            <p class="vy-gtm-card-body" id="gtmAgentText">Watch hiring, funding and product news across your market.</p>
          </div>
          <div class="vy-gtm-card vy-gtm-card-person" data-spotlight>
            <div class="vy-gtm-card-head">
              <span class="who">person</span>
              <span class="vy-gtm-stage-name" id="gtmPersonStage">Signals</span>
            </div>
            <p class="vy-gtm-card-body" id="gtmPersonText">Decide which signals are worth acting on.</p>
          </div>
        </div>
      </div>

      <div class="loop vy-rv" role="table" aria-label="Who does what at each GTM stage">`;

if (!html.includes(oldGtmLoop)) {
  console.error("ERROR: oldGtmLoop target not found in index.html");
  process.exit(1);
}
html = html.replace(oldGtmLoop, newGtmInteractive);
console.log("[OK] Section #gtm updated.");

// 4. SECTION #how UPDATE
// Target:
const oldHow = `  <section class="sec" id="how" aria-labelledby="how-title">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">How we work</span>
        <h2 id="how-title">You only meet people we would hire ourselves.</h2>
      </div>
      <ol class="flow" aria-label="From first call to ongoing support">
        <li><span>Intro call</span></li>
        <li><span>Calibrate</span></li>
        <li><span>Shortlist</span></li>
        <li><span>Kickoff</span></li>
        <li><span>Ongoing support</span></li>
      </ol>
      <p class="how-text">We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.</p>

      <div class="pair">
        <article>
          <span class="eyebrow">Time zones</span>
          <h3>Your hours, not ours.</h3>
          <p>Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.</p>
        </article>
        <article>
          <span class="eyebrow">After the hire</span>
          <h3>We stay after the hire.</h3>
          <p>We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together.</p>
        </article>
      </div>
    </div>
  </section>`;

const newHow = `  <section class="sec" id="how" aria-labelledby="how-title">
    <div class="wrap">
      <div class="sec-head vy-rv">
        <span class="eyebrow">How we work</span>
        <h2 id="how-title">You only meet people we would hire ourselves.</h2>
      </div>
      <ol class="flow vy-rv" aria-label="From first call to ongoing support">
        <li><span>Intro call</span></li>
        <li><span>Calibrate</span></li>
        <li><span>Shortlist</span></li>
        <li><span>Kickoff</span></li>
        <li><span>Ongoing support</span></li>
      </ol>
      <p class="how-text vy-rv">We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.</p>

      <div class="pair">
        <article class="vy-rv" data-spotlight>
          <span class="eyebrow">Time zones</span>
          <h3>Your hours, not ours.</h3>
          <p>Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.</p>
        </article>
        <article class="vy-rv" data-spotlight>
          <span class="eyebrow">After the hire</span>
          <h3>We stay after the hire.</h3>
          <p>We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together.</p>
        </article>
      </div>
    </div>
  </section>`;

if (!html.includes(oldHow)) {
  console.error("ERROR: oldHow target not found in index.html");
  process.exit(1);
}
html = html.replace(oldHow, newHow);
console.log("[OK] Section #how updated.");

// 5. SECTION #faq UPDATE
// Target:
const oldFaqStart = `  <section class="sec" id="faq" aria-labelledby="faq-title" style="padding-top:0">
    <div class="wrap faq">
      <div class="sec-head" style="margin-bottom:0">
        <span class="eyebrow">FAQ</span>
        <h2 id="faq-title">Questions we hear first.</h2>
      </div>
      <div>`;

const newFaqStart = `  <section class="sec" id="faq" aria-labelledby="faq-title" style="padding-top:0">
    <div class="wrap faq">
      <div class="sec-head vy-rv" style="margin-bottom:0">
        <span class="eyebrow">FAQ</span>
        <h2 id="faq-title">Questions we hear first.</h2>
      </div>
      <div class="vy-faq-search-wrap vy-rv">
        <div class="vy-faq-search-box">
          <svg class="vy-faq-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="search" id="faqSearchInput" class="vy-faq-input" placeholder="Search questions (e.g., pricing, SDRs, LATAM...)" aria-label="Search frequently asked questions" autocomplete="off" />
          <button type="button" id="faqClearBtn" class="vy-faq-clear" aria-label="Clear search" style="display:none;">&times;</button>
        </div>
        <div class="vy-faq-count" id="faqCount" aria-live="polite">Showing all 9 questions</div>
      </div>
      <div id="faqList" class="vy-faq-list">`;

if (!html.includes(oldFaqStart)) {
  console.error("ERROR: oldFaqStart target not found in index.html");
  process.exit(1);
}
html = html.replace(oldFaqStart, newFaqStart);

// Replace closing div of FAQ with empty state and closing div
const oldFaqEnd = `        <details>
          <summary>Where are your people based?</summary>
          <p>Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones.</p>
        </details>
      </div>
    </div>
  </section>`;

const newFaqEnd = `        <details>
          <summary>Where are your people based?</summary>
          <p>Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones.</p>
        </details>
        <div class="vy-faq-empty" id="faqEmpty" style="display:none;" role="status">
          <p>No questions found matching "<span id="faqQueryText"></span>"</p>
          <button class="btn btn-ghost" type="button" id="faqResetBtn">Clear search</button>
        </div>
      </div>
    </div>
  </section>`;

if (!html.includes(oldFaqEnd)) {
  console.error("ERROR: oldFaqEnd target not found in index.html");
  process.exit(1);
}
html = html.replace(oldFaqEnd, newFaqEnd);
console.log("[OK] Section #faq updated.");

// 6. CURSOR DOM ELEMENTS AND VANILLA JS SCRIPT BEFORE </body>
const oldBeforeBody = `<!-- Start of HubSpot Embed Code -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/43876008.js"></script>
<!-- End of HubSpot Embed Code -->
</body>`;

const newBeforeBody = `<!-- Ambient Cursor DOM Elements -->
<div class="vy-cursor-dot" id="vyCursorDot" aria-hidden="true"></div>
<div class="vy-cursor-ring" id="vyCursorRing" aria-hidden="true"></div>

<!-- Vayra UI Enhancement Engine (Abstra Reference Synthesis) -->
<script id="vy-enhancements">
(function() {
  'use strict';

  // 1. Mark JS enabled for progressive enhancement scroll reveals
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // 2. Scroll Reveal Engine (.vy-rv)
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.vy-rv'));
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function(el) { el.classList.add('vy-in'); });
    } else {
      var revealObserver = new IntersectionObserver(function(entries, obs) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('vy-in');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
      reveals.forEach(function(el) { revealObserver.observe(el); });
    }
  }

  // 3. Hero Ambient Flashlight Tracking
  var hero = document.getElementById('heroSection');
  if (hero && !reduceMotion) {
    var curX = window.innerWidth * 0.75, curY = 250;
    var tarX = curX, tarY = curY;
    var heroRaf = null;

    function renderHeroGlow() {
      curX += (tarX - curX) * 0.12;
      curY += (tarY - curY) * 0.12;
      hero.style.setProperty('--gx', curX.toFixed(1) + 'px');
      hero.style.setProperty('--gy', curY.toFixed(1) + 'px');
      if (Math.abs(tarX - curX) > 0.5 || Math.abs(tarY - curY) > 0.5) {
        heroRaf = requestAnimationFrame(renderHeroGlow);
      } else {
        heroRaf = null;
      }
    }

    hero.addEventListener('pointermove', function(e) {
      var rect = hero.getBoundingClientRect();
      tarX = e.clientX - rect.left;
      tarY = e.clientY - rect.top;
      if (!heroRaf) heroRaf = requestAnimationFrame(renderHeroGlow);
    }, { passive: true });
  }

  // 4. Custom Pointer (Cursor Dot & Magnetic Ring)
  var cursorDot = document.getElementById('vyCursorDot');
  var cursorRing = document.getElementById('vyCursorRing');
  if (cursorDot && cursorRing && finePointer && !reduceMotion) {
    var dotX = 0, dotY = 0;
    var ringX = 0, ringY = 0;
    var ringTarX = 0, ringTarY = 0;
    var ringRaf = null;

    function renderRing() {
      ringX += (ringTarX - ringX) * 0.2;
      ringY += (ringTarY - ringY) * 0.2;
      cursorRing.style.transform = 'translate(' + ringX.toFixed(1) + 'px, ' + ringY.toFixed(1) + 'px) translate(-50%, -50%)';
      if (Math.abs(ringTarX - ringX) > 0.3 || Math.abs(ringTarY - ringY) > 0.3) {
        ringRaf = requestAnimationFrame(renderRing);
      } else {
        ringRaf = null;
      }
    }

    window.addEventListener('pointermove', function(e) {
      if (!document.body.classList.contains('vy-has-pointer')) {
        document.body.classList.add('vy-has-pointer');
      }
      dotX = e.clientX;
      dotY = e.clientY;
      ringTarX = e.clientX;
      ringTarY = e.clientY;
      cursorDot.style.transform = 'translate(' + dotX + 'px, ' + dotY + 'px) translate(-50%, -50%)';
      if (!ringRaf) ringRaf = requestAnimationFrame(renderRing);
    }, { passive: true });

    document.addEventListener('pointerover', function(e) {
      if (e.target.closest('a, button, input, summary, [data-spotlight], .vy-gtm-tab, .offer')) {
        document.body.classList.add('vy-hovering');
      }
    });

    document.addEventListener('pointerout', function(e) {
      if (e.target.closest('a, button, input, summary, [data-spotlight], .vy-gtm-tab, .offer')) {
        document.body.classList.remove('vy-hovering');
      }
    });

    document.addEventListener('mouseleave', function() {
      document.body.classList.remove('vy-has-pointer');
    });
  }

  // 5. Card Spotlight Cursor Tracking [data-spotlight]
  var spotlightCards = Array.prototype.slice.call(document.querySelectorAll('[data-spotlight]'));
  if (spotlightCards.length && !reduceMotion) {
    spotlightCards.forEach(function(card) {
      card.addEventListener('pointermove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mx', x.toFixed(1) + 'px');
        card.style.setProperty('--my', y.toFixed(1) + 'px');
      }, { passive: true });
    });
  }

  // 6. Talent Rail Carousel (#what)
  var rail = document.getElementById('talentRail');
  var railPrev = document.getElementById('railPrev');
  var railNext = document.getElementById('railNext');
  if (rail && railPrev && railNext) {
    function getRailStep() {
      var firstCard = rail.querySelector('.vy-pcard');
      return firstCard ? firstCard.offsetWidth + 20 : 340;
    }

    function updateRailButtons() {
      railPrev.disabled = rail.scrollLeft <= 5;
      railNext.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
    }

    railPrev.addEventListener('click', function() {
      rail.scrollBy({ left: -getRailStep(), behavior: 'smooth' });
    });

    railNext.addEventListener('click', function() {
      rail.scrollBy({ left: getRailStep(), behavior: 'smooth' });
    });

    rail.addEventListener('scroll', updateRailButtons, { passive: true });
    window.addEventListener('resize', updateRailButtons, { passive: true });
    updateRailButtons();
  }

  // 7. Interactive Split Process Panels / Tabs (#gtm)
  var gtmStages = [
    {
      name: "Signals",
      agent: "Watch hiring, funding and product news across your market.",
      person: "Decide which signals are worth acting on."
    },
    {
      name: "Research",
      agent: "Enrich accounts and contacts with what matters.",
      person: "Check every account against your real ICP."
    },
    {
      name: "Outreach",
      agent: "Draft first lines and sequences per account.",
      person: "Rewrite, approve and send in your voice."
    },
    {
      name: "Conversations",
      agent: "Summarize replies and calls into clean notes.",
      person: "Run the calls and build the relationship."
    },
    {
      name: "Pipeline",
      agent: "Keep the CRM updated without anyone chasing it.",
      person: "Report to you on what is moving and why."
    }
  ];

  var gtmTabs = Array.prototype.slice.call(document.querySelectorAll('.vy-gtm-tab'));
  var gtmAgentStage = document.getElementById('gtmAgentStage');
  var gtmAgentText = document.getElementById('gtmAgentText');
  var gtmPersonStage = document.getElementById('gtmPersonStage');
  var gtmPersonText = document.getElementById('gtmPersonText');
  var loopCols = Array.prototype.slice.call(document.querySelectorAll('.loop .stage'));
  var loopCellsA = Array.prototype.slice.call(document.querySelectorAll('.loop .cell.a'));
  var loopCellsP = Array.prototype.slice.call(document.querySelectorAll('.loop .cell.p'));

  function activateGtmStage(index) {
    if (!gtmStages[index]) return;
    gtmTabs.forEach(function(tab, i) {
      var isActive = (i === index);
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (gtmAgentStage) gtmAgentStage.textContent = gtmStages[index].name;
    if (gtmPersonStage) gtmPersonStage.textContent = gtmStages[index].name;
    if (gtmAgentText) gtmAgentText.textContent = gtmStages[index].agent;
    if (gtmPersonText) gtmPersonText.textContent = gtmStages[index].person;

    // Highlight corresponding table column in .loop if present
    loopCols.forEach(function(col, i) {
      col.classList.toggle('vy-active-col', i === index);
    });
    loopCellsA.forEach(function(cell, i) {
      cell.classList.toggle('vy-active-col', i === index);
    });
    loopCellsP.forEach(function(cell, i) {
      cell.classList.toggle('vy-active-col', i === index);
    });
  }

  if (gtmTabs.length) {
    gtmTabs.forEach(function(tab, idx) {
      tab.addEventListener('click', function() {
        activateGtmStage(idx);
      });
    });
    activateGtmStage(0);
  }

  // 8. Real-time FAQ Search & Filtering (#faq)
  var faqInput = document.getElementById('faqSearchInput');
  var faqClearBtn = document.getElementById('faqClearBtn');
  var faqResetBtn = document.getElementById('faqResetBtn');
  var faqCount = document.getElementById('faqCount');
  var faqList = document.getElementById('faqList');
  var faqEmpty = document.getElementById('faqEmpty');
  var faqQueryText = document.getElementById('faqQueryText');

  if (faqInput && faqList) {
    var faqItems = Array.prototype.slice.call(faqList.querySelectorAll('details'));
    var totalFaqs = faqItems.length;

    // Cache text for fast matching
    var faqData = faqItems.map(function(item, idx) {
      var summary = item.querySelector('summary');
      var p = item.querySelector('p');
      return {
        item: item,
        originalOpen: idx === 0, // line 1040: first item default open
        text: ((summary ? summary.textContent : '') + ' ' + (p ? p.textContent : '')).toLowerCase()
      };
    });

    function filterFaqs() {
      var query = faqInput.value.trim().toLowerCase();
      if (faqClearBtn) {
        faqClearBtn.style.display = query.length > 0 ? 'inline-block' : 'none';
      }

      if (!query) {
        faqData.forEach(function(d) {
          d.item.style.display = '';
          d.item.open = d.originalOpen;
        });
        if (faqEmpty) faqEmpty.style.display = 'none';
        if (faqCount) faqCount.textContent = 'Showing all ' + totalFaqs + ' questions';
        return;
      }

      var matchCount = 0;
      faqData.forEach(function(d) {
        if (d.text.indexOf(query) !== -1) {
          d.item.style.display = '';
          d.item.open = true;
          matchCount++;
        } else {
          d.item.style.display = 'none';
        }
      });

      if (matchCount === 0) {
        if (faqEmpty) {
          faqEmpty.style.display = 'block';
          if (faqQueryText) faqQueryText.textContent = faqInput.value.trim();
        }
        if (faqCount) faqCount.textContent = 'No questions found';
      } else {
        if (faqEmpty) faqEmpty.style.display = 'none';
        if (faqCount) faqCount.textContent = 'Showing ' + matchCount + ' of ' + totalFaqs + ' questions';
      }
    }

    faqInput.addEventListener('input', filterFaqs);

    function clearFaqSearch() {
      faqInput.value = '';
      filterFaqs();
      faqInput.focus();
    }

    if (faqClearBtn) faqClearBtn.addEventListener('click', clearFaqSearch);
    if (faqResetBtn) faqResetBtn.addEventListener('click', clearFaqSearch);

    // Dynamic rotating search placeholder
    var placeholders = [
      'Search questions (e.g., pricing, SDRs, LATAM...)',
      'Try searching "rates" or "cost"...',
      'Try searching "orchestrated"...',
      'Try searching "time zones"...',
      'Try searching "engineering"...'
    ];
    var placeholderIdx = 0;
    var isInputFocused = false;

    faqInput.addEventListener('focus', function() { isInputFocused = true; });
    faqInput.addEventListener('blur', function() { isInputFocused = false; });

    setInterval(function() {
      if (!isInputFocused && !faqInput.value) {
        placeholderIdx = (placeholderIdx + 1) % placeholders.length;
        faqInput.placeholder = placeholders[placeholderIdx];
      }
    }, 3800);
  }

})();
</script>

<!-- Start of HubSpot Embed Code -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/43876008.js"></script>
<!-- End of HubSpot Embed Code -->
</body>`;

if (!html.includes(oldBeforeBody)) {
  console.error("ERROR: oldBeforeBody target not found in index.html");
  process.exit(1);
}
html = html.replace(oldBeforeBody, newBeforeBody);
console.log("[OK] Cursor DOM and JS enhancements added.");

fs.writeFileSync(indexPath, html, 'utf8');
console.log("Successfully wrote enhanced public/index.html!");
