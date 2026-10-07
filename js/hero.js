/* Hero scroll indicator — updates the % and hides over dark sections */
(function () {
  const indicator = document.querySelector(".hero__scroll");
  if (!indicator) return;

  /* 1) Update the scroll percentage as you scroll */
  function updatePercent() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
    indicator.textContent = "scroll(" + pct + "%)";
  }
  window.addEventListener("scroll", updatePercent, { passive: true });
  window.addEventListener("resize", updatePercent);
  updatePercent();

  /* 2) Hide the indicator when a dark section is on screen.
     Now = the footer. Later: add class "is-dark" to the Lavori section
     and it will be picked up here automatically. */
  const darkSections = document.querySelectorAll("footer, .is-dark");
  if (darkSections.length) {
    const visible = new Set();
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        indicator.classList.toggle("is-hidden", visible.size > 0);
      },
      { threshold: 0 }
    );
    darkSections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* 3) Navbar auto-hide: slides away on scroll down, reappears on scroll up.
     The gradual motion comes from the CSS `transition: transform` on header. */
  const header = document.querySelector("header");
  if (header) {
    let lastY = window.scrollY;
    let navTick = false;
    function updateNav() {
      const y = window.scrollY;
      if (y > lastY && y > 120) header.classList.add("nav-hidden");
      else if (y < lastY) header.classList.remove("nav-hidden");
      lastY = y;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (navTick) return;
        navTick = true;
        requestAnimationFrame(function () {
          updateNav();
          navTick = false;
        });
      },
      { passive: true }
    );
  }
})();
