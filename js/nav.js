export function initNav() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const menuToggle = header.querySelector(".nav-menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const dropdowns = header.querySelectorAll(".nav-dropdown");
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".nav-link");
    const panel = dropdown.querySelector(".nav-dropdown__panel");
    if (!trigger || !panel) return;

    const close = () => {
      trigger.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    };

    const open = () => {
      dropdowns.forEach((other) => {
        if (other !== dropdown) {
          other.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
          const otherPanel = other.querySelector(".nav-dropdown__panel");
          if (otherPanel) otherPanel.hidden = true;
        }
      });
      trigger.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    };

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });

    dropdown.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        trigger.focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        dropdown.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
        const panel = dropdown.querySelector(".nav-dropdown__panel");
        if (panel) panel.hidden = true;
      }
    });
  });
}
