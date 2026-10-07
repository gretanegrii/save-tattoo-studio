/* About — scroll behaviours (inspired by vitalinabender.com)
   - left fragments focus in WORD BY WORD as they enter the viewport
   - the two phrases over the image scroll and focus in at different moments
   - "Anarchica da sempre" is aligned just after the 4th fragment
   - the navbar auto-hides on scroll down, reappears on scroll up
   - the portrait stays still, then "releases" at the last fragment (fuchsia below) */
(function () {
  const fragments = [...document.querySelectorAll(".about__frag")];
  const heading = document.querySelector(".about__media h1");
  const statement = document.querySelector(".about__statement");
  const header = document.querySelector("header");
  const portrait = document.querySelector(".about__portrait");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => window.matchMedia("(max-width: 800px)").matches;

  /* ---------- entrance animations (skipped for reduced motion) ---------- */
  if (!reduce) {
    document.body.classList.add("anim-ready");

    function wrapWords(node) {
      [...node.childNodes].forEach(function (child) {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(function (part) {
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

    fragments.forEach(function (frag) {
      wrapWords(frag);
      frag.querySelectorAll(".word").forEach(function (word, i) {
        word.style.setProperty("--d", i * 45 + "ms");
      });
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -12% 0px" }
    );
    fragments.forEach(function (f) {
      observer.observe(f);
    });
    if (heading) observer.observe(heading);
    if (statement) observer.observe(statement);
  }

  /* ---------- align "Anarchica da sempre" just after the 4th fragment ---------- */
  function alignStatement() {
    if (!statement || fragments.length < 4 || mobile()) {
      if (statement) statement.style.marginTop = "";
      return;
    }
    const fourth = fragments[3];
    statement.style.marginTop = "0px";
    const naturalTop = statement.getBoundingClientRect().top + window.scrollY;
    const target =
      fourth.getBoundingClientRect().bottom +
      window.scrollY +
      window.innerHeight * 0.3;
    statement.style.marginTop = Math.max(0, target - naturalTop) + "px";
  }

  /* ---------- portrait release point: size the sticky container to end at the last fragment ---------- */
  const visual = document.querySelector(".about__visual");
  function setVisualHeight() {
    if (!visual || !fragments.length) return;
    if (mobile()) {
      visual.style.height = ""; // CSS handles the stacked mobile layout
      return;
    }
    const last = fragments[fragments.length - 1];
    const visualTop = visual.getBoundingClientRect().top + window.scrollY;
    const lastBottom = last.getBoundingClientRect().bottom + window.scrollY;
    visual.style.height = Math.max(0, lastBottom - visualTop) + "px";
  }

  /* navbar auto-hide is handled globally by js/main.js */
  function onResize() {
    alignStatement();
    setVisualHeight();
  }

  alignStatement();
  setVisualHeight();
  window.addEventListener("resize", onResize);
  /* recompute once fonts/images settle (they can shift measured positions) */
  window.addEventListener("load", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
})();
