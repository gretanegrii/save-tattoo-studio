/* Hero medusa — scroll-driven motion, modelled on the statue of monolithstudio.com.
   The model is position:fixed and follows the scroll through ONE continuous move
   (the curves below were measured on that site, then rescaled to this page):
     1. it starts facing front and turns very slowly while growing a little, always centred;
     2. it then speeds up, passes behind (back view) and zooms in hard, head cropped;
     3. the camera pulls back and it keeps turning, slowly, until it faces front again;
     4. all along it also slides to the side opposite each text block;
     5. it fades out, FRONT-ON, TOGETHER with the closing phrase ("Anarchica da sempre") as the
        Lavori section comes up.
   Everything is eased with a per-frame lerp so the movement stays fluid. */
(function () {
  const model = document.querySelector(".hero__model");
  const blocks = [...document.querySelectorAll(".hero-block, .hero-closer")];
  const fadeTarget = document.querySelector(".lavori") || document.querySelector("footer");
  const closer = document.querySelector(".hero-closer");
  const glow = document.querySelector(".hero__glow");
  if (!model || !blocks.length) return;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Respect users who prefer less motion: leave the medusa static in the hero.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // The move, as a function of u = how far we are between the hero (0) and the closing
  // phrase (1). yaw in degrees (turns the face towards the viewer's right first), s = scale
  // relative to the hero. Sideways, it additionally moves to the side opposite each text block.
  const PATH = [
    { u: 0.0, yaw: 0, s: 1.0 },
    { u: 0.13, yaw: 5, s: 1.12 },
    { u: 0.27, yaw: 18, s: 1.28 },
    { u: 0.4, yaw: 42, s: 1.45 },
    { u: 0.47, yaw: 100, s: 1.8 },
    { u: 0.53, yaw: 160, s: 2.35 }, // back view, zoomed in hard
    { u: 0.6, yaw: 205, s: 1.35 },
    { u: 0.67, yaw: 240, s: 1.2 },
    { u: 0.78, yaw: 280, s: 1.15 },
    { u: 0.89, yaw: 325, s: 1.1 },
    { u: 1.0, yaw: 360, s: 1.05 }, // back to front while it fades out
  ];
  const offset = () => Math.min(window.innerWidth * 0.26, 480); // side travel in px

  // Monotone cubic interpolation (Fritsch–Carlson): smooth through every point, no overshoot,
  // so the speed changes gradually instead of stopping at each keyframe.
  function makeCurve(key) {
    const n = PATH.length;
    const d = [];
    for (let i = 0; i < n - 1; i++) d.push((PATH[i + 1][key] - PATH[i][key]) / (PATH[i + 1].u - PATH[i].u));
    const m = [d[0]];
    for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
    m.push(d[n - 2]);
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = Math.hypot(a, b);
      if (h > 3) { m[i] = (3 * a / h) * d[i]; m[i + 1] = (3 * b / h) * d[i]; }
    }
    return (u) => {
      u = clamp(u, 0, 1);
      let i = 0;
      while (i < n - 2 && u > PATH[i + 1].u) i++;
      const h = PATH[i + 1].u - PATH[i].u;
      const t = (u - PATH[i].u) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * PATH[i][key] + (t3 - 2 * t2 + t) * h * m[i] +
        (-2 * t3 + 3 * t2) * PATH[i + 1][key] + (t3 - t2) * h * m[i + 1];
    };
  }
  const yawAt = makeCurve("yaw");
  const scaleAt = makeCurve("s");

  // cur = what's drawn now, tgt = where it wants to be. We lerp cur -> tgt.
  // d = "dim": on phones the medusa fades back behind the phrases so they can be read
  const cur = { x: 0, y: 0, s: 1, yaw: 0, o: 1, d: 1 };
  const tgt = { x: 0, y: 0, s: 1, yaw: 0, o: 1, d: 1 };
  const phone = window.matchMedia("(max-width: 860px)");
  const DIM = 0.62; // medusa opacity behind the text on phones
  const BLUR = 3; // px of blur over the medusa behind the text on phones (see .hero__stage.is-blurred)
  const stage = model.closest(".hero__stage");
  const DEBUG = /[?&]debug\b/.test(window.location.search);
  const VERSION = "20261015k";
  let dbg = null;
  let dbgScanAt = 0;
  let dbgWidth = "";

  let running = false;
  let lastScroll = performance.now();

  function computeTargets() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const progress = window.scrollY + vh / 2; // page-Y of the viewport centre

    // u = 0 at the hero (scroll = 0), 1 when the closing phrase is centred
    const last = blocks[blocks.length - 1].getBoundingClientRect();
    const A = vh / 2;
    const Z = Math.max(window.scrollY + last.top + last.height / 2 - vh * 0.3, A + vh); // a bit early: already front-on when the fade starts
    const u = clamp((progress - A) / (Z - A), 0, 1);

    // side opposite the text: -1/+1 per block (0 for centred text), smoothly blended between blocks
    const R = offset();
    const pts = [{ at: A, v: 0 }];
    blocks.forEach((b) => {
      const r = b.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const side = cx < vw * 0.47 ? 1 : cx > vw * 0.53 ? -1 : 0; // +1 => text left, medusa right
      pts.push({ at: window.scrollY + r.top + r.height / 2, v: side * R });
    });
    let x = pts[pts.length - 1].v;
    if (progress <= pts[0].at) x = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      if (progress >= pts[i].at && progress <= pts[i + 1].at) {
        let t = (progress - pts[i].at) / (pts[i + 1].at - pts[i].at);
        t = t * t * (3 - 2 * t);
        x = pts[i].v + (pts[i + 1].v - pts[i].v) * t;
        break;
      }
    }
    tgt.x = x;
    tgt.y = 0;
    tgt.s = scaleAt(u);
    tgt.yaw = -yawAt(u); // model-viewer turns the other way: negative = face towards the viewer's right

    // Phones: the phrases sit ON TOP of the medusa (full width, no room beside it), so it stays
    // in the middle, a bit less zoomed, and dims only while a phrase is on screen.
    tgt.d = 1;
    if (phone.matches) {
      tgt.x = 0;
      tgt.s = 1 + (tgt.s - 1) * 0.55;
      // The medusa dims ONLY while a phrase is on screen. For each phrase: how far it is from the
      // "reading band" (the middle of the screen); inside the band the dim is full, and it fades
      // in over the last 7% of the screen before the phrase gets there. Between phrases (and in
      // the first screen) she is sharp and fully visible.
      const band = [vh * 0.4, vh * 0.75]; // the part of the screen where a phrase actually covers the medusa
      const lead = vh * 0.07;
      let presence = 0;
      blocks.forEach((blk) => {
        const r = blk.getBoundingClientRect();
        const gap = Math.max(r.top - band[1], band[0] - r.bottom, 0);
        presence = Math.max(presence, 1 - clamp(gap / lead, 0, 1));
      });
      const t = presence * presence * (3 - 2 * presence);
      tgt.d = 1 - (1 - DIM) * t;
    }

    // Fade out as the Lavori section rises into view: the medusa and the closing phrase
    // ("Anarchica da sempre") fade away together (same value), fully gone before the
    // section covers them.
    if (fadeTarget) {
      const ft = fadeTarget.getBoundingClientRect().top; // distance from viewport top
      const start = vh * 0.8; // begin fading when the section top is at 80% of the screen
      const end = vh * 0.3; // fully gone when it has risen to 30%
      tgt.o = clamp((ft - end) / (start - end), 0, 1);
    } else {
      tgt.o = 1;
    }
  }

  function frame() {
    computeTargets();

    const k = 0.055; // position & scale: a bit more inertia → a slower, calmer glide
    cur.x += (tgt.x - cur.x) * k;
    cur.y += (tgt.y - cur.y) * k;
    cur.s += (tgt.s - cur.s) * k;
    cur.o += (tgt.o - cur.o) * 0.12;
    cur.yaw += (tgt.yaw - cur.yaw) * 0.07; // a little inertia on the turn too, so it unfolds slowly
    cur.d += (tgt.d - cur.d) * (tgt.d < cur.d ? 0.14 : 0.25); // dims in softly, clears quickly
    if (stage) {
      // blur grows with the dimming (0 on desktop and in the first screen)
      const kb = (1 - cur.d) / (1 - DIM);
      stage.style.setProperty("--blur", (kb * BLUR).toFixed(1) + "px");
      stage.classList.toggle("is-blurred", kb > 0.03);
    }

    model.style.setProperty("--mx", cur.x.toFixed(1) + "px");
    model.style.setProperty("--my", cur.y.toFixed(1) + "px");
    model.style.setProperty("--ms", cur.s.toFixed(3));
    model.style.setProperty("--mo", (cur.o * cur.d).toFixed(3)); // fade-out x phone dimming
    if (glow) {
      // the light/shadow behind the medusa follow it
      glow.style.setProperty("--mx", cur.x.toFixed(1) + "px");
      glow.style.setProperty("--my", cur.y.toFixed(1) + "px");
      glow.style.setProperty("--ms", cur.s.toFixed(3));
      glow.style.setProperty("--mo", cur.o.toFixed(3));
    }
    if (closer) closer.style.opacity = cur.o.toFixed(3); // the phrase fades with the medusa

    // Debug read-out (only with ?debug in the address): shows what the script is doing on a phone.
    if (DEBUG) {
      if (!dbg) {
        dbg = document.createElement("div");
        dbg.style.cssText =
          "position:fixed;left:8px;top:96px;z-index:99;background:#000;color:#0f0;font:10px/1.3 monospace;padding:6px;pointer-events:none;max-width:85vw;white-space:pre-wrap";
        document.body.appendChild(dbg);
      }
      // width diagnosis (scanned at most every 600 ms): who is wider than the screen?
      const nowT = performance.now();
      if (!dbgScanAt || nowT - dbgScanAt > 600) {
        dbgScanAt = nowT;
        const cw = document.documentElement.clientWidth;
        const wide = [];
        document.querySelectorAll("body *").forEach((el) => {
          if (el.closest("#site-nav") || el.closest(".faq")) return;
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.right > cw + 1) {
            wide.push(el.tagName.toLowerCase() + "." + String(el.className && el.className.baseVal !== undefined ? "" : el.className).split(" ")[0] + "=" + Math.round(r.right));
          }
        });
        const vv = window.visualViewport;
        dbgWidth =
          "inner=" + window.innerWidth + " client=" + cw + " scrollW=" + document.documentElement.scrollWidth +
          (vv ? " vv=" + Math.round(vv.width) + " scale=" + vv.scale.toFixed(2) + " offX=" + Math.round(vv.offsetLeft) : "") +
          " wider:" + (wide.slice(0, 5).join(",") || "none");
      }
      dbg.textContent =
        "JS v" + VERSION + " phone=" + phone.matches +
        " d=" + cur.d.toFixed(2) + " mo=" + (cur.o * cur.d).toFixed(2) +
        " blur=" + (stage ? stage.style.getPropertyValue("--blur") : "-") +
        " s=" + cur.s.toFixed(2) + "\n" + dbgWidth;
    }

    // Turn the model in 3D (keeps the baked framing via radius "auto").
    if ("cameraOrbit" in model) {
      model.cameraOrbit = cur.yaw.toFixed(2) + "deg 90deg auto";
    }

    // Keep ticking while anything is still moving or we scrolled recently.
    const settling =
      Math.abs(tgt.x - cur.x) +
      Math.abs(tgt.yaw - cur.yaw) +
      Math.abs(tgt.s - cur.s) * 100 +
      Math.abs(tgt.o - cur.o) * 100 +
      Math.abs(tgt.d - cur.d) * 100;
    if (settling > 0.5 || performance.now() - lastScroll < 500) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function kick() {
    lastScroll = performance.now();
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);

  // Start once the model-viewer element is upgraded (so cameraOrbit exists).
  if (window.customElements && customElements.whenDefined) {
    customElements.whenDefined("model-viewer").then(kick);
  }
  kick();
})();
