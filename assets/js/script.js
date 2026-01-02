// Amiineecmoii — lightweight effects (typing + matrix + mobile menu)
(() => {
  const $ = (q) => document.querySelector(q);

  // Footer year
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Mobile drawer
  const menuBtn = $("#menuBtn");
  const drawer = $("#drawer");
  const closeDrawer = $("#closeDrawer");

  const setDrawer = (open) => {
    if (!drawer || !menuBtn) return;
    drawer.style.display = open ? "block" : "none";
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) drawer.addEventListener("click", onBackdrop, { once: true });
  };

  const onBackdrop = (e) => {
    if (e.target === drawer) setDrawer(false);
  };

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => setDrawer(true));
  }
  if (closeDrawer) closeDrawer.addEventListener("click", () => setDrawer(false));
  drawer?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setDrawer(false)));

  // Typing effect
  const typingEl = $("#typing");
  const lines = [
    "learn · analyze · break.",
    "malware breaker — unpack, decode, extract.",
    "reverse engineering — static + dynamic analysis.",
    "CTF player & maker — clean puzzles, clean solves."
  ];
  let li = 0, ci = 0, deleting = false;

  function tick(){
    if (!typingEl) return;
    const s = lines[li];
    if (!deleting) {
      ci++;
      typingEl.textContent = s.slice(0, ci);
      if (ci >= s.length) {
        deleting = true;
        setTimeout(tick, 900);
        return;
      }
    } else {
      ci--;
      typingEl.textContent = s.slice(0, ci);
      if (ci <= 0) {
        deleting = false;
        li = (li + 1) % lines.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 55);
  }
  tick();

  // Matrix rain background
  const canvas = $("#matrix");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*";
  let width, height, columns, drops, fontSize;

  function resize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    fontSize = Math.max(12, Math.floor(width / 110));
    columns = Math.floor(width / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.random() * height);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  function draw(){
    // fade
    ctx.fillStyle = "rgba(11, 15, 20, 0.08)";
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + "px ui-monospace, monospace";
    for (let i=0; i<columns; i++){
      const text = chars[Math.floor(Math.random()*chars.length)];
      const x = i * fontSize;
      const y = drops[i];

      // slight color variance by column (no hard-coded colors beyond green-ish alpha)
      ctx.fillStyle = "rgba(124, 255, 178, 0.55)";
      ctx.fillText(text, x, y);

      drops[i] += fontSize * 0.92;
      if (drops[i] > height && Math.random() > 0.975){
        drops[i] = -fontSize * (1 + Math.random()*10);
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
