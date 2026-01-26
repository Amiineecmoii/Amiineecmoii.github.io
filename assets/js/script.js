(() => {
  const input = document.getElementById("searchInput");
  const grid = document.getElementById("postsGrid");
  if (!input || !grid) return;

  const cards = Array.from(grid.querySelectorAll(".post-card"));

  function normalize(s) {
    return (s || "").toLowerCase().trim();
  }

  input.addEventListener("input", () => {
    const q = normalize(input.value);

    cards.forEach(card => {
      const title = normalize(card.querySelector("h3")?.textContent);
      const desc  = normalize(card.querySelector("p")?.textContent);
      const tags  = normalize(card.getAttribute("data-tags"));
      const hay   = `${title} ${desc} ${tags}`;

      card.style.display = hay.includes(q) ? "" : "none";
    });
  });
})();
