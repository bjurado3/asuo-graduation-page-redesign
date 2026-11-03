/**
 * Tassel chat animation controls.
 *
 * The animation itself is pure CSS (8.5s loop, keyframes from Figma). This
 * wires the pause/play button: it toggles .is-paused on the stage, which sets
 * animation-play-state: paused on every animated element, and keeps the
 * button's pressed state + accessible name in sync. With prefers-reduced-motion
 * the loop starts paused on a frame where the whole conversation is visible.
 */
export function initTasselChat() {
  const stage = document.getElementById("tasselStage");
  const button = document.getElementById("tasselPause");
  if (!stage || !button) return;

  const setPaused = (paused) => {
    stage.classList.toggle("is-paused", paused);
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stage.classList.add("is-static");
    setPaused(true);
  }

  button.addEventListener("click", () => {
    const willPlay = stage.classList.contains("is-paused");
    // Leaving the reduced-motion static frame: start the loop from the top.
    if (willPlay) stage.classList.remove("is-static");
    setPaused(!willPlay);
  });
}
