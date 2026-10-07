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

  function show(step) {
    if (!step) return;
    steps.forEach((s) => s.classList.toggle("is-active", s === step));
    if (notice) notice.hidden = step !== step1; // avviso solo nella schermata 1
    scrollTop();
  }

  function nudge(name) {
    const r = form.querySelector('input[name="' + name + '"]');
    if (r && r.reportValidity) r.reportValidity();
  }

  // --- step 1: Avanti -> ramo del servizio ---
  const toBranch = step1.querySelector(".btn-next");
  if (toBranch) {
    toBranch.addEventListener("click", function () {
      const svc = service();
      if (!svc) return nudge("servizio");
      show(branch[svc]);
    });
  }

  // --- step 2 Tatuaggio / Piercing: Indietro -> step 1, Avanti -> dati ---
  [branch.Tatuaggio, branch.Piercing].forEach(function (step) {
    if (!step) return;
    const back = step.querySelector(".btn-back");
    const next = step.querySelector(".btn-next");
    if (back) back.addEventListener("click", () => show(step1));
    if (next) next.addEventListener("click", () => show(stepDati));
  });

  // --- dermo · scelta zona: Indietro -> step 1, Avanti -> sotto-pannello ---
  const dermoBack = branch.Dermopigmentazione.querySelector(".btn-back");
  const dermoNext = branch.Dermopigmentazione.querySelector(".btn-next");
  if (dermoBack) dermoBack.addEventListener("click", () => show(step1));
  if (dermoNext) {
    dermoNext.addEventListener("click", function () {
      const panel = dermoPanel();
      if (!panel) return nudge("dermo_zona");
      show(panel);
    });
  }

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
  // TODO: età minime reali da confermare con Save.
  const minAge = { Septum: 16, Lingua: 18, Capezzolo: 18, Intimi: 18, Smile: 16 };
  const warnBox = document.getElementById("piercing-warning");
  if (warnBox) {
    const warnText = warnBox.querySelector(".form-warning__text");
    form.querySelectorAll('input[name="piercing_tipo"]').forEach(function (r) {
      r.addEventListener("change", function () {
        const age = minAge[r.value];
        if (age) {
          warnText.textContent =
            "Per il piercing “" + r.value + "” l'età minima è " + age +
            " anni. Scrivimi se hai dubbi.";
          warnBox.hidden = false;
        } else {
          warnBox.hidden = true;
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
  show(step1);
})();
