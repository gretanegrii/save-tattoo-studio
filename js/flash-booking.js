/* Flash booking — riempie la pagina da ?flash=NN e apre il form in linea
   (sotto al bottone "Prenota questo flash", scorrendo, niente modale). */
(function () {
  const n = (new URLSearchParams(location.search).get("flash") || "").padStart(2, "0");

  let flashName = "Flash " + n;

  // ---- immagine + nome dal query ----
  // the name is read from the card title in flash.html, so it is edited in one place only
  function setName(value) {
    flashName = value;
    const name = document.getElementById("flash-name");
    const img = document.getElementById("flash-image");
    if (name) name.textContent = flashName;
    if (img) img.alt = "Disegno flash " + flashName;
  }

  // data-prices on the card in flash.html, one text per size separated by "|":
  // "small|medium|large|very large", e.g. "Non disponibile|250 €|da 350 €|Da concordare".
  // data-taken on the card marks a flash as no longer bookable but keeps its prices visible.
  function setPrices(list, takenFlag) {
    const prices = (list || "").split("|").map(function (v) {
      return v.trim();
    });
    // taken: flagged, or every size unavailable (e.g. Save's own pieces)
    const taken =
      takenFlag ||
      (prices.length >= 4 &&
        prices.slice(0, 4).every(function (v) {
          return /^non disp/i.test(v);
        }));
    if (taken) {
      const status = document.getElementById("flash-status");
      if (status) status.textContent = "Non disponibile";
    }
    document.querySelectorAll(".chip").forEach(function (chip, i) {
      const priceEl = chip.querySelector(".chip__price");
      const input = chip.querySelector("input");
      function disable() {
        input.disabled = true;
        chip.classList.add("chip--disabled");
      }
      if (taken) disable();
      if (i >= 4) {
        // "Non so ancora" has no price
        if (priceEl) priceEl.textContent = "";
        return;
      }
      if (!prices[i]) return;
      if (priceEl) priceEl.textContent = prices[i];
      if (/^non disp/i.test(prices[i])) disable();
    });
  }

  if (/^\d{2}$/.test(n)) {
    const img = document.getElementById("flash-image");
    if (img) img.src = "assets/img/flash/" + n + ".webp";
    setName(flashName);

    fetch("flash.html")
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const link = doc.querySelector('.flash-card a[href$="flash=' + n + '"]');
        const title = link && link.closest(".flash-card").querySelector(".flash-card__title");
        if (title && title.textContent.trim()) setName(title.textContent.trim());
        const card = link && link.closest(".flash-card");
        if (card) setPrices(card.dataset.prices, card.hasAttribute("data-taken"));
      })
      .catch(function () {});
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
    if (fFlash) fFlash.value = n + " – " + flashName;
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
      if (fFlash) fFlash.value = n + " – " + flashName;
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
