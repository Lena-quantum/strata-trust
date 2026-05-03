/* STRATA case study deck — slide navigation
   - left/right arrow keys, page up/down, space
   - prev/next buttons in nav
   - URL hash sync (#1 ... #12)
   - progress bar updates
*/

(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const progressFill = document.getElementById("dn-progress-fill");
  const counter = document.getElementById("dn-current");
  const prevBtn = document.getElementById("dn-prev");
  const nextBtn = document.getElementById("dn-next");

  let current = 1;

  function show(n) {
    n = Math.max(1, Math.min(total, n));
    current = n;
    slides.forEach(s => s.classList.toggle("is-active", +s.dataset.slide === n));
    progressFill.style.width = (n / total * 100) + "%";
    counter.textContent = n;
    if (location.hash !== "#" + n) {
      history.replaceState(null, "", "#" + n);
    }
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  // Buttons
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // Keyboard
  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft"  || e.key === "PageUp")                    { e.preventDefault(); prev(); }
    if (e.key === "Home") { e.preventDefault(); show(1); }
    if (e.key === "End")  { e.preventDefault(); show(total); }
    if (/^[1-9]$/.test(e.key)) show(+e.key);
  });

  // URL hash on load
  const hashN = parseInt(location.hash.slice(1), 10);
  if (hashN >= 1 && hashN <= total) {
    show(hashN);
  } else {
    show(1);
  }

  // hash change
  window.addEventListener("hashchange", () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n <= total) show(n);
  });

})();
