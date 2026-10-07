/* Galleries — "Carica di più" (tattoo) + a shared click-to-zoom lightbox
   used by the tattoo grid and each piercing zone strip. */
(function () {
  /* ---------------- load more (tattoo grid only) ---------------- */
  const grid = document.getElementById("tattoo-grid");
  const btn = document.getElementById("load-more");
  if (grid && btn) {
    const BATCH = 24;
    const hidden = () =>
      grid.querySelectorAll(".tattoo-gallery__item.is-hidden");
    btn.addEventListener("click", function () {
      [...hidden()].slice(0, BATCH).forEach((i) => i.classList.remove("is-hidden"));
      if (hidden().length === 0) btn.hidden = true;
    });
    if (hidden().length === 0) btn.hidden = true;
  }

  /* ---------------- shared lightbox ---------------- */
  const galleries = [...document.querySelectorAll("#tattoo-grid, .js-gallery")];
  if (!galleries.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.innerHTML =
    '<button class="lightbox__close" aria-label="Chiudi">×</button>' +
    '<span class="lightbox__arrow lightbox__arrow--left" aria-hidden="true">‹</span>' +
    '<img class="lightbox__img" alt="" />' +
    '<span class="lightbox__arrow lightbox__arrow--right" aria-hidden="true">›</span>' +
    '<span class="lightbox__counter"></span>';
  document.body.appendChild(box);

  const bimg = box.querySelector(".lightbox__img");
  const counter = box.querySelector(".lightbox__counter");

  let srcs = [];
  let alts = [];
  let current = 0;

  function render() {
    bimg.src = srcs[current];
    bimg.alt = alts[current];
    counter.textContent = current + 1 + "/" + srcs.length;
  }
  function go(step) {
    current = (current + step + srcs.length) % srcs.length;
    render();
  }
  function open(list, altList, i) {
    srcs = list;
    alts = altList;
    current = (i + list.length) % list.length;
    render();
    box.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
  }

  // each gallery opens the lightbox with ITS own images
  galleries.forEach(function (g) {
    const imgs = [...g.querySelectorAll("img")];
    const list = imgs.map((i) => i.getAttribute("src"));
    const altList = imgs.map((i) => i.getAttribute("alt") || "");
    g.addEventListener("click", function (e) {
      const img = e.target.closest("img");
      if (img && g.contains(img)) open(list, altList, imgs.indexOf(img));
    });
  });

  box.addEventListener("click", function (e) {
    if (e.target.closest(".lightbox__close")) return close();
    if (e.target.closest(".lightbox__arrow--left")) return go(-1);
    if (e.target.closest(".lightbox__arrow--right")) return go(1);
    if (e.target === bimg) {
      go(e.clientX < window.innerWidth / 2 ? -1 : 1);
    } else {
      close();
    }
  });

  box.addEventListener("mousemove", function (e) {
    bimg.style.cursor = e.clientX < window.innerWidth / 2 ? "w-resize" : "e-resize";
  });

  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  });
})();
