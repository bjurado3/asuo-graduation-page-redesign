/**
 * Keeps --header-height in sync with the real, rendered height of the sticky
 * site header, so the sticky toggle bar's `top` offset (css/grad-toggle.css)
 * never drifts out of sync — covers initial load, the mobile menu opening
 * (which changes header height), window resize, and font-load reflow.
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
