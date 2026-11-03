/**
 * "Ready to graduate?" tab switcher (Applying for graduation / Going to
 * graduation). Standard WAI-ARIA tabs: click to select, Left/Right/Home/End to
 * move between tabs with a roving tabindex.
 */
export function initReadyTabs() {
  const tabs = Array.from(document.querySelectorAll(".ready__tab"));
  if (!tabs.length) return;

  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-selected", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const last = tabs.length - 1;
      const target = {
        ArrowRight: tabs[i === last ? 0 : i + 1],
        ArrowLeft: tabs[i === 0 ? last : i - 1],
        Home: tabs[0],
        End: tabs[last],
      }[e.key];
      if (target) {
        e.preventDefault();
        select(target, true);
      }
    });
  });
}
