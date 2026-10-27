/* Booking wizard — una pagina fucsia, schermate che si alternano.
   1) servizio → 2) domande del servizio scelto → 3) quando + dati.
   La dermopigmentazione ha un sotto-flusso: scelta zona → schermata della zona.
   Resta fisso l'hero; si mostra una sola .step alla volta. */
(function () {
  const form = document.querySelector(".booking-form");
  if (!form) return;

  const notice = document.querySelector(".booking-notice");
  const hero = document.querySelector(".booking-hero");
  const steps = Array.from(form.querySelectorAll(".step"));
  const step1 = document.getElementById("step-1");
  const stepDati = document.getElementById("step-dati");

  // servizio (step 1) -> pannello step 2
  const branch = {
    Tatuaggio: document.getElementById("step-tattoo"),
    Piercing: document.getElementById("step-piercing"),
    Dermopigmentazione: document.getElementById("step-dermo"),
  };

  // dermopigmentazione: zona scelta -> sotto-pannello
  const dermoPanels = {
    Sopracciglia: document.getElementById("step-dermo-sopracciglia"),
    Labbra: document.getElementById("step-dermo-labbra"),
    Eyeliner: document.getElementById("step-dermo-eyeliner"),
    Lentiggini: document.getElementById("step-dermo-lentiggini"),
  };

  function service() {
    const el = form.querySelector('input[name="servizio"]:checked');
    return el ? el.value : null;
  }
  function dermoPanel() {
    const el = form.querySelector('input[name="dermo_zona"]:checked');
    return el ? dermoPanels[el.value] : null;
  }

  function scrollTop() {
    if (hero && hero.scrollIntoView) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // profondità di ogni schermata: serve a capire se si va avanti (entra da destra) o indietro (da sinistra)
  const depth = new Map([[step1, 0], [stepDati, 3]]);
  Object.values(branch).forEach((el) => depth.set(el, 1));
  Object.values(dermoPanels).forEach((el) => depth.set(el, 2));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SLIDE_MS = 800;
  const SLIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  // la schermata nuova scorre dentro da destra verso sinistra, quella vecchia esce verso sinistra
  // (tornando indietro: al contrario)
  function show(step, silent) {
    if (!step) return;
    const out = steps.find((s) => s.classList.contains("is-active"));
    if (out === step) return;
    const dir = out && (depth.get(step) || 0) < (depth.get(out) || 0) ? -1 : 1;

    if (out && !reduceMotion.matches) {
      const top = out.offsetTop;
      out.classList.remove("is-active");
      out.classList.add("is-leaving");
      out.style.top = top + "px";
      const leave = out.animate(
        [
          { transform: "translateX(0)", opacity: 1 },
          { transform: "translateX(" + -dir * 40 + "%)", opacity: 0 },
        ],
        { duration: SLIDE_MS * 0.7, easing: SLIDE_EASE, fill: "forwards" }
      );
      leave.onfinish = function () {
        leave.cancel();
        out.classList.remove("is-leaving");
        out.style.top = "";
      };
    } else if (out) {
      out.classList.remove("is-active");
    }

    step.classList.add("is-active");
    if (out && !reduceMotion.matches) {
      step.animate(
        [
          { transform: "translateX(" + dir * 100 + "%)" },
          { transform: "translateX(0)" },
        ],
        { duration: SLIDE_MS, easing: SLIDE_EASE }
      );
    }
    if (notice) notice.hidden = step !== step1; // avviso solo nella schermata 1
    if (!silent) scrollTop(); // all'apertura della pagina non scorre: si vede subito logo e titolo
  }

  // schermate con UNA sola domanda: scegli e si va avanti da sole (niente tasto Avanti).
  // Solo col mouse/tocco: con la tastiera si sceglie con le frecce e si conferma con Invio.
  function autoAdvance(radios, go) {
    let byPointer = false;
    radios.forEach(function (r) {
      r.addEventListener("pointerdown", () => (byPointer = true));
      r.closest("label").addEventListener("pointerdown", () => (byPointer = true));
      r.addEventListener("keydown", function (e) {
        byPointer = false;
        if (e.key === "Enter") {
          e.preventDefault();
          go();
        }
      });
      r.addEventListener("click", function () {
        if (byPointer) setTimeout(go, 300); // il tempo di vedere la scelta
      });
    });
  }

  function nudge(name) {
    const r = form.querySelector('input[name="' + name + '"]');
    if (r && r.reportValidity) r.reportValidity();
  }

  // --- step 1: scegli il servizio -> si passa da solo al ramo ---
  autoAdvance(Array.from(step1.querySelectorAll('input[name="servizio"]')), function () {
    const svc = service();
    if (svc) show(branch[svc]);
  });

  // --- step 2 Tatuaggio / Piercing: Indietro -> step 1, Avanti -> dati ---
  [branch.Tatuaggio, branch.Piercing].forEach(function (step) {
    if (!step) return;
    const back = step.querySelector(".btn-back");
    const next = step.querySelector(".btn-next");
    if (back) back.addEventListener("click", () => show(step1));
    if (next) next.addEventListener("click", () => show(stepDati));
  });

  // --- dermo · scelta zona: Indietro -> step 1; scegli la zona -> si passa da sola al sotto-pannello ---
  const dermoBack = branch.Dermopigmentazione.querySelector(".btn-back");
  if (dermoBack) dermoBack.addEventListener("click", () => show(step1));
  autoAdvance(
    Array.from(branch.Dermopigmentazione.querySelectorAll('input[name="dermo_zona"]')),
    function () {
      const panel = dermoPanel();
      if (panel) show(panel);
    }
  );

  // --- dermo · sotto-pannelli: Indietro -> scelta zona, Avanti -> dati ---
  Object.values(dermoPanels).forEach(function (panel) {
    if (!panel) return;
    const back = panel.querySelector(".btn-back");
    const next = panel.querySelector(".btn-next");
    if (back)
      back.addEventListener("click", () => show(branch.Dermopigmentazione));
    if (next) next.addEventListener("click", () => show(stepDati));
  });

  // --- step 3: Indietro -> ultima schermata del servizio scelto ---
  const datiBack = stepDati.querySelector(".btn-back");
  if (datiBack) {
    datiBack.addEventListener("click", function () {
      const svc = service();
      if (svc === "Dermopigmentazione") {
        show(dermoPanel() || branch.Dermopigmentazione);
      } else {
        show(svc && branch[svc] ? branch[svc] : step1);
      }
    });
  }

  // --- piercing: avviso età minima (non bloccante) in base alla scelta ---
  // [soggetto della frase, età minima, verbo]. Rimozione microdermal: nessun avviso.
  const ageInfo = {
    Helix: ["L'helix", 14],
    Trago: ["Il trago", 14],
    Rook: ["Il rook", 14],
    Conch: ["Il conch", 14],
    Daith: ["Il daith", 14],
    Industrial: ["L'industrial", 14],
    Nostril: ["Il nostril", 14],
    Septum: ["Il septum", 16],
    Bridge: ["Il bridge", 16],
    Medusa: ["La medusa", 16],
    Monroe: ["Il monroe", 16],
    Labret: ["Il labret", 16],
    Eyebrow: ["L'eyebrow", 16],
    Ombelico: ["L'ombelico", 14],
    Capezzolo: ["Il capezzolo", 16],
    Lingua: ["La lingua", 16],
    Smile: ["Lo smile", 16],
    Intimi: ["I piercing intimi", 18, "si fanno"],
    Microdermal: ["Il microdermal", 18],
  };

  function warningText(type) {
    if (type === "Lobo")
      return "Il lobo si fa anche sotto i 14 anni, con il consenso di un genitore.";
    const info = ageInfo[type];
    if (!info) return "";
    const verb = info[2] || "si fa";
    return info[1] >= 18
      ? info[0] + " " + verb + " solo dai 18 anni."
      : info[0] + " " + verb + " dai " + info[1] + " anni — se sei più giovane, ne parliamo insieme.";
  }

  // Quanto resta visibile l'avviso, in millisecondi. 0 = resta finché il piercing è selezionato.
  const WARNING_AUTOHIDE_MS = 5000;
  let warnTimer;

  const warnBox = document.getElementById("piercing-warning");
  if (warnBox) {
    const warnText = warnBox.querySelector(".form-warning__text");
    form.querySelectorAll('input[name="piercing_tipo"]').forEach(function (r) {
      r.addEventListener("change", function () {
        const text = warningText(r.value);
        clearTimeout(warnTimer);
        if (text) {
          warnText.textContent = text;
          warnBox.classList.add("is-open");
          if (WARNING_AUTOHIDE_MS > 0)
            warnTimer = setTimeout(function () {
              warnBox.classList.remove("is-open");
            }, WARNING_AUTOHIDE_MS);
        } else {
          warnBox.classList.remove("is-open"); // keeps the old text while it fades out
        }
      });
    });
  }

  // --- submit → invio reale via FormSubmit (AJAX, resta in pagina) ---
  function showDone() {
    form.innerHTML =
      '<p class="booking-done">Richiesta inviata.' +
      "<span>Ti ricontatto io a breve per confermare tutto. ♥</span></p>";
    scrollTop();
  }

  function showError(msg) {
    const note = form.querySelector("#step-dati .form-note") || stepDati;
    let box = document.getElementById("submit-error");
    if (!box) {
      box = document.createElement("p");
      box.id = "submit-error";
      box.className = "form-error";
      note.parentNode.insertBefore(box, note);
    }
    box.innerHTML =
      (msg || "Qualcosa è andato storto nell'invio.") +
      ' Puoi scrivermi direttamente a ' +
      '<a href="mailto:gretanegrii@gmail.com">gretanegrii@gmail.com</a>.';
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const btn = form.querySelector("#step-dati .btn-submit");
    const raw = new FormData(form);
    // gli allegati non passano dall'endpoint AJAX di FormSubmit
    form.querySelectorAll('input[type="file"]').forEach((fi) => raw.delete(fi.name));

    // ripulisci: niente campi vuoti (es. i pannelli non usati), aggiungi il servizio
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
        // FormSubmit risponde 200 anche quando il form non è ancora attivato:
        // consideriamo inviato solo se success non è esplicitamente "false".
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

  // init
  show(step1, true);
})();
