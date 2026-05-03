/* STRATA — scripted demo data
   Sources, references, AI exchanges per stage. Mocked-but-plausible content
   pointing at real publishers (Baunetz, DIN, Rockwool, ASR, Karamba3D,
   Climate-Studio). Image URLs are real Unsplash photos that fall back to a
   CSS gradient if they fail to load.
*/

/* ==================================================================
   SOURCES
   Each entry encodes:
     - sourceClass : precedent · standard · manufacturer · simulation · inspiration
     - confidence  : how confident the model is in its claim FROM this source
     - accuracy    : sourced (green) · inferred (amber) · extrapolated (rust)
     - votes       : initial { up, down } reflecting community confidence
     - url         : a real publisher homepage to link out to
     - image       : optional image URL (mood references)
   ================================================================== */

const SOURCES = {

  /* ---------- ideation references ---------- */
  pin01: {
    title: "Translucent timber pavilion · Hokkaido",
    publisher: "Pinterest · @arch_north",
    year: 2024,
    sourceClass: "inspiration",
    confidence: "low",
    accuracy: "no-source",
    votes: { up: 38, down: 4 },
    url: "https://www.pinterest.com",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=720&q=80&auto=format&fit=crop",
    snippet: "Cross-laminated larch with polycarbonate infill panels — diffuse north light, lantern at dusk.",
    body: "An inspirational mood reference. Translucent polycarbonate inserts read as a glowing volume after dark; structural rhythm is a CLT frame at ~1.20 m centers. Useful as a façade direction, not as a code precedent.",
    entail: "Inspirational only — no formal entailment. Treat as direction, not evidence.",
    tags: ["timber", "translucent", "pavilion"]
  },
  pin02: {
    title: "Riverside Pavilion · Kettelhut",
    publisher: "Baunetz · 2023 portfolio",
    year: 2023,
    sourceClass: "precedent",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 124, down: 6 },
    url: "https://www.baunetz.de",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=720&q=80&auto=format&fit=crop",
    snippet: "480 m² public pavilion · glulam frame · operable façade · open ground plan with central service core.",
    body: "Closest published comparable for site, scale, and floodplain conditions. Glulam primary frame on a 6.0 × 4.5 m grid; Brettstapel roof; jacked foundations on micro-piles. Construction documents available on Baunetz portfolio.",
    entail: "Strong support — same floodplain typology, same approximate scale.",
    tags: ["public", "glulam", "small-scale"]
  },
  pin03: {
    title: "Aalto · Maison Louis Carré",
    publisher: "Architectural Review · archive",
    year: 1959,
    sourceClass: "precedent",
    confidence: "medium",
    accuracy: "sourced",
    votes: { up: 92, down: 2 },
    url: "https://www.architectural-review.com",
    image: "https://images.unsplash.com/photo-1496564203457-11bb12075d90?w=720&q=80&auto=format&fit=crop",
    snippet: "Roof as the primary spatial gesture — single sweeping plane organizes the whole plan beneath it.",
    body: "A canonical precedent for roof-driven pavilion typologies. The single sloped plane both shelters and orients the program. Useful as a typological reference; not directly applicable to floodplain construction.",
    entail: "Direct support for the roof-as-organizer move; no support for floodplain detailing.",
    tags: ["roof-driven", "modernism"]
  },
  pin04: {
    title: "GUNNARSSONS · River cabin",
    publisher: "Baunetz · 2024",
    year: 2024,
    sourceClass: "precedent",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 67, down: 3 },
    url: "https://www.baunetz.de",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=720&q=80&auto=format&fit=crop",
    snippet: "Lightweight steel + timber hybrid · 380 m² · floodplain construction · jacked foundation system.",
    body: "Hybrid construction: steel HEA frame for resilience to flood loading; timber infill for warmth and lighter dead load. Jacked micro-pile foundation lets the structure clear a 1-in-100 year flood line.",
    entail: "Strong support for floodplain foundation strategy.",
    tags: ["floodplain", "hybrid", "lightweight"]
  },
  pin05: {
    title: "Diffuse façade studies",
    publisher: "Pinterest · @materials_lab",
    year: 2025,
    sourceClass: "inspiration",
    confidence: "low",
    accuracy: "no-source",
    votes: { up: 19, down: 8 },
    url: "https://www.pinterest.com",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=720&q=80&auto=format&fit=crop",
    snippet: "Polycarbonate, ETFE, and translucent timber screens — comparison board.",
    body: "Mood comparison board of three diffuse-light cladding strategies: 25 mm polycarbonate honeycomb, single-layer ETFE, and milled timber screen at ~50% transparency. No quantitative performance data — purely visual.",
    entail: "Inspirational only. For performance values, refer to manufacturer data in stage 04.",
    tags: ["façade", "translucency"]
  },
  pin06: {
    title: "SANAA · pavilion typologies",
    publisher: "El Croquis 179/180",
    year: 2015,
    sourceClass: "precedent",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 211, down: 5 },
    url: "https://elcroquis.es",
    image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=720&q=80&auto=format&fit=crop",
    snippet: "Light, low-mass, single-volume civic pavilions with column grids dissolved by transparency.",
    body: "El Croquis monograph documenting SANAA's pavilion-scale work 2005–2015. Recurring moves: very thin slabs, slender column grids, full-height glazing, single-volume reading. Highly relevant typological reference.",
    entail: "Direct support for the lightweight-typology direction.",
    tags: ["pavilion", "transparency", "civic"]
  },

  /* ---------- concept stage ---------- */
  precedent01: {
    title: "Pavilion in the Park · Schenk + Waiblinger",
    publisher: "Baunetz · 2022",
    year: 2022,
    sourceClass: "precedent",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 78, down: 2 },
    url: "https://www.baunetz.de",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=720&q=80&auto=format&fit=crop",
    snippet: "Comparable 510 m² public pavilion. Service core 18% of GFA, central position; circulation loops the perimeter.",
    body: "A direct programmatic precedent. The architects placed all servant spaces (WC, technical, storage) in a single core occupying ~18% of gross floor area, centered on the long axis. This freed the perimeter for a continuous served zone with three operable façade segments.",
    entail: "Direct support for the central-core typology; ratio is within 3% of the AI's recommendation."
  },
  precedent02: {
    title: "Riverside Pavilion · Kettelhut (2023)",
    publisher: "Baunetz · 2023",
    year: 2023,
    sourceClass: "precedent",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 124, down: 6 },
    url: "https://www.baunetz.de",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=720&q=80&auto=format&fit=crop",
    snippet: "480 m² · Berlin floodplain · Brettstapel roof on glulam frame · published structural drawings.",
    body: "Closest published comparable for site, scale, and floodplain conditions. Glulam primary frame on a 6.0 × 4.5 m grid; Brettstapel roof; jacked foundations on micro-piles.",
    entail: "Strong support — same floodplain typology, same approximate scale."
  },

  /* ---------- blueprint / code references ---------- */
  din18040: {
    title: "DIN 18040-1 · Barrier-free public buildings",
    publisher: "Deutsches Institut für Normung",
    year: 2010,
    sourceClass: "standard",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 314, down: 3 },
    url: "https://www.din.de",
    snippet: "Min. corridor width 1.50 m where two wheelchairs may pass; 1.20 m local minimum acceptable for short segments.",
    body: "DIN 18040-1 §4.3.2 — Verkehrsflächen: Die nutzbare Breite von Fluren muss mindestens 1,50 m betragen. Lokale Einengungen bis 1,20 m sind über kurze Distanzen (≤ 1,80 m) zulässig, sofern eine Begegnungsfläche von 1,80 × 1,80 m im Abstand von höchstens 15 m vorhanden ist.",
    entail: "Direct support — corridor at 1.55 m is above the 1.50 m minimum. Compliant."
  },
  mbo: {
    title: "Musterbauordnung (MBO) §47 · Sanitäranlagen",
    publisher: "ARGEBAU",
    year: 2019,
    sourceClass: "standard",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 188, down: 7 },
    url: "https://www.is-argebau.de",
    snippet: "Public assembly use ≥ 100 occupants: WC count ratio 1:25 male / 1:20 female, accessible WC required.",
    body: "MBO §47 (2) for assembly occupancies above 100 persons: a minimum of one WC per 25 male occupants, one per 20 female occupants, plus at least one barrier-free WC accessible from the main circulation. Local state codes (LBO) may impose stricter requirements.",
    entail: "Partial support — current plan provides 1:30 ratio, below the 1:25 minimum. Add 1 WC."
  },
  asr: {
    title: "ASR A3.4 · Beleuchtung",
    publisher: "BAuA",
    year: 2011,
    sourceClass: "standard",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 142, down: 4 },
    url: "https://www.baua.de",
    snippet: "Public gathering spaces: maintained illuminance ≥ 200 lx; daylight factor ≥ 2% recommended for primary use.",
    body: "ASR A3.4 §4.1 — for assembly spaces, a maintained mean illuminance of 200 lx is required. A daylight factor (D) of ≥ 2% on the working plane is recommended for primary occupancy zones.",
    entail: "Direct support — current daylight modeling indicates D = 3.1% at the working plane."
  },

  /* ---------- detail / material references ---------- */
  din4108: {
    title: "DIN 4108-2 · Wärmeschutz",
    publisher: "Deutsches Institut für Normung",
    year: 2013,
    sourceClass: "standard",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 256, down: 5 },
    url: "https://www.din.de",
    snippet: "Reference U-value for external walls (residential / public): ≤ 0.24 W/(m²·K) per GEG 2024.",
    body: "DIN 4108-2 in conjunction with GEG (Gebäudeenergiegesetz) 2024 sets the reference external wall U-value at 0.24 W/(m²·K). Public buildings with continuous occupancy fall under the same threshold.",
    entail: "Direct support — proposed wall buildup achieves U = 0.18 W/(m²·K), exceeds requirement."
  },
  rockwool: {
    title: "Rockwool RP-PT · Stone wool insulation",
    publisher: "Rockwool GmbH · technical datasheet",
    year: 2024,
    sourceClass: "manufacturer",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 96, down: 11 },
    url: "https://www.rockwool.de",
    snippet: "λ = 0.035 W/(m·K) · density 50 kg/m³ · A1 fire classification · long-term thermal stability proven.",
    body: "Manufacturer-published λ-value of 0.035 W/(m·K) for the RP-PT product line at 200 mm. Verified by independent testing per DIN EN 12667. Fire class A1 (non-combustible) per DIN EN 13501-1.",
    entail: "Direct support — λ value used in U-value calculation."
  },
  brettstapel: {
    title: "Brettstapel timber decking · technical handbook",
    publisher: "Holzbau Deutschland · 2022",
    year: 2022,
    sourceClass: "manufacturer",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 64, down: 2 },
    url: "https://www.holzbau-deutschland.de",
    snippet: "Span tables for nail-laminated timber decks · 160 mm thickness spans up to 5.4 m at L/300.",
    body: "For Brettstapel decking at 160 mm thickness in C24 spruce, the published span table gives a maximum simple-span of 5.4 m at a deflection criterion of L/300 under a uniform live load of 5.0 kN/m². For our 6.0 m grid, increase to 200 mm or add intermediate beam.",
    entail: "Partial support — at the proposed 6.0 m grid, the 160 mm assumption fails the span table. Confidence band is correctly cautious."
  },

  /* ---------- simulation references ---------- */
  simEngine: {
    title: "Karamba3D · v3.2 structural solver",
    publisher: "Karamba3D · model documentation",
    year: 2024,
    sourceClass: "simulation",
    confidence: "medium",
    accuracy: "extrapolated",
    votes: { up: 47, down: 14 },
    url: "https://karamba3d.com",
    snippet: "FEA solver · linear-elastic small-displacement assumptions · pinned-support boundary condition used.",
    body: "Linear-elastic small-displacement FEA. Boundary conditions: pinned at column bases. Load case: dead (G) + live (Q) + snow (Sk) per DIN EN 1991. Mesh: 0.25 m. Solver tolerance: 1e-6. The model assumes rigid joints at glulam-to-glulam connections, which is an idealization.",
    entail: "Partial support — assumptions documented; rigid-joint idealization is standard for preliminary analysis but should be revisited at detailed design."
  },
  daylight: {
    title: "Climate-Studio · annual daylight simulation",
    publisher: "Climate-Studio (Solemma) · model run 2026-04-29",
    year: 2026,
    sourceClass: "simulation",
    confidence: "high",
    accuracy: "sourced",
    votes: { up: 81, down: 3 },
    url: "https://www.solemma.com/climatestudio",
    snippet: "Berlin TMY weather file · sUDA(300, 50%) = 71% across the served zone · sDA result tagged 'preliminary'.",
    body: "Annual daylight simulation using Berlin TMY3 climate data. Spatial useful daylight autonomy at 300 lux for 50% of occupied hours: 71% of the served floor area meets the threshold. Results are preliminary — surrounding building shading is approximated with a simple massing block; detailed terrain modeling pending.",
    entail: "Direct support — meets typical sDA target (≥ 50%). Caveat on the surrounding-building approximation."
  }
};

/* ==================================================================
   STAGES — per-stage role + thread
   Each thread message can include:
     - confidence : 'high' | 'medium' | 'low'    (renders ring + bubble border)
     - accuracy   : 'sourced' | 'inferred' | 'unsourced'
     - cites      : array of source IDs the message references
   ================================================================== */

const STAGES = {

  ideation: {
    name: "ideation",
    label: "01 · Ideation",
    sub: "references & mood",
    role: "brainstormer",
    stakes: "low",
    competence: "peer",
    confidence: "low",
    accuracy: "unsourced ok",
    levels: { competence: "low", confidence: "low", accuracy: "low" },
    posture: "I generate associations freely. Treat this stage as a wide net, not a recommendation.",
    thread: [
      {
        who: "ai", role: "brainstormer",
        confidence: "low", accuracy: "unsourced",
        text: "I scanned 6 references you've pinned. The recurring threads I see: <em>translucency</em>, <em>roof-as-gesture</em>, and <em>floodplain construction</em>. Want me to widen the net or narrow on one?"
      },
      { who: "user", text: "Narrow on translucent + lightweight." },
      {
        who: "ai", role: "brainstormer",
        confidence: "medium", accuracy: "unsourced",
        cites: ["pin06"],
        text: "Pulling references in that vein. Two are precedent-grade — <a class='cite' data-cite='pin06'>SANAA pavilion typologies</a> is the strongest. Two others stay on the mood board only — I'm flagging them as inspirational so you don't mistake them for evidence."
      }
    ]
  },

  concept: {
    name: "concept",
    label: "02 · Concept",
    sub: "massing & program",
    role: "advisor",
    stakes: "medium",
    competence: "advisor",
    confidence: "medium",
    accuracy: "precedent-cited",
    levels: { competence: "medium", confidence: "medium", accuracy: "medium" },
    posture: "I now reference real precedents. I'll mark each claim's source class and flag what's still inference.",
    thread: [
      {
        who: "ai", role: "advisor",
        confidence: "high", accuracy: "sourced",
        cites: ["precedent01"],
        text: "From your pinned references and the 480 m² brief, the dominant typology is <strong>central-core, perimeter-served</strong>. Closest precedent: <a class='cite' data-cite='precedent01'>Pavilion in the Park</a> at 510 m² — same core ratio, same perimeter loop."
      },
      {
        who: "ai", role: "advisor",
        confidence: "medium", accuracy: "inferred",
        text: "I've placed three massing volumes: <span class='hedge' data-hedge='based on a single precedent at this scale'>the central core at ~17% GFA</span>, two served zones N and S. Drag the pins to test alternative placements."
      },
      { who: "user", text: "What if the core is offset, not central?" },
      {
        who: "ai", role: "advisor",
        confidence: "medium", accuracy: "inferred",
        cites: ["precedent02"],
        text: "Trade-off: offset core opens one continuous served zone (better for events) but breaks the symmetry of <a class='cite' data-cite='precedent02'>Riverside Pavilion · Kettelhut</a>. <span class='hedge' data-hedge='no precedent at this exact configuration'>Daylight on the long edge would improve ~12%</span> — that estimate is mine, not from a sim yet."
      }
    ]
  },

  blueprint: {
    name: "blueprint",
    label: "03 · Blueprint",
    sub: "plan & code review",
    role: "expert",
    stakes: "high",
    competence: "expert",
    confidence: "high",
    accuracy: "code-cited",
    levels: { competence: "high", confidence: "high", accuracy: "high" },
    posture: "I cite the building code on every claim. If I cannot find a source, I will say so explicitly and refuse to assert.",
    thread: [
      {
        who: "ai", role: "expert",
        confidence: "high", accuracy: "sourced",
        text: "I've reviewed the plan against three standards. <strong>Two pass, one fails.</strong> Annotations are pinned on the drawing — pan and zoom the canvas to inspect."
      },
      {
        who: "ai", role: "expert",
        confidence: "high", accuracy: "sourced",
        cites: ["din18040", "asr", "mbo"],
        text: "✓ Corridor width 1.55 m — meets <a class='cite' data-cite='din18040'>DIN 18040-1</a> minimum 1.50 m.<br />✓ Daylight D = 3.1% — meets <a class='cite' data-cite='asr'>ASR A3.4</a> ≥ 2%.<br />✗ WC ratio 1:30 — fails <a class='cite' data-cite='mbo'>MBO §47</a> minimum 1:25 for assembly use."
      },
      { who: "user", text: "Can the WC failure be addressed without expanding the core?" },
      {
        who: "ai", role: "expert",
        confidence: "medium", accuracy: "inferred",
        text: "<span class='hedge' data-hedge='depends on local LBO interpretation'>Yes — converting one storage cell to a unisex WC raises the ratio to 1:24 and meets the minimum</span>. I cannot confirm whether your specific Berlin Bauamt accepts a unisex count toward the male/female split. Recommend: confirm with your reviewer."
      }
    ]
  },

  detail: {
    name: "detail",
    label: "04 · Detail",
    sub: "wall section & materials",
    role: "engineer",
    stakes: "high",
    competence: "engineer",
    confidence: "high",
    accuracy: "spec-sourced",
    levels: { competence: "high", confidence: "high", accuracy: "high" },
    posture: "I work from manufacturer datasheets and DIN norms. Where I extrapolate beyond a published value, I will mark it.",
    thread: [
      {
        who: "ai", role: "engineer",
        confidence: "high", accuracy: "sourced",
        cites: ["rockwool"],
        text: "Wall buildup proposed: 25 mm larch cladding · 30 mm ventilated cavity · 16 mm DWD board · <strong>200 mm Rockwool RP-PT</strong> (<a class='cite' data-cite='rockwool'>λ = 0.035</a>) · 18 mm OSB · 60 mm service void · 12.5 mm GKB."
      },
      {
        who: "ai", role: "engineer",
        confidence: "high", accuracy: "sourced",
        cites: ["din4108"],
        text: "Resulting U-value: <strong>0.18 W/(m²·K)</strong>. <a class='cite' data-cite='din4108'>GEG 2024 reference</a> is 0.24 — your wall exceeds the requirement by 25%."
      },
      {
        who: "ai", role: "engineer",
        confidence: "high", accuracy: "sourced",
        cites: ["brettstapel"],
        text: "<strong>One flag:</strong> the <a class='cite' data-cite='brettstapel'>Brettstapel span table</a> shows 160 mm decking is insufficient for the 6.0 m grid. <span class='hedge' data-hedge='from manufacturer span table — verified'>Increase to 200 mm or add a secondary beam at 3.0 m</span>. This is not a stylistic choice; it's a deflection limit."
      }
    ]
  },

  simulation: {
    name: "simulation",
    label: "05 · Simulation",
    sub: "structural & daylight",
    role: "simulator",
    stakes: "verification",
    competence: "simulator",
    confidence: "bounded",
    accuracy: "model-bounded",
    levels: { competence: "high", confidence: "medium", accuracy: "medium" },
    posture: "I run preliminary models. Every result has assumptions, a confidence band, and a recommendation to verify with a structural engineer.",
    thread: [
      {
        who: "ai", role: "simulator",
        confidence: "medium", accuracy: "extrapolated",
        text: "<strong class='outside-banner'>I am running preliminary simulations.</strong> Boundary conditions, mesh, and load assumptions are documented per result. <em>These are not construction-grade outputs.</em>"
      },
      {
        who: "ai", role: "simulator",
        confidence: "high", accuracy: "sourced",
        cites: ["simEngine"],
        text: "Structural · max deflection of glulam beam B-3: <strong>8.4 mm ± 1.2 mm</strong> (95% CI). Limit is L/300 = 20 mm. <a class='cite' data-cite='simEngine'>Karamba3D v3.2</a> · pinned-support, rigid-joint idealization."
      },
      {
        who: "ai", role: "simulator",
        confidence: "high", accuracy: "sourced",
        cites: ["daylight"],
        text: "Daylight · <strong>sDA(300, 50%) = 71%</strong> across the served zone. <a class='cite' data-cite='daylight'>Climate-Studio · Berlin TMY</a>. Note: surrounding terrain shading approximated with a single massing block."
      },
      {
        who: "ai", role: "simulator",
        confidence: "high", accuracy: "sourced",
        text: "<strong>Refuse-to-extrapolate:</strong> you asked about fire-safety egress timing. I do not run an evacuation simulation in this hub. Recommend a separate Pathfinder model with your fire engineer."
      }
    ]
  }
};

/* ==================================================================
   PLAN_ELEMENTS — clickable rooms in the blueprint stage
   Each element has its own facts, code references, and trust posture.
   ================================================================== */

const PLAN_ELEMENTS = {
  "event-hall": {
    name: "Event Hall",
    badge: "served zone · north",
    area: "220 m²",
    occupancy: "180 standing · 90 seated",
    summary: "Primary public space. North-facing for diffuse light; column-free span via glulam frame at 6.0 m grid.",
    facts: [
      { label: "Daylight factor",   value: "D = 3.1 %",  required: "≥ 2.0 %",  status: "pass", level: "high",   citeId: "asr",      note: "ASR A3.4 §4.1 — primary occupancy zone." },
      { label: "Floor-to-ceiling",  value: "5.2 m",      required: "≥ 2.5 m",  status: "pass", level: "high",   citeId: null,       note: "Comfortable assembly volume." },
      { label: "Egress doors",      value: "2 doors",    required: "occupancy-derived", status: "info", level: "medium", citeId: null, note: "Verify with fire engineer at next stage. Refuse-to-assert until Pathfinder run." },
      { label: "Acoustic RT60",     value: "~1.4 s",     required: "0.8–1.6 s", status: "pass", level: "medium", citeId: null,      note: "Inferred from volume + finishes; not yet measured." }
    ]
  },
  "foyer": {
    name: "Foyer + Gallery",
    badge: "served zone · south",
    area: "180 m²",
    occupancy: "~110 milling",
    summary: "Public entry, exhibition, overflow. Operable façade extends use into the courtyard.",
    facts: [
      { label: "Barrier-free access", value: "compliant", required: "DIN 18040-1", status: "pass", level: "high", citeId: "din18040", note: "Step-free entry from public side; threshold ≤ 20 mm." },
      { label: "Daylight factor",     value: "D = 2.8 %", required: "≥ 2.0 %",     status: "pass", level: "high", citeId: "asr",      note: "South orientation; consider overheating control." },
      { label: "Operable façade",     value: "4 segments", required: "—",          status: "info", level: "medium", citeId: null,     note: "Indicative — manufacturer to confirm air-tightness when closed." }
    ]
  },
  "corridor": {
    name: "Main corridor",
    badge: "circulation",
    area: "30.0 × 1.55 m",
    summary: "Spine connecting the two served zones. Required clear width drives the long-axis dimension.",
    facts: [
      { label: "Clear width",         value: "1.55 m",     required: "≥ 1.50 m",       status: "pass", level: "high", citeId: "din18040", note: "DIN 18040-1 §4.3.2 — wheelchair pass." },
      { label: "Two-wheelchair node", value: "1.80 × 1.80 m", required: "every ≤ 15 m", status: "pass", level: "high", citeId: "din18040", note: "Two passing nodes provided at 10.0 m and 22.0 m." },
      { label: "Floor finish slip",   value: "R10",        required: "—",              status: "info", level: "medium", citeId: null,     note: "Specifier choice — confirm with finishes spec." }
    ]
  },
  "wc-m": {
    name: "WC · Male",
    badge: "core",
    area: "16 m² · 2 stalls + urinal",
    summary: "Part of the central service core.",
    facts: [
      { label: "Stall ratio",   value: "1:30 male",   required: "1:25 max", status: "fail", level: "high", citeId: "mbo",      note: "Below MBO §47 minimum for 180-occupant assembly use. Plan stage flagged." },
      { label: "Accessibility", value: "1 stall BF",  required: "≥ 1 BF",   status: "pass", level: "high", citeId: "din18040", note: "DIN 18040-1 — barrier-free WC accessible from main corridor." }
    ]
  },
  "wc-f": {
    name: "WC · Female",
    badge: "core",
    area: "16 m² · 3 stalls",
    summary: "Part of the central service core.",
    facts: [
      { label: "Stall ratio",   value: "1:30 female", required: "1:20 max", status: "fail", level: "high", citeId: "mbo",      note: "Below MBO §47 minimum. Storage cell convertible to mitigate." },
      { label: "Accessibility", value: "1 stall BF",  required: "≥ 1 BF",   status: "pass", level: "high", citeId: "din18040", note: "Compliant." }
    ]
  },
  "tech": {
    name: "Tech room",
    badge: "core",
    area: "16 m²",
    summary: "Mechanical, electrical, water connections.",
    facts: [
      { label: "Ventilation rate", value: "—",         required: "by MEP", status: "info", level: "medium", citeId: null, note: "Awaiting MEP engagement." },
      { label: "Acoustic isolation", value: "—",       required: "DIN 4109", status: "info", level: "medium", citeId: null, note: "Recommend RW ≥ 47 dB to public spaces." }
    ]
  },
  "storage": {
    name: "Storage",
    badge: "core · convertible",
    area: "16 m²",
    summary: "Currently unallocated. The assistant flags this cell as the lowest-cost path to compliance.",
    facts: [
      { label: "Convert → unisex WC", value: "recommended", required: "—",          status: "flag", level: "high", citeId: "mbo", note: "Raises overall WC ratio from 1:30 to 1:24, meeting MBO §47. Trade-off: lose 16 m² storage." },
      { label: "Existing use",        value: "unallocated",  required: "—",          status: "info", level: "medium", citeId: null, note: "No committed function — low switching cost." }
    ]
  },
  "kitchen": {
    name: "Kitchen / Serving",
    badge: "core",
    area: "16 m²",
    summary: "Catering pantry serving the event hall and foyer.",
    facts: [
      { label: "Hand-wash basin",   value: "1 dedicated", required: "≥ 1",  status: "pass", level: "high", citeId: null, note: "ArbStätt §4.1 — separate from kitchen prep sink." },
      { label: "Grease-trap",       value: "—",           required: "by MEP", status: "info", level: "medium", citeId: null, note: "Spec at MEP stage." }
    ]
  }
};

