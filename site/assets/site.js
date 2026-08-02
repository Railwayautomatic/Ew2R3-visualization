(() => {
  const menu = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-nav]");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });
  }

  window.ewTrack = window.ewTrack || ((name, params = {}) => {
    const safe = { ...params, page_path: location.pathname };
    window.dispatchEvent(new CustomEvent("ew2r3:event", { detail: { name, params: safe } }));
  });

  document.querySelectorAll("[data-event]").forEach((el) => {
    el.addEventListener("click", () => window.ewTrack(el.dataset.event, {
      destination: el.getAttribute("href") || "",
    }));
  });

})();
