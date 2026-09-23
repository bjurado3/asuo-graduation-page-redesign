/**
 * The name tag above each photo reveals on hover/focus via CSS (:hover, :focus-visible).
 * This adds a tap-to-toggle for touch devices, which have neither hover nor a
 * separate focus-visible affordance.
 */
export function initPhotoStrip() {
  const items = document.querySelectorAll(".photo-strip__item");

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const isActive = item.classList.contains("is-active");
      items.forEach((other) => other.classList.remove("is-active"));
      if (!isActive) item.classList.add("is-active");
    });
  });
}
