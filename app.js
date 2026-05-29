const notes = document.querySelector("#notes");
const key = `frus-notes:${document.body.dataset.docId}`;
if (notes) {
  notes.value = localStorage.getItem(key) || "";
  notes.addEventListener("input", () => localStorage.setItem(key, notes.value));
}
for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    const old = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = old), 1200);
  });
}
