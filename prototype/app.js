/* trust prototype — interactivity
   Wires up the trust-system surface: citation hover-cards, side-panel, hedge
   tooltips, confidence-pill calibration tooltips, feedback chips, modality
   switcher, manipulable diagram, agent trace, persistent steering bar,
   competence indicator, calibration card, legend, cognitive-forcing toggle,
   composer.

   Demo content is scripted in index.html; this file binds behaviour to it.
*/

(function () {
  "use strict";

  /* ====================== STATE ====================== */

  const state = {
    steering: {
      hedge: "measured",
      sources: "any",
      audience: "practitioner"
    },
    forcing: false,
    feedback: {},   // { claimId: 'accept' | 'reject' | 'refine' }
    rejected: 0
  };

  /* ====================== UTIL ====================== */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const setHidden = (el, hidden) => el.setAttribute("aria-hidden", hidden ? "true" : "false");

  function placeFloating(target, el, gap = 8) {
    const tr = target.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    let left = tr.left + tr.width / 2 - er.width / 2;
    let top  = tr.bottom + gap;
    const vw = window.innerWidth, vh = window.innerHeight;
    if (left < 8) left = 8;
    if (left + er.width > vw - 8) left = vw - 8 - er.width;
    if (top + er.height > vh - 8) top = tr.top - er.height - gap;
    el.style.left = left + "px";
    el.style.top  = top + "px";
  }

  /* ====================== POPOVER (citation hover-card) ====================== */

  const pop = $("#popover");
  const popFavicon = $("#pop-favicon");
  const popTitle = $("#pop-title");
  const popDomain = $("#pop-domain");
  const popSnippet = $("#pop-snippet");
  const popClass = $("#pop-class");
  const popOpen = $("#pop-open");

  let popoverTarget = null;
  let popoverHoverEl = null;
  let popoverHideTimer = null;

  function openPopover(target, citeId) {
    const src = SOURCES[citeId];
    if (!src) return;
    popoverTarget = target;
    popTitle.innerHTML = src.title;
    popDomain.textContent = src.domain;
    popSnippet.textContent = src.snippet;
    popClass.textContent = src.sourceClass;
    popClass.dataset.class = src.sourceClass;
    popFavicon.textContent = src.favicon || "·";
    popOpen.dataset.cite = citeId;

    pop.classList.add("is-open");
    setHidden(pop, false);
    placeFloating(target, pop);
  }
  function closePopover() {
    pop.classList.remove("is-open");
    setHidden(pop, true);
    popoverTarget = null;
  }

  function bindCitations() {
    $$("sup.cite").forEach(chip => {
      chip.addEventListener("mouseenter", () => {
        clearTimeout(popoverHideTimer);
        openPopover(chip, chip.dataset.cite);
      });
      chip.addEventListener("mouseleave", () => {
        popoverHideTimer = setTimeout(() => {
          if (popoverHoverEl !== pop) closePopover();
        }, 100);
      });
      chip.addEventListener("focus", () => openPopover(chip, chip.dataset.cite));
      chip.addEventListener("blur",  closePopover);
      chip.addEventListener("click", e => {
        e.preventDefault();
        openSourcePanel(chip.dataset.cite);
      });
      chip.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openSourcePanel(chip.dataset.cite);
        }
      });
    });

    pop.addEventListener("mouseenter", () => {
      popoverHoverEl = pop;
      clearTimeout(popoverHideTimer);
    });
    pop.addEventListener("mouseleave", () => {
      popoverHoverEl = null;
      closePopover();
    });

    popOpen.addEventListener("click", () => openSourcePanel(popOpen.dataset.cite));
  }

  /* ====================== SOURCE SIDE PANEL ====================== */

  const sp = $("#source-panel");
  const spTitle = $("#sp-title");
  const spClass = $("#sp-class");
  const spDomain = $("#sp-domain");
  const spYear = $("#sp-year");
  const spBody = $("#sp-body");
  const spEntail = $("#sp-entail");

  function openSourcePanel(citeId) {
    const src = SOURCES[citeId];
    if (!src) return;
    spTitle.innerHTML = src.title;
    spClass.textContent = src.sourceClass;
    spDomain.textContent = src.domain;
    spYear.textContent = src.year;
    spBody.innerHTML = src.body;
    spEntail.innerHTML = "<strong>Entailment</strong>: " + src.entail;
    sp.classList.add("is-open");
    setHidden(sp, false);
    closePopover();
    closeTracePanel(); // mutually exclusive
    document.body.classList.add("source-open");
    $$("sup.cite").forEach(c => c.classList.toggle("is-active", c.dataset.cite === citeId));
  }
  function closeSourcePanel() {
    sp.classList.remove("is-open");
    setHidden(sp, true);
    document.body.classList.remove("source-open");
    $$("sup.cite").forEach(c => c.classList.remove("is-active"));
  }
  $("#sp-close").addEventListener("click", closeSourcePanel);

  /* ====================== TOOLTIP (hedge + confidence) ====================== */

  const tt = $("#tooltip");
  function openTooltip(target, text) {
    tt.textContent = text;
    tt.classList.add("is-open");
    setHidden(tt, false);
    placeFloating(target, tt, 6);
  }
  function closeTooltip() {
    tt.classList.remove("is-open");
    setHidden(tt, true);
  }

  function bindTooltips() {
    $$(".hedge[data-hedge]").forEach(el => {
      el.addEventListener("mouseenter", () => openTooltip(el, "model is hedging here — " + el.dataset.hedge));
      el.addEventListener("mouseleave", closeTooltip);
      el.addEventListener("focus",  () => openTooltip(el, "model is hedging here — " + el.dataset.hedge));
      el.addEventListener("blur", closeTooltip);
    });

    $$(".confidence").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const lvl = el.dataset.level;
        const map = {
          high:   "calibrated band: ~87% empirical accuracy on test set. click the competence indicator to see the calibration card.",
          medium: "calibrated band: ~64% empirical accuracy. multiple sources disagreed on exact value.",
          low:    "calibrated band: ~31%. claim is plausible but unverified."
        };
        openTooltip(el, map[lvl] || "confidence band");
      });
      el.addEventListener("mouseleave", closeTooltip);
    });

    $$(".no-source").forEach(el => {
      el.addEventListener("mouseenter", () => {
        openTooltip(el, "this claim has no source — it's the assistant's inference. handle accordingly.");
      });
      el.addEventListener("mouseleave", closeTooltip);
    });

    $$(".opinion-mark").forEach(el => {
      el.addEventListener("mouseenter", () => {
        openTooltip(el, "this is a recommendation, not a fact. you can accept, refine, or reject it below.");
      });
      el.addEventListener("mouseleave", closeTooltip);
    });
  }

  /* ====================== FEEDBACK CHIPS ====================== */

  function bindFeedback() {
    $$(".fb-btn").forEach((btn, idx) => {
      btn.dataset.cid = btn.dataset.cid || ("c" + idx);
      btn.addEventListener("click", () => {
        const fb = btn.dataset.fb;
        const group = btn.closest(".claim-feedback");
        const claim = btn.closest(".claim");

        const wasActive = btn.classList.contains("is-active");
        $$(".fb-btn", group).forEach(b => b.classList.remove("is-active"));

        if (wasActive) {
          // toggling off
          if (claim) claim.classList.remove("is-rejected");
          delete state.feedback[btn.dataset.cid];
          showToast({ kind: "info", text: "feedback cleared" });
          return;
        }

        btn.classList.add("is-active");
        state.feedback[btn.dataset.cid] = fb;

        if (fb === "accept") {
          showToast({ kind: "ok", text: "<span class='toast-strong'>accepted.</span> next response will treat this as common ground." });
        } else if (fb === "refine") {
          showToast({ kind: "info", text: "<span class='toast-strong'>refining…</span> the assistant would re-run only this claim. (prototype: not actually re-running)" });
        } else if (fb === "reject") {
          state.rejected += 1;
          if (claim) claim.classList.add("is-rejected");
          showToast({ kind: "warn", text: "<span class='toast-strong'>rejected.</span> the assistant will acknowledge this in its next turn — silent absorption is a bug." });
          // Demonstrate inbound-flow leg 3: pattern of rejections nudges hedging to cautious
          if (state.rejected >= 2 && state.steering.hedge !== "cautious") {
            setSteering("hedge", "cautious");
            showToast({ kind: "info", text: "<span class='toast-strong'>hedging strength updated.</span> two recent rejections; the assistant has shifted to <code>cautious</code>." });
          }
        }
      });
    });
  }

  /* ====================== MODALITY SWITCHER ====================== */

  function bindModality() {
    $$(".turn-assistant").forEach(turn => {
      const switcher = $(".modality-switch", turn);
      if (!switcher) return;
      $$(".mode-btn", switcher).forEach(btn => {
        btn.addEventListener("click", () => {
          const mode = btn.dataset.mode;
          $$(".mode-btn", switcher).forEach(b => {
            const a = b === btn;
            b.classList.toggle("is-active", a);
            b.setAttribute("aria-selected", a ? "true" : "false");
          });
          $$(".modality-pane", turn).forEach(pane => {
            pane.classList.toggle("is-active", pane.dataset.pane === mode);
          });
          if (mode === "diagram") {
            // re-init the diagram in case node positions need rebinding
            initDiagram(true);
          }
        });
      });
    });
  }

  /* ====================== DIAGRAM (manipulable nodes) ====================== */

  let diagramInited = false;

  function initDiagram(force = false) {
    const svg = $("#diagram-recsys");
    if (!svg) return;
    if (diagramInited && !force) { drawEdges(); return; }
    diagramInited = true;

    // arrow marker
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#a8a29e" />
        </marker>`;
      svg.insertBefore(defs, svg.firstChild);
    }

    $$(".node", svg).forEach(node => {
      const x = +node.dataset.x, y = +node.dataset.y;
      node.setAttribute("transform", `translate(${x},${y})`);
      const rect = node.querySelector("rect");
      const w = +rect.getAttribute("width");
      const titleT = node.querySelector(".node-title");
      const subT = node.querySelector(".node-sub");
      titleT.setAttribute("x", w / 2);
      titleT.setAttribute("y", 26);
      subT.setAttribute("x", w / 2);
      subT.setAttribute("y", 44);
    });

    drawEdges();
    enableDrag(svg);
  }

  function drawEdges() {
    const svg = $("#diagram-recsys");
    if (!svg) return;
    const edges = svg.querySelector(".edges");
    edges.innerHTML = "";
    const links = [
      ["cf", "hybrid"],
      ["cb", "hybrid"],
      ["hybrid", "rec"]
    ];
    links.forEach(([a, b]) => {
      const na = svg.querySelector(`.node[data-id="${a}"]`);
      const nb = svg.querySelector(`.node[data-id="${b}"]`);
      if (!na || !nb) return;
      const ax = +na.dataset.x + (+na.querySelector("rect").getAttribute("width"));
      const ay = +na.dataset.y + 30;
      const bx = +nb.dataset.x;
      const by = +nb.dataset.y + 30;
      const cx = (ax + bx) / 2;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${ax} ${ay} C ${cx} ${ay}, ${cx} ${by}, ${bx} ${by}`);
      edges.appendChild(path);
    });
  }

  function enableDrag(svg) {
    let dragNode = null;
    let pointerStart = null;
    let nodeStart = null;

    function svgPoint(evt) {
      const p = svg.createSVGPoint();
      p.x = evt.clientX; p.y = evt.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }

    svg.addEventListener("pointerdown", e => {
      const node = e.target.closest(".node");
      if (!node) return;
      dragNode = node;
      node.classList.add("is-drag");
      svg.setPointerCapture(e.pointerId);
      pointerStart = svgPoint(e);
      nodeStart = { x: +node.dataset.x, y: +node.dataset.y };
    });

    svg.addEventListener("pointermove", e => {
      if (!dragNode) return;
      const p = svgPoint(e);
      const dx = p.x - pointerStart.x;
      const dy = p.y - pointerStart.y;
      const nx = Math.max(0, Math.min(720 - 160, nodeStart.x + dx));
      const ny = Math.max(0, Math.min(360 - 60,  nodeStart.y + dy));
      dragNode.dataset.x = nx;
      dragNode.dataset.y = ny;
      dragNode.setAttribute("transform", `translate(${nx},${ny})`);
      drawEdges();
    });

    function endDrag() {
      if (!dragNode) return;
      dragNode.classList.remove("is-drag");
      dragNode = null;
    }
    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);
    svg.addEventListener("pointerleave", endDrag);
  }

  /* ====================== AGENT TRACE PANEL ====================== */

  const app = $("#app");
  const traceBtn = $("#open-trace");
  const tracePanel = $("#trace-panel");

  function openTracePanel() {
    app.classList.add("trace-open");
    setHidden(tracePanel, false);
    traceBtn.setAttribute("aria-pressed", "true");
    closeSourcePanel();
  }
  function closeTracePanel() {
    app.classList.remove("trace-open");
    setHidden(tracePanel, true);
    traceBtn.setAttribute("aria-pressed", "false");
  }
  function toggleTrace() {
    if (app.classList.contains("trace-open")) closeTracePanel();
    else openTracePanel();
  }
  traceBtn.addEventListener("click", toggleTrace);
  $("#trace-close").addEventListener("click", closeTracePanel);

  $$(".trace-line").forEach(line => {
    line.addEventListener("click", () => {
      openTracePanel();
      const turnId = line.closest(".turn").dataset.turnId;
      const target = $(`.trace-turn[data-trace-for="${turnId}"]`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ====================== STEERING BAR ====================== */

  function setSteering(key, value) {
    state.steering[key] = value;
    const seg = document.querySelector(`.seg[data-steer="${key}"]`);
    if (!seg) return;
    $$(".seg-btn", seg).forEach(b => b.classList.toggle("is-active", b.dataset.val === value));
  }

  $$(".seg").forEach(seg => {
    const key = seg.dataset.steer;
    $$(".seg-btn", seg).forEach(btn => {
      btn.addEventListener("click", () => {
        setSteering(key, btn.dataset.val);
        showToast({ kind: "info", text: `<span class="toast-strong">${key}</span> set to <code>${btn.dataset.val}</code> — applies to the next response.` });
      });
    });
  });

  /* cognitive forcing toggle */
  const forcingToggle = $("#forcing-toggle");
  const forcingOverlay = $("#forcing-overlay");
  forcingToggle.addEventListener("change", e => {
    state.forcing = e.target.checked;
    showToast({
      kind: e.target.checked ? "warn" : "info",
      text: e.target.checked
        ? "<span class='toast-strong'>cognitive forcing on.</span> the assistant will ask you to commit a position before showing future answers. (Buçinca et al., 2021)"
        : "<span class='toast-strong'>cognitive forcing off.</span> answers show without prompting you first."
    });
  });

  $("#forcing-cancel").addEventListener("click", () => {
    forcingOverlay.classList.remove("is-open");
    setHidden(forcingOverlay, true);
  });
  $("#forcing-continue").addEventListener("click", () => {
    forcingOverlay.classList.remove("is-open");
    setHidden(forcingOverlay, true);
    showToast({ kind: "ok", text: "<span class='toast-strong'>your prediction is recorded.</span> in a real system, the assistant would compare its answer to your prediction and surface disagreements." });
    runScriptedSend();
  });

  /* ====================== COMPOSER ====================== */

  $("#send-btn").addEventListener("click", handleSend);
  $("#composer").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  function handleSend() {
    const text = $("#composer").value.trim();
    if (!text) {
      showToast({ kind: "info", text: "type a follow-up — try changing steering settings and asking the same question." });
      return;
    }
    if (state.forcing) {
      forcingOverlay.classList.add("is-open");
      setHidden(forcingOverlay, false);
      $("#forcing-input").focus();
      return;
    }
    runScriptedSend();
  }

  function runScriptedSend() {
    $("#composer").value = "";
    showToast({ kind: "info", text: "<span class='toast-strong'>this is a scripted prototype.</span> in a production version, your message would route through the trust layer and produce a calibrated response." });
  }

  /* ====================== COMPETENCE INDICATOR / CALIBRATION CARD ====================== */

  const competence = $("#competence");
  const competenceState = $("#competence-state");
  const calModal = $("#cal-modal");
  competence.addEventListener("click", openCal);
  competence.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") openCal(); });

  function openCal() {
    calModal.classList.add("is-open");
    setHidden(calModal, false);
  }
  function closeModal(modal) {
    modal.classList.remove("is-open");
    setHidden(modal, true);
  }
  $$("[data-modal-close]").forEach(b => b.addEventListener("click", () => closeModal(b.closest(".modal-back"))));
  $$(".modal-back").forEach(m => m.addEventListener("click", e => { if (e.target === m) closeModal(m); }));

  /* shift competence indicator to "outside" when user scrolls turn 2 into view */
  const t2 = document.querySelector('.turn[data-turn-id="t2"]');
  if (t2) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          if (competence.dataset.state !== "outside") {
            competence.dataset.state = "outside";
            competenceState.textContent = "outside";
          }
        } else if (!entry.isIntersecting) {
          if (competence.dataset.state !== "evaluated") {
            competence.dataset.state = "evaluated";
            competenceState.textContent = "evaluated";
          }
        }
      });
    }, { threshold: [0, 0.35, 0.7] });
    io.observe(t2);
  }

  /* ====================== LEGEND ====================== */

  $("#open-legend").addEventListener("click", () => {
    $("#legend-modal").classList.add("is-open");
    setHidden($("#legend-modal"), false);
  });

  /* ====================== TOOL ROW (branch / verify / copy) ====================== */

  $$(".tool-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action === "branch") {
        showToast({ kind: "info", text: "<span class='toast-strong'>alternative reading:</span> the assistant would generate a fork — a different framing of the same answer. (prototype)" });
      } else if (action === "verify") {
        showToast({ kind: "ok", text: "<span class='toast-strong'>verifying…</span> the assistant would re-search the cited claims and surface any disagreement. (prototype)" });
      } else if (action === "copy-cited") {
        showToast({ kind: "ok", text: "<span class='toast-strong'>copied.</span> in a real system, your clipboard would now contain the response with citations attached." });
      } else if (action === "open-trace") {
        openTracePanel();
      }
    });
  });

  /* ====================== TOAST ====================== */

  const toastEl = $("#toast");
  let toastTimer;
  function showToast({ kind = "info", text = "" }) {
    toastEl.innerHTML = text;
    toastEl.dataset.kind = kind;
    toastEl.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-open"), 3600);
  }

  /* ====================== KEY BINDINGS ====================== */

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeTooltip();
      closePopover();
      closeSourcePanel();
      $$(".modal-back.is-open").forEach(closeModal);
      forcingOverlay.classList.remove("is-open");
      setHidden(forcingOverlay, true);
    }
  });

  /* ====================== INIT ====================== */

  bindCitations();
  bindTooltips();
  bindFeedback();
  bindModality();
  initDiagram();

  // brief opening hint
  let suppressOpeningHint = false;

  /* ====================== STAGE HANDLER (for Figma capture) ====================== */
  /* Append ?stage=<name> to the URL to auto-arrange a specific UI state.
     Each stage matches a screen we want as a Figma frame. */
  function applyStage(stage) {
    if (!stage) return;
    suppressOpeningHint = true;

    const stages = {
      "default": () => {},
      "citation-hover": () => {
        const chip = document.querySelector('sup.cite[data-cite="ricci-handbook"]') || document.querySelector('sup.cite');
        if (chip) { chip.scrollIntoView({ block: "center" }); setTimeout(() => openPopover(chip, chip.dataset.cite), 200); }
      },
      "source-panel": () => {
        const chip = document.querySelector('sup.cite');
        if (chip) openSourcePanel(chip.dataset.cite);
      },
      "modality-bullets": () => {
        const btn = document.querySelector('.mode-btn[data-mode="bullets"]');
        if (btn) btn.click();
      },
      "modality-table": () => {
        const btn = document.querySelector('.mode-btn[data-mode="table"]');
        if (btn) btn.click();
      },
      "modality-diagram": () => {
        const btn = document.querySelector('.mode-btn[data-mode="diagram"]');
        if (btn) btn.click();
      },
      "outside-domain": () => {
        const t2 = document.querySelector('.turn[data-turn-id="t2"]');
        if (t2) t2.scrollIntoView({ behavior: "instant", block: "start" });
      },
      "agent-trace": () => { openTracePanel(); },
      "calibration-card": () => { openCal(); },
      "legend": () => {
        $("#legend-modal").classList.add("is-open");
        setHidden($("#legend-modal"), false);
      },
      "cognitive-forcing": () => {
        forcingToggle.checked = true;
        state.forcing = true;
        forcingOverlay.classList.add("is-open");
        setHidden(forcingOverlay, false);
      },
      "rejection-cascade": () => {
        // simulate two rejections to demonstrate closed-loop
        const rejects = $$('.fb-btn[data-fb="reject"]').slice(0, 2);
        rejects.forEach(b => b.click());
      },
      "hedge-tooltip": () => {
        const h = document.querySelector('.hedge[data-hedge]');
        if (h) { h.scrollIntoView({ block: "center" }); setTimeout(() => openTooltip(h, "model is hedging here — " + h.dataset.hedge), 200); }
      }
    };

    const fn = stages[stage];
    if (fn) setTimeout(fn, 80);
  }

  /* ====================== "what I'd need" checklist ====================== */
  /* Interactive checkboxes + upload pills + yes/no toggle on the last row.
     Models the counter-principle's actionable handoff: empty-state confession
     is paired with a concrete, clickable path back to a sourced answer. */
  document.querySelectorAll(".ec-row").forEach(row => {
    const check  = row.querySelector(".ec-check");
    const upload = row.querySelector(".ec-action.ec-upload");
    const file   = row.querySelector(".ec-file");
    const toggles = row.querySelectorAll(".ec-toggle");

    const setChecked = (v) => {
      check.setAttribute("aria-checked", v ? "true" : "false");
    };

    // Manual click on the checkbox itself
    check.addEventListener("click", () => {
      const next = check.getAttribute("aria-checked") !== "true";
      setChecked(next);
      // If unchecking, also reset the action state
      if (!next) {
        if (upload) {
          upload.classList.remove("is-done");
          upload.querySelector(".ec-action-label").textContent = "upload";
          if (file) file.value = "";
        }
        toggles.forEach(t => t.setAttribute("aria-checked", "false"));
      }
    });

    // Upload pill → trigger hidden file input
    if (upload && file) {
      upload.addEventListener("click", () => file.click());
      file.addEventListener("change", () => {
        if (!file.files || file.files.length === 0) return;
        upload.classList.add("is-done");
        const label = upload.querySelector(".ec-action-label");
        const name = file.files.length === 1
          ? file.files[0].name
          : `${file.files.length} files`;
        label.textContent = name.length > 18 ? name.slice(0, 15) + "…" : name;
        setChecked(true);
        showToast({
          kind: "ok",
          text: `<span class='toast-strong'>received.</span> in a real system this data would be passed back to the assistant so it could move from inference to a sourced answer.`
        });
      });
    }

    // Yes / no toggle (4th row)
    toggles.forEach(btn => {
      btn.addEventListener("click", () => {
        toggles.forEach(t => t.setAttribute("aria-checked", t === btn ? "true" : "false"));
        setChecked(true);
        showToast({
          kind: "ok",
          text: `<span class='toast-strong'>answered <code>${btn.dataset.val}</code>.</span> the assistant will use this to qualify its next recommendation.`
        });
      });
    });
  });

  const urlStage = new URLSearchParams(location.search).get("stage");
  applyStage(urlStage);

  if (!suppressOpeningHint) {
    setTimeout(() => {
      showToast({ kind: "info", text: "<span class='toast-strong'>scroll the conversation</span> to see the system shift between an evaluated and an outside-domain response. open the legend (top-right) for the full key." });
    }, 800);
  }

})();
