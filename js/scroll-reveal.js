/**
 * Slide-in cards, modelled on asuonline.asu.edu's `slide-to-left` /
 * `slide-to-right` component: the card waits off to one side (clipped by its
 * overflow:hidden panel) and slides to rest — `transform 0.5s` — the first
 * time its panel scrolls into view. One-shot: it does not hide again.
 *
 * The panel photo ([data-zoom]) does ASU Online's companion effect: it starts
 * at scale(1.1) and settles to scale(1) (CSS transition) once the panel is
 * about half on screen. Independent of the card slide, which is left as is.
 *
 * Cards opt in with data-reveal="left" | "right" (the side they enter from).
 * The hidden class is added by JS, so without JS (or with reduced motion)
 * the cards simply render in place.
 */
export function initScrollReveal() {
  initPhotoZoom();

  const cards = document.querySelectorAll("[data-reveal]");
  if (!cards.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target.querySelector("[data-reveal]");
        card.classList.remove("is-hidden-left", "is-hidden-right");
        observer.unobserve(entry.target);
      });
    },
    // Fire once roughly a third of the panel is on screen.
    { threshold: 0.35 }
  );

  cards.forEach((card) => {
    // Set the hidden state instantly (no slide-out on load), then restore the
    // CSS transition so the reveal itself animates.
    card.style.transition = "none";
    card.classList.add(`is-hidden-${card.dataset.reveal}`);
    void card.offsetWidth;
    card.style.transition = "";
    observer.observe(card.parentElement);
  });
}

function initPhotoZoom() {
  const media = document.querySelectorAll("[data-zoom]");
  if (!media.length) return;

  if (!("IntersectionObserver" in window)) {
    media.forEach((m) => m.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelector("[data-zoom]").classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  media.forEach((m) => observer.observe(m.parentElement));
}
