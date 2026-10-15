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

  // esposto per far bloccare lo scroll di fondo quando si apre la FAQ (js/faq.js)
  window.__lenis = lenis;
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

/* Mobile menu (all pages).
   The hamburger (.menu-toggle) toggles `menu-open` on <html>; the CSS turns the nav into a
   full-screen panel. Closes on a link click, on Escape, and when the window gets wide again. */
(function () {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const root = document.documentElement;
  const wide = window.matchMedia("(min-width: 861px)");

  function setOpen(open) {
    root.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    // freeze the smooth scroll behind the panel (the FAQ drawer manages its own lock)
    if (window.__lenis) {
      if (open) window.__lenis.stop();
      else if (!root.classList.contains("faq-open")) window.__lenis.start();
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(!root.classList.contains("menu-open"));
  });

  // any link or the FAQ button inside the panel closes it
  document.querySelector("header").addEventListener("click", function (e) {
    if (e.target.closest("#site-nav a, #site-nav .nav__faq, .btn-prenota")) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("menu-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  wide.addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
})();
