/* Flash booking — fill the page from ?flash=NN and run the request modal. */
(function () {
  const n = (new URLSearchParams(location.search).get("flash") || "").padStart(2, "0");

  // ---- fill image + name from the query ----
  if (/^\d{2}$/.test(n)) {
    const img = document.getElementById("flash-image");
    const name = document.getElementById("flash-name");
    if (img) {
      img.src = "assets/img/flash/" + n + ".webp";
      img.alt = "Disegno flash " + n;
    }
    if (name) name.textContent = "Flash " + n;
  }

  // ---- modal ----
  const modal = document.getElementById("booking-modal");
  const openBtn = document.getElementById("flash-cta");
  if (!modal || !openBtn) return;
  const form = document.getElementById("booking-form");
  const closeBtn = modal.querySelector(".modal__close");

  function open() {
    // carry the flash number and the chosen size into the form
    const fFlash = document.getElementById("form-flash");
    const fSize = document.getElementById("form-misura");
    if (fFlash) fFlash.value = n;
    const checked = document.querySelector('input[name="tattoo_dimensione"]:checked');
    if (fSize) fSize.value = checked ? checked.value : "";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) close(); // click on the dark backdrop
  });
  document.addEventListener("keydown", function (e) {
    if (!modal.hidden && e.key === "Escape") close();
  });

  // ---- submit (no backend yet): confirm in place ----
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.innerHTML =
        '<p class="booking-form__done">Richiesta inviata. Ti ricontatto io a breve. ♥</p>';
    });
  }
})();
