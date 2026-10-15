/* Home — the phrases come in like the ones on the About page (not the two lines in the first
   screen, "Studio tattoo · dal 2011…" and "Anarchica dal 1986…", which stay as they are):
   each word focuses in (from blurred and a little lower) one after the other as the phrase
   scrolls into view, and again whenever it comes back. Skipped for reduced motion; without JS
   the text is simply visible (the hidden state only exists once the `hero-anim` class is set). */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // selector -> delay (ms) before its first word, so the label and its text follow each other
  const TARGETS = [
    [".hero-block__label", 0],
    [".hero-block__text", 150],
    [".hero-closer", 0],
  ];

  function wrapWords(node) {
    [...node.childNodes].forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (part === "") return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement("span");
            span.className = "word";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrapWords(child);
      }
    });
  }

  const els = [];
  TARGETS.forEach(function (t) {
    document.querySelectorAll(t[0]).forEach(function (el) {
      wrapWords(el);
      el.classList.add("reveal-words");
      el.querySelectorAll(".word").forEach(function (w, i) {
        w.style.setProperty("--d", t[1] + i * 45 + "ms");
      });
      els.push(el);
    });
  });
  if (!els.length) return;

  document.body.classList.add("hero-anim");

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -12% 0px" }
  );
  els.forEach(function (el) {
    observer.observe(el);
  });
})();
