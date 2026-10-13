/* Masonry for the tattoo gallery — every photo keeps its natural shape (no crop).
   Items stay in DOM order (so the lightbox order is the same as the page) and are
   placed in the shortest column. Heights come from the img width/height attributes,
   so nothing jumps while photos load, and "Carica di più" only appends — it never
   moves what is already on screen. Without JS, CSS columns are the fallback. */
(function () {
  const grid = document.querySelector(".tattoo-gallery__grid--masonry");
  if (!grid) return;

  const count = document.getElementById("tattoo-count");
  if (count) {
    const total = grid.querySelectorAll(".tattoo-gallery__item").length;
    count.textContent = total + " lavori";
  }

  let colHeights = [];
  let placed = 0; // how many visible items are already positioned
  let lastWidth = 0;
  let lastCols = 0;

  function cssNumber(name) {
    return parseInt(getComputedStyle(grid).getPropertyValue(name), 10);
  }

  function place(item, colWidth, gap) {
    const img = item.querySelector("img");
    // box shape comes from the HTML width/height attributes (4:3 if missing)
    const w = parseInt(img.getAttribute("width"), 10);
    const h = parseInt(img.getAttribute("height"), 10);
    const height = colWidth * (w && h ? h / w : 4 / 3);

    let col = 0;
    for (let c = 1; c < colHeights.length; c++) {
      if (colHeights[c] < colHeights[col] - 0.5) col = c;
    }
    item.style.width = colWidth + "px";
    item.style.height = height + "px";
    item.style.transform =
      "translate(" + col * (colWidth + gap) + "px," + colHeights[col] + "px)";
    colHeights[col] += height + gap;
  }

  function layout(full) {
    const cols = cssNumber("--cols") || 5;
    const gap = parseFloat(getComputedStyle(grid).getPropertyValue("--gap")) * 16 || 12;
    const width = grid.clientWidth;
    const colWidth = (width - gap * (cols - 1)) / cols;

    // width or column count changed → start over; otherwise only append
    if (full || cols !== lastCols || width !== lastWidth) {
      colHeights = new Array(cols).fill(0);
      placed = 0;
      lastCols = cols;
      lastWidth = width;
    }

    const items = [...grid.querySelectorAll(".tattoo-gallery__item")].filter(
      (i) => !i.classList.contains("is-hidden")
    );
    for (let i = placed; i < items.length; i++) place(items[i], colWidth, gap);
    placed = items.length;

    grid.style.height = Math.max(0, Math.max.apply(null, colHeights) - gap) + "px";
  }

  grid.classList.add("is-masonry");
  layout(true);

  grid.addEventListener("gallery:update", () => layout(false));

  let t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(() => layout(false), 100);
  });
})();
