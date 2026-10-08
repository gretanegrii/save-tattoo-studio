/* Flash booking — riempie la pagina da ?flash=NN e apre il form in linea
   (sotto al bottone "Prenota questo flash", scorrendo, niente modale). */
(function () {
  const n = (new URLSearchParams(location.search).get("flash") || "").padStart(2, "0");

  // ---- immagine + nome dal query ----
  if (/^\d{2}$/.test(n)) {
    const img = document.getElementById("flash-image");
    const name = document.getElementById("flash-name");
    if (img) {
      img.src = "assets/img/flash/" + n + ".webp";
      img.alt = "Disegno flash " + n;
    }
    if (name) name.textContent = "Flash " + n;
  }

  // ---- pannello inline ----
  const reveal = document.getElementById("booking-reveal");
  const openBtn = document.getElementById("flash-cta");
  if (!reveal || !openBtn) return;
  const form = document.getElementById("booking-form");
  const closeBtn = reveal.querySelector(".flash-reveal__close");

  // "Prenota questo flash" è cliccabile solo dopo aver scelto una misura
  function syncCta() {
    const picked = document.querySelector('input[name="tattoo_dimensione"]:checked');
    openBtn.disabled = !picked;
    if (!picked && reveal.classList.contains("is-open")) close();
  }
  document.querySelectorAll('input[name="tattoo_dimensione"]').forEach(function (r) {
    r.addEventListener("change", syncCta);
  });
  syncCta();

  function scrollTo(el) {
    if (window.__lenis && window.__lenis.scrollTo) {
      window.__lenis.scrollTo(el, { offset: -90 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function open() {
    // porta il flash scelto e la misura nei campi nascosti
    const fFlash = document.getElementById("form-flash");
    const fSize = document.getElementById("form-misura");
    if (fFlash) fFlash.value = n;
    const checked = document.querySelector('input[name="tattoo_dimensione"]:checked');
    if (fSize) fSize.value = checked ? checked.value : "";

    reveal.classList.add("is-open");
    reveal.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");

    // porta il bottone in cima: il form si rivela subito sotto
    scrollTo(openBtn);
    // focus al primo campo a animazione finita
    window.setTimeout(function () {
      const first = form && form.querySelector("input:not([type=hidden]), textarea");
      if (first) first.focus({ preventScroll: true });
    }, 480);
  }

  function close() {
    reveal.classList.remove("is-open");
    reveal.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    scrollTo(openBtn);
    openBtn.focus({ preventScroll: true });
  }

  openBtn.addEventListener("click", function () {
    reveal.classList.contains("is-open") ? close() : open();
  });
  if (closeBtn) closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && reveal.classList.contains("is-open")) close();
  });

  // ---- submit → invio reale via FormSubmit (AJAX, resta in pagina) ----
  function showDone() {
    form.innerHTML =
      '<p class="booking-form__done">Richiesta inviata. Ti ricontatto io a breve. ♥</p>';
  }

  function showError(msg) {
    let box = document.getElementById("flash-submit-error");
    if (!box) {
      box = document.createElement("p");
      box.id = "flash-submit-error";
      box.className = "booking-form__note";
      form.appendChild(box);
    }
    box.innerHTML =
      (msg || "Qualcosa è andato storto nell'invio.") +
      ' Puoi scrivermi a <a href="mailto:gretanegrii@gmail.com">gretanegrii@gmail.com</a>.';
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      // assicura flash + misura aggiornati al momento dell'invio
      const fFlash = document.getElementById("form-flash");
      const fSize = document.getElementById("form-misura");
      if (fFlash) fFlash.value = n;
      const sizeNow = document.querySelector('input[name="tattoo_dimensione"]:checked');
      if (fSize) fSize.value = sizeNow ? sizeNow.value : "";

      const btn = form.querySelector('button[type="submit"]');
      const raw = new FormData(form);
      // ripulisci i campi vuoti (es. radio non scelti)
      const fd = new FormData();
      for (const pair of raw.entries()) {
        if (typeof pair[1] === "string" && pair[1].trim() === "") continue;
        fd.append(pair[0], pair[1]);
      }

      if (btn) {
        btn.disabled = true;
        btn.dataset.label = btn.innerHTML;
        btn.textContent = "Invio…";
      }

      fetch(form.action, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      })
        .then(function (r) {
          return r
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: r.ok, data: data };
            });
        })
        .then(function (res) {
          const sent =
            res.ok && !(res.data && String(res.data.success) === "false");
          if (sent) {
            showDone();
          } else {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = btn.dataset.label;
            }
            showError(res.data && res.data.message);
          }
        })
        .catch(function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.label;
          }
          showError();
        });
    });
  }
})();
