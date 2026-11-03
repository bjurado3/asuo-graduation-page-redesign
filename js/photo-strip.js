/**
 * "This could be you" cards. Hover and click behavior follow
 * asuonline.asu.edu/students/community:
 *
 * Hover (mouse): the card jumps to the front (z-index 100), scales to 1.1 and
 * settles on a new small random tilt, over the CSS 0.5s ease-in-out. A maroon
 * name pill (.photo-tag) follows the cursor, 20px right and down of it, fading
 * in over 0.3s. Keyboard focus gets the same card treatment with the pill
 * under the card.
 *
 * Click / Enter / Space: opens the graduate in a modal over a dimmed, blurred
 * page. The modal uses the site's 0.25s drop-in, locks page scroll, traps Tab,
 * closes with the close button, Esc or a click on the backdrop, and returns
 * focus to the card that opened it.
 */
export function initPhotoStrip() {
  const items = Array.from(document.querySelectorAll(".photo-strip__item"));
  const tag = document.getElementById("photoTag");
  if (!items.length) return;

  /* ---------- Hover ---------- */
  const randomTilt = () => (Math.random() * 6 - 3).toFixed(2); // new tilt within +/-3deg

  const raise = (item) => {
    item.style.setProperty("--rot", `${randomTilt()}deg`);
    item.style.setProperty("--scale", "1.1");
    item.style.zIndex = "100";
  };

  const lower = (item) => {
    item.style.removeProperty("--rot");
    item.style.removeProperty("--scale");
    item.style.zIndex = "";
  };

  const showTag = (name) => {
    if (!tag) return;
    tag.textContent = name;
    tag.classList.add("is-visible");
  };

  const hideTag = () => tag?.classList.remove("is-visible");

  const moveTag = (x, y) => {
    if (!tag) return;
    let left = x + 20;
    if (left + tag.offsetWidth > window.innerWidth - 8) left = x - tag.offsetWidth - 20;
    tag.style.left = `${left}px`;
    tag.style.top = `${y + 20}px`;
  };

  items.forEach((item) => {
    item.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      raise(item);
      showTag(item.dataset.name || "");
      moveTag(e.clientX, e.clientY);
    });
    item.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") moveTag(e.clientX, e.clientY);
    });
    item.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      lower(item);
      hideTag();
    });

    item.addEventListener("focus", () => {
      if (!item.matches(":focus-visible")) return;
      raise(item);
      showTag(item.dataset.name || "");
      const r = item.getBoundingClientRect();
      moveTag(r.left + r.width / 2 - 40, r.bottom - 36);
    });
    item.addEventListener("blur", () => {
      lower(item);
      hideTag();
    });

    item.addEventListener("click", () => openModal(item));
  });

  window.addEventListener("scroll", hideTag, { passive: true });

  /* ---------- Modal ---------- */
  let backdrop = null;
  let lastTrigger = null;

  const buildModal = () => {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
        <div class="modal-content">
          <div class="modal-media"><img alt="" /></div>
          <div class="modal-info">
            <h2 class="modal-title" id="modalTitle"></h2>
            <p class="modal-program" hidden></p>
            <div class="modal-divider" hidden></div>
            <p class="modal-quote" hidden></p>
            <a class="modal-link" target="_blank" rel="noopener" hidden>See full video <span class="visually-hidden">(opens in a new tab)</span></a>
          </div>
        </div>
        <button class="modal-close-btn" type="button" aria-label="Close modal">
          <img src="assets/icons/modal-close.svg" alt="" width="24" height="24" />
        </button>
      </div>`;
    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    backdrop.querySelector(".modal-close-btn").addEventListener("click", closeModal);
    backdrop.addEventListener("keydown", onModalKey);
  };

  const onModalKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== "Tab") return;
    // Keep Tab inside the dialog.
    const focusable = Array.from(
      backdrop.querySelectorAll('a[href]:not([hidden]), button:not([disabled]), [tabindex="0"]')
    ).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const container = backdrop.querySelector(".modal-container");
    if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const fill = (item) => {
    const img = item.querySelector("img");
    const media = backdrop.querySelector(".modal-media img");
    media.src = img.currentSrc || img.src;
    media.alt = img.alt || "";

    // Reuse the card's own crop of the photo (so Gary stays framed as on the card)
    // as percentages of the modal's photo box.
    const cs = getComputedStyle(img);
    const w = item.offsetWidth;
    const h = item.offsetHeight;
    const pct = (value, base) => `${(parseFloat(value) / base) * 100}%`;
    Object.assign(media.style, {
      position: "absolute",
      maxWidth: "none",
      left: pct(cs.left, w),
      top: pct(cs.top, h),
      width: pct(cs.width, w),
      height: pct(cs.height, h),
      transform: item.matches(":nth-child(2)") ? "translate(-50%, -50%)" : "none",
      objectPosition: "50% 50%",
    });

    backdrop.querySelector(".modal-title").textContent = item.dataset.name || "";

    const program = backdrop.querySelector(".modal-program");
    const divider = backdrop.querySelector(".modal-divider");
    const quote = backdrop.querySelector(".modal-quote");
    const link = backdrop.querySelector(".modal-link");

    program.textContent = item.dataset.program || "";
    program.hidden = !item.dataset.program;
    quote.textContent = item.dataset.quote || "";
    quote.hidden = !item.dataset.quote;
    divider.hidden = !(item.dataset.program || item.dataset.quote);
    link.hidden = !item.dataset.videoUrl;
    if (item.dataset.videoUrl) link.href = item.dataset.videoUrl;
  };

  function openModal(item) {
    if (!backdrop) buildModal();
    lastTrigger = item;
    fill(item);
    hideTag();

    // Lock page scroll without the layout jumping when the scrollbar disappears.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    backdrop.classList.remove("is-closing");
    backdrop.hidden = false;
    // Restart the CSS entrance animations each time the modal opens.
    const container = backdrop.querySelector(".modal-container");
    container.style.animation = "none";
    backdrop.style.animation = "none";
    void container.offsetWidth;
    container.style.animation = "";
    backdrop.style.animation = "";
    container.focus();
  }

  function closeModal() {
    if (!backdrop || backdrop.hidden) return;
    const done = () => {
      backdrop.hidden = true;
      backdrop.classList.remove("is-closing");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      lastTrigger?.focus({ preventScroll: true });
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      done();
    } else {
      backdrop.classList.add("is-closing");
      setTimeout(done, 200);
    }
  }
}
