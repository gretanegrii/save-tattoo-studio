/* Tattoo gallery — "Carica di più": reveal the next batch of items on click. */
(function () {
  const grid = document.getElementById("tattoo-grid");
  const btn = document.getElementById("load-more");
  if (!grid || !btn) return;

  const BATCH = 8;
  const hidden = () => grid.querySelectorAll(".tattoo-gallery__item.is-hidden");

  function revealNext() {
    const toShow = [...hidden()].slice(0, BATCH);
    toShow.forEach((item) => item.classList.remove("is-hidden"));
    if (hidden().length === 0) btn.hidden = true;
  }

  btn.addEventListener("click", revealNext);

  // nothing left to reveal → no button
  if (hidden().length === 0) btn.hidden = true;
})();
