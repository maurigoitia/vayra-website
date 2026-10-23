# Vayra Landing Page Technical Survey & Verbatim Copy Catalog

**Author**: Explorer 2 (Survey Team)  
**Date**: October 15, 2026  
**Target Resource**: `public/index.html` (and associated assets in `public/`)  
**Mission**: Comprehensive dissection of layout, DOM hierarchy, design tokens, typography, scripts, interactive behaviors, and an exhaustive, verbatim catalog of locked marketing copy for zero-regression integration.

---

## 1. Executive Summary

`public/index.html` is a high-performance, single-document web application built with vanilla HTML5, inlined CSS, and lightweight vanilla JavaScript. It embodies a **"night-shift navy"** aesthetic inspired by elite developer and high-conviction B2B landing pages (deep navy surfaces, warm golden Andean sun accents, high-contrast monospace typography, and subtle terminal aesthetics), contrasting with a warm parchment map poster section ("cafe wall").

### Critical Constraints from Request
1. **STRICT COPY PRESERVATION (R2)**: All marketing copy, headings, ledes, body text, button labels, ticker chips, table contents, FAQs, and metadata are **STRICTLY LOCKED**. No text may be replaced with generic copy or Abstra template placeholders.
2. **MAINTAIN DARK THEME (R3)**: All UI/UX enhancements ported from the Abstra design system must adapt seamlessly to Vayra's token palette (`--ink: #0A0F1F`, `--sun: #FFB547`, etc.).
3. **DOCUMENT STRUCTURE INTEGRITY**: All existing DOM anchors (`#what`, `#gtm`, `#cities`, `#how`, `#faq`, `#contact`, `#save`) and interactive controls must retain full functional parity.

---

## 2. Design Tokens & Styling Architecture

`public/index.html` defines its core design system in `:root` (lines 36–56). Note: While `public/styles.css` contains an earlier light-mode exploration, `public/index.html` embeds the canonical, production **dark theme**.

### 2.1 CSS Custom Properties (Tokens)
| Token | Value | Semantic Role / Usage |
|---|---|---|
| `--ink` | `#0A0F1F` | Deep midnight navy page background, base canvas |
| `--ink-2` | `#111934` | Raised surfaces, card backgrounds, terminal console background |
| `--ink-3` | `#1A2447` | Hover states, active borders, interactive focus surfaces |
| `--line` | `#24305A` | Subtle dividers, borders, terminal headers, card strokes |
| `--fg` | `#EEF1FA` | Primary foreground text (clean, crisp off-white) |
| `--muted` | `#A5AECB` | Secondary text, captions, subtitles, lede body paragraphs |
| `--sun` | `#FFB547` | Primary brand accent ("Andes sun amber"): hero highlights, primary buttons, badges |
| `--sun-ink` | `#1B1204` | High-contrast dark ink text applied on `--sun` button surfaces |
| `--sky` | `#8CC8EE` | Secondary accent (celeste): technical highlights, secondary signals |
| `--leaf` | `#7ED3A6` | Success status green: live agent indicators, terminal checkmarks |
| `--paper` | `#EADFCB` | Warm cafe wall parchment background (used for city poster section) |
| `--paper-ink` | `#2A2118` | Dark espresso text on `--paper` surfaces |
| `--paper-muted` | `#6B5D4C` | Muted brown secondary copy on `--paper` surfaces |
| `--r` | `14px` | Standard border radius for cards, containers, and interactive frames |

### 2.2 Typography & Font Stacks
Google Fonts loaded via `<link>` (lines 30–32):
- `Anton`
- `Bricolage Grotesque` (weights: 500, 700, 800)
- `Hanken Grotesk` (weights: 400, 500, 600)
- `JetBrains Mono` (weights: 400, 500)

CSS Variable Font Definitions:
```css
--f-display: "Bricolage Grotesque", "Hanken Grotesk", system-ui, sans-serif;
--f-body: "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
--f-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
--f-poster: "Anton", "Oswald", "Arial Narrow", Impact, sans-serif;
```

---

## 3. Section-by-Section DOM Layout & Structural Breakdown

### 3.1 Global & Navigation (`header.nav`, lines 401–416)
- **Container**: `<header class="nav"><div class="wrap">`
- **Sticky Blur**: `position: sticky; top: env(safe-area-inset-top, 0px); backdrop-filter: blur(10px);`
- **Brand**:
  - Logo SVG: Sun circle (`fill="#FFB547"`) + Geometric "V" path (`stroke="#EEF1FA"`, `stroke-width="3.4"`)
  - Label: `Vayra`
- **Nav Links**:
  - `What we do` (`href="#what"`)
  - `GTM system` (`href="#gtm"`)
  - `Cities` (`href="#cities"`)
  - `How we work` (`href="#how"`)
  - `FAQ` (`href="#faq"`)
- **Nav CTA**: `<a class="btn btn-sun" href="#save">Get a quote</a>`

### 3.2 Hero Section (`section.hero`, lines 419–446)
- **Grid Layout**: 2-column grid (`1.05fr .95fr`, gap `56px`) with background radial grid pattern overlay.
- **Left Column**:
  - Route badge: `<span class="route"><i></i>LATAM &rarr; US</span>` (pulsing leaf green dot)
  - H1: `Senior GTM and engineering teams, <em>augmented with AI.</em>`
  - Lede paragraph: Explains senior LATAM talent alongside orchestrated AI agents on US hours.
  - CTAs:
    - Primary: `<a class="btn btn-sun" href="#save">Get a quote <span class="arr">&rarr;</span></a>`
    - Ghost: `<a class="btn btn-ghost" href="#gtm">See the GTM system</a>`
- **Right Column (Interactive Terminal Console)**:
  - Container: `.console` with window header (`gtm-team / live`) and simulated command prompt:
    `$ vayra orchestrate --team gtm --icp "your best customers"`
  - Active Scanning Rows (`#rows .row`):
    - Row 1 (agent): `signals` -> `hiring and funding news found`
    - Row 2 (agent): `research` -> `accounts and contacts enriched`
    - Row 3 (agent): `drafts` -> `first lines written per account`
    - Row 4 (person): `gtm engineer` -> `reviewed, edited, approved`
    - Row 5 (person): `sdr` -> `conversations started, calls booked`
  - Footer check: `✓ pipeline updated in your CRM` with blinking monospace caret.

### 3.3 Ticker Marquee (`.ticker`, lines 448–453)
- **CSS Infinite Marquee**: Pure CSS `@keyframes slide` (`38s linear infinite`).
- **Pills/Chips duplicated for seamless loop**:
  - `Outbound systems`
  - `Enrichment`
  - `CRM and RevOps`
  - `SDR teams`
  - `AI agents`
  - `Web and mobile`
  - `Data pipelines`
  - `Cloud`

### 3.4 What We Do (`section#what`, lines 455–493)
- **Section Header**: Eyebrow `What we do`, H2 `Teams that sell, build and ship with AI in the loop.`
- **Offerings Grid (`.offers`)**: 3 cards
  1. **Lead Card (`.offer.lead`)**:
     - Tag: `GTM`
     - H3: `GTM engineers and teams`
     - Description: People and system behind pipeline (outbound, enrichment, CRM, automations, SDRs, marketing, ops).
     - Chips: `Outbound`, `Enrichment`, `CRM`, `RevOps`, `SDRs`
  2. **Card 2 (`.offer`)**:
     - Tag: `Orchestrated`
     - H3: `Orchestrated teams`
     - Description: Small senior team + AI agents around one goal.
     - Chips: `Agents`, `Workflows`, `Human review`
  3. **Card 3 (`.offer`)**:
     - Tag: `Engineering`
     - H3: `AI-augmented engineering`
     - Description: Senior engineers building with AI in code, tests, reviews, docs.
     - Chips: `Web`, `Mobile`, `Data`, `Cloud`
- **Start Models (`.start`)**: "Two ways to start" sub-panel
  - Option 1: `Add people to your team` — You lead, they join your Slack, standups, and tools.
  - Option 2: `Hand us a goal` — Vayra squad owns it from discovery to production or first signal to booked meeting.

### 3.5 The GTM System (`section#gtm`, lines 495–526)
- **Section Header**: Eyebrow `The GTM system`, H2 `Agents do the repetitive work. People own the pipeline.`, Lede.
- **Workflow Matrix Table (`.loop`, CSS Grid table)**:
  - Column Headers (5 Stages): `Signals`, `Research`, `Outreach`, `Conversations`, `Pipeline`
  - Row 1 (`.lane.a` - Agents):
    - Signals: `Watch hiring, funding and product news across your market.`
    - Research: `Enrich accounts and contacts with what matters.`
    - Outreach: `Draft first lines and sequences per account.`
    - Conversations: `Summarize replies and calls into clean notes.`
    - Pipeline: `Keep the CRM updated without anyone chasing it.`
  - Row 2 (`.lane.p` - People):
    - Signals: `Decide which signals are worth acting on.`
    - Research: `Check every account against your real ICP.`
    - Outreach: `Rewrite, approve and send in your voice.`
    - Conversations: `Run the calls and build the relationship.`
    - Pipeline: `Report to you on what is moving and why.`
- **Footnote**: `GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week.`

### 3.6 Cities & Workday Atlas (`section#cities.wall`, lines 528–613)
- **Visual Theme**: Warm cafe wall (`--paper: #EADFCB`, `--paper-ink: #2A2118`).
- **Section Header**: Eyebrow `Where your team lives`, H2 `15 cities, one shared workday.`, Lede.
- **Components**:
  1. **Map Poster (`.mapposter`)**:
     - Embedded SVG containing US, LATAM, and regional landmass paths (`#m-us`, `#m-other`, `#m-city`).
     - Dynamic route curve arc (`#at-route`).
     - "You" locator badge (`#at-you` with `#at-you-t`).
     - 15 interactive city pin buttons (`.at-pin[data-city="..."]`).
     - Map caption: `Latin America on US hours` | `vayra.team`.
  2. **Interactive Controls & Timezone Calculator (`.atside`)**:
     - US location dropdown (`#uscity-a[data-usselect]`) covering West Coast, Mountain, Central, East Coast tech hubs.
     - Auto-detected location message (`#geo-note-a`).
     - City chip selector buttons (`.citychips .chip[data-city="..."]`).
     - Live city status header (`#ch-name`, `#ch-country`, `#ch-meta`, `#say`, `#cityline`).
     - Visual Workday Comparison Strip Bar (`.strip`):
       - User workday band (`#band-you`) vs Team workday band (`#band-team`) across a 24-hour timeline (12 AM - 6 AM - 12 PM - 6 PM - 12 AM).
       - Live overlap metric (`#shared`, e.g., `8 shared work hours, same clock`).

### 3.7 How We Work (`section#how`, lines 615–643)
- **Section Header**: Eyebrow `How we work`, H2 `You only meet people we would hire ourselves.`
- **Process Steps Flow (`ol.flow`)**:
  1. `Intro call`
  2. `Calibrate`
  3. `Shortlist`
  4. `Kickoff`
  5. `Ongoing support`
- **Exploratory Text**: Rigorous vetting on seniority, English, AI workflows, and team collaboration.
- **Value Cards Pair (`.pair`)**:
  - Card 1: Eyebrow `Time zones`, H3 `Your hours, not ours.`, Body: Questions answered today, live standups, moving at one speed.
  - Card 2: Eyebrow `After the hire`, H3 `We stay after the hire.`, Body: Regular touchpoints with client and talent to solve small issues early.

### 3.8 FAQ Section (`section#faq`, lines 645–690)
- **Section Header**: Eyebrow `FAQ`, H2 `Questions we hear first.`
- **9 Accordion `<details>` Elements**: Native disclosure elements with animated `::after` expand markers. (See verbatim catalog below).

### 3.9 Contact Section (`section#contact`, lines 692–704)
- **Section Header**: Eyebrow `Talk to us`, H2 `Tell us what you are building.`, Lede `A short call is enough to see if we are a good fit.`
- **Mailbox Card (`.mailbox`)**:
  - Address text: `hello@vayra.team` (`#addr`)
  - Copy Button: `<button class="copy" id="copy" type="button">Copy email</button>`
  - Mailto CTA: `<a class="btn btn-sun" href="mailto:hello@vayra.team?subject=Quote%20request">Email us for a quote <span class="arr">&rarr;</span></a>`
  - Feedback toast: `<p class="copied" id="copied" role="status" aria-live="polite"></p>`

### 3.10 Footer (`footer`, lines 707–719)
- Brand logo + name
- Subtitle: `AI-augmented teams from Latin America`
- Nav links: `What we do`, `GTM system`, `Cities`, `FAQ`
- Copyright: `© 2026 Vayra`

### 3.11 Exit Intent Modal (`#exit`, lines 722–748)
- Modal dialog (`role="dialog" aria-modal="true" hidden`)
- Close button: `#exit-close`
- Left Column: Video player (`/avatar.mp4`) autoplay loop muted.
- Right Column:
  - H2: `Scaling your engineering or GTM team?`
  - Paragraph: LATAM engineers & AI-augmented GTM in 48 hours.
  - HubSpot form container (`#hubspot-form-container`) with embedded loader.
  - Secondary action: `<button class="exit-later" id="exit-later" type="button">No thanks, just looking</button>`

---

## 4. Complete Verbatim Marketing Copy Catalog (STRICTLY LOCKED)

The following copy catalog is 100% faithful to `public/index.html`. During UI/UX integration, **all of this text must remain intact**.

### 4.1 Page Metadata & SEO
- **`<title>`**: `Vayra | Hire Top 1% Latam Software Engineers & GTM Talent`
- **`meta[name="description"]`**: `Hire elite, AI-vetted software developers and GTM teams from Latin America. The premier nearshore talent network for CTOs, VPs of Engineering, and Growth Managers.`
- **`og:title` & `twitter:title`**: `Vayra | Hire Top 1% Latam Software Engineers & GTM Talent`
- **`og:description` & `twitter:description`**: `Hire elite, AI-vetted software developers and GTM teams from Latin America. The premier nearshore talent network for CTOs, VPs of Engineering, and Growth Managers.`
- **`og:image:alt`**: `Vayra. Elite AI-vetted Engineering and GTM nearshore teams.`

### 4.2 Header & Navigation
- **Brand text**: `Vayra`
- **Nav items**:
  - `What we do`
  - `GTM system`
  - `Cities`
  - `How we work`
  - `FAQ`
- **Nav Button**: `Get a quote`

### 4.3 Hero Section
- **Badge route**: `LATAM → US`
- **Heading 1**: `Senior GTM and engineering teams, augmented with AI.` (with `augmented with AI.` wrapped in `<em>`)
- **Lede Paragraph**: `Vayra builds teams of senior talent from Latin America who work alongside orchestrated AI agents. GTM engineers, SDRs and developers on your hours, with more done by every person.`
- **Button 1 (Primary)**: `Get a quote →`
- **Button 2 (Ghost)**: `See the GTM system`
- **Terminal Title**: `gtm-team / live`
- **Terminal Command**: `$ vayra orchestrate --team gtm --icp "your best customers"`
- **Terminal Console Rows**:
  1. Agent | `signals` | `hiring and funding news found`
  2. Agent | `research` | `accounts and contacts enriched`
  3. Agent | `drafts` | `first lines written per account`
  4. Person | `gtm engineer` | `reviewed, edited, approved`
  5. Person | `sdr` | `conversations started, calls booked`
- **Terminal Status**: `✓ pipeline updated in your CRM`

### 4.4 Ticker Marquee Items
- `Outbound systems`
- `Enrichment`
- `CRM and RevOps`
- `SDR teams`
- `AI agents`
- `Web and mobile`
- `Data pipelines`
- `Cloud`

### 4.5 Section: "What we do" (`#what`)
- **Eyebrow**: `What we do`
- **Heading 2**: `Teams that sell, build and ship with AI in the loop.`
- **Card 1 (Lead)**:
  - Tag: `GTM`
  - Heading 3: `GTM engineers and teams`
  - Paragraph: `The people and the system behind your pipeline. GTM engineers build your outbound, enrichment, CRM and the automations that connect them. SDRs, marketing and ops people run it every day.`
  - Chips: `Outbound`, `Enrichment`, `CRM`, `RevOps`, `SDRs`
- **Card 2**:
  - Tag: `Orchestrated`
  - Heading 3: `Orchestrated teams`
  - Paragraph: `A small senior team plus AI agents, set up around one goal. People make the calls, agents take the repetitive work, and you see every step.`
  - Chips: `Agents`, `Workflows`, `Human review`
- **Card 3**:
  - Tag: `Engineering`
  - Heading 3: `AI-augmented engineering`
  - Paragraph: `Senior engineers who build with AI in every part of the work: code, tests, reviews and docs. Join your team or own a project end to end.`
  - Chips: `Web`, `Mobile`, `Data`, `Cloud`
- **Sub-panel Label**: `Two ways to start`
- **Option 1**:
  - Heading 4: `Add people to your team`
  - Paragraph: `You lead. They join your Slack, your standups and your tools from day one.`
- **Option 2**:
  - Heading 4: `Hand us a goal`
  - Paragraph: `A Vayra squad owns it, from discovery to production or from first signal to booked meeting.`

### 4.6 Section: "The GTM system" (`#gtm`)
- **Eyebrow**: `The GTM system`
- **Heading 2**: `Agents do the repetitive work. People own the pipeline.`
- **Lede**: `Every Vayra GTM team runs on the same loop. You can see who did what at each stage, and a person signs off before anything reaches a buyer.`
- **Stages (Columns)**:
  1. `Signals`
  2. `Research`
  3. `Outreach`
  4. `Conversations`
  5. `Pipeline`
- **Row: Agents**:
  - Signals: `Watch hiring, funding and product news across your market.`
  - Research: `Enrich accounts and contacts with what matters.`
  - Outreach: `Draft first lines and sequences per account.`
  - Conversations: `Summarize replies and calls into clean notes.`
  - Pipeline: `Keep the CRM updated without anyone chasing it.`
- **Row: People**:
  - Signals: `Decide which signals are worth acting on.`
  - Research: `Check every account against your real ICP.`
  - Outreach: `Rewrite, approve and send in your voice.`
  - Conversations: `Run the calls and build the relationship.`
  - Pipeline: `Report to you on what is moving and why.`
- **Footnote Note**: `GTM engineers set the system up and keep improving it. SDRs, marketing and ops people run it with you every week.`

### 4.7 Section: "Where your team lives" (`#cities`)
- **Eyebrow**: `Where your team lives`
- **Heading 2**: `15 cities, one shared workday.`
- **Lede**: `Pick where you are in the US and see what your team is doing right now.`
- **US Selector Label**: `Where are you in the US?`
- **US Options**:
  - West Coast: `San Francisco`, `San Jose`, `Seattle`, `Los Angeles`
  - Mountain: `Denver`
  - Central: `Austin`, `Dallas`, `Chicago`
  - East Coast: `Atlanta`, `Miami`, `Washington, DC`, `New York`, `Boston`
- **LATAM Selector Label**: `Pick a city in Latin America`
- **LATAM 15 Cities & Quotes**:
  1. **Mendoza, Argentina**: `Senior engineers between the vineyards and the Andes.`
  2. **Buenos Aires, Argentina**: `Builders who move fast and never really stop.`
  3. **Córdoba, Argentina**: `A university city full of engineers with solid fundamentals.`
  4. **Rosario, Argentina**: `River city builders who ship steady, careful work.`
  5. **Montevideo, Uruguay**: `Calm product teams who think before they build.`
  6. **Asunción, Paraguay**: `A growing tech scene with people who want to own things.`
  7. **Santiago, Chile**: `Engineers who think in systems, with the Andes out the window.`
  8. **Lima, Peru**: `Builders who turn messy problems into clear products.`
  9. **Bogotá, Colombia**: `Designers and engineers who care how things feel.`
  10. **Medellín, Colombia**: `A city that reinvented itself, and builders who do the same.`
  11. **Mexico City, Mexico**: `SDRs and marketers who sell in English and Spanish.`
  12. **Guadalajara, Mexico**: `Mexico’s tech hub, close to US hours and US customers.`
  13. **São Paulo, Brazil**: `GTM and engineering talent from the biggest market in the region.`
  14. **Rio, Brazil**: `GTM people who know how to start a conversation.`
  15. **Florianópolis, Brazil**: `Surf before standup, ship after.`
- **Culture Activity Texts (JavaScript Coffee Array)**:
  - Argentina & Uruguay: `sharing a mate`
  - Paraguay: `having a tereré`
  - Brazil: `having a cafezinho`
  - Colombia: `having a tinto`
  - Mexico, Peru, Chile: `grabbing a coffee`
- **Time Statuses**: `off for the night`, `having breakfast`, `having lunch`, `deep in the afternoon`, `wrapping up the day`
- **Map Footer**: `Latin America on US hours` | `vayra.team`
- **Work Hours Comparison Strip**:
  - Axis: `12 AM` `6 AM` `12 PM` `6 PM` `12 AM`
  - Initial/Fallback Label: `Same workday`

### 4.8 Section: "How we work" (`#how`)
- **Eyebrow**: `How we work`
- **Heading 2**: `You only meet people we would hire ourselves.`
- **5 Process Steps**:
  1. `Intro call`
  2. `Calibrate`
  3. `Shortlist`
  4. `Kickoff`
  5. `Ongoing support`
- **Description**: `We meet every person before you do. Seniority, English, and how they work with AI and with a team. Then we calibrate with you and bring a short list of people who fit.`
- **Card 1**:
  - Eyebrow: `Time zones`
  - Heading 3: `Your hours, not ours.`
  - Paragraph: `Latin America shares most of the US workday. Questions get answered today, standups happen live and your team moves at one speed.`
- **Card 2**:
  - Eyebrow: `After the hire`
  - Heading 3: `We stay after the hire.`
  - Paragraph: `We keep in touch with you and with every person on the team, so small things get solved early and good teams stay together.`

### 4.9 Section: "FAQ" (`#faq`)
- **Eyebrow**: `FAQ`
- **Heading 2**: `Questions we hear first.`
- **Q1**: `What is Vayra?`  
  **A1**: `Vayra builds AI-augmented GTM and engineering teams from Latin America for US companies. Senior people work alongside orchestrated AI agents, on US hours.`
- **Q2**: `How much does senior talent in Latin America cost?`  
  **A2**: `Vayra rates start at about $50 an hour for a semi-senior software or GTM engineer and $3,000 a month for an SDR. Senior and manager levels cost more. For comparison, the US median pay for software developers is $135,980 a year before benefits (BLS OEWS, May 2025).`
- **Q3**: `What does AI-augmented mean?`  
  **A3**: `Every person works with AI tools and agents as part of the daily work, and knows when to trust them and when to check.`
- **Q4**: `What is an orchestrated team?`  
  **A4**: `Senior people plus AI agents organized around one goal, with a clear owner for every decision.`
- **Q5**: `What do GTM engineers do?`  
  **A5**: `They build the system behind your pipeline: data, enrichment, sequences, CRM and the automations that connect them.`
- **Q6**: `Which roles can Vayra provide?`  
  **A6**: `GTM engineers, SDRs, marketing and ops people, and software engineers for web, mobile, data and cloud.`
- **Q7**: `Can I start with one person?`  
  **A7**: `Yes. Start with one and grow from there.`
- **Q8**: `Extend my team or hand you a goal?`  
  **A8**: `If you already have a lead and a plan, add people to your team. If you need something built or a pipeline running end to end, hand us the goal.`
- **Q9**: `Where are your people based?`  
  **A9**: `Across Latin America, from Mexico City, Guadalajara, Bogotá and Medellín to Lima, Santiago, São Paulo, Rio, Buenos Aires, Mendoza and Montevideo, working on US time zones.`

### 4.10 Section: "Talk to us" (`#contact`)
- **Eyebrow**: `Talk to us`
- **Heading 2**: `Tell us what you are building.`
- **Lede**: `A short call is enough to see if we are a good fit.`
- **Email Address**: `hello@vayra.team`
- **Button 1 (Copy)**: `Copy email`
- **Button 2 (Mailto)**: `Email us for a quote →`
- **Status Messages**:
  - Success: `Copied: hello@vayra.team`
  - Fallback: `Selected. Press Ctrl+C or Cmd+C to copy.`

### 4.11 Footer
- **Brand**: `Vayra`
- **Tagline**: `AI-augmented teams from Latin America`
- **Links**: `What we do`, `GTM system`, `Cities`, `FAQ`
- **Copyright**: `© 2026 Vayra`

### 4.12 Exit Modal Dialog (`#exit`)
- **Heading 2**: `Scaling your engineering or GTM team?`
- **Paragraph**: `Your growth shouldn't be bottlenecked by hiring cycles. We deploy top 1% LATAM engineers and AI-augmented GTM teams in 48 hours. Drop your email to see our vetted talent.`
- **Dismiss Button**: `No thanks, just looking`

---

## 5. Existing Interactive Elements & Animation Logic

### 5.1 Hero Console Row Highlight Loop
- **Selector**: `#rows .row` (5 items)
- **Logic**: Cycles the `.on` active background class every `1600ms`.
- **Accessibility**: Automatically disabled if `prefers-reduced-motion: reduce` is active.

### 5.2 Atlas Map & Timezone Calculator
- **Coordinates & Projections**: 15 LATAM cities and 13 US cities mapped to percentages (`%`) and SVG viewBox pixels (`600x800`).
- **Dynamic Routing**: Computes a quadratic Bézier curve (`<path id="at-route">`) linking the selected US city with the selected LATAM city.
- **Live Local Time**: Uses `Intl.DateTimeFormat` with IANA timezone strings (`America/Argentina/Mendoza`, etc.) to calculate local hour, minute, and UTC offset.
- **Shared Workday Calculator**: Computes overlapping working hours (assuming standard 9 AM to 6 PM day) and renders horizontal percentage bars (`#band-you`, `#band-team`).
- **Geolocation**: Proactively queries `https://ipapi.co/json/` with an `AbortController` timeout (2500ms) to detect visitor US city and auto-select the nearest tech hub.
- **Polling Heartbeat**: Refreshes timestamps and activities every `30,000ms` (30 seconds).

### 5.3 Exit Intent Detection
- **Desktop Trigger**: `mouseout` event where `e.clientY <= 0` and `e.relatedTarget === null`.
- **Mobile Trigger**: Fast upward scroll velocity (`lastY - y > 140px` within `260ms`) after reaching a page depth > 45%.
- **Frequency Capping**: Stores `vayra-exit=1` in `sessionStorage` to avoid irritating repeated popups.
- **Accessible Focus**: Stores active element before dialog open and restores focus on close.

### 5.4 Clipboard Copy Integration
- Targets `hello@vayra.team`.
- Uses `navigator.clipboard.writeText` with graceful fallback to DOM Range selection (`createRange`, `selectNodeContents`) for unsupported browser environments.

---

## 6. Recommendations & Integration Strategy for Abstra Features

When integrating UI/UX components from the Abstra design system into Vayra:
1. **Never Replace Vayra Copy**: Slot the exact copy cataloged in Section 4 into the corresponding new UI containers.
2. **Talent Rail Integration**:
   - Vayra currently lists its 15 cities and roles in chips/cards.
   - An Abstra-style smooth horizontal talent showcase can feature Vayra's senior roles (GTM Engineers, SDRs, AI-Augmented Full-Stack Developers, RevOps Specialists) mapped to their home cities (Mendoza, Medellín, CDMX, São Paulo, etc.) with Vayra's verbatim descriptions.
3. **Scroll Reveal Animations**:
   - Utilize CSS opacity/transform transitions triggered by `IntersectionObserver`.
   - Wrap all animations in `@media (prefers-reduced-motion: no-preference)` to maintain accessibility standards.
4. **Theme Adaptation**:
   - Map all Abstra dark colors to Vayra's tokens:
     - Backgrounds → `var(--ink)` / `var(--ink-2)`
     - Borders → `var(--line)`
     - Accents → `var(--sun)`
     - Statuses → `var(--leaf)`
5. **JSON-LD Schema Clean-up**:
   - Line 984 in `public/index.html` has an HTML fragment inside the JSON string from a previous raw edit (`"name": "How we calculate this</summary>\n..."`). The implementation worker should cleanly normalize this FAQ JSON-LD entry without altering the user-facing text.
