/* Hero medusa — scroll-driven motion.
   The model is position:fixed. As you scroll it glides to the side OPPOSITE
   the active text block, scales down, and turns in 3D (the studio light slides
   over it), then fades out over the footer. Everything is eased with a per-frame
   lerp so the movement stays fluid. */
(function () {
  const model = document.querySelector(".hero__model");
  const blocks = [...document.querySelectorAll(".hero-block, .hero-closer")];
  const footer = document.querySelector("footer");
  if (!model || !blocks.length) return;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Respect users who prefer less motion: leave the medusa static in the hero.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const BIG = 1.9; // scale at the "zoom in" beats
  const SMALL = 0.58; // scale at the "zoom out" beats
  const SPIN = 720; // degrees of horizontal rotation from the hero to the closer (two full turns)
  const offset = () => Math.min(window.innerWidth * 0.26, 480); // side travel in px

  // cur = what's drawn now, tgt = where it wants to be. We lerp cur -> tgt.
  const cur = { x: 0, y: 0, s: 1, yaw: 0, o: 1 };
  const tgt = { x: 0, y: 0, s: 1, yaw: 0, o: 1 };

  let running = false;
  let lastScroll = performance.now();

  function computeTargets() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const progress = window.scrollY + vh / 2; // page-Y of the viewport centre
    const R = offset();

    // Keyframes along the page: the hero (centred, big, facing front), then one
    // per text block on the side OPPOSITE its text. We interpolate continuously
    // between them, so the medusa is always drifting toward the next position.
    const kf = [{ at: vh / 2, x: 0, s: 1 }];
    let ci = 0; // content-block counter, to alternate big / small
    for (const b of blocks) {
      const r = b.getBoundingClientRect();
      const cy = window.scrollY + r.top + r.height / 2;
      const cx = r.left + r.width / 2;
      const side = cx < vw * 0.47 ? 1 : cx > vw * 0.53 ? -1 : 0; // +1 => text left, medusa right
      const isCloser = b.classList.contains("hero-closer");
      // zoom a lot: alternate BIG / SMALL on each text block; end roomy on the closer
      const s = isCloser ? 1.15 : ci++ % 2 === 0 ? BIG : SMALL;
      kf.push({ at: cy, x: side * R, s });
    }

    let x, s;
    if (progress <= kf[0].at) {
      ({ x, s } = kf[0]);
    } else if (progress >= kf[kf.length - 1].at) {
      ({ x, s } = kf[kf.length - 1]);
    } else {
      for (let i = 0; i < kf.length - 1; i++) {
        const a = kf[i];
        const b = kf[i + 1];
        if (progress >= a.at && progress <= b.at) {
          let t = (progress - a.at) / (b.at - a.at);
          t = t * t * (3 - 2 * t); // smoothstep for eased travel
          x = a.x + (b.x - a.x) * t;
          s = a.s + (b.s - a.s) * t;
          break;
        }
      }
    }
    tgt.x = x;
    tgt.y = 0;
    tgt.s = s;

    // Horizontal spin: one smooth full turn from the hero down to the closer,
    // so it ends facing front again.
    const start = kf[0].at;
    const end = kf[kf.length - 1].at;
    const f = clamp((progress - start) / (end - start), 0, 1);
    tgt.yaw = SPIN * f;

    // Fade out as the (dark) footer rises into view so it never sits over it.
    if (footer) {
      const ft = footer.getBoundingClientRect().top; // distance from viewport top
      const start = vh * 0.9; // begin fading when the footer is near the bottom
      const end = vh * 0.35; // fully gone by the time it's a third up the screen
      tgt.o = clamp((ft - end) / (start - end), 0, 1);
    } else {
      tgt.o = 1;
    }
  }

  function frame() {
    computeTargets();

    const k = 0.09; // position & scale: a little inertia for a fluid glide
    cur.x += (tgt.x - cur.x) * k;
    cur.y += (tgt.y - cur.y) * k;
    cur.s += (tgt.s - cur.s) * k;
    cur.o += (tgt.o - cur.o) * 0.12;
    // rotation is scrubbed straight from scroll so the two turns always line up
    // (front in the hero, front again on the closer) with no lag.
    cur.yaw = tgt.yaw;

    model.style.setProperty("--mx", cur.x.toFixed(1) + "px");
    model.style.setProperty("--my", cur.y.toFixed(1) + "px");
    model.style.setProperty("--ms", cur.s.toFixed(3));
    model.style.setProperty("--mo", cur.o.toFixed(3));

    // Turn the model in 3D (keeps the baked framing via radius "auto").
    if ("cameraOrbit" in model) {
      model.cameraOrbit = cur.yaw.toFixed(2) + "deg 90deg auto";
    }

    // Keep ticking while anything is still moving or we scrolled recently.
    const settling =
      Math.abs(tgt.x - cur.x) +
      Math.abs(tgt.yaw - cur.yaw) +
      Math.abs(tgt.s - cur.s) * 100 +
      Math.abs(tgt.o - cur.o) * 100;
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
