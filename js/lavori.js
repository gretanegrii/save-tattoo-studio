/* Home — Lavori on phones: the three boxes are a horizontal strip (CSS scroll-snap, so it can be
   swiped) and the two arrows below move it by one box. On desktop the arrows are hidden and nothing
   here does anything visible. */
(function () {
  const track = document.querySelector(".lavori__track");
  const arrows = [...document.querySelectorAll(".lavori__arrow")];
  if (!track || !arrows.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function step() {
    const box = track.querySelector(".lavori__box");
    if (!box) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return box.getBoundingClientRect().width + gap;
  }

  function update() {
    const max = track.scrollWidth - track.clientWidth;
    arrows.forEach(function (a) {
      const dir = Number(a.dataset.dir);
      a.disabled = dir < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max - 2;
    });
  }

  arrows.forEach(function (a) {
    a.addEventListener("click", function () {
      track.scrollBy({ left: Number(a.dataset.dir) * step(), behavior: reduce ? "auto" : "smooth" });
    });
  });

  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
