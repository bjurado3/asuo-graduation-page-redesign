/**
 * Wires the "Congrats graduate!" toggle switch: label crossfade, confetti ->
 * cap icon crossfade (driven by CSS off .pill-outer.on), hover/focus drop
 * shadow, cursor-following tooltip, and the balloon-drop/confetti trail
 * effects.
 */
import { startGraduationEffects, stopGraduationEffects, spawnTogglePop } from "./graduation-effects.js?v=9";

export function initModeToggle() {
  const pill = document.getElementById("pill");
  const labelText = document.getElementById("labelText");
  const status = document.getElementById("srStatus");
  const tooltip = document.getElementById("tooltip");
  const knob = document.querySelector(".pill-knob");
  if (!pill || !labelText || !status || !tooltip || !knob) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const OFF_TEXT = "Feeling festive?";
  const ON_TEXT = "Congrats graduate!";

  // Pill width is a fixed 253px set in CSS (.pill-outer) per the page's grid,
  // not measured from the label text — it no longer resizes as the label
  // crossfades between the two states.
  let on = false;

  function setState(newOn) {
    on = newOn;
    pill.setAttribute("aria-checked", on);
    pill.classList.add("animating");
    pill.classList.toggle("on", on);
    if (!on) tooltip.classList.remove("visible");

    if (on) {
      startGraduationEffects();
      // A short delay rather than firing at the click itself, so the
      // confetti reads as popping out from the knob mid-slide (.pill-knob's
      // `left` transition is 600ms total — see css/grad-toggle.css) instead
      // of from its starting position. Shorter than the full 600ms so it
      // doesn't feel laggy relative to the click.
      const popDelay = prefersReduced ? 0 : 200;
      setTimeout(() => {
        const rect = knob.getBoundingClientRect();
        spawnTogglePop(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }, popDelay);
    } else {
      stopGraduationEffects();
    }

    // Crossfade the label instead of swapping it instantly: fade out, swap
    // the text once it's invisible, fade back in — timed to land within the
    // pill's own fill/glow sweep (kept in sync with grad-toggle.css) rather
    // than dragging the whole transition out.
    const FADE_OUT = prefersReduced ? 0 : 180;
    labelText.style.opacity = "0";
    setTimeout(() => {
      labelText.textContent = on ? ON_TEXT : OFF_TEXT;
      status.textContent = on ? "Graduation mode is on" : "Graduation mode is off";
      labelText.style.opacity = "1";
    }, FADE_OUT);

    const duration = prefersReduced ? 0 : 600;
    setTimeout(() => {
      pill.classList.remove("animating");
    }, duration);
  }

  // "Feeling festive?" nudge: draw the eye to the toggle on load with a
  // single knob bounce (repeated once more if the user still hasn't
  // touched it), then stop for good — never a looping/repeating animation.
  let hasInteracted = false;
  let nudgeCount = 0;
  const MAX_NUDGES = 2;
  const NUDGE_DURATION = 600;

  function nudgeKnob() {
    if (prefersReduced || hasInteracted || nudgeCount >= MAX_NUDGES) return;
    nudgeCount++;
    // Restart the animation even if a previous nudge's classes never got
    // cleaned up (belt-and-suspenders, since a hidden/backgrounded tab can
    // defer or drop the setTimeout cleanup below).
    knob.classList.remove("nudge");
    pill.classList.remove("nudge-ring");
    // Force a reflow so re-adding the classes re-triggers the CSS animations
    // instead of being a no-op mutation.
    void knob.offsetWidth;
    knob.classList.add("nudge");
    pill.classList.add("nudge-ring");
    setTimeout(() => {
      knob.classList.remove("nudge");
      pill.classList.remove("nudge-ring");
    }, NUDGE_DURATION + 50);
  }

  if (!prefersReduced) {
    setTimeout(nudgeKnob, 1200); // once content has settled
    setTimeout(nudgeKnob, 5000); // one repeat if still untouched
  }

  pill.addEventListener("click", () => {
    hasInteracted = true;
    setState(!on);
  });
  pill.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      hasInteracted = true;
      setState(!on);
    }
  });

  // tooltip: follows the cursor, offset to its bottom-right, only while ON
  const CURSOR_OFFSET = 14;

  pill.addEventListener("mousemove", (e) => {
    if (!on) return;
    tooltip.style.left = e.clientX + CURSOR_OFFSET + "px";
    tooltip.style.top = e.clientY + CURSOR_OFFSET + "px";
    tooltip.classList.add("visible");
  });
  pill.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));

  // keyboard users have no cursor to follow — fall back to anchoring
  // near the pill's own bottom-right corner instead
  pill.addEventListener("focus", () => {
    if (!on) return;
    const rect = pill.getBoundingClientRect();
    tooltip.style.left = rect.right - 20 + "px";
    tooltip.style.top = rect.bottom + 8 + "px";
    tooltip.classList.add("visible");
  });
  pill.addEventListener("blur", () => tooltip.classList.remove("visible"));
}
