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
