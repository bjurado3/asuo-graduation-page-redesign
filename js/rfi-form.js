/**
 * RFI form (step 1 of 2): Continue stays disabled until every required field
 * (Program and the military question) has an answer. Figma doesn't design the
 * next step or a submission target, so submitting only validates for now.
 */
export function initRfiForm() {
  const form = document.getElementById("rfiForm");
  const button = document.getElementById("rfiContinue");
  if (!form || !button) return;

  const update = () => {
    button.disabled = !form.checkValidity();
  };

  form.addEventListener("input", update);
  form.addEventListener("change", update);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) return;
    // TODO: continue to step 2 / post to the request-info service.
  });

  update();
}
