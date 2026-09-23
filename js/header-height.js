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
 * bar (previously fixed at a flat --header-height, or snapped to a flat
 * 36px the instant any scrolling started) would otherwise either leave a
 * growing empty gap above it, or — snapping too early — overlap and get
 * clipped by the header while it's still substantially on screen. Instead,
 * track the header's real, live bottom edge on every scroll tick and keep
 * the bar's top at least HEADER_CLEARANCE below it (the bar's own 20px
 * padding-top adds the rest, so the pill itself never sits closer than
 * ~32px to the header), only settling at the flat MIN_TOP floor once the
 * header has scrolled far enough away that the clearance rule would place
 * it higher than that anyway. Direct scroll listener rather than
 * rAF-throttled, matching ceremony-accordion.js — the position check itself
 * is cheap.
 */
export function initToggleBarScrollOffset() {
  const header = document.querySelector(".site-header");
  const bar = document.querySelector(".grad-toggle-bar");
  if (!header || !bar) return;

  const MIN_TOP = 36;
  const HEADER_CLEARANCE = 12; // + the bar's own 20px padding-top = 32px to the pill

  const updatePosition = () => {
    const headerBottom = header.getBoundingClientRect().bottom;
    bar.style.top = `${Math.max(MIN_TOP, headerBottom + HEADER_CLEARANCE)}px`;
  };

  updatePosition();
  window.addEventListener("scroll", updatePosition, { passive: true });
  window.addEventListener("resize", updatePosition);
}
