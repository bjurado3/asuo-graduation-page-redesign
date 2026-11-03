/**
 * FAQ behavior.
 *  - Filter tabs: "All" shows every topic group; a topic tab shows only that
 *    group. Buttons use aria-pressed; hidden groups are removed with [hidden].
 *  - Each group opens one question at a time (first question open by default);
 *    the answer panel on the right swaps to match.
 */
export function initFaq() {
  const root = document.getElementById("faq");
  if (!root) return;

  const filters = Array.from(root.querySelectorAll("[data-faq-filter]"));
  const groups = Array.from(root.querySelectorAll("[data-faq-group]"));

  const applyFilter = (key) => {
    filters.forEach((f) => {
      const on = f.dataset.faqFilter === key;
      f.classList.toggle("is-selected", on);
      f.setAttribute("aria-pressed", String(on));
    });
    groups.forEach((g) => {
      g.hidden = key !== "all" && g.dataset.faqGroup !== key;
    });
  };

  filters.forEach((f) => f.addEventListener("click", () => applyFilter(f.dataset.faqFilter)));

  groups.forEach((group) => {
    const items = Array.from(group.querySelectorAll(".faq-item"));
    const select = (item) => {
      items.forEach((it) => {
        const on = it === item;
        const btn = it.querySelector(".faq-q");
        it.classList.toggle("is-selected", on);
        btn.setAttribute("aria-expanded", String(on));
        document.getElementById(btn.getAttribute("aria-controls")).hidden = !on;
      });
    };
    items.forEach((item) => item.querySelector(".faq-q").addEventListener("click", () => select(item)));
  });
}
