const BALLOON_IMAGES = [
  { src: "assets/images/balloon-maroon.png", alt: "" },
  { src: "assets/images/balloon-gold.png", alt: "" },
];

const CONFETTI_COLORS = ["#ffc627", "#8c1d40"];
// 30-34 instances per drop, picked fresh each time the toggle turns on —
// varied like the reference spec asked for, instead of a fixed count.
const BALLOON_COUNT_MIN = 30;
const BALLOON_COUNT_MAX = 34;
// Every balloon moves at a constant speed from frame one (nothing ever sits
// static/"stuck") — the spread comes from varying how far above the hero
// each one starts, not from delaying when it starts moving.
// Tuned as "px per frame at 60fps" — see FRAME_MS below, which converts this
// into real px/second so speed stays the same on a 60Hz display and a 120Hz
// (e.g. MacBook Pro ProMotion) one instead of scaling with the refresh rate.
const BALLOON_SPEED_MIN = 3.4; // px/frame @ 60fps
const BALLOON_SPEED_MAX = 5.8; // px/frame @ 60fps
// requestAnimationFrame fires once per display refresh, not at a fixed rate —
// a 120Hz screen calls the loop twice as often as a 60Hz one. Every per-frame
// increment below (fall speed, confetti physics, particle lifespan) is
// multiplied by (actual ms since last frame) / FRAME_MS, so motion tracks
// real elapsed time instead of frame count and looks the same speed on any
// display.
const FRAME_MS = 1000 / 60;
// Extra start height above the hero, as a multiple of the hero's own height.
// Bumped up alongside the higher balloon count (see BALLOON_COUNT above) —
// the same stagger window compressed more balloons together as they fell,
// so more of them ended up bunched near the bottom of the screen at once
// instead of spread evenly through the whole "rain".
const START_HEIGHT_SPREAD_FACTOR = 1.8;
// Cleanup is driven by every balloon actually reaching the bottom (position),
// never a wall-clock cutoff — this hard cap only guards against a balloon
// that's stuck being dragged forever.
const SAFETY_MAX_MS = 20000;

// Confetti tuning (cursor-trail particle system — desktop only, mousemove-driven)
const CONFETTI_MOVE_SPEED_THRESHOLD = 4; // px between consecutive mousemove events
const CONFETTI_GRAVITY = 0.18;
const CONFETTI_MIN_LIFE = 40;
const CONFETTI_MAX_LIFE = 60;
const BALLOON_POP_CONFETTI_COUNT = 24;

let running = false;
let balloonLayer = null;
let confettiLayer = null;
let balloonTooltip = null;
let rafId = null;
let showStartTime = 0;
let lastFrameTime = 0;
let balloons = [];
let confettiParticles = [];
let lastMouse = null;

// Cursor-offset match the mode toggle's own tooltip (js/mode-toggle.js).
const BALLOON_TOOLTIP_OFFSET = 14;

function makeBalloonTooltip() {
  const el = document.createElement("div");
  el.className = "balloon-tooltip";
  el.setAttribute("aria-hidden", "true");
  // "burst-light-full" icon, supplied directly (assets/icons/burst-light-full.svg).
  el.innerHTML =
    '<svg class="balloon-tooltip__icon" viewBox="0 0 395 395" fill="none"><path d="M42.4008 42.4008C45.7336 39.068 50.918 38.5742 54.868 41.1664L162.999 113.254L188.242 45.9188C189.723 42.0305 193.365 39.5 197.5 39.5C201.635 39.5 205.277 42.0305 206.758 45.9188L233.05 116.031L283.289 99.3055C286.869 98.1328 290.757 99.0586 293.411 101.713C296.065 104.366 296.991 108.255 295.818 111.834L279.03 161.95L349.081 188.242C352.908 189.662 355.5 193.365 355.5 197.5C355.5 201.635 352.97 205.277 349.081 206.758L280.327 232.556L314.951 301.743C316.864 305.57 316.123 310.137 313.099 313.161C310.075 316.185 305.508 316.926 301.681 315.012L232.495 280.388L206.758 349.081C205.338 352.908 201.635 355.5 197.5 355.5C193.365 355.5 189.723 352.97 188.242 349.081L162.505 280.388L93.3187 314.951C89.4922 316.864 84.925 316.123 81.9008 313.099C78.8766 310.075 78.1359 305.508 80.0492 301.681L114.612 232.495L45.9188 206.758C42.0305 205.277 39.5 201.635 39.5 197.5C39.5 193.365 42.0305 189.723 45.9188 188.242L113.254 162.999L41.1664 54.868C38.5742 50.9797 39.068 45.7336 42.4008 42.4008ZM84.9867 84.9867L136.584 162.382C138.25 164.913 138.682 167.998 137.756 170.899C136.83 173.8 134.67 176.084 131.831 177.133L77.5187 197.5L131.831 217.867C134.423 218.855 136.522 220.891 137.571 223.484C138.62 226.076 138.435 229.038 137.201 231.507L110.97 284.03L163.493 257.799C166.023 256.565 168.924 256.441 171.516 257.429C174.109 258.416 176.145 260.515 177.133 263.169L197.5 317.543L217.867 263.169C218.855 260.577 220.891 258.478 223.484 257.429C226.076 256.38 229.038 256.565 231.507 257.799L284.03 284.03L257.799 231.507C256.565 228.977 256.441 226.076 257.429 223.484C258.416 220.891 260.515 218.855 263.169 217.867L317.543 197.5L263.169 177.133C258.17 175.281 255.577 169.788 257.244 164.789L270.76 124.302L230.273 137.818C225.212 139.484 219.78 136.892 217.929 131.893L197.562 77.5805L177.195 131.893C176.145 134.732 173.862 136.892 170.961 137.818C168.06 138.744 164.974 138.312 162.444 136.645L84.9867 84.9867Z" fill="#747474"/></svg>' +
    "<span>Pop balloons</span>";
  document.body.appendChild(el);
  return el;
}

function makeBalloon(bounds) {
  const el = document.createElement("img");
  const choice = BALLOON_IMAGES[Math.floor(Math.random() * BALLOON_IMAGES.length)];
  el.src = choice.src;
  el.alt = choice.alt;
  el.className = "balloon";
  el.setAttribute("aria-hidden", "true");
  el.draggable = false;

  const size = 140 + Math.random() * 120; // 140-260px wide
  el.style.width = `${size}px`;

  // Wide range of starting heights above the viewport is what actually
  // creates the staggered "rain" look — everyone moves immediately, but
  // balloons starting further up simply take longer to arrive and exit.
  const startY = -size - Math.random() * bounds.height * START_HEIGHT_SPREAD_FACTOR;
  const endY = bounds.height + size;

  const state = {
    el,
    x: Math.random() * (bounds.width - size),
    y: startY,
    endY,
    vy: BALLOON_SPEED_MIN + Math.random() * (BALLOON_SPEED_MAX - BALLOON_SPEED_MIN),
    swayAmplitude: 15 + Math.random() * 25,
    swayFrequency: 0.0004 + Math.random() * 0.0006,
    swayPhase: Math.random() * Math.PI * 2,
    baseX: 0,
    size,
    done: false,
  };
  state.baseX = state.x;

  el.addEventListener("click", () => {
    if (state.done) return;
    state.done = true;
    const rect = el.getBoundingClientRect();
    spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    el.remove();
    balloonTooltip?.classList.remove("visible");
  });

  // "Pop balloons" tooltip: only while the cursor is actually over this
  // balloon (never elsewhere) — mirrors the toggle pill's own cursor-follow
  // tooltip in js/mode-toggle.js.
  el.addEventListener("mouseenter", (e) => {
    if (!balloonTooltip) return;
    balloonTooltip.style.left = e.clientX + BALLOON_TOOLTIP_OFFSET + "px";
    balloonTooltip.style.top = e.clientY + BALLOON_TOOLTIP_OFFSET + "px";
    balloonTooltip.classList.add("visible");
  });
  el.addEventListener("mousemove", (e) => {
    if (!balloonTooltip) return;
    balloonTooltip.style.left = e.clientX + BALLOON_TOOLTIP_OFFSET + "px";
    balloonTooltip.style.top = e.clientY + BALLOON_TOOLTIP_OFFSET + "px";
  });
  el.addEventListener("mouseleave", () => {
    balloonTooltip?.classList.remove("visible");
  });

  applyBalloonTransform(state);
  return state;
}

function applyBalloonTransform(state) {
  state.el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
}

function updateBalloons(timestamp, elapsed, frameScale) {
  for (const state of balloons) {
    if (state.done) continue;

    state.y += state.vy * frameScale;
    // Sway already reads real elapsed time (timestamp) rather than a
    // per-frame increment, so it's refresh-rate-independent on its own.
    state.x = state.baseX + Math.sin(timestamp * state.swayFrequency + state.swayPhase) * state.swayAmplitude;
    applyBalloonTransform(state);

    if (state.y >= state.endY) {
      state.done = true;
    }
  }

  const allDone = balloons.every((state) => state.done);
  if (allDone || elapsed >= SAFETY_MAX_MS) {
    // Every balloon has actually fallen out of view or been popped (or, in
    // the rare edge case, the safety cap kicked in) — safe to remove now
    // without anything visibly popping out of existence.
    balloonLayer?.remove();
    balloonLayer = null;
    balloons = [];
    return true; // balloon phase finished
  }
  return false;
}

// ---------- Confetti (cursor trail + balloon-pop burst share this system) ----------

function createConfettiElement(x, y) {
  const isSquare = Math.random() < 0.5;
  const width = isSquare ? 8 : 5;
  const height = isSquare ? 8 : 12;

  const el = document.createElement("div");
  el.className = "confetti-piece";
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.borderRadius = isSquare ? "2px" : "1px";
  el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  confettiLayer.appendChild(el);
  return el;
}

function pushConfettiParticle(el, vx, vy) {
  const life = CONFETTI_MIN_LIFE + Math.random() * (CONFETTI_MAX_LIFE - CONFETTI_MIN_LIFE);
  confettiParticles.push({
    el,
    dx: 0,
    dy: 0,
    vx,
    vy,
    rotation: 0,
    rotVel: (Math.random() - 0.5) * 12, // ±6 deg/frame
    life,
    maxLife: life,
  });
}

function spawnConfettiParticle(x, y) {
  const el = createConfettiElement(x, y);
  pushConfettiParticle(el, (Math.random() - 0.5) * 3, -1 - Math.random() * 2); // vx ±1.5, vy -3 to -1
}

// Balloon pop (and, via the export below, the mode toggle's own switch-on
// pop): same particle look/physics as the cursor trail, but bursting outward
// in every direction from the pop point instead of drifting from a moving
// cursor. `count` defaults to the balloon-pop tuning; `speedMultiplier`
// scales how far particles travel, for callers that want a bigger-reaching
// burst without also having to touch the shared balloon-pop tuning.
function spawnConfettiBurst(x, y, count = BALLOON_POP_CONFETTI_COUNT, speedMultiplier = 1) {
  for (let i = 0; i < count; i++) {
    const el = createConfettiElement(x, y);
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 5) * speedMultiplier;
    pushConfettiParticle(el, Math.cos(angle) * speed, Math.sin(angle) * speed);
  }
}

function onMouseMove(event) {
  const { clientX: x, clientY: y } = event;
  if (lastMouse) {
    const dx = x - lastMouse.x;
    const dy = y - lastMouse.y;
    const speed = Math.hypot(dx, dy);
    if (speed > CONFETTI_MOVE_SPEED_THRESHOLD) {
      const count = Math.min(3, Math.max(1, Math.round(speed / 12)));
      for (let i = 0; i < count; i++) {
        spawnConfettiParticle(x, y);
      }
    }
  }
  lastMouse = { x, y };
}

function updateConfetti(frameScale) {
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.vy += CONFETTI_GRAVITY * frameScale;
    p.dx += p.vx * frameScale;
    p.dy += p.vy * frameScale;
    p.rotation += p.rotVel * frameScale;
    p.life -= frameScale;

    if (p.life <= 0) {
      p.el.remove();
      confettiParticles.splice(i, 1);
      continue;
    }

    p.el.style.opacity = String(p.life / p.maxLife);
    p.el.style.transform = `translate(${p.dx}px, ${p.dy}px) rotate(${p.rotation}deg)`;
  }
}

function mainLoop(timestamp) {
  // Capped so a tab that was backgrounded (rAF pauses, then resumes with a
  // huge gap) doesn't make everything leap forward in one jump — worst case
  // motion just briefly looks a bit slow instead.
  const frameScale = Math.min(5, (timestamp - lastFrameTime) / FRAME_MS);
  lastFrameTime = timestamp;

  if (balloons.length > 0) {
    updateBalloons(timestamp, timestamp - showStartTime, frameScale);
  }
  updateConfetti(frameScale);
  rafId = requestAnimationFrame(mainLoop);
}

// Mobile has no toggle and no cursor — balloons auto-drop on load instead,
// and the ambient cursor-confetti trail doesn't apply (popping still does).
export const MOBILE_BREAKPOINT_PX = 768;

function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
}

export function startGraduationEffects({ enableCursorTrail = true } = {}) {
  if (running) return;
  running = true;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bounds = { width: window.innerWidth, height: window.innerHeight };

  // Fixed and viewport-wide (see components.css) — balloons fall down the
  // whole page, not just the hero.
  balloonLayer = document.createElement("div");
  balloonLayer.className = "balloon-layer";
  balloonLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(balloonLayer);

  balloonTooltip = makeBalloonTooltip();

  balloons = [];
  const balloonCount = BALLOON_COUNT_MIN + Math.floor(Math.random() * (BALLOON_COUNT_MAX - BALLOON_COUNT_MIN + 1));
  for (let i = 0; i < balloonCount; i++) {
    const state = makeBalloon(bounds);
    balloonLayer.appendChild(state.el);
    balloons.push(state);
  }

  // Balloons stay poppable either way, so confettiLayer is needed regardless
  // of whether the ambient cursor trail is enabled.
  confettiLayer = document.createElement("div");
  confettiLayer.className = "confetti-layer";
  confettiLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(confettiLayer);
  confettiParticles = [];

  if (reducedMotion) {
    // No falling animation or cursor trail — drop each balloon once at a
    // random resting spot instead, so the toggle still visibly does something.
    for (const state of balloons) {
      state.y = Math.random() * (bounds.height - state.size);
      applyBalloonTransform(state);
    }
    return;
  }

  showStartTime = performance.now();
  lastFrameTime = showStartTime;

  // Touch devices have no persistent cursor to trail confetti behind, so the
  // ambient trail never attaches there regardless of what the caller asked
  // for — popping balloons by tapping still works either way.
  if (enableCursorTrail && !isTouchDevice()) {
    lastMouse = null;
    window.addEventListener("mousemove", onMouseMove);
  }

  rafId = requestAnimationFrame(mainLoop);
}

// Call once on page load; no-ops on anything wider than MOBILE_BREAKPOINT_PX.
export function autoStartGraduationEffectsOnMobile() {
  const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
  if (isMobile) {
    startGraduationEffects({ enableCursorTrail: false });
  }
}

// For the mode toggle's own switch-on pop (see js/mode-toggle.js) — a
// smaller burst than a balloon pop, from a point the caller supplies (the
// knob's own position) rather than an event target. No-ops unless the main
// animation loop is actually running (checking `rafId`, not just `running`
// — reduced motion sets `running` true but returns *before* starting that
// loop, so spawned particles would just sit there forever unanimated).
export function spawnTogglePop(x, y) {
  if (!confettiLayer || !rafId) return;
  spawnConfettiBurst(x, y, 32, 1.5);
}

export function stopGraduationEffects() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  window.removeEventListener("mousemove", onMouseMove);
  balloonLayer?.remove();
  confettiLayer?.remove();
  balloonTooltip?.remove();
  balloonLayer = null;
  confettiLayer = null;
  balloonTooltip = null;
  balloons = [];
  confettiParticles = [];
  lastMouse = null;
}
