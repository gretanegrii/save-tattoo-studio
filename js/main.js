/* Smooth scroll (Lenis) — slow, eased scrolling, like the portfolio.
   Only on desktop pointers, and skipped for reduced-motion. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (typeof Lenis === "undefined" || reduce || !finePointer) return;

  const lenis = new Lenis({
    duration: 1.2, // bigger = longer glide
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* Navbar auto-hide (all pages).
   The fixed header slides away on scroll down and eases back on scroll up;
   the gradual motion is the CSS `transition: transform` on `header`. */
(function () {
  const header = document.querySelector("header");
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    if (y > lastY && y > 120) header.classList.add("nav-hidden");
    else if (y < lastY) header.classList.remove("nav-hidden");
    lastY = y;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );
})();
