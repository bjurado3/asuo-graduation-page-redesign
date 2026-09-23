/**
 * Wires the "Congrats graduate!" toggle switch: label crossfade, confetti ->
 * cap icon crossfade (driven by CSS off .pill-outer.on), hover/focus lift and
 * header-gap shrink, cursor-following tooltip, and the balloon-drop/confetti
 * trail effects.
 */
import { startGraduationEffects, stopGraduationEffects } from "./graduation-effects.js?v=6";

export function initModeToggle() {
  const pill = document.getElementById("pill");
  const labelText = document.getElementById("labelText");
  const status = document.getElementById("srStatus");
  const tooltip = document.getElementById("tooltip");
  const bar = document.querySelector(".grad-toggle-bar");
  if (!pill || !labelText || !status || !tooltip || !bar) return;

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

  pill.addEventListener("click", () => setState(!on));
  pill.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
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

  // Header-to-toggle gap shrink (24px -> 16px): lives on .grad-toggle-bar,
  // not .pill-outer itself, so it can't be a plain CSS :hover — the rest of
  // the bar has pointer-events:none and only the pill is hoverable. Mirror
  // the pill's hover/focus state onto the bar instead.
  pill.addEventListener("mouseenter", () => bar.classList.add("is-hovered"));
  pill.addEventListener("mouseleave", () => bar.classList.remove("is-hovered"));
  pill.addEventListener("focus", () => bar.classList.add("is-hovered"));
  pill.addEventListener("blur", () => bar.classList.remove("is-hovered"));
}
