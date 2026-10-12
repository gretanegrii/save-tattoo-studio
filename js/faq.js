/* FAQ — pannello che entra da destra e occupa metà pagina.
   Il contenuto è qui sotto (FAQ_DATA): testi facili da modificare.
   Il pannello viene creato una volta e funziona su tutte le pagine
   (ogni pagina ha il bottone .nav__faq nella navbar).
   NB: i PDF linkati (consensi / aftercare) sono segnaposto in assets/pdf/. */
(function () {
  const PDF = "assets/pdf/";

  function dl(label, file) {
    // link PDF tra parentesi quadre (niente emoji)
    return (
      '[<a href="' + PDF + file + '" target="_blank" rel="noopener">' +
      label +
      "</a>]"
    );
  }

  const FAQ_DATA = [
    {
      // NB: titolo aggiunto io per questa prima sezione — rinominalo se vuoi.
      title: "Età, sicurezza e salute",
      items: [
        {
          q: "Posso farmi un tatuaggio o un piercing se sono minorenne?",
          a:
            "<p>In conformità con la normativa (Legge 23 Luglio 2021 n. 13):</p>" +
            "<ul>" +
            "<li><strong>Tatuaggi:</strong> l'età minima è 16 anni. Dai 16 ai 17 anni è obbligatorio il consenso scritto di un genitore/tutore legale e un documento d'identità valido. Sotto i 16 anni non è consentito eseguirli.<br>" +
            '<span class="faq__dl">' +
            dl("Consenso Tattoo Minorenni", "consenso-tattoo-minorenni.pdf") +
            " · " +
            dl("Consenso Tattoo Maggiorenni", "consenso-tattoo-maggiorenni.pdf") +
            "</span></li>" +
            "<li><strong>Piercing:</strong> l'età minima è 14 anni (con consenso e documenti dei genitori/tutori legali). Sotto i 14 anni è vietato, fatta eccezione per il lobo dell'orecchio.<br>" +
            '<span class="faq__dl">' +
            dl("Consenso Piercing Minorenni", "consenso-piercing-minorenni.pdf") +
            " · " +
            dl("Consenso Piercing Maggiorenni", "consenso-piercing-maggiorenni.pdf") +
            "</span></li>" +
            "<li><strong>Dermopigmentazione (PMU):</strong> " +
            '<span class="faq__dl">' +
            dl("Consenso PMU", "consenso-pmu.pdf") +
            "</span></li>" +
            "<li>Per i <strong>maggiorenni</strong> è sempre sufficiente mostrare un documento d'identità in corso di validità e compilare il rispettivo modulo di consenso.</li>" +
            "</ul>",
        },
        {
          q: "Usate materiale sterile e sicuro?",
          a:
            "<p>Assolutamente sì. La sicurezza e l'igiene sono la nostra priorità. Utilizziamo esclusivamente materiali monouso sterili sia per i tatuaggi che per i piercing. Per i primi fori impieghiamo solo titanio da implantologia certificato anallergico e la nostra autoclave rispetta tutti gli standard della normativa europea.</p>",
        },
        {
          q: "Fa male?",
          a:
            "<p>Il dolore è soggettivo e varia in base alla zona del corpo e alla propria tolleranza. È comunque una sensazione del tutto sopportabile e ti accompagneremo durante ogni fase della seduta per farti sentire al sicuro e a tuo agio.</p>",
        },
        {
          q: "Posso venire con un accompagnatore?",
          a:
            "<ul>" +
            "<li><strong>Per i minorenni:</strong> è obbligatoria la presenza di un genitore o tutore legale.</li>" +
            "<li><strong>Per i maggiorenni:</strong> è consentito 1 solo accompagnatore, che potrà attendere nell'area d'attesa fuori dalla cabina di lavoro per garantire la massima igiene.</li>" +
            "</ul>",
        },
        {
          q: "Posso fare un tatuaggio o piercing in gravidanza o allattamento?",
          a:
            "<p>No. Durante la gravidanza e l'allattamento il sistema immunitario subisce cambiamenti e non è consigliato sottoporre il corpo a stress o rischi di infezione. Ti aspettiamo con gioia terminato questo periodo: goditi la tua gravidanza!</p>",
        },
        {
          q: "E se ho allergie?",
          a:
            "<ul>" +
            "<li><strong>Tatuaggi:</strong> i nostri pigmenti sono conformi alle severe normative europee REACH. Se è il tuo primo tatuaggio o hai forti allergie, possiamo effettuare una prova colore con un piccolo puntino al costo di € 30 (importo che verrà interamente scalato dal costo finale del tatuaggio).</li>" +
            "<li><strong>Piercing:</strong> utilizziamo esclusivamente titanio anallergico di altissima qualità, ideale anche per le pelli più sensibili.</li>" +
            "</ul>",
        },
      ],
    },
    {
      title: "Prenotazioni, acconto e regole dello studio",
      items: [
        {
          q: "Come posso prenotare?",
          a:
            '<p>Puoi compilare il form nella sezione <a href="booking.html">Prenota</a> raccontandoci la tua idea. Ti ricontatteremo al più presto per definire tutti i dettagli.</p>',
        },
        {
          q: "Come funziona l'acconto?",
          a:
            "<p>L'acconto è una garanzia reciproca d'impegno e serve a bloccare la data dell'appuntamento (verrà poi scalato dal totale). Non si versa dal sito: dopo la tua richiesta ti ricontatteremo noi in privato spiegandoti come inviarlo.</p>" +
            "<ul>" +
            "<li><strong>Tatuaggi e PMU:</strong> 25% del prezzo totale.</li>" +
            "<li><strong>Piercing:</strong> € 20.</li>" +
            "</ul>",
        },
        {
          q: "Se disdico o arrivo in ritardo, cosa succede?",
          a:
            "<ul>" +
            "<li><strong>Disdetta:</strong> se avvisi con almeno 5 giorni di anticipo, l'acconto non va perso e verrà spostato sulla nuova data. In caso di mancato preavviso o assenza, l'acconto verrà trattenuto.</li>" +
            "<li><strong>Ritardo:</strong> un piccolo ritardo si gestisce sempre, ma oltre i 15 minuti potremmo dover riprogrammare l'appuntamento per rispetto verso il cliente successivo.</li>" +
            "</ul>",
        },
        {
          q: "Quanto dovrò aspettare per l'appuntamento?",
          a:
            "<p>I tempi di attesa variano in base al periodo dell'anno e alla complessità del lavoro. Ti comunicheremo la prima data disponibile non appena ci ricontatterai.</p>",
        },
      ],
    },
    {
      title: "Progetti, tatuaggi e dermopigmentazione",
      items: [
        {
          q: "Posso portare una mia idea o un disegno?",
          a:
            "<p>Certamente! Ogni lavoro nasce dalla tua idea. Puoi portarci immagini, riferimenti o bozzetti: li analizzeremo insieme per creare un progetto unico e fatto su misura per te.</p>",
        },
        {
          q: "Si può tatuare su cicatrici, nei o smagliature?",
          a:
            "<ul>" +
            "<li><strong>Nei:</strong> non si possono mai tatuare sopra, per motivi medici e di prevenzione.</li>" +
            "<li><strong>Cicatrici:</strong> certamente sì! Possiamo studiare un progetto per valorizzare o coprire la cicatrice (valuteremo insieme lo stato della pelle).</li>" +
            "<li><strong>Smagliature:</strong> sì, è possibile tatuare sopra le smagliature.</li>" +
            "</ul>",
        },
        {
          q: "Quanto dura una seduta? Si può dividere in più appuntamenti?",
          a:
            "<p>La durata dipende dalla dimensione e dai dettagli del lavoro, oltre che dalla puntualità. Per i tatuaggi più grandi ed elaborati è possibile dividere il lavoro in più sedute, a discrezione del tatuatore.</p>",
        },
        {
          q: "I ritocchi sono inclusi?",
          a:
            "<ul>" +
            "<li><strong>Tatuaggi:</strong> il primo ritocco è incluso nel prezzo. Eventuali ritocchi successivi saranno a pagamento, salvo diversi accordi presi durante la seduta.</li>" +
            "<li><strong>Dermopigmentazione (PMU):</strong> la prima seduta di ritocco si effettua dopo 40 giorni. I rinfreschi successivi si valutano insieme (solitamente ogni 6 mesi, 1 anno o più, a seconda dell'effetto desiderato e del tipo di pelle).</li>" +
            "</ul>",
        },
      ],
    },
    {
      title: "Piercing & servizi speciali",
      items: [
        {
          q: "Effettuate cambi gioiello o rimozioni?",
          a:
            "<p>Sì! Eseguiamo cambi di gioielli, ripristino di fori parzialmente chiusi e rimozione di microdermal (anche se non sono stati realizzati da noi). Prenota un appuntamento e ti spiegheremo come procedere.</p>",
        },
        {
          q: "Come devo prendermi cura del tatuaggio / piercing / PMU?",
          a:
            "<p>Ti daremo tutte le indicazioni dettagliate a voce a fine seduta. Inoltre puoi scaricare direttamente le nostre guide ufficiali visitando le relative pagine dedicate::</p>" +
            '<p class="faq__dl">' +
            dl("Guida Aftercare Tattoo", "tattoo-aftercare.pdf") +
            " · " +
            dl("Guida Aftercare Piercing", "piercing-aftercare.pdf") +
            " · " +
            dl("Guida Aftercare Dermopigmentazione", "pmu-aftercare.pdf") +
            "</p>",
        },
      ],
    },
  ];

  // ---- build the drawer once ----
  function buildBody() {
    return FAQ_DATA.map(function (section) {
      const items = section.items
        .map(function (it) {
          return (
            '<div class="faq__item">' +
            '<h4 class="faq__q">' +
            it.q +
            "</h4>" +
            '<div class="faq__a">' +
            it.a +
            "</div>" +
            "</div>"
          );
        })
        .join("");
      return (
        '<section class="faq__section">' +
        '<h3 class="faq__section-title">' +
        section.title +
        "</h3>" +
        items +
        "</section>"
      );
    }).join("");
  }

  const root = document.createElement("div");
  root.className = "faq";
  root.id = "faq-drawer";
  root.innerHTML =
    '<div class="faq__backdrop" data-faq-close></div>' +
    '<aside class="faq__panel" role="dialog" aria-modal="true" aria-label="Domande frequenti" data-lenis-prevent>' +
    '<div class="faq__head">' +
    '<h2 class="faq__title">FAQ</h2>' +
    '<button type="button" class="faq__close" aria-label="Chiudi" data-faq-close>×</button>' +
    "</div>" +
    '<div class="faq__body">' +
    buildBody() +
    "</div>" +
    "</aside>";
  document.body.appendChild(root);

  // indice per lo stagger d'entrata del contenuto (il CSS usa --i)
  root
    .querySelectorAll(".faq__section-title, .faq__item")
    .forEach(function (el, i) {
      el.style.setProperty("--i", i);
    });

  const panel = root.querySelector(".faq__panel");
  const closeBtn = root.querySelector(".faq__close");
  const buttons = Array.from(document.querySelectorAll(".nav__faq"));
  let opener = null;

  function open(fromBtn) {
    opener = fromBtn || null;
    root.classList.add("is-open");
    buttons.forEach((b) => b.setAttribute("aria-expanded", "true"));
    document.documentElement.classList.add("faq-open");
    if (window.__lenis && window.__lenis.stop) window.__lenis.stop();
    panel.scrollTop = 0;
    closeBtn.focus();
  }

  function close() {
    root.classList.remove("is-open");
    buttons.forEach((b) => b.setAttribute("aria-expanded", "false"));
    document.documentElement.classList.remove("faq-open");
    if (window.__lenis && window.__lenis.start) window.__lenis.start();
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      root.classList.contains("is-open") ? close() : open(btn);
    });
  });

  root.addEventListener("click", function (e) {
    if (e.target.closest("[data-faq-close]")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("is-open")) close();
  });
})();
