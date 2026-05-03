# STRATA — calibrating trust in AI for the architect's workflow

Milestone II · Part II · UX for AI · UC Berkeley · Lena Ehrenreich

**Live site:** [https://lena-quantum.github.io/strata-trust/](https://lena-quantum.github.io/strata-trust/)

- [Landing](https://lena-quantum.github.io/strata-trust/) — overview + links
- [Live prototype](https://lena-quantum.github.io/strata-trust/architect-prototype/) — STRATA · Riverside Pavilion (5 stages, click-to-inspect blueprint, minimizable advisor orb)
- [Case study deck](https://lena-quantum.github.io/strata-trust/pitchdeck/) — 12 slides, navigate with `←` / `→` or number keys
- [Editable .pptx](https://lena-quantum.github.io/strata-trust/pitchdeck/STRATA_case_study.pptx) — drop into Google Slides via *File → Import slides* or upload to Drive and *Open with Google Slides*

## Repo structure

```
.
├── index.html               landing page
├── architect-prototype/     vanilla HTML/CSS/JS prototype
├── pitchdeck/               12-slide HTML deck
│   └── STRATA_case_study.pptx     editable PowerPoint export
└── README.md
```

## Stack

Vanilla HTML, CSS, JavaScript. No build step. No dependencies. Static deployment via GitHub Pages.

The `.pptx` was generated from `pitchdeck/build_pptx.py` (kept out of the public repo for cleanliness, but available on request).
