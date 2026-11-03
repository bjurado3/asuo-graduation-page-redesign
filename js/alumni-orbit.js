/**
 * Alumni photo orbit (GSAP).
 *
 * The cards sit on a very large circle whose edges run past both sides of the
 * screen, which gives the Figma fan its curved path. Behavior:
 *   - Hovering the card area and scrolling horizontally (trackpad swipe,
 *     horizontal wheel, or Shift + wheel) rotates the ring in either direction.
 *     Dragging with a mouse or finger does the same. Vertical scrolling is left
 *     alone: it scrolls the page and never moves the cards.
 *   - Moving the ring quickly flings each card off its orbit (along the radius,
 *     by a different amount per card); they settle back as the motion slows.
 *   - The arrow buttons nudge the ring by one card with an eased tween.
 *   - Cards that pass the edge of the arc wrap to the other end off-screen, so
 *     the ring loops forever with only eight cards.
 * At rest (nudge 0) the cards are exactly at their Figma positions.
 * With prefers-reduced-motion the ring still follows your input, but with no
 * easing or drift. Requires window.gsap (loaded from cdnjs in index.html);
 * without it the cards simply stay at their static Figma positions.
 */
export function initAlumniOrbit() {
  const gsap = window.gsap;
  const orbit = document.getElementById("alumniOrbit");
  if (!gsap || !orbit) return;

  const section = orbit.closest(".alumni");
  const cards = Array.from(orbit.querySelectorAll(".alumni-card"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const R = 1250; // orbit radius (px), fitted to the Figma card centers
  const Y0 = 150; // card-center height at the top of the circle
  const CX = 873.7; // Figma frame center x
  const HALF = 55; // cards wrap at +/-55deg (off-screen)
  const SPAN = HALF * 2;
  const STEP = 13.5; // average angular gap between cards
  const DEG_PER_PX = 0.05; // ring rotation per px of horizontal input
  const DRIFT_PX = 6; // px of orbit drift per unit of ring speed (max)
  const BAND_TOP = 300; // the hoverable card band starts this far below the section top

  const rad = (d) => (d * Math.PI) / 180;
  const wrap = (a) => ((((a + HALF) % SPAN) + SPAN) % SPAN) - HALF;

  // Per-card setup: base angle, a small fixed correction so that at rest the
  // card lands exactly on its Figma center, and a fixed drift personality.
  const items = cards.map((el, i) => {
    const base = parseFloat(el.dataset.angle);
    let rx = 0;
    let ry = 0;
    if (el.dataset.cx) {
      rx = parseFloat(el.dataset.cx) - CX - R * Math.sin(rad(base));
      ry = parseFloat(el.dataset.cy) - (Y0 + R * (1 - Math.cos(rad(base))));
    }
    const k = Math.sin((i + 1) * 12.9898) * 0.5 + (i % 2 ? 0.5 : -0.5); // -1..1, varies by card
    return { el, base, rx, ry, k };
  });

  const state = { nudge: 0, v: 0 };
  let lastNudge = 0;
  let active = true;

  const render = () => {
    items.forEach((it) => {
      const a = wrap(it.base + state.nudge);
      const drift = reduced ? 0 : state.v * DRIFT_PX * it.k;
      const s = Math.sin(rad(a));
      const c = Math.cos(rad(a));
      const x = R * s + it.rx + s * drift;
      const y = Y0 + R * (1 - c) + it.ry - c * drift;
      const fade = Math.min(1, Math.max(0, (HALF - Math.abs(a)) / 4));
      gsap.set(it.el, {
        x,
        y,
        xPercent: -50,
        yPercent: -50,
        rotation: a + drift * 0.06,
        opacity: fade,
      });
    });
  };

  gsap.ticker.add(() => {
    if (!active) return;
    // Ring speed in deg per frame, clamped to -1..1 and smoothed; decays to 0 when idle.
    const d = state.nudge - lastNudge;
    lastNudge = state.nudge;
    const target = reduced ? 0 : Math.max(-1, Math.min(1, d / 1.5));
    state.v += (target - state.v) * 0.12;
    if (Math.abs(state.v) < 0.001) state.v = 0;
    render();
  });

  // Skip the per-frame work while the section is far off screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => {
        active = e.isIntersecting;
        if (active) render();
      },
      { rootMargin: "200px 0px" }
    ).observe(section);
  }

  // Move the ring by `deg` degrees, smoothed with GSAP.
  let target = 0;
  const moveBy = (deg, { instant = false, duration = 0.6 } = {}) => {
    target += deg;
    gsap.to(state, {
      nudge: target,
      duration: reduced || instant ? 0 : duration,
      ease: "power3.out",
      overwrite: true,
      onUpdate: render,
    });
  };

  const overBand = (clientY) => {
    const r = section.getBoundingClientRect();
    return clientY >= r.top + BAND_TOP && clientY <= r.bottom;
  };

  // Horizontal wheel / trackpad swipe (or Shift + wheel) while hovering the cards.
  section.addEventListener(
    "wheel",
    (e) => {
      if (!overBand(e.clientY)) return;
      let dx = e.deltaX;
      // Shift + vertical wheel is the usual way for a mouse to scroll sideways.
      if (e.shiftKey && Math.abs(e.deltaY) > Math.abs(dx)) dx = e.deltaY;
      // Mostly vertical: let the page scroll and leave the cards alone.
      if (Math.abs(dx) <= Math.abs(e.deltaY) && !e.shiftKey) return;
      if (dx === 0) return;
      e.preventDefault();
      moveBy(-dx * DEG_PER_PX, { duration: 0.5 });
    },
    { passive: false }
  );

  // Click-and-drag (mouse) or swipe (touch) over the cards.
  let dragging = false;
  let lastX = 0;
  section.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !overBand(e.clientY)) return;
    if (e.target.closest("button, a")) return;
    dragging = true;
    lastX = e.clientX;
    section.classList.add("is-dragging");
    section.setPointerCapture?.(e.pointerId);
  });
  section.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moveBy(dx * DEG_PER_PX, { duration: 0.25 });
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    section.classList.remove("is-dragging");
    section.releasePointerCapture?.(e.pointerId);
  };
  section.addEventListener("pointerup", endDrag);
  section.addEventListener("pointercancel", endDrag);
  // Keep the browser from starting a native image drag on a card photo.
  orbit.addEventListener("dragstart", (e) => e.preventDefault());

  document.getElementById("alumniPrev")?.addEventListener("click", () => moveBy(STEP, { duration: 0.9 }));
  document.getElementById("alumniNext")?.addEventListener("click", () => moveBy(-STEP, { duration: 0.9 }));

  render();
}
