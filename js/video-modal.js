/**
 * "Watch video" buttons ([data-video-id]) open the YouTube video in a modal over
 * the same dimmed, blurred backdrop as the graduate modals. The iframe is only
 * created on open (and removed on close, which stops playback). Esc, the close
 * button or a click on the backdrop closes it; Tab is trapped; focus returns to
 * the button that opened it.
 */
export function initVideoModal() {
  const triggers = document.querySelectorAll("[data-video-id]");
  if (!triggers.length) return;

  let backdrop = null;
  let trigger = null;

  const build = () => {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <div class="video-modal" role="dialog" aria-modal="true" aria-label="Video" tabindex="-1">
        <button class="video-modal__close" type="button" aria-label="Close video">
          <img src="assets/icons/modal-close.svg" alt="" width="20" height="20" />
        </button>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    backdrop.querySelector(".video-modal__close").addEventListener("click", close);
    backdrop.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        // The player is cross-origin, so keep focus on the close button.
        e.preventDefault();
        backdrop.querySelector(".video-modal__close").focus();
      }
    });
  };

  const open = (btn) => {
    if (!backdrop) build();
    trigger = btn;
    const box = backdrop.querySelector(".video-modal");
    box.setAttribute("aria-label", btn.dataset.videoTitle || "Video");
    box.querySelector("iframe")?.remove();
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.videoId}?autoplay=1&rel=0`;
    iframe.title = btn.dataset.videoTitle || "Video";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    box.appendChild(iframe);

    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    backdrop.classList.remove("is-closing");
    backdrop.hidden = false;
    box.focus();
  };

  function close() {
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    backdrop.querySelector("iframe")?.remove();
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    trigger?.focus({ preventScroll: true });
  }

  triggers.forEach((btn) => btn.addEventListener("click", () => open(btn)));
}
