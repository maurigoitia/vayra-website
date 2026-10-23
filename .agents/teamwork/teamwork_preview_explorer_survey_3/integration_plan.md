# Vayra Landing Page UI/UX Integration Plan: Abstra Reference Synthesis

**Author**: Explorer 3 (Survey Team)  
**Target Environment**: `C:\Users\mauri\.gemini\antigravity\scratch\media_1792004477748_37e8ade1`  
**Reference Document**: Abstra Home v2 (`media_1792069901266_eba27c2d.html`, 557,450 bytes)  
**Target File**: `public/index.html` & `public/styles.css`  
**Core Directives**: Zero copy alteration (100% text locked); Seamless dark theme integration; Zero console errors; Clean namespacing.

---

## 1. Executive Summary & Architectural Strategy

The objective is to integrate the most compelling and high-converting modern UI/UX components from the **Abstra reference design** into the **Vayra landing page**, elevating the user experience into a world-class AI + talent showcase while **strictly preserving every single word of Vayra's marketing copy**.

### Key Architectural Strengths of Abstra:
1. **Pure Vanilla Web Architecture**: Abstra uses zero runtime bloat — no heavy React, Vue, or GSAP dependencies. Everything is implemented using lightweight, standard modern web APIs (`IntersectionObserver`, `requestAnimationFrame`, `matchMedia`, CSS variables, CSS grid).
2. **Elevated Micro-Interactions**: Ambient pointer tracking, dynamic card spotlights, snap-scroll horizontal rails, interactive multi-lane process accordions, and instant natural-language FAQ filtering.
3. **Graceful Progressive Degradation**: Content remains 100% accessible and readable if JavaScript fails or when `prefers-reduced-motion: reduce` is enabled.

### Integration Strategy for Vayra:
- **Non-Destructive Namespacing (`vy-` Prefix)**: To avoid destructive CSS cascading conflicts with Vayra's existing classes (`.cell`, `.row`, `.on`, `.tag`, `.btn`), all ported Abstra styles and components will be namespaced or scoped.
- **Deep Theme Synchronization**: Map Abstra's color scheme directly into Vayra's canonical dark navy design tokens (`--ink: #0A0F1F`, `--ink-2: #111934`, `--sun: #FFB547` / `#EA580C`, `--sky: #8CC8EE`, `--leaf: #7ED3A6`).
- **Verbatim Copy Ingestion**: Wrap existing locked text blocks in modernized structural layouts without altering titles, paragraphs, chips, or bullet points.

---

## 2. Design Token Translation & Theme Architecture

Abstra utilizes a high-contrast corporate palette with royal blues (`#2727CD`), teals (`#98CECE`), and deep navy (`#0b0b24`). Vayra features an Andes-inspired tech aesthetic combining deep navy, warm golden amber sun (`--sun`), leaf green (`--leaf`), and sky blue (`--sky`).

### Token Mapping Matrix

| Design Role | Abstra Token / Value | Vayra Canonical Token | Vayra Value / Expression | Usage in Ported Components |
|---|---|---|---|---|
| **Page Canvas** | `--ink: #0b0b24` | `--ink` | `#0A0F1F` (Dark) / `#FAFAFA` (Base) | Base background for containers |
| **Elevated Surface** | `--white: #fff` / `#161B33` | `--ink-2` | `#111934` (Navy) / `#FFFFFF` | Cards, rails, panels, interactive states |
| **Hover Surface** | `--tint: #eef0ff` | `--ink-3` | `#1A2447` (Navy tint) / `#F3F4F6` | Card hover fills, active tab indicators |
| **Borders & Dividers** | `--line: #e4e5ee` | `--line` | `#24305A` (Dark line) / `#E5E7EB` | Structural borders, rail separators |
| **Primary Accent** | `--blue: #2727CD` | `--sun` | `#FFB547` / `#EA580C` | Primary glows, active badges, focus rings |
| **Secondary Accent** | `--teal: #98CECE` | `--sky` | `#8CC8EE` / `#3B82F6` | Tech pills, secondary highlights, ambient glow |
| **Agent / Status** | `#10B981` | `--leaf` | `#7ED3A6` / `#059669` | AI agent status, online indicators |
| **Primary Text** | `--text: #16162e` / `#fff` | `--fg` | `#EEF1FA` / `#111827` | Headings, card titles, body copy |
| **Muted Text** | `--muted: #5b5e78` | `--muted` | `#A5AECB` / `#6B7280` | Subtitles, labels, metadata |
| **Card Radius** | `--r: 20px` | `--r` | `14px` / `16px` | Consistent rounded corner geometry |
| **Easing Function** | `--ease: cubic-bezier(.16,1,.3,1)` | `--ease` | `cubic-bezier(.16,1,.3,1)` | Fluid spring-like transitions |

```css
/* Scoped Dark Theme Adaptations for Ported Components */
.vy-component-root {
  --vy-bg: var(--ink-2);
  --vy-border: var(--line);
  --vy-accent: var(--sun);
  --vy-tech: var(--sky);
  --vy-agent: var(--leaf);
  --vy-text: var(--fg);
  --vy-muted: var(--muted);
  --vy-glow: color-mix(in srgb, var(--sun) 14%, transparent);
}
```

---

## 3. Component-by-Component Integration Blueprint

### Component A: Ambient Cursor Flashlight & Interactive Pointer Tracking

#### 1. Architectural Role
In Abstra (`#ab-top`), mouse movement calculates coordinates `(--gx, --gy)` to position a smooth radial gradient flashlight behind the hero content. Explorer 2's survey also specifies a custom dual-tier pointer tracker (precision dot + magnetic aura ring).

#### 2. Vayra Adaptation
- **Hero Flashlight**: Apply `--gx` and `--gy` ambient flashlight to `.hero::before` using Vayra's `--sun` and `--sky` hues.
- **Custom Pointer Tracker**: A lightweight (1.1KB), zero-dependency cursor tracking system dynamically injected only on desktop viewports (`(pointer: fine)` and `(hover: hover)`), auto-disabled on touch devices and `prefers-reduced-motion`.
- **Target Location in Vayra**: Section 2 (`.hero`) for flashlight; Global `body` for cursor tracking.

#### 3. CSS Implementation
```css
/* Hero Ambient Flashlight */
.hero {
  --gx: 50vw;
  --gy: 350px;
}
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(650px circle at var(--gx, 80%) var(--gy, 20%), 
      color-mix(in srgb, var(--sun) 18%, transparent) 0%, 
      color-mix(in srgb, var(--sky) 8%, transparent) 40%, 
      transparent 70%),
    linear-gradient(var(--line) 1px, transparent 1px) 0 0/56px 56px,
    linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0/56px 56px;
  opacity: .6;
  mask-image: linear-gradient(to bottom, #000 50%, transparent);
  transition: opacity .3s ease;
}

/* Custom Pointer System */
.vy-cursor-dot, .vy-cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  border-radius: 50%;
  transform: translate3d(-50%, -50%, 0);
  will-change: transform;
}
.vy-cursor-dot {
  width: 6px;
  height: 6px;
  background: var(--sun);
  transition: opacity .2s ease, transform .2s ease;
}
.vy-cursor-ring {
  width: 38px;
  height: 38px;
  border: 1.5px solid color-mix(in srgb, var(--sun) 45%, transparent);
  background: color-mix(in srgb, var(--sun) 6%, transparent);
  transition: width .25s ease, height .25s ease, border-color .25s ease, background-color .25s ease;
}
body.vy-hover .vy-cursor-ring {
  width: 58px;
  height: 58px;
  border-color: var(--sun);
  background: color-mix(in srgb, var(--sun) 15%, transparent);
}
body.vy-hover .vy-cursor-dot {
  opacity: 0.2;
  transform: translate3d(-50%, -50%, 0) scale(0.4);
}
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .vy-cursor-dot, .vy-cursor-ring { display: none !important; }
}
```

#### 4. JavaScript Logic
```javascript
(function initPointerSystem() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const hero = document.querySelector('.hero');
  
  // 1. Hero Flashlight
  if (hero && !reduce) {
    let cur = { x: window.innerWidth * 0.75, y: 250 };
    let tar = { x: window.innerWidth * 0.75, y: 250 };
    let raf = null;
    function updateGlow() {
      cur.x += (tar.x - cur.x) * 0.12;
      cur.y += (tar.y - cur.y) * 0.12;
      hero.style.setProperty('--gx', cur.x.toFixed(1) + 'px');
      hero.style.setProperty('--gy', cur.y.toFixed(1) + 'px');
      if (Math.abs(tar.x - cur.x) > 0.5 || Math.abs(tar.y - cur.y) > 0.5) {
        raf = requestAnimationFrame(updateGlow);
      } else { raf = null; }
    }
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tar.x = e.clientX - r.left;
      tar.y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(updateGlow);
    });
  }

  // 2. Custom Cursor (Fine pointer only)
  if (!fine || reduce) return;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'vy-cursor-dot';
  ring.className = 'vy-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let rx = 0, ry = 0, tx = 0, ty = 0, rafRing = null;
  function updateRing() {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    if (Math.abs(tx - rx) > 0.2 || Math.abs(ty - ry) > 0.2) {
      rafRing = requestAnimationFrame(updateRing);
    } else { rafRing = null; }
  }

  window.addEventListener('pointermove', e => {
    tx = e.clientX;
    ty = e.clientY;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    if (!rafRing) rafRing = requestAnimationFrame(updateRing);
  }, { passive: true });

  document.addEventListener('pointerover', e => {
    if (e.target.closest('a, button, input, select, details summary, .offer, .chip')) {
      document.body.classList.add('vy-hover');
    }
  });
  document.addEventListener('pointerout', e => {
    if (e.target.closest('a, button, input, select, details summary, .offer, .chip')) {
      document.body.classList.remove('vy-hover');
    }
  });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();
```

---

### Component B: Talent Rail (Horizontal Carousel)

#### 1. Architectural Role
Abstra's Talent Rail (`#ab-talent` / `.rail`) provides a high-impact horizontal showcase of talent profiles with snap scrolling, prev/next arrows, profile cards (`.pcard`), skill tags, and experience badges.

#### 2. Vayra Adaptation
In Vayra, Section 3 (`#what` — "Teams that sell, build and ship with AI in the loop.") presents three core offerings:
1. `GTM engineers and teams` (Chips: Outbound, Enrichment, CRM, RevOps, SDRs)
2. `Orchestrated teams` (Chips: Agents, Workflows, Human review)
3. `AI-augmented engineering` (Chips: Web, Mobile, Data, Cloud)
plus two engagement paths:
4. `Add people to your team`
5. `Hand us a goal`

We upgrade `.offers` into a **responsive Talent Rail layout**:
- On large screens, cards align in an elegant scrollable track with controls.
- Prev / Next navigation buttons (`#railPrev`, `#railNext`) are integrated into `.sec-head`.
- Touch swipe / trackpad horizontal scrolling with `scroll-snap-type: x mandatory`.
- 100% of Vayra's text copy, headings, and chip tags are preserved inside each card!

#### 3. HTML Markup (Preserving 100% Vayra Copy)
```html
<section class="sec" id="what" aria-labelledby="what-title">
  <div class="wrap">
    <div class="sec-head vy-rail-head">
      <div>
        <span class="eyebrow">What we do</span>
        <h2 id="what-title">Teams that sell, build and ship with AI in the loop.</h2>
      </div>
      <div class="vy-rail-ctrl" aria-label="Carousel Navigation">
        <button class="vy-rail-btn" id="railPrev" aria-label="Previous offering" disabled>&larr;</button>
        <button class="vy-rail-btn" id="railNext" aria-label="Next offering">&rarr;</button>
      </div>
    </div>

    <div class="vy-rail" id="talentRail">
      <!-- Card 1: GTM -->
      <article class="offer lead vy-pcard" data-spotlight>
        <span class="tag">GTM</span>
        <h3>GTM engineers and teams</h3>
        <p>The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.</p>
        <ul class="chips">
          <li>Outbound</li><li>Enrichment</li><li>CRM</li><li>RevOps</li><li>SDRs</li>
        </ul>
      </article>

      <!-- Card 2: Orchestrated -->
      <article class="offer vy-pcard" data-spotlight>
        <span class="tag">Orchestrated</span>
        <h3>Orchestrated teams</h3>
        <p>A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.</p>
        <ul class="chips">
          <li>Agents</li><li>Workflows</li><li>Human review</li>
        </ul>
      </article>

      <!-- Card 3: Engineering -->
      <article class="offer vy-pcard" data-spotlight>
        <span class="tag">Engineering</span>
        <h3>AI-augmented engineering</h3>
        <p>Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.</p>
        <ul class="chips">
          <li>Web</li><li>Mobile</li><li>Data</li><li>Cloud</li>
        </ul>
      </article>

      <!-- Card 4: Add people -->
      <article class="offer vy-pcard vy-pcard-mode" data-spotlight>
        <span class="eyebrow">Two ways to start</span>
        <h4>Add people to your team</h4>
        <p>You lead. They join your Slack, your standups and your tools from day one.</p>
      </article>

      <!-- Card 5: Hand us a goal -->
      <article class="offer vy-pcard vy-pcard-mode" data-spotlight>
        <span class="eyebrow">Two ways to start</span>
        <h4>Hand us a goal</h4>
        <p>A Vayra squad owns it, from discovery to production or from first signal to booked meeting.</p>
      </article>
    </div>
  </div>
</section>
```

#### 4. CSS Rules
```css
.vy-rail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}
.vy-rail-ctrl {
  display: flex;
  gap: 8px;
}
.vy-rail-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--ink-2);
  color: var(--fg);
  font-size: 18px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}
.vy-rail-btn:hover:not(:disabled) {
  border-color: var(--sun);
  color: var(--sun);
  transform: translateY(-2px);
}
.vy-rail-btn:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.vy-rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 2 * 20px) / 3);
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 8px 4px 20px;
  margin-top: 16px;
  -webkit-overflow-scrolling: touch;
}
.vy-rail::-webkit-scrollbar { display: none; }

@media (max-width: 1024px) {
  .vy-rail {
    grid-auto-columns: calc((100% - 16px) / 2);
  }
}
@media (max-width: 640px) {
  .vy-rail {
    grid-auto-columns: 86%;
  }
}

.vy-pcard {
  scroll-snap-align: start;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}
```

#### 5. JavaScript Logic
```javascript
(function initTalentRail() {
  const rail = document.getElementById('talentRail');
  const prev = document.getElementById('railPrev');
  const next = document.getElementById('railNext');
  if (!rail || !prev || !next) return;

  const getStep = () => {
    const card = rail.querySelector('.vy-pcard');
    return card ? card.offsetWidth + 20 : 340;
  };

  const updateControls = () => {
    prev.disabled = rail.scrollLeft <= 4;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 6;
  };

  prev.addEventListener('click', () => {
    rail.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    rail.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  rail.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls, { passive: true });
  updateControls();
})();
```

---

### Component C: Interactive Process Panels & Synchronized State (`#gtm`)

#### 1. Architectural Role
In Abstra (`#ab-process` / `.md-steps`), the process is organized into interactive step triggers on one side and active state/progress panels on the other side. 

#### 2. Vayra Adaptation
In Vayra, Section 4 (`#gtm` — "Agents do the repetitive work. People own the pipeline.") is currently a 5-stage matrix:
- **Stages**: `Signals`, `Research`, `Outreach`, `Conversations`, `Pipeline`.
- **Agents Lane**: Specific tasks done by AI agents.
- **People Lane**: Specific actions owned by human team members.
- **Summary**: "GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week."

By layering Abstra's **Interactive Process Panel** system onto `#gtm`:
- The 5 stages become interactive tabs / steps.
- Users can click any stage (or watch an auto-cycle progression) to reveal a synchronized **Comparison Panel**:
  - Highlights what **Agents** do (with green `--leaf` status indicator and agent badge).
  - Highlights what **People** do (with amber `--sun` status indicator and human badge).
- Retains Vayra's full responsive table/grid layout as the fallback/underlying structure, ensuring zero layout breakage.
- Preserves 100% of all verbatim text.

#### 3. HTML Structure (Preserving 100% Vayra Copy)
```html
<section class="sec gtm" id="gtm" aria-labelledby="gtm-title">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">The GTM system</span>
      <h2 id="gtm-title">Agents do the repetitive work. People own the pipeline.</h2>
      <p class="lede">Every Vayra GTM team runs on the same loop. You can see who did what at each stage, and a person signs off before anything reaches a buyer.</p>
    </div>

    <!-- Interactive Step Selector Tabs -->
    <div class="vy-gtm-nav" role="tablist" aria-label="GTM Stages">
      <button class="vy-gtm-tab active" role="tab" aria-selected="true" data-stage="0">Signals</button>
      <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="1">Research</button>
      <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="2">Outreach</button>
      <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="3">Conversations</button>
      <button class="vy-gtm-tab" role="tab" aria-selected="false" data-stage="4">Pipeline</button>
    </div>

    <!-- Interactive Inspector Panel -->
    <div class="vy-gtm-panel" id="gtmPanel" aria-live="polite">
      <div class="vy-panel-card vy-agent-card">
        <div class="vy-panel-badge agent"><i></i> Agents</div>
        <p class="vy-panel-text" id="gtmAgentText">Watch hiring, funding and product news across your market.</p>
      </div>
      <div class="vy-panel-card vy-person-card">
        <div class="vy-panel-badge person"><i></i> People</div>
        <p class="vy-panel-text" id="gtmPersonText">Decide which signals are worth acting on.</p>
      </div>
    </div>

    <!-- Full Canonical Loop Table (Maintained for accessibility & complete text preservation) -->
    <div class="loop" role="table" aria-label="Who does what at each GTM stage">
      <div class="corner" role="columnheader"></div>
      <div class="stage" style="--o:3" role="columnheader">Signals</div>
      <div class="stage" style="--o:6" role="columnheader">Research</div>
      <div class="stage" style="--o:9" role="columnheader">Outreach</div>
      <div class="stage" style="--o:12" role="columnheader">Conversations</div>
      <div class="stage" style="--o:15" role="columnheader">Pipeline</div>

      <div class="lane a" role="rowheader"><i></i>Agents</div>
      <div class="cell a" style="--o:4" role="cell">Watch hiring, funding and product news across your market.</div>
      <div class="cell a" style="--o:7" role="cell">Enrich accounts and contacts with what matters.</div>
      <div class="cell a" style="--o:10" role="cell">Draft first lines and sequences per account.</div>
      <div class="cell a" style="--o:13" role="cell">Summarize replies and calls into clean notes.</div>
      <div class="cell a" style="--o:16" role="cell">Keep the CRM updated without anyone chasing it.</div>

      <div class="lane p" role="rowheader"><i></i>People</div>
      <div class="cell p" style="--o:5" role="cell">Decide which signals are worth acting on.</div>
      <div class="cell p" style="--o:8" role="cell">Check every account against your real ICP.</div>
      <div class="cell p" style="--o:11" role="cell">Rewrite, approve and send in your voice.</div>
      <div class="cell p" style="--o:14" role="cell">Run the calls and build the relationship.</div>
      <div class="cell p" style="--o:17" role="cell">Report to you on what is moving and why.</div>
    </div>

    <p class="gtm-foot">GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week.</p>
  </div>
</section>
```

#### 4. JavaScript Logic
```javascript
(function initGtmInteractivePanel() {
  const tabs = document.querySelectorAll('.vy-gtm-tab');
  const agentText = document.getElementById('gtmAgentText');
  const personText = document.getElementById('gtmPersonText');
  if (!tabs.length || !agentText || !personText) return;

  const STAGES = [
    {
      agent: "Watch hiring, funding and product news across your market.",
      person: "Decide which signals are worth acting on."
    },
    {
      agent: "Enrich accounts and contacts with what matters.",
      person: "Check every account against your real ICP."
    },
    {
      agent: "Draft first lines and sequences per account.",
      person: "Rewrite, approve and send in your voice."
    },
    {
      agent: "Summarize replies and calls into clean notes.",
      person: "Run the calls and build the relationship."
    },
    {
      agent: "Keep the CRM updated without anyone chasing it.",
      person: "Report to you on what is moving and why."
    }
  ];

  function setStage(idx) {
    tabs.forEach((tab, i) => {
      const active = i === idx;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active);
    });
    agentText.textContent = STAGES[idx].agent;
    personText.textContent = STAGES[idx].person;
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => setStage(idx));
  });
})();
```

---

### Component D: Progressive Scroll Reveal System

#### 1. Architectural Role
Abstra uses `.rv` classes with `IntersectionObserver` to animate elements into view smoothly (`opacity: 0; transform: translateY(24px) -> opacity: 1; transform: none`).

#### 2. Vayra Adaptation
- Add class `rv` to major landing page landmarks:
  - Hero Console: `.console.rv`
  - Section Heads: `.sec-head.rv`
  - Cards: `.offer.rv`, `.pair article.rv`
  - City Map container: `.mapwrap.rv`
  - FAQ list: `.faq.rv`
- **Crucial Progressive Enhancement Guard**: The initial CSS hidden state (`opacity: 0`) is **only applied if the root element has the `.js` class**. If JavaScript is disabled or fails to execute, everything remains 100% visible immediately.
- Honors `prefers-reduced-motion: reduce`.

#### 3. CSS Implementation
```css
/* Reveal Progressive Enhancement */
html.js .rv {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .7s ease, transform .9s cubic-bezier(.16, 1, .3, 1);
  will-change: opacity, transform;
}
html.js .rv.on {
  opacity: 1;
  transform: none;
}
.rv-d1 { transition-delay: .1s; }
.rv-d2 { transition-delay: .2s; }
.rv-d3 { transition-delay: .3s; }

@media (prefers-reduced-motion: reduce) {
  html.js .rv {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

#### 4. JavaScript Logic
```javascript
(function initScrollReveals() {
  document.documentElement.classList.add('js');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('on'));
    return;
  }
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('on'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.rv').forEach(el => observer.observe(el));
})();
```

---

### Component E: FAQ Glass Live Instant Search & Filter

#### 1. Architectural Role
In Abstra (`#ab-faq.faq-glass`), a live client-side search engine with tokenization immediately filters FAQ items as the user types, while cycling helpful hint placeholders.

#### 2. Vayra Adaptation
In Vayra, Section 7 (`#faq` — "Questions we hear first.") contains 9 locked `<details>` elements:
1. *What is Vayra?*
2. *How much does senior talent in Latin America cost?*
3. *What does AI-augmented mean?*
4. *What is an orchestrated team?*
5. *What do GTM engineers do?*
6. *Which roles can Vayra provide?*
7. *Can I start with one person?*
8. *Extend my team or hand you a goal?*
9. *Where are your people based?*

By adding a glass search input at the top of `#faq`:
- Matches user queries in real-time.
- Automatically opens matching `<details>` items and highlights or un-hides them.
- Restores all items when the search input is cleared.
- Cycles through dynamic question prompts in the search placeholder (`e.g. How much does talent cost?`, `e.g. Where are your people based?`).

#### 3. HTML Markup
```html
<section class="sec" id="faq" aria-labelledby="faq-title" style="padding-top:0">
  <div class="wrap faq">
    <div class="sec-head" style="margin-bottom:0">
      <span class="eyebrow">FAQ</span>
      <h2 id="faq-title">Questions we hear first.</h2>
    </div>

    <!-- Glass Instant Search Input -->
    <div class="vy-faq-search-box">
      <svg class="vy-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="search" id="faqSearchInput" class="vy-faq-input" placeholder="Search questions... e.g. How much does talent cost?" aria-label="Search FAQ">
      <span class="vy-faq-count" id="faqMatchCount" aria-live="polite"></span>
    </div>

    <div id="faqList">
      <details open>
        <summary>What is Vayra?</summary>
        <p>Vayra builds AI-augmented GTM and engineering teams from Latin America for US companies. Senior people work alongside orchestrated AI agents, on US hours.</p>
      </details>
      <details>
        <summary>How much does senior talent in Latin America cost?</summary>
        <p>Vayra rates start at about $50 an hour for a semi-senior software or GTM engineer and $3,000 a month for an SDR. Senior and manager levels cost more. For comparison, the US median pay for software developers is $135,980 a year before benefits (BLS OEWS, May 2025).</p>
      </details>
      <details>
        <summary>What does AI-augmented mean?</summary>
        <p>Every person works with AI tools and agents as part of the daily work, and knows when to trust them and when to check.</p>
      </details>
      <details>
        <summary>What is an orchestrated team?</summary>
        <p>Senior people plus AI agents organized around one goal, with a clear owner for every decision.</p>
      </details>
      <details>
        <summary>What do GTM engineers do?</summary>
        <p>They build the system behind your pipeline: data, enrichment, sequences, CRM and the automations that connect them.</p>
      </details>
      <details>
        <summary>Which roles can Vayra provide?</summary>
        <p>GTM engineers, SDRs, marketing and ops people, and software engineers for web, mobile, data and cloud.</p>
      </details>
      <details>
        <summary>Can I start with one person?</summary>
        <p>Yes. Start with one and grow from there.</p>
      </details>
      <details>
        <summary>Extend my team or hand you a goal?</summary>
        <p>If you already have a lead and a plan, add people to your team. If you need something built or a pipeline running end to end, hand us the goal.</p>
      </details>
      <details>
        <summary>Where are your people based?</summary>
        <p>Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones.</p>
      </details>
    </div>
  </div>
</section>
```

#### 4. CSS Rules
```css
.vy-faq-search-box {
  position: relative;
  margin-block: 24px 28px;
  display: flex;
  align-items: center;
}
.vy-search-icon {
  position: absolute;
  left: 18px;
  color: var(--muted);
  pointer-events: none;
}
.vy-faq-input {
  width: 100%;
  padding: 14px 44px 14px 48px;
  background: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--fg);
  font: 500 15px/1.4 var(--f-body);
  transition: border-color .2s ease, box-shadow .2s ease;
  outline: none;
}
.vy-faq-input:focus {
  border-color: var(--sun);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sun) 15%, transparent);
}
.vy-faq-count {
  position: absolute;
  right: 18px;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
details.vy-faq-hidden {
  display: none !important;
}
```

#### 5. JavaScript Logic
```javascript
(function initFaqSearch() {
  const input = document.getElementById('faqSearchInput');
  const list = document.getElementById('faqList');
  const countEl = document.getElementById('faqMatchCount');
  if (!input || !list) return;

  const items = Array.from(list.querySelectorAll('details'));
  const questions = items.map(d => ({
    el: d,
    q: d.querySelector('summary').textContent.toLowerCase(),
    a: d.querySelector('p').textContent.toLowerCase()
  }));

  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    let matches = 0;

    questions.forEach(item => {
      if (!term) {
        item.el.classList.remove('vy-faq-hidden');
        matches++;
      } else {
        const hit = item.q.includes(term) || item.a.includes(term);
        item.el.classList.toggle('vy-faq-hidden', !hit);
        if (hit) {
          item.el.open = true;
          matches++;
        }
      }
    });

    if (countEl) {
      countEl.textContent = term ? `${matches} found` : '';
    }
  });

  // Dynamic placeholder rotation
  const prompts = [
    "Search questions... e.g. How much does talent cost?",
    "Search questions... e.g. Where are your people based?",
    "Search questions... e.g. What does AI-augmented mean?",
    "Search questions... e.g. Which roles can Vayra provide?"
  ];
  let pIdx = 0;
  setInterval(() => {
    if (document.activeElement !== input && !input.value) {
      pIdx = (pIdx + 1) % prompts.length;
      input.placeholder = prompts[pIdx];
    }
  }, 3500);
})();
```

---

### Component F: Card Spotlight Glow (`--mx`, `--my`)

#### 1. Architectural Role
In Abstra (`#ab .sol .cell`), moving the cursor over a card calculates local `(clientX - left, clientY - top)` and sets `--mx` and `--my`, creating a subtle specular highlight that tracks the cursor inside each card.

#### 2. Vayra Adaptation
Apply to all `.offer` cards, `.vy-pcard` items, and `.pair article` cards.

```css
[data-spotlight] {
  position: relative;
  overflow: hidden;
}
[data-spotlight]::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(320px circle at var(--mx, -500px) var(--my, -500px), 
    color-mix(in srgb, var(--sun) 10%, transparent), 
    transparent 70%);
  opacity: 0;
  transition: opacity .3s ease;
}
[data-spotlight]:hover::before {
  opacity: 1;
}
```

```javascript
(function initSpotlights() {
  document.querySelectorAll('[data-spotlight]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  });
})();
```

---

## 4. Strict Copy Preservation Matrix

To satisfy **Requirement R2 (STRICT COPY PRESERVATION)**, the following verification matrix ensures that 100% of Vayra's text nodes remain intact:

| Section & ID | Original Vayra Content Elements | Preserved in New Architecture | Status |
|---|---|---|---|
| **Header (Nav)** | `Vayra`, links: `What we do`, `GTM system`, `Cities`, `How we work`, `FAQ`, button: `Get a quote` | Navbar links and CTA retained untouched | **LOCKED & PRESERVED** |
| **Hero** | Eyebrow: `LATAM -> US`<br>H1: `Senior GTM and engineering teams, augmented with AI.`<br>Lede: `Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents...`<br>CTAs: `Get a quote ->`, `See the GTM system`<br>Terminal: All 5 prompt commands, agent rows, person rows, and `pipeline updated in your CRM` | All hero text and terminal row contents retained verbatim; augmented with flashlight glow | **LOCKED & PRESERVED** |
| **Marquee** | `Argentina / Colombia / Brazil / Uruguay / Chile / Mexico / ...` | Ticker track retained untouched | **LOCKED & PRESERVED** |
| **Section `#what`** | Eyebrow: `What we do`<br>H2: `Teams that sell, build and ship with AI in the loop.`<br>Offer 1: `GTM engineers and teams` + body + 5 chips<br>Offer 2: `Orchestrated teams` + body + 3 chips<br>Offer 3: `AI-augmented engineering` + body + 4 chips<br>Start 1: `Add people to your team` + body<br>Start 2: `Hand us a goal` + body | Integrated into `vy-rail` carousel structure; all text, headings, chips preserved | **LOCKED & PRESERVED** |
| **Section `#gtm`** | Eyebrow: `The GTM system`<br>H2: `Agents do the repetitive work. People own the pipeline.`<br>Lede: `Every Vayra GTM team runs on the same loop...`<br>5 Stages: `Signals`, `Research`, `Outreach`, `Conversations`, `Pipeline`<br>5 Agent cells: Verbatim text<br>5 People cells: Verbatim text<br>Footer: `GTM engineers set the system up...` | Integrated into Interactive Inspector Panel + underlying table; every character preserved | **LOCKED & PRESERVED** |
| **Section `#cities`** | Eyebrow: `Where your team lives`<br>H2: `15 cities, one shared workday.`<br>Lede: `Pick where you are in the US and see what your team is doing right now.`<br>Interactive Map, US City selector, 15 LATAM cities, Timezone cards, and sources | Entire city selector, map SVG, timecard, and source links preserved intact | **LOCKED & PRESERVED** |
| **Section `#how`** | Eyebrow: `How we work`<br>H2: `You only meet people we would hire ourselves.`<br>5 Steps: `Intro call`, `Calibrate`, `Shortlist`, `Kickoff`, `Ongoing support`<br>Lead text: `We meet every person before you do...`<br>Card 1: `Your hours, not ours.` + body<br>Card 2: `We stay after the hire.` + body | Steps and pair cards preserved verbatim; wrapped with reveal and spotlight classes | **LOCKED & PRESERVED** |
| **Section `#faq`** | Eyebrow: `FAQ`<br>H2: `Questions we hear first.`<br>All 9 Questions and Answers: 100% verbatim | All 9 Q&As retained; augmented with instant glass search filter | **LOCKED & PRESERVED** |
| **Section `#contact`** | Eyebrow: `Talk to us`<br>H2: `Tell us what you are building.`<br>Lede: `A short call is enough to see if we are a good fit.`<br>Email: `hello@vayra.team`, Copy button, `Email us for a quote ->` | Retained verbatim | **LOCKED & PRESERVED** |
| **Footer** | `Vayra`, `AI-augmented teams from Latin America`, links, `(c) 2026 Vayra` | Retained verbatim | **LOCKED & PRESERVED** |

---

## 5. Potential Pitfalls & Engineering Countermeasures

### Pitfall 1: CSS Class Name Collisions
- **Symptom**: Abstra uses `.cell`, `.row`, `.tag`, `.btn`, `.sec`, `.card`, `.on`.
- **Conflict in Vayra**: 
  - Vayra's console terminal uses `.rows`, `.row`, `.row.on`, `.row.agent`, `.row.person`.
  - Vayra's GTM system uses `.cell`, `.cell.a`, `.cell.p`.
  - Overwriting `.cell` or `.row` will destroy the layout of the terminal console or the GTM table!
- **Countermeasure**: Prefix all ported Abstra classes with `vy-` (e.g., `.vy-pcard`, `.vy-rail`, `.vy-gtm-panel`, `.vy-cursor-ring`). Scoped reveal classes must only target explicit elements via `.rv.on`.

### Pitfall 2: JavaScript Runtime Exceptions & Console Errors
- **Symptom**: Abstra scripts contain direct element selectors like `$('#abStack')`, `$('#abNav')`, `$$('.pick')`. Calling methods on `null` triggers uncaught `TypeError` in the browser console.
- **Conflict with Acceptance Criteria**: AC requires *"No `mcp__chrome-devtools__page_errors` occur in the console when loading the site."*
- **Countermeasure**:
  1. Every single script must use defensive guard clauses:
     ```javascript
     const el = document.getElementById('...');
     if (!el) return;
     ```
  2. Avoid unhandled promises or async crashes.
  3. Clean up timers and passive scroll listeners.

### Pitfall 3: Responsive Viewport Clamping & Horizontal Blowout
- **Symptom**: Unconstrained horizontal rail or absolute transforms can push the body width beyond 100vw, introducing an unwanted horizontal scrollbar on mobile devices.
- **Countermeasure**:
  1. Enforce `body { overflow-x: hidden; }`.
  2. Contain `.vy-rail` inside `.wrap { max-width: 1180px; }` with `max-width: 100%` and `box-sizing: border-box`.
  3. Responsive `grid-auto-columns`:
     - Desktop (> 1024px): 3 columns (`calc((100% - 40px) / 3)`).
     - Tablet (641px - 1024px): 2 columns (`calc((100% - 20px) / 2)`).
     - Mobile (<= 640px): 86% card width with peek snapping.

### Pitfall 4: Discovered Pre-Existing Anomaly in `public/index.html`
- **Forensic Discovery**: Line 984 of `public/index.html` currently contains an escaped HTML snippet erroneously embedded inside the `<script type="application/ld+json">` block (caused by a previous automated script).
- **Countermeasure**: When Worker updates `public/index.html`, do not replicate or propagate this corrupt JSON-LD string; ensure the schema script remains valid JSON or leave it cleanly isolated so as not to cause validator errors.

---

## 6. Worker Implementation Plan & Handoff Checklist

For the implementation worker agent:

- [ ] **Step 1: CSS Additions in `public/styles.css`**
  - Append the namespaced rules (`.vy-rail`, `.vy-pcard`, `.vy-gtm-panel`, `.vy-faq-search-box`, `.vy-cursor-*`, `.rv`).
  - Add theme token mappings for `.vy-` classes.
  - Verify zero collisions with existing `.cell`, `.row`, `.console`.

- [ ] **Step 2: Markup Updates in `public/index.html`**
  - Section `#what`: Wrap the 5 offers into `.vy-rail` with `#railPrev` and `#railNext` in the header.
  - Section `#gtm`: Add `.vy-gtm-nav` tabs and `#gtmPanel` above the canonical `.loop` table.
  - Section `#faq`: Insert `#faqSearchInput` above the list of `<details>`.
  - Add `rv` reveal classes to `.sec-head`, `.console`, `.offer`, `.pair article`.
  - Add `data-spotlight` to `.offer` cards.

- [ ] **Step 3: Script Integration in `public/index.html`**
  - Inject the guarded Vanilla JS modules before `</body>`:
    1. Ambient hero glow & pointer tracking
    2. Talent Rail carousel controls
    3. GTM interactive panel synchronizer
    4. Scroll reveals observer
    5. FAQ instant live search & placeholder rotator
    6. Card spotlight effect

- [ ] **Step 4: Verification & Acceptance Gates**
  - Verify 100% copy preservation using text-diff tools.
  - Verify zero console errors in Chrome DevTools MCP.
  - Verify responsive rendering on mobile (375px), tablet (768px), and desktop (1440px).
