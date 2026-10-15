/* Hero scroll indicator — updates the % and hides over dark sections */
(function () {
  const indicator = document.querySelector(".hero__scroll");
  if (!indicator) return;

  /* 1) Update the scroll percentage as you scroll.
     The counter belongs to the fuchsia part of the page: 0% at the top and 100% exactly when the
     Lavori section starts to come up under it (then it is hidden, see below). */
  const works = document.querySelector(".lavori");
  const MARGIN = 40; // px: the counter sits 20px from the bottom, plus a little room
  function updatePercent() {
    let max;
    if (works) {
      const worksTop = works.getBoundingClientRect().top + window.scrollY;
      max = worksTop - window.innerHeight + MARGIN; // scroll position where Lavori reaches the counter
    } else {
      max = document.documentElement.scrollHeight - window.innerHeight;
    }
    const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100))) : 0;
    indicator.textContent = "scroll(" + pct + "%)";
  }
  window.addEventListener("scroll", updatePercent, { passive: true });
  window.addEventListener("resize", updatePercent);
  window.addEventListener("load", updatePercent);
  updatePercent();

  /* The strips above and below the page on phones (status bar, toolbar) must look like an extension
     of the page. Safari fills them from two things: the theme-color tag and the page background
     (the colour behind everything). On pages with one colour both are set once in the HTML/CSS; the
     home changes colour while you scroll (fuchsia hero, dark photo, black footer), so both follow
     the section that fills most of the screen: fuchsia while the hero does, dark once Lavori (and
     then the footer) take over more than half of it. */
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const THEME_PINK = themeMeta ? themeMeta.getAttribute("content") : "";
  const THEME_DARK = "#0b0b0c";
  let themeIsDark = null;
  function updateTheme() {
    if (!works) return;
    const dark = works.getBoundingClientRect().top <= window.innerHeight * 0.5;
    if (dark === themeIsDark) return;
    themeIsDark = dark;
    if (themeMeta) themeMeta.setAttribute("content", dark ? THEME_DARK : THEME_PINK);
    document.body.style.backgroundColor = dark ? THEME_DARK : ""; // "" = the normal fuchsia from the CSS
  }
  window.addEventListener("scroll", updateTheme, { passive: true });
  window.addEventListener("resize", updateTheme);
  window.addEventListener("load", updateTheme);
  updateTheme();

  /* 2) Hide the indicator as soon as a dark section (Lavori, footer) rises up to it. The observed
     area stops MARGIN px above the bottom of the screen, where the counter sits. */
  const darkSections = document.querySelectorAll(".lavori, footer, .is-dark");
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
      { threshold: 0, rootMargin: "0px 0px -" + MARGIN + "px 0px" }
    );
    darkSections.forEach(function (section) {
      observer.observe(section);
    });
  }

})();
