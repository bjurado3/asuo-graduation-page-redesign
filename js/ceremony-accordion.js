/**
 * "Picking your ceremonies" accordion.
 * Starts with every row open. A sentinel sitting at the top of the (non-
 * sticky) .ceremony-panel wrapper — i.e. exactly where the sticky
 * .ceremony-accordion box first engages — flips the whole group to "only the
 * last row open" once scrolled past that point, and back to "all open" when
 * scrolled back above it. Rows stay individually clickable at any time.
 *
 * Driven by a scroll/resize listener rather than an IntersectionObserver:
 * this needs the sentinel's *continuous* position relative to a moving
 * threshold (--header-height changes on resize), not just a one-time
 * visibility crossing — and a large scroll jump (e.g. a "back to top" link,
 * or a fast flick) can skip clean over the crossing an IntersectionObserver
 * would need to see, leaving stale state. Runs the check directly on every
 * scroll event rather than throttling via requestAnimationFrame — rAF is
 * paused while the tab/pane isn't visible, and a throttle gated on "wait for
 * the next rAF tick" can get permanently stuck (never resets) if that tick
 * never comes. The check itself is cheap (one getBoundingClientRect + a
 * handful of class toggles), so it doesn't need throttling anyway.
 */
export function initCeremonyAccordion() {
  const accordion = document.querySelector("[data-ceremony-accordion]");
  const sentinel = document.querySelector("[data-ceremony-sentinel]");
  if (!accordion || !sentinel) return;

  const items = Array.from(accordion.querySelectorAll("[data-ceremony-item]"));

  function setOpen(openIndexes) {
    items.forEach((item, i) => {
      const isOpen = openIndexes.includes(i);
      item.classList.toggle("is-open", isOpen);
      item.querySelector(".ceremony-item__trigger").setAttribute("aria-expanded", String(isOpen));
    });
  }

  items.forEach((item, i) => {
    item.querySelector(".ceremony-item__trigger").addEventListener("click", () => {
      setOpen(item.classList.contains("is-open") ? [] : [i]);
    });
  });

  // Matches .ceremony-accordion's own `top` (css/sections.css) — the point
  // at which it engages its sticky offset, not the raw viewport top.
  function engagementOffset() {
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
    return headerHeight + 96;
  }

  function checkPosition() {
    const scrolledPast = sentinel.getBoundingClientRect().top < engagementOffset();
    setOpen(scrolledPast ? [items.length - 1] : items.map((_, i) => i));
  }

  window.addEventListener("scroll", checkPosition, { passive: true });
  window.addEventListener("resize", checkPosition);
  checkPosition();
}
