/**
 * Keeps --header-height in sync with the real, rendered height of the site
 * header, so the fixed toggle bar's `top` offset (css/grad-toggle.css) lines
 * up with it while the header is still in view — covers initial load, the
 * mobile menu opening (which changes header height), window resize, and
 * font-load reflow.
 */
export function initHeaderHeightVar() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const setVar = () => {
    document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
  };

  setVar();

  if ("ResizeObserver" in window) {
    new ResizeObserver(setVar).observe(header);
  } else {
    window.addEventListener("resize", setVar);
  }
}

/**
 * The header is static, not sticky, so as it scrolls out of view the toggle
 * bar (still fixed at --header-height) would otherwise leave a growing empty
 * gap above it where the header used to be. As soon as the page starts
 * scrolling at all, switch the bar to its flat 36px top offset instead — not
 * only once the header has fully scrolled away. Direct scroll listener
 * rather than rAF-throttled, matching ceremony-accordion.js — the position
 * check itself is cheap.
 */
export function initToggleBarScrollOffset() {
  const bar = document.querySelector(".grad-toggle-bar");
  if (!bar) return;

  const checkPosition = () => {
    bar.classList.toggle("header-scrolled-out", window.scrollY > 0);
  };

  checkPosition();
  window.addEventListener("scroll", checkPosition, { passive: true });
  window.addEventListener("resize", checkPosition);
}
