/* Smooth scroll (Lenis) — slow, eased scrolling, like the portfolio.
   On desktop and on touch screens (syncTouch), skipped for reduced-motion. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof Lenis === "undefined" || reduce) return;

  const lenis = new Lenis({
    duration: 1.2, // bigger = longer glide
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    syncTouch: true, // phones too: the finger drags, then the page glides to a stop
    syncTouchLerp: 0.08, // smaller = longer, softer glide after the finger lifts
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // sideways scrollers (photo strips, Lavori slider): on touch Lenis must leave the finger to the
  // browser, or a swipe that is not perfectly horizontal is eaten by the page scroll
  document
    .querySelectorAll(".zone__strip, .lavori__track, .gallery__row")
    .forEach((el) => el.setAttribute("data-lenis-prevent-touch", ""));

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
  const wide = window.matchMedia("(min-width: 921px)");

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

/* Cursor click animation: on a mouse click the cursor drawing "plays" its little splashes.
   While it plays (about a second) the real cursor is hidden (html.pene-playing) and the sprite
   (.pene-click, css/base.css) follows the mouse, so the drawing never jumps. Mouse only, and not for
   people who ask for less motion. */
(function () {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;

  const HOT_X = 31; // where the click point sits inside the sprite frame (px)
  const HOT_Y = 38;
  const DURATION = 1000; // ms, same as the CSS animation

  const root = document.documentElement;
  const sprite = document.createElement("div");
  sprite.className = "pene-click";
  sprite.setAttribute("aria-hidden", "true");
  document.body.appendChild(sprite);

  let timer = 0;
  let playing = false;

  function place(e) {
    sprite.style.transform = "translate(" + (e.clientX - HOT_X) + "px," + (e.clientY - HOT_Y) + "px)";
  }
  function stop() {
    playing = false;
    sprite.classList.remove("is-playing");
    root.classList.remove("pene-playing");
  }

  document.addEventListener(
    "pointerdown",
    function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      // text fields and the gallery arrows keep their own cursor: no animation there
      if (e.target.closest && e.target.closest('input, textarea, select, [style*="cursor"]')) return;
      place(e);
      playing = true;
      root.classList.add("pene-playing");
      sprite.classList.remove("is-playing");
      void sprite.offsetWidth; // restart the animation on a quick second click
      sprite.classList.add("is-playing");
      clearTimeout(timer);
      timer = setTimeout(stop, DURATION);
    },
    true
  );
  document.addEventListener(
    "pointermove",
    function (e) {
      if (playing) place(e);
    },
    { passive: true }
  );
})();
