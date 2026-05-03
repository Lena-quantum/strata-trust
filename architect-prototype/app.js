/* STRATA — interactivity (rev. 2)
   - Renders mood grid, annotations, code rows, spec rows, sim results from data
   - Stage switching with per-stage AI thread (rich: confidence rings, accuracy
     borders, vote bars, source-citation popovers)
   - Cite popover above text → "open full source" button → side panel
   - Vote bars on every source (popover, side panel, mood card, annotation)
   - Pan/zoom on ideation grid + blueprint plan (cmd+wheel zoom; drag pan)
   - Trust meter pop-over cards
*/

(function () {
  "use strict";

  /* ====================== UTILS ====================== */

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const setHidden = (el, h) => el.setAttribute("aria-hidden", h ? "true" : "false");
  const escapeHtml = (s) => s.replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

  /* ====================== STATE ====================== */

  const voteState = {};
  Object.entries(SOURCES).forEach(([id, s]) => {
    voteState[id] = { up: s.votes?.up || 0, down: s.votes?.down || 0, mine: null };
  });

  /* ====================== CONFIDENCE RING (SVG donut) ====================== */

  const RING_PCT = { high: 90, medium: 60, low: 30 };

  function ringHTML(level, lg = false) {
    const pct = RING_PCT[level] || 50;
    const cls = "conf-ring" + (lg ? " conf-ring-lg" : "");
    return `
      <svg class="${cls}" viewBox="0 0 36 36" aria-label="confidence ${level}">
        <circle class="ring-track" cx="18" cy="18" r="14" fill="none" stroke-width="3.2" pathLength="100"/>
        <circle class="ring-fill" data-level="${level}" cx="18" cy="18" r="14" fill="none" stroke-width="3.2"
                pathLength="100" stroke-dasharray="${pct} 100" stroke-linecap="round"
                transform="rotate(-90 18 18)"/>
        <text class="ring-text" x="18" y="22">${pct}</text>
      </svg>
    `;
  }

  /* ====================== VOTE BAR ====================== */

  function voteBarHTML(srcId) {
    const v = voteState[srcId] || { up: 0, down: 0, mine: null };
    const score = v.up - v.down;
    return `
      <span class="vote-bar" data-vote-src="${srcId}">
        <button class="vote-up ${v.mine === 'up' ? 'is-active' : ''}" aria-label="upvote source" data-vote="up">▲</button>
        <span class="vote-count">${score >= 0 ? "+" : ""}${score}</span>
        <button class="vote-down ${v.mine === 'down' ? 'is-active' : ''}" aria-label="downvote source" data-vote="down">▼</button>
      </span>
    `;
  }

  function bindVotesIn(root) {
    $$(".vote-bar", root).forEach(bar => {
      if (bar.dataset._bound) return;
      bar.dataset._bound = "1";
      const srcId = bar.dataset.voteSrc;
      $$("button", bar).forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const dir = btn.dataset.vote;
          const v = voteState[srcId];
          if (v.mine === dir) {
            // un-vote
            v[dir] -= 1;
            v.mine = null;
          } else {
            if (v.mine) v[v.mine] -= 1;
            v[dir] += 1;
            v.mine = dir;
          }
          updateVoteBars(srcId);
          showToast(`<strong>${dir === 'up' ? 'Upvoted' : 'Downvoted'}</strong> <code>${srcId}</code> — your trust signal persists across stages.`);
        });
      });
    });
  }

  function updateVoteBars(srcId) {
    const v = voteState[srcId];
    const score = v.up - v.down;
    $$(`.vote-bar[data-vote-src="${srcId}"]`).forEach(bar => {
      const u = bar.querySelector(".vote-up");
      const d = bar.querySelector(".vote-down");
      const c = bar.querySelector(".vote-count");
      u.classList.toggle("is-active", v.mine === "up");
      d.classList.toggle("is-active", v.mine === "down");
      c.textContent = (score >= 0 ? "+" : "") + score;
    });
  }

  /* ====================== CITE POPOVER ====================== */

  const popover = $("#cite-popover");
  const cpClass = $("#cp-class");
  const cpTitle = $("#cp-title");
  const cpPub   = $("#cp-pub");
  const cpSnippet = $("#cp-snippet");
  const cpVoteMount = $("#cp-vote-mount");
  const cpOpen  = $("#cp-open");

  let popoverFor = null;
  let popoverHideTimer = null;
  let popoverHovered = false;

  function placePopover(target) {
    const tr = target.getBoundingClientRect();
    const pr = popover.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = tr.left + tr.width / 2 - pr.width / 2;
    let top  = tr.top - pr.height - 14;
    let flipUp = false;
    if (top < 8) { top = tr.bottom + 14; flipUp = true; }
    if (left < 8) left = 8;
    if (left + pr.width > vw - 8) left = vw - 8 - pr.width;
    popover.style.left = left + "px";
    popover.style.top = top + "px";
    popover.classList.toggle("flip-up", flipUp);
  }

  function openPopover(target, srcId) {
    const src = SOURCES[srcId];
    if (!src) return;
    popoverFor = srcId;
    cpClass.textContent = src.sourceClass;
    cpClass.dataset.class = src.sourceClass;
    cpTitle.textContent = src.title;
    cpPub.textContent = `${src.publisher} · ${src.year}`;
    cpSnippet.textContent = src.snippet;
    cpVoteMount.innerHTML = voteBarHTML(srcId);
    bindVotesIn(cpVoteMount);
    cpOpen.dataset.srcId = srcId;

    popover.classList.add("is-open");
    setHidden(popover, false);
    requestAnimationFrame(() => placePopover(target));
  }
  function closePopover() {
    popover.classList.remove("is-open");
    setHidden(popover, true);
    popoverFor = null;
  }

  popover.addEventListener("mouseenter", () => {
    popoverHovered = true;
    clearTimeout(popoverHideTimer);
  });
  popover.addEventListener("mouseleave", () => {
    popoverHovered = false;
    closePopover();
  });
  cpOpen.addEventListener("click", () => {
    if (cpOpen.dataset.srcId) openSource(cpOpen.dataset.srcId);
    closePopover();
  });

  function bindCitationsIn(root) {
    $$(".cite", root).forEach(c => {
      if (c.dataset._bound) return;
      c.dataset._bound = "1";
      c.addEventListener("mouseenter", () => {
        clearTimeout(popoverHideTimer);
        openPopover(c, c.dataset.cite);
      });
      c.addEventListener("mouseleave", () => {
        popoverHideTimer = setTimeout(() => {
          if (!popoverHovered) closePopover();
        }, 140);
      });
      c.addEventListener("click", e => {
        e.preventDefault();
        openSource(c.dataset.cite);
        closePopover();
      });
    });
  }

  /* ====================== HEDGE TOOLTIPS ====================== */

  function bindHedgesIn(root) {
    $$(".hedge", root).forEach(h => {
      if (h.dataset._bound) return;
      h.dataset._bound = "1";
      h.title = "model is hedging here — " + (h.dataset.hedge || "");
    });
  }

  /* ====================== SOURCE PANEL ====================== */

  const sp = $("#source-panel");
  const spClass = $("#sp-class");
  const spTitle = $("#sp-title");
  const spPublisher = $("#sp-publisher");
  const spSnippet = $("#sp-snippet");
  const spBody = $("#sp-body-text");
  const spEntail = $("#sp-entail");
  const spTrustRow = $("#sp-trust-row");
  const spLink = $("#sp-link");

  function openSource(srcId) {
    const src = SOURCES[srcId];
    if (!src) return;
    spClass.textContent = src.sourceClass;
    spClass.dataset.class = src.sourceClass;
    spTitle.textContent = src.title;
    spPublisher.textContent = `${src.publisher} · ${src.year}`;
    spSnippet.textContent = src.snippet;
    spBody.textContent = src.body || "Full body not available in this scripted demo.";
    if (src.entail) {
      spEntail.innerHTML = `<strong>Entailment:</strong> ${src.entail}`;
      spEntail.classList.toggle("partial", /partial|inspirational/i.test(src.entail));
    }
    if (src.url) spLink.setAttribute("href", src.url);

    spTrustRow.innerHTML = `
      ${ringHTML(src.confidence || "medium", true)}
      <div class="sp-trust-meta">
        <strong>Confidence ${src.confidence || "—"}</strong>
        <span>accuracy: ${src.accuracy || "—"}</span>
      </div>
      ${voteBarHTML(srcId)}
    `;
    bindVotesIn(spTrustRow);

    sp.classList.add("is-open");
    setHidden(sp, false);
  }
  function closeSource() {
    sp.classList.remove("is-open");
    setHidden(sp, true);
  }
  $("#sp-close").addEventListener("click", closeSource);
  $("#sp-copy").addEventListener("click", () => showToast("citation copied (scripted)"));

  /* ====================== STAGE-PANEL CONTENT RENDERERS ====================== */

  /* ---- mood grid (ideation) ---- */
  function renderMoodGrid() {
    const grid = $("#mood-grid");
    if (!grid || grid.dataset._rendered) return;
    grid.dataset._rendered = "1";

    const moodIds = ["pin01", "pin02", "pin03", "pin04", "pin05", "pin06"];
    grid.innerHTML = moodIds.map(id => {
      const s = SOURCES[id];
      const trust = s.sourceClass === "precedent" ? "precedent" : "inspiration";
      const trustLabel = trust === "precedent" ? "precedent" : "mood";
      return `
        <div class="mood-card" data-cite="${id}">
          <div class="mood-art">
            <img src="${s.image}" alt="" loading="lazy" onerror="this.style.display='none'">
            <span class="mood-trust" data-trust="${trust}">${trustLabel}</span>
            <div class="mood-meta">
              <span class="mood-source-pill">${s.publisher.split('·')[0].trim()}</span>
              <div>${s.title}</div>
            </div>
          </div>
          <div class="mood-info">
            <div class="mood-tags">
              ${(s.tags || []).map(t => `<span class="mood-tag">${t}</span>`).join("")}
            </div>
            ${voteBarHTML(id)}
          </div>
        </div>
      `;
    }).join("");

    // mood-card click → open source (but not when clicking vote buttons)
    $$(".mood-card", grid).forEach(card => {
      card.addEventListener("click", e => {
        if (e.target.closest(".vote-bar")) return;
        openSource(card.dataset.cite);
      });
    });
    bindVotesIn(grid);
  }

  /* ====================== CONCEPT — VARIANTS ====================== */

  const CONCEPT_VARIANTS = {
    A: {
      label: "A · Central core",
      rationale: `<strong>Symmetric central core.</strong> Service spaces consolidated in a single 80 m² volume on the long axis; two equal served zones flank it. Closest published parallel is <a class="cite" data-cite="precedent01">Pavilion in the Park</a> at 510 m² with the same 17–18 % core ratio.`,
      svg: `
        <rect class="ground" x="0" y="0" width="920" height="380" rx="6"/>
        <line class="axis" x1="0" y1="190" x2="920" y2="190"/>
        <line class="axis" x1="460" y1="0" x2="460" y2="380"/>
        <rect class="volume" x="120" y="60" width="680" height="120" rx="6"/>
        <text x="160" y="80" fill="#2f8a5a">SERVED · NORTH · 220 m²</text>
        <rect class="volume-core" x="380" y="140" width="160" height="100" rx="6"/>
        <text x="460" y="196" text-anchor="middle" fill="#226e7e" font-weight="600">CORE · 80 m² · ~17%</text>
        <rect class="volume" x="120" y="200" width="680" height="120" rx="6"/>
        <text x="160" y="315" fill="#2f8a5a">SERVED · SOUTH · 180 m²</text>
        <g class="pin" data-pin-id="A1" data-x="220" data-y="120"><circle r="14"/><text>1</text></g>
        <g class="pin" data-pin-id="A2" data-x="460" data-y="190"><circle r="14"/><text>2</text></g>
        <g class="pin" data-pin-id="A3" data-x="700" data-y="260"><circle r="14"/><text>3</text></g>
      `,
      program: [
        { name: "Served · North", val: 220, cls: "s-served-n", color: "#2f8a5a" },
        { name: "Core",           val: 80,  cls: "s-core",     color: "#226e7e" },
        { name: "Served · South", val: 180, cls: "s-served-s", color: "#4a9c6e" }
      ],
      metrics: [
        { label: "GFA eff.",   val: "83%", level: "high" },
        { label: "Daylight D", val: "3.1%", level: "high" },
        { label: "Complexity", val: "low", level: "high" }
      ],
      precedents: ["precedent01", "precedent02"],
      annotations: [
        { n: 1, trust: "medium", level: "medium", body: `<strong>North served zone</strong> — 220 m² for primary occupancy. Daylight bias north for diffuse light, per <a class="cite" data-cite="pin03">Aalto roof typology</a>.`, meta: "precedent-grounded · 1 source", citeId: "pin03" },
        { n: 2, trust: "high",   level: "high",   body: `<strong>Central service core</strong> — 80 m² (≈17 % GFA). Within 3 % of <a class="cite" data-cite="precedent01">Pavilion in the Park</a> at 18 %.`, meta: "2 precedents agree", citeId: "precedent01" },
        { n: 3, trust: "medium", level: "medium", body: `<strong>South served zone</strong> — 180 m² for events / overflow. Smaller to <span class="hedge" data-hedge="based on a single precedent">accommodate operable façade for outdoor extension</span>, modeled after <a class="cite" data-cite="precedent02">Riverside Pavilion · Kettelhut</a>.`, meta: "single precedent · drag pin to test", citeId: "precedent02" }
      ]
    },
    B: {
      label: "B · Offset core",
      rationale: `<strong>Asymmetric, event-optimized.</strong> The core slides east; a single continuous 280 m² served zone runs the length of the building, ideal for large gatherings. Trade-off: breaks the symmetry of the precedent set; long-edge daylight likely improves <span class="hedge" data-hedge="estimated, not yet simulated">~12 %</span> but no comparable precedent at this scale.`,
      svg: `
        <rect class="ground" x="0" y="0" width="920" height="380" rx="6"/>
        <line class="axis" x1="0" y1="190" x2="920" y2="190"/>
        <line class="axis" x1="640" y1="0" x2="640" y2="380"/>
        <rect class="volume" x="120" y="60" width="520" height="260" rx="6"/>
        <text x="160" y="80" fill="#2f8a5a">SERVED · CONTINUOUS · 280 m²</text>
        <text x="160" y="298" fill="#2f8a5a">single-volume · operable façade west</text>
        <rect class="volume-core" x="640" y="60" width="160" height="160" rx="6"/>
        <text x="720" y="148" text-anchor="middle" fill="#226e7e" font-weight="600">CORE · 80 m²</text>
        <rect class="volume" x="640" y="220" width="160" height="100" rx="6"/>
        <text x="720" y="280" text-anchor="middle" fill="#2f8a5a">SECONDARY · 120 m²</text>
        <g class="pin" data-pin-id="B1" data-x="280" data-y="190"><circle r="14"/><text>1</text></g>
        <g class="pin" data-pin-id="B2" data-x="720" data-y="140"><circle r="14"/><text>2</text></g>
        <g class="pin" data-pin-id="B3" data-x="720" data-y="280"><circle r="14"/><text>3</text></g>
      `,
      program: [
        { name: "Served · main",   val: 280, cls: "s-served-n", color: "#2f8a5a" },
        { name: "Core (east)",     val: 80,  cls: "s-core",     color: "#226e7e" },
        { name: "Served · second", val: 120, cls: "s-served-s", color: "#4a9c6e" }
      ],
      metrics: [
        { label: "GFA eff.",   val: "83%", level: "high" },
        { label: "Daylight D", val: "~3.5%", level: "medium" },
        { label: "Complexity", val: "med", level: "medium" }
      ],
      precedents: ["precedent02", "pin04"],
      annotations: [
        { n: 1, trust: "medium", level: "medium", body: `<strong>Continuous served zone</strong> — 280 m² uninterrupted. Optimized for full-house events. <span class="hedge" data-hedge="no precedent at this exact configuration">No direct precedent at 480 m²</span>; estimate based on adjacent typologies.`, meta: "inferred from adjacents", citeId: "pin04" },
        { n: 2, trust: "high",   level: "high",   body: `<strong>Offset core</strong> — same 80 m² area, repositioned. Foundation strategy follows <a class="cite" data-cite="pin04">GUNNARSSONS · River cabin</a> jacked-pile detail.`, meta: "1 precedent direct match", citeId: "pin04" },
        { n: 3, trust: "low",    level: "low",    body: `<strong>Secondary served zone</strong> — 120 m² behind the core. <span class="hedge" data-hedge="risk: poor daylight access">East-facing only</span>; may need a clerestory addition. Flag for engineer review.`, meta: "no precedent · own inference", citeId: "pin04" }
      ]
    },
    C: {
      label: "C · Three micro-cores",
      rationale: `<strong>Distributed, flexibility-first.</strong> Three small cores (~30 m² each) interleave with three served zones. Highest spatial flexibility, lowest WC-distance for users — but structural complexity rises and net efficiency drops to 81 %. Suited if the brief expects multiple parallel uses.`,
      svg: `
        <rect class="ground" x="0" y="0" width="920" height="380" rx="6"/>
        <line class="axis" x1="0" y1="190" x2="920" y2="190"/>
        <rect class="volume" x="120" y="60" width="200" height="260" rx="6"/>
        <text x="220" y="80" text-anchor="middle" fill="#2f8a5a">SERVED · 130 m²</text>
        <rect class="volume-core" x="320" y="120" width="80" height="140" rx="6"/>
        <text x="360" y="200" text-anchor="middle" fill="#226e7e" font-weight="600">C1 · 30</text>
        <rect class="volume" x="400" y="60" width="180" height="260" rx="6"/>
        <text x="490" y="80" text-anchor="middle" fill="#2f8a5a">SERVED · 130 m²</text>
        <rect class="volume-core" x="580" y="120" width="80" height="140" rx="6"/>
        <text x="620" y="200" text-anchor="middle" fill="#226e7e" font-weight="600">C2 · 30</text>
        <rect class="volume" x="660" y="60" width="180" height="260" rx="6"/>
        <text x="750" y="80" text-anchor="middle" fill="#2f8a5a">SERVED · 130 m²</text>
        <g class="pin" data-pin-id="C1" data-x="220" data-y="190"><circle r="14"/><text>1</text></g>
        <g class="pin" data-pin-id="C2" data-x="490" data-y="190"><circle r="14"/><text>2</text></g>
        <g class="pin" data-pin-id="C3" data-x="750" data-y="190"><circle r="14"/><text>3</text></g>
      `,
      program: [
        { name: "Served · west",   val: 130, cls: "s-served-n", color: "#2f8a5a" },
        { name: "Cores (3 × 30)",  val: 90,  cls: "s-core",     color: "#226e7e" },
        { name: "Served · center", val: 130, cls: "s-served-s", color: "#4a9c6e" },
        { name: "Served · east",   val: 130, cls: "s-served-e", color: "#6db38a" }
      ],
      metrics: [
        { label: "GFA eff.",   val: "81%", level: "medium" },
        { label: "Daylight D", val: "3.4%", level: "high" },
        { label: "Complexity", val: "high", level: "low" }
      ],
      precedents: ["pin06", "pin01"],
      annotations: [
        { n: 1, trust: "medium", level: "medium", body: `<strong>West served zone</strong> — 130 m² with adjacent micro-core. Pattern modeled on <a class="cite" data-cite="pin06">SANAA pavilion typologies</a>.`, meta: "precedent-grounded", citeId: "pin06" },
        { n: 2, trust: "low",    level: "low",    body: `<strong>Central served zone</strong> — 130 m² between two cores. <span class="hedge" data-hedge="three-core layout uncommon at 480 m²">Structural rhythm uncertain at this scale</span>; flag for engineer.`, meta: "no precedent at 480 m²", citeId: "pin01" },
        { n: 3, trust: "medium", level: "medium", body: `<strong>East served zone</strong> — 130 m² mirrors the west. Symmetry restored across the long axis; lighting consistency simplified.`, meta: "internal consistency", citeId: "pin06" }
      ]
    }
  };

  let activeVariant = "A";

  function renderConcept() {
    const v = CONCEPT_VARIANTS[activeVariant];
    if (!v) return;

    // canvas label
    $("#concept-canvas-label").textContent = `massing study · variant ${activeVariant}`;

    // massing svg
    $("#massing-svg").innerHTML = v.svg;

    // rationale
    const rat = $("#concept-rationale");
    rat.innerHTML = v.rationale;
    bindCitationsIn(rat);
    bindHedgesIn(rat);

    // program donut
    renderProgramDonut(v.program);

    // metrics
    $("#metrics-row").innerHTML = v.metrics.map(m => `
      <div class="metric">
        ${ringHTML(m.level)}
        <span class="m-label">${m.label}</span>
        <span class="m-val">${m.val}</span>
      </div>
    `).join("");

    // precedents
    $("#precedent-strip").innerHTML = v.precedents.map(id => {
      const s = SOURCES[id];
      return `
        <div class="precedent-tile" data-cite="${id}">
          <img src="${s.image || ''}" alt="" loading="lazy" onerror="this.style.display='none'">
          <div class="p-overlay">${s.title}</div>
        </div>
      `;
    }).join("");
    $$(".precedent-tile", $("#precedent-strip")).forEach(t => {
      t.addEventListener("click", () => openSource(t.dataset.cite));
    });

    // annotations
    const ah = $("#concept-annotations");
    ah.innerHTML = v.annotations.map(it => `
      <div class="annotation" data-trust="${it.trust}">
        <span class="anno-num">${it.n}</span>
        <div class="anno-body">
          ${it.body}
          <div class="anno-conf">
            ${ringHTML(it.level)}
            <span style="font-size: 11.5px; color: var(--muted); flex:1;">${it.meta}</span>
            ${voteBarHTML(it.citeId)}
          </div>
        </div>
      </div>
    `).join("");
    bindCitationsIn(ah);
    bindHedgesIn(ah);
    bindVotesIn(ah);

    // active variant button
    $$("#concept-variants .variant-btn").forEach(b => {
      b.classList.toggle("is-active", b.dataset.variant === activeVariant);
    });

    // re-init pins on the new SVG
    const svg = $("#massing-svg");
    delete svg.dataset._inited;
    initPins("concept");
  }

  function renderProgramDonut(items) {
    const total = items.reduce((s, i) => s + i.val, 0);
    const svg = $("#program-donut");
    const C = 100; // pathLength normalized
    let acc = 0;
    const segs = items.map(it => {
      const pct = (it.val / total) * 100;
      const seg = `<circle class="donut-seg ${it.cls}" cx="18" cy="18" r="14" pathLength="100"
                     stroke-dasharray="${pct} 100" stroke-dashoffset="${-acc}"
                     transform="rotate(-90 18 18)" />`;
      acc += pct;
      return seg;
    }).join("");
    svg.innerHTML = `
      <circle class="donut-track" cx="18" cy="18" r="14" pathLength="100" />
      ${segs}
      <text x="18" y="20" text-anchor="middle" font-family="JetBrains Mono" font-size="5" font-weight="600" fill="#1c1a25">${total}m²</text>
    `;

    $("#program-legend").innerHTML = items.map(i => `
      <div class="program-legend-row">
        <span class="p-dot" style="background:${i.color}"></span>
        <span class="p-name">${i.name}</span>
        <span class="p-val">${i.val} m²</span>
      </div>
    `).join("");
  }

  function bindConceptVariants() {
    $$("#concept-variants .variant-btn").forEach(btn => {
      if (btn.dataset._bound) return;
      btn.dataset._bound = "1";
      btn.addEventListener("click", () => {
        activeVariant = btn.dataset.variant;
        renderConcept();
        showToast(`<strong>Variant ${activeVariant}</strong> · ${CONCEPT_VARIANTS[activeVariant].label.split('·')[1].trim()} loaded.`);
      });
    });
  }

  /* ---- code checklist ---- */
  function renderCodeChecklist() {
    const host = $("#code-checklist");
    if (!host || host.dataset._rendered) return;
    host.dataset._rendered = "1";

    const rows = [
      {
        kind: "pass", trust: "high", level: "high",
        body: `<strong>Corridor width</strong> — 1.55 m · meets 1.50 m minimum.`,
        src: `→ <a class="cite" data-cite="din18040">DIN 18040-1 §4.3.2</a>`,
        citeId: "din18040"
      },
      {
        kind: "fail", trust: "low", level: "high",
        body: `<strong>WC count ratio</strong> — 1:30 current · fails 1:25 minimum for assembly use.`,
        src: `→ <a class="cite" data-cite="mbo">MBO §47 (2)</a> · <span class="hedge" data-hedge="local LBO interpretation pending">recommend converting storage to unisex WC</span>`,
        citeId: "mbo"
      },
      {
        kind: "pass", trust: "high", level: "high",
        body: `<strong>Daylight factor</strong> — D = 3.1% · meets 2% recommendation.`,
        src: `→ <a class="cite" data-cite="asr">ASR A3.4 §4.1</a> · simulation confidence band: ±0.4%`,
        citeId: "asr"
      }
    ];

    host.innerHTML = rows.map(r => `
      <div class="code-row ${r.kind}" data-trust="${r.trust}">
        <span class="check-icon">${r.kind === 'pass' ? '✓' : '✗'}</span>
        <div>
          ${r.body}
          <div class="code-source">${r.src}</div>
        </div>
        ${ringHTML(r.level)}
        ${voteBarHTML(r.citeId)}
      </div>
    `).join("");

    bindCitationsIn(host);
    bindHedgesIn(host);
    bindVotesIn(host);
  }

  /* ---- detail spec stack ---- */
  function renderSpecStack() {
    const host = $("#spec-stack");
    if (!host || host.dataset._rendered) return;
    host.dataset._rendered = "1";

    const rows = [
      {
        name: "Composite U-value", value: "0.18 W/(m²·K)", valueClass: "good",
        meta: `Reference: <a class="cite" data-cite="din4108">GEG 2024 ≤ 0.24</a> · exceeds requirement by 25%`,
        trust: "high", level: "high", citeId: "din4108"
      },
      {
        name: "Insulation", value: "λ = 0.035 W/(m·K)", valueClass: "",
        meta: `<a class="cite" data-cite="rockwool">Rockwool RP-PT</a> · A1 fire class · 200 mm`,
        trust: "high", level: "high", citeId: "rockwool"
      },
      {
        name: "Roof deck (Brettstapel)", value: "160 mm — flag", valueClass: "flag",
        meta: `Span table fails at 6.0 m grid. <span class="hedge" data-hedge="from manufacturer span table — verified">Increase to 200 mm or add secondary beam at 3.0 m.</span> See <a class="cite" data-cite="brettstapel">handbook</a>.`,
        trust: "medium", level: "medium", citeId: "brettstapel"
      },
      {
        name: "Vapor control", value: "sd = 4.0 m", valueClass: "",
        meta: `Continuous OSB layer functions as airtight + vapor-control plane.`,
        trust: "high", level: "high", citeId: null
      }
    ];

    host.innerHTML = rows.map(r => `
      <div class="spec-row" data-trust="${r.trust}">
        <div class="spec-head">
          <span class="spec-name">${r.name}</span>
          <span class="spec-value ${r.valueClass}">${r.value}</span>
        </div>
        <div class="spec-meta">${r.meta}</div>
        <div class="spec-foot">
          ${ringHTML(r.level)}
          ${r.citeId ? voteBarHTML(r.citeId) : '<span style="color:var(--muted);font-size:11px;">no external source — internal calculation</span>'}
        </div>
      </div>
    `).join("");

    bindCitationsIn(host);
    bindHedgesIn(host);
    bindVotesIn(host);
  }

  /* ---- sim results ---- */
  function renderSimResults() {
    const struct = $("#sim-struct-results");
    const day = $("#sim-daylight-results");
    if (struct && !struct.dataset._rendered) {
      struct.dataset._rendered = "1";
      struct.innerHTML = `
        <div class="sim-result-row">
          ${ringHTML("high")}
          <div class="sr-text">Max deflection · <strong>8.4 mm</strong> ± 1.2 (95% CI)</div>
          ${voteBarHTML("simEngine")}
        </div>
        <div class="sim-result-row">
          ${ringHTML("high")}
          <div class="sr-text">Limit (L/300) · <strong>20.0 mm</strong></div>
        </div>
        <div class="sim-result-row">
          ${ringHTML("high")}
          <div class="sr-text">Utilization · <strong>42%</strong></div>
        </div>
      `;
      bindVotesIn(struct);
    }
    if (day && !day.dataset._rendered) {
      day.dataset._rendered = "1";
      day.innerHTML = `
        <div class="sim-result-row">
          ${ringHTML("high")}
          <div class="sr-text">sDA(300, 50%) overall · <strong>71%</strong></div>
          ${voteBarHTML("daylight")}
        </div>
        <div class="sim-result-row">
          ${ringHTML("high")}
          <div class="sr-text">Target (LM-83) · <strong>≥ 50%</strong></div>
        </div>
        <div class="sim-result-row">
          ${ringHTML("medium")}
          <div class="sr-text">ASE (1000, 250h) · <strong>8%</strong> <span style="color:var(--t-inferred);">(limit 10%)</span></div>
        </div>
      `;
      bindVotesIn(day);
    }
  }

  /* ====================== AI THREAD RENDERER ====================== */

  const aiThread    = $("#ai-thread");
  const roleBadge   = $("#role-badge");
  const roleStakes  = $("#role-stakes");
  const rolePosture = $("#role-posture");
  const mCompetence = $("#m-competence");
  const mConfidence = $("#m-confidence");
  const mAccuracy   = $("#m-accuracy");

  function renderThread(stageKey) {
    const cfg = STAGES[stageKey];
    if (!cfg) return;
    aiThread.innerHTML = "";
    cfg.thread.forEach(msg => {
      const el = document.createElement("div");
      el.className = "msg " + (msg.who === "user" ? "user" : "ai");
      const who = msg.who === "user" ? "you" : (msg.role || "ai");

      let trustStrip = "";
      if (msg.who === "ai" && msg.confidence) {
        const pct = RING_PCT[msg.confidence] || 50;
        trustStrip = `
          <div class="trust-strip">
            <span class="ts-label">conf</span>
            <span class="ts-bar"><span class="ts-fill" data-level="${msg.confidence}" style="width: ${pct}%"></span></span>
            ${ringHTML(msg.confidence)}
          </div>
        `;
      }

      const cites = (msg.cites || []).map(id => `<span class="cite-tag" data-cite="${id}">${id}</span>`).join("");

      el.innerHTML = `
        <div class="msg-meta">
          <span class="who">${who}</span>
          ${msg.cites ? `<div class="msg-cites">${cites}</div>` : ""}
        </div>
        <div class="msg-bubble" ${msg.accuracy ? `data-accuracy="${msg.accuracy}"` : ""}>
          ${msg.text}
          ${trustStrip}
        </div>
      `;
      aiThread.appendChild(el);
    });
    aiThread.scrollTop = 0;
    bindCitationsIn(aiThread);
    bindHedgesIn(aiThread);

    // wire .cite-tag chips at top of bubbles
    $$(".cite-tag", aiThread).forEach(t => {
      t.addEventListener("click", e => {
        e.preventDefault();
        openSource(t.dataset.cite);
      });
      t.addEventListener("mouseenter", () => openPopover(t, t.dataset.cite));
      t.addEventListener("mouseleave", () => {
        popoverHideTimer = setTimeout(() => { if (!popoverHovered) closePopover(); }, 140);
      });
    });
  }

  /* ====================== STAGE SWITCHING ====================== */

  const stagePanels = $$(".stage-panel");
  const stageBtns   = $$(".stage-btn");

  function setStage(stageKey) {
    const cfg = STAGES[stageKey];
    if (!cfg) return;

    stagePanels.forEach(p => p.classList.toggle("is-active", p.dataset.stage === stageKey));
    stageBtns.forEach(b => b.classList.toggle("is-active", b.dataset.stage === stageKey));

    roleBadge.textContent = cfg.role;
    roleBadge.dataset.role = cfg.role;
    roleStakes.textContent = cfg.stakes + " stakes";
    rolePosture.textContent = cfg.posture;

    mCompetence.textContent = cfg.competence;
    mConfidence.textContent = cfg.confidence;
    mAccuracy.textContent   = cfg.accuracy;

    // update meter gauges (topbar)
    const lvls = cfg.levels || { competence: "medium", confidence: "medium", accuracy: "medium" };
    setMeterGauge("competence", lvls.competence);
    setMeterGauge("confidence", lvls.confidence);
    setMeterGauge("accuracy",   lvls.accuracy);

    // update AI panel trust dashboard
    setAtlGauge("competence", lvls.competence, cfg.competence);
    setAtlGauge("confidence", lvls.confidence, cfg.confidence);
    setAtlGauge("accuracy",   lvls.accuracy,   cfg.accuracy);

    renderThread(stageKey);

    // stage-specific content
    if (stageKey === "ideation")   { renderMoodGrid(); ensurePanZoom("ideation"); }
    if (stageKey === "concept")    { bindConceptVariants(); renderConcept(); }
    if (stageKey === "blueprint")  {
      renderCodeChecklist();
      initPins("blueprint");
      ensurePanZoom("blueprint");
      bindPlanRooms();
      renderInsight(null);   // empty-state on stage entry
    }
    if (stageKey === "detail")     renderSpecStack();
    if (stageKey === "simulation") renderSimResults();

    closePopover();
  }

  /* ====================== METER GAUGE HELPERS ====================== */

  const PCT = { low: 32, medium: 64, high: 92 };

  function setMeterGauge(key, level) {
    const fill = document.getElementById("g-" + key);
    if (!fill) return;
    const pct = PCT[level] || 50;
    fill.dataset.level = level;
    fill.style.width = pct + "%";
  }
  function setAtlGauge(key, level, valueText) {
    const fill = document.getElementById("atl-" + key);
    const val  = document.getElementById("atlv-" + key);
    if (fill) {
      const pct = PCT[level] || 50;
      fill.dataset.level = level;
      fill.style.width = pct + "%";
    }
    if (val && valueText) val.textContent = valueText;
  }

  /* ====================== BLUEPRINT — CLICKABLE ROOMS + INSIGHT ====================== */

  let selectedRoomId = null;

  function bindPlanRooms() {
    const svg = $("#plan-svg");
    if (!svg || svg.dataset._roomsBound) return;
    svg.dataset._roomsBound = "1";

    $$(".plan-room", svg).forEach(rect => {
      rect.addEventListener("click", e => {
        e.stopPropagation();
        selectRoom(rect.dataset.elemId);
      });
    });
  }

  function selectRoom(elemId) {
    selectedRoomId = elemId;
    const svg = $("#plan-svg");
    if (svg) {
      $$(".plan-room", svg).forEach(r => r.classList.toggle("is-selected", r.dataset.elemId === elemId));
    }
    renderInsight(elemId);
    if (elemId) {
      const elem = PLAN_ELEMENTS[elemId];
      if (elem) showToast(`<strong>${elem.name}</strong> selected · ${elem.facts.length} facts`);
    }
  }

  function renderInsight(elemId) {
    const host = $("#bp-insight");
    if (!host) return;

    if (!elemId) {
      host.innerHTML = `
        <div class="bpi-empty">
          <span class="bpi-empty-cue">tap a room or pin to inspect</span>
          The assistant will surface code references, confidence, and applicable trade-offs for any element you click.
        </div>
      `;
      return;
    }

    const elem = PLAN_ELEMENTS[elemId];
    if (!elem) return;

    const factsHTML = elem.facts.map(f => {
      const pct = PCT[f.level] || 50;
      const cite = f.citeId ? ` · <a class="cite" data-cite="${f.citeId}">source</a>` : "";
      return `
        <div class="fact-row" data-status="${f.status || 'info'}">
          <span class="fact-label">${f.label}</span>
          <span class="fact-value">${f.value}</span>
          <span class="fact-required">${f.required || '—'}</span>
          <span class="fact-note">${f.note || ''}${cite}</span>
          <span class="fact-bar-cell">
            <span class="fact-bar-track"><span class="fact-bar-fill" data-level="${f.level || 'medium'}" style="width:${pct}%"></span></span>
            <span class="fact-bar-label">conf · ${f.level || 'medium'}</span>
          </span>
        </div>
      `;
    }).join("");

    host.innerHTML = `
      <div class="bpi-head">
        <div>
          <span class="bpi-badge">${elem.badge || 'element'}</span>
          <h3>${elem.name}</h3>
          <div class="bpi-meta">
            <span><strong>area</strong> ${elem.area || '—'}</span>
            ${elem.occupancy ? `<span><strong>occupancy</strong> ${elem.occupancy}</span>` : ''}
          </div>
        </div>
        <div class="bpi-summary">${elem.summary || ''}</div>
      </div>
      <div class="bpi-facts">${factsHTML}</div>
      <div class="bpi-foot">
        <span>${elem.facts.length} fact${elem.facts.length === 1 ? '' : 's'} · ${elem.facts.filter(f => f.status === 'pass').length} pass · ${elem.facts.filter(f => f.status === 'fail').length} fail · ${elem.facts.filter(f => f.status === 'flag').length} flag</span>
        <button class="bpi-deselect" id="bpi-deselect">clear selection</button>
      </div>
    `;

    bindCitationsIn(host);
    $("#bpi-deselect").addEventListener("click", () => selectRoom(null));
  }

  stageBtns.forEach(btn => btn.addEventListener("click", () => setStage(btn.dataset.stage)));

  /* ====================== PIN DRAG ====================== */

  function initPins(stageKey) {
    const svg = stageKey === "concept" ? $("#massing-svg") : $("#plan-svg");
    if (!svg) return;
    placePinsIn(svg);
    if (svg.dataset._inited) return;
    svg.dataset._inited = "1";
    enablePinDrag(svg);
  }
  function placePinsIn(svg) {
    $$(".pin", svg).forEach(p => {
      p.setAttribute("transform", `translate(${+p.dataset.x}, ${+p.dataset.y})`);
    });
  }
  function enablePinDrag(svg) {
    let active = null, start = null, nodeStart = null, totalMove = 0;
    function svgPoint(evt) {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    svg.addEventListener("pointerdown", e => {
      const pin = e.target.closest(".pin");
      if (!pin) return;
      e.stopPropagation();
      active = pin;
      totalMove = 0;
      pin.classList.add("is-drag");
      svg.setPointerCapture(e.pointerId);
      start = svgPoint(e);
      nodeStart = { x: +pin.dataset.x, y: +pin.dataset.y };
    });
    svg.addEventListener("pointermove", e => {
      if (!active) return;
      const p = svgPoint(e);
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      totalMove += Math.abs(dx) + Math.abs(dy);
      const nx = nodeStart.x + dx;
      const ny = nodeStart.y + dy;
      active.dataset.x = nx;
      active.dataset.y = ny;
      active.setAttribute("transform", `translate(${nx}, ${ny})`);
    });
    function end() {
      if (!active) return;
      active.classList.remove("is-drag");
      const id = active.dataset.pinId;
      const elemTarget = active.dataset.elemTarget;
      const wasClick = totalMove < 4;
      active = null;
      if (wasClick && elemTarget) {
        // click on a pin opens the insight for the targeted element
        selectRoom(elemTarget);
      } else if (!wasClick) {
        showToast(`<strong>annotation pin moved.</strong> the assistant would re-run the local check on next prompt — <code>${id}</code>`);
      }
    }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
  }

  /* ====================== PAN / ZOOM ====================== */

  const panState = {}; // { ideation: {scale, tx, ty}, blueprint: {...} }

  function ensurePanZoom(key) {
    const canvas = $(`#zoom-${key}`);
    if (!canvas || canvas.dataset._panBound) return;
    canvas.dataset._panBound = "1";
    const target = canvas.querySelector(".zoom-target");
    panState[key] = { scale: 1, tx: 0, ty: 0 };

    function apply() {
      const s = panState[key];
      target.style.transform = `translate(${s.tx}px, ${s.ty}px) scale(${s.scale})`;
      const readout = canvas.querySelector(`[data-zoom-readout="${key}"]`);
      if (readout) readout.textContent = Math.round(s.scale * 100) + "%";
    }

    // wheel zoom — requires cmd/ctrl, otherwise let page scroll happen normally
    canvas.addEventListener("wheel", e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const s = panState[key];
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.max(0.4, Math.min(3, s.scale * factor));
      const ratio = newScale / s.scale;
      s.tx = cx - ratio * (cx - s.tx);
      s.ty = cy - ratio * (cy - s.ty);
      s.scale = newScale;
      apply();
    }, { passive: false });

    // drag pan
    let dragging = false, sx, sy, didMove = false;
    canvas.addEventListener("pointerdown", e => {
      if (e.target.closest("button, a, .mood-card, .cite, .vote-bar, .pin, .plan-room")) return;
      dragging = true; didMove = false;
      sx = e.clientX - panState[key].tx;
      sy = e.clientY - panState[key].ty;
      canvas.classList.add("is-grabbing");
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener("pointermove", e => {
      if (!dragging) return;
      panState[key].tx = e.clientX - sx;
      panState[key].ty = e.clientY - sy;
      didMove = true;
      apply();
    });
    function endPan() {
      dragging = false;
      canvas.classList.remove("is-grabbing");
    }
    canvas.addEventListener("pointerup", endPan);
    canvas.addEventListener("pointercancel", endPan);
    canvas.addEventListener("pointerleave", endPan);

    // controls
    $$(".zoom-btn", canvas).forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const s = panState[key];
        const cmd = btn.dataset.zoom;
        if (cmd === "in")  s.scale = Math.min(3, s.scale * 1.18);
        if (cmd === "out") s.scale = Math.max(0.4, s.scale * 0.85);
        if (cmd === "reset") { s.scale = 1; s.tx = 0; s.ty = 0; }
        apply();
      });
    });

    apply();
  }

  /* ====================== TRUST METER POPOVER ====================== */

  const meterCard = $("#meter-card");
  const mcTitle   = $("#mc-title");
  const mcSub     = $("#mc-sub");
  const mcBody    = $("#mc-body");

  const METER_COPY = {
    competence: {
      title: "Competence",
      body: "The role the assistant takes for this stage. Each stage assigns a different competence — peer in ideation, expert in blueprint review, simulator in modeling. Higher competence = higher accountability for sourcing each claim."
    },
    confidence: {
      title: "Confidence",
      body: "How strongly the assistant asserts in this stage. In ideation, low confidence is fine — the model is brainstorming. In blueprint and simulation, confidence must be backed by sourced claims; hedge typography marks any clause where the model is unsure."
    },
    accuracy: {
      title: "Accuracy posture",
      body: "What grounding is expected of every claim. Ideation tolerates inspirational references. Blueprint requires every claim to cite a code. Simulation requires explicit confidence bands and model assumptions on every result."
    }
  };

  $$(".meter-pill").forEach(pill => {
    pill.addEventListener("click", e => {
      e.stopPropagation();
      const key = pill.dataset.meter;
      const copy = METER_COPY[key];
      mcTitle.textContent = copy.title;
      const valEl = pill.querySelector(".meter-value");
      mcSub.textContent = valEl ? valEl.textContent : "";
      mcBody.textContent = copy.body;

      const r = pill.getBoundingClientRect();
      meterCard.style.right = (window.innerWidth - r.right) + "px";
      meterCard.style.top   = (r.bottom + 8) + "px";

      meterCard.classList.add("is-open");
      setHidden(meterCard, false);
    });
  });
  document.addEventListener("click", e => {
    if (!meterCard.contains(e.target) && !e.target.closest(".meter-pill")) {
      meterCard.classList.remove("is-open");
      setHidden(meterCard, true);
    }
    // close popover on outside click
    if (!popover.contains(e.target) && !e.target.closest(".cite, .cite-tag")) {
      closePopover();
    }
    // close source panel on backdrop click in canvas
    if (!sp.contains(e.target) && sp.classList.contains("is-open") && !e.target.closest(".cite, .cite-tag, .mood-card, .vote-bar")) {
      // require that the click target is in canvas/main area — keep panel open for clicks in the panel itself
      const inPanel = e.target.closest("#source-panel");
      if (!inPanel && e.target.closest(".canvas")) {
        closeSource();
      }
    }
  });

  /* ====================== COMPOSER ====================== */

  $("#ai-send").addEventListener("click", handleSend);
  $("#ai-input").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });

  function handleSend() {
    const inp = $("#ai-input");
    const txt = inp.value.trim();
    if (!txt) {
      showToast("type a question — try \"what would change if we offset the core?\"");
      return;
    }
    inp.value = "";

    const userEl = document.createElement("div");
    userEl.className = "msg user";
    userEl.innerHTML = `
      <div class="msg-meta"><span class="who">you</span></div>
      <div class="msg-bubble">${escapeHtml(txt)}</div>
    `;
    aiThread.appendChild(userEl);

    const cfg = STAGES[currentStage()];
    const reply = `<em>This is a scripted prototype — I don't actually re-generate.</em> In a production STRATA, your message would route through the <strong>${cfg.role}</strong> role with <strong>${cfg.accuracy}</strong> grounding requirements; any new claim would carry a confidence ring and a source chip.`;
    setTimeout(() => {
      const aiEl = document.createElement("div");
      aiEl.className = "msg ai";
      aiEl.innerHTML = `
        <div class="msg-meta"><span class="who">${cfg.role}</span></div>
        <div class="msg-bubble" data-accuracy="inferred">
          ${reply}
          <div class="trust-strip">
            <span class="ts-label">conf</span>
            <span class="ts-bar"><span class="ts-fill" data-level="medium" style="width: 60%"></span></span>
            ${ringHTML("medium")}
          </div>
        </div>
      `;
      aiThread.appendChild(aiEl);
      aiThread.scrollTop = aiThread.scrollHeight;
    }, 340);

    aiThread.scrollTop = aiThread.scrollHeight;
  }

  function currentStage() {
    return ($(".stage-btn.is-active") || {}).dataset?.stage || "ideation";
  }

  /* ====================== AI PANEL MINIMIZE / ORB ====================== */

  const aiOrb = $("#ai-orb");
  const aiMin = $("#ai-minimize");

  function setCollapsed(collapsed) {
    document.body.classList.toggle("ai-collapsed", collapsed);
  }
  aiMin.addEventListener("click", () => {
    setCollapsed(true);
    showToast("<strong>advisor minimized.</strong> click the orb on the right to bring it back.");
  });
  aiOrb.addEventListener("click", () => {
    setCollapsed(false);
  });

  /* ====================== TOAST ====================== */

  const toastEl = $("#toast");
  let toastTimer;
  function showToast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-open"), 3400);
  }

  /* ====================== KEY BINDINGS ====================== */

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeSource();
      closePopover();
      meterCard.classList.remove("is-open");
      setHidden(meterCard, true);
    }
    if (/^[1-5]$/.test(e.key) && document.activeElement.tagName !== "INPUT") {
      const order = ["ideation", "concept", "blueprint", "detail", "simulation"];
      setStage(order[+e.key - 1]);
    }
  });

  /* ====================== INIT ====================== */

  const urlStage = new URLSearchParams(location.search).get("stage");
  setStage(urlStage && STAGES[urlStage] ? urlStage : "ideation");

  setTimeout(() => {
    showToast("<strong>STRATA — five stages.</strong> Hover an underlined source for a quick card · click for the full panel · upvote / downvote with ▲ ▼ · ⌘ + scroll to zoom the canvas · drag to pan.");
  }, 700);

})();
