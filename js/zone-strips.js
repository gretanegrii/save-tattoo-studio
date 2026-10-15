/* Piercing / Dermopigmentazione — the photo strip of each zone scrolls sideways.
   On phones you swipe it (CSS only); on desktop the two round arrows under the zone title move it
   by a few photos at a time (a trackpad scrolls it too). An arrow turns off at the start / the end. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".zone").forEach(function (zone) {
    const strip = zone.querySelector(".zone__strip");
    const arrows = [...zone.querySelectorAll(".zone__arrow")];
    if (!strip || !arrows.length) return;

    const box = zone.querySelector(".zone__arrows");

    function update() {
      const max = strip.scrollWidth - strip.clientWidth;
      // nothing to scroll (few photos, they all fit): no arrows at all
      if (box) box.hidden = max <= 2;
      arrows.forEach(function (a) {
        const dir = Number(a.dataset.dir);
        a.disabled = dir < 0 ? strip.scrollLeft <= 2 : strip.scrollLeft >= max - 2;
      });
    }

    arrows.forEach(function (a) {
      a.addEventListener("click", function () {
        // about three-quarters of what is visible, so the photos keep some continuity
        const step = Math.max(strip.clientWidth * 0.75, 200);
        strip.scrollBy({ left: Number(a.dataset.dir) * step, behavior: reduce ? "auto" : "smooth" });
      });
    });

    strip.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    // photos load lazily: recompute when the strip gets its real width
    strip.querySelectorAll("img").forEach(function (img) {
      if (!img.complete) img.addEventListener("load", update, { once: true });
    });
  });
})();
