/* trust prototype — data layer
   sources used by inline citation chips. id matches the data-cite attribute
   in index.html. fields:
     - title:    short title shown in popover and side panel
     - domain:   formatted hostname for the chip footer
     - sourceClass: peer-reviewed | encyclopedic | news | industry
     - year:     publication year
     - snippet:  short italic preview shown in the hover popover
     - body:     longer side-panel body, may include <em class="highlight"> spans
     - entail:   model's NLI-style judgement of whether the source supports the claim
     - url:      external url (for "open in source" — not actually opened in prototype)
     - favicon:  text initial used as a placeholder favicon (kept offline)
*/

const SOURCES = {
  "ricci-handbook": {
    title: "Recommender Systems Handbook (3rd ed.) — §1: Introduction",
    domain: "link.springer.com",
    sourceClass: "encyclopedic",
    year: "2022",
    snippet: "Recommender systems are commonly classified into collaborative filtering, content-based, and hybrid families; most production systems combine the three.",
    body: `<p><em class="highlight">Recommender systems are commonly classified into collaborative filtering, content-based filtering, and hybrid approaches</em>, with the latter being the dominant configuration in industry deployments since the late 2000s. The handbook surveys evidence that hybrid systems "consistently outperform either pure approach" once a deployment matures past the cold-start regime.</p>
<p>Chapter 1 frames the design tension that motivates the rest of the volume: cold-start vs. warm-state behavior, the asymmetry between user-side and item-side cold-start, and the role of contextual signals in narrowing the explore/exploit tradeoff.</p>`,
    entail: "supports",
    url: "https://link.springer.com/book/10.1007/978-1-0716-2197-4",
    favicon: "S"
  },

  "koren-survey": {
    title: "Matrix Factorization Techniques for Recommender Systems",
    domain: "ieeexplore.ieee.org",
    sourceClass: "peer-reviewed",
    year: "2009",
    snippet: "Collaborative filtering recovers latent factors from observed user–item interactions; the approach makes no assumption about the items themselves.",
    body: `<p>Koren, Bell &amp; Volinsky's <em>IEEE Computer</em> survey is the canonical reference for collaborative filtering as a latent-factor problem. The central claim: <em class="highlight">"collaborative filtering recovers latent factors from observed interactions, without requiring features describing the items themselves."</em></p>
<p>The paper documents the rise of matrix factorization out of the Netflix Prize, including the regularization, biases, and temporal dynamics that the team added to take MF from baseline to state-of-the-art at the time.</p>`,
    entail: "supports",
    url: "https://ieeexplore.ieee.org/document/5197422",
    favicon: "I"
  },

  "pazzani-content": {
    title: "Content-Based Recommendation Systems (Pazzani &amp; Billsus)",
    domain: "link.springer.com",
    sourceClass: "encyclopedic",
    year: "2007",
    snippet: "Content-based methods represent items by their attributes and recommend items similar to those the user has previously liked.",
    body: `<p>Pazzani &amp; Billsus's chapter in <em>The Adaptive Web</em> remains the cleanest pedagogical treatment of content-based recommendation. Their framing: <em class="highlight">"content-based recommenders represent items by attributes and infer user preferences as a function over those attributes."</em></p>
<p>The chapter covers TF-IDF representations, Rocchio's relevance feedback, naïve Bayes classifiers, and the over-specialization failure mode — content-based systems tend to recommend items <em>too similar</em> to what the user has already seen.</p>`,
    entail: "supports",
    url: "https://link.springer.com/chapter/10.1007/978-3-540-72079-9_10",
    favicon: "S"
  },

  "amazon-recsys": {
    title: "Two Decades of Recommender Systems at Amazon — case study (RecSys 2023)",
    domain: "dl.acm.org",
    sourceClass: "industry",
    year: "2023",
    snippet: "In our internal evaluations, collaborative methods reliably outperform content-based baselines once users cross roughly 50–200 product interactions; below this, content-based methods dominate.",
    body: `<p>Smith &amp; Linden's RecSys 2023 retrospective updates Amazon's earlier 2003/2017 papers with two decades of internal experimentation. The threshold claim cited in the prototype:</p>
<p><em class="highlight">"In our internal evaluations, collaborative methods reliably outperform content-based baselines once users cross roughly 50–200 product interactions; below this, content-based methods dominate due to data sparsity in the user × item matrix."</em></p>
<p>The retrospective explicitly cautions that the threshold varies by category — high-engagement categories (books, media) hit the crossover earlier; long-tail categories (industrial supply) push it past 500.</p>`,
    entail: "partially supports — exact range varies by category in the cited paper",
    url: "https://dl.acm.org/doi/10.1145/3604915.3608873",
    favicon: "A"
  },

  "spotify-retro": {
    title: "Co-visitation, Cold Start, and the Long Middle (Spotify Engineering, 2023)",
    domain: "engineering.atspotify.com",
    sourceClass: "industry",
    year: "2023",
    snippet: "For low-traffic surfaces, a content-based recommender plus a co-visitation list captured ~78% of the lift of our full collaborative system, at a fraction of the operational cost.",
    body: `<p>Spotify's engineering blog retrospective on a year of recommender experiments includes the somewhat counterintuitive finding cited in the prototype:</p>
<p><em class="highlight">"For low-traffic surfaces — including new market launches and niche product placements — a content-based recommender plus a co-visitation list captured roughly 78% of the lift of our full collaborative system, at a fraction of the operational cost."</em></p>
<p>The retrospective is a single-company datapoint; the lift number does not necessarily generalize. The prototype's claim is consequently flagged at <code>medium</code> confidence and labelled as a "documented in n=1 case."</p>`,
    entail: "supports — but n=1 case study, generalization is uncertain",
    url: "https://engineering.atspotify.com/",
    favicon: "S"
  }
};
