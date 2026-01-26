// Small UX helpers (menu + terminal typing vibe + year)
(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuBtn && mobileMenu) {
    const toggle = () => {
      const open = mobileMenu.style.display === "flex";
      mobileMenu.style.display = open ? "none" : "flex";
      menuBtn.setAttribute("aria-expanded", open ? "false" : "true");
      mobileMenu.setAttribute("aria-hidden", open ? "true" : "false");
    };

    menuBtn.addEventListener("click", toggle);
    mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      mobileMenu.style.display = "none";
      menuBtn.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    }));

    document.addEventListener("click", (e) => {
      const isOpen = mobileMenu.style.display === "flex";
      if (!isOpen) return;
      const clickedInside = mobileMenu.contains(e.target) || menuBtn.contains(e.target);
      if (!clickedInside) {
        mobileMenu.style.display = "none";
        menuBtn.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
      }
    });
  }

  // Optional: subtle "typing" effect (safe + lightweight)
  const terminalBody = document.getElementById("terminalBody");
  if (terminalBody) {
    const lines = Array.from(terminalBody.querySelectorAll(".line"));
    lines.forEach(l => (l.style.opacity = "0"));
    let i = 0;

    const reveal = () => {
      if (i >= lines.length) return;
      lines[i].style.opacity = "1";
      lines[i].style.transform = "translateY(0)";
      i++;
      setTimeout(reveal, 140 + Math.random() * 120);
    };
    reveal();
  }
})();
