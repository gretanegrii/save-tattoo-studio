/* Parete lavori — prototipo: inclinazione 3D del muro col mouse.
   I pezzi sono sollevati (translateZ) quindi "parallassano" rispetto allo
   sfondo quando il muro si inclina → sembra roba vera appesa. */
(function () {
  const stage = document.querySelector(".parete__stage");
  const wall = document.getElementById("wall");
  if (!stage || !wall) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce || !fine) return;

  const MAX = 5; // gradi di inclinazione
  let raf = 0;

  stage.addEventListener("mousemove", function (e) {
    const r = wall.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2); // -1..1
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      wall.style.transform =
        "rotateY(" +
        (dx * MAX).toFixed(2) +
        "deg) rotateX(" +
        (-dy * MAX).toFixed(2) +
        "deg)";
    });
  });

  stage.addEventListener("mouseleave", function () {
    cancelAnimationFrame(raf);
    wall.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
})();
