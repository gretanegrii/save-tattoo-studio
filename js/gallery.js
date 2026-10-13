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
      grid.dispatchEvent(new Event("gallery:update")); // masonry re-lays out
    });
    if (hidden().length === 0) btn.hidden = true;
  }

  /* ---------------- shared lightbox ---------------- */
  const galleries = [...document.querySelectorAll("#tattoo-grid, .js-gallery")];
  if (!galleries.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML =
    '<button class="lightbox__close" aria-label="Chiudi">×</button>' +
    '<span class="lightbox__arrow lightbox__arrow--left" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></span>' +
    '<img class="lightbox__img" alt="" />' +
    '<span class="lightbox__arrow lightbox__arrow--right" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
    '<span class="lightbox__counter"></span>';
  document.body.appendChild(box);

  const bimg = box.querySelector(".lightbox__img");
  const counter = box.querySelector(".lightbox__counter");

  let srcs = [];
  let alts = [];
  let current = 0;

  let isOpen = false;
  let swapToken = 0;

  function render() {
    bimg.src = srcs[current];
    bimg.alt = alts[current];
    counter.textContent = current + 1 + "/" + srcs.length;
  }
  // browsing: fade the photo out, swap it, fade the new one in
  function go(step) {
    current = (current + step + srcs.length) % srcs.length;
    const token = ++swapToken;
    bimg.classList.add("is-swapping");
    setTimeout(function () {
      if (token !== swapToken) return;
      render();
      const show = function () {
        if (token === swapToken) bimg.classList.remove("is-swapping");
      };
      if (bimg.complete) show();
      else {
        bimg.onload = show;
        bimg.onerror = show;
      }
    }, 200);
  }
  function open(list, altList, i) {
    srcs = list;
    alts = altList;
    current = (i + list.length) % list.length;
    swapToken++;
    bimg.classList.remove("is-swapping");
    render();
    isOpen = true;
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    isOpen = false;
    box.classList.remove("is-open");
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
    if (!isOpen) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  });
})();
