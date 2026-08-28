(() => {
  if (window.__portfolioRuntime) return;
  window.__portfolioRuntime = true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  document.documentElement.dataset.revealRuntime = "true";
  let registerReveal;
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    registerReveal = (element) => { element.dataset.visible = "true"; };
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.visible = "true";
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    registerReveal = (element) => {
      if (!element.hasAttribute("data-visible")) revealObserver.observe(element);
    };
  }

  const registerRevealTree = (root) => {
    if (!(root instanceof Element)) return;
    if (root.matches("[data-reveal]")) registerReveal(root);
    root.querySelectorAll("[data-reveal]").forEach(registerReveal);
  };
  document.querySelectorAll("[data-reveal]").forEach(registerReveal);
  if ("MutationObserver" in window) {
    const revealMutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(registerRevealTree));
    });
    revealMutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  const transition = document.getElementById("page-transition");
  let transitionTimer = 0;
  const clearTransition = () => transition?.removeAttribute("data-active");
  addEventListener("pageshow", clearTransition);
  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest("a[data-transition]") : null;
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === "_blank") return;
    if (anchor.hasAttribute("data-project-transition")) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.hash)) return;
    if (reducedMotion.matches) return;
    transition?.setAttribute("data-active", "true");
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(clearTransition, 320);
  }, true);

  if (precisePointer.matches && !reducedMotion.matches) {
    const cursor = document.getElementById("custom-cursor");
    const dot = cursor?.querySelector("[data-cursor-dot]");
    const ring = cursor?.querySelector("[data-cursor-ring]");
    const accents = { "/visual-notes": "#ff6b52", "/aesthetic": "#ff6b52", "/photography": "#f2b15b", "/moving-image": "#d6ff4b", "/projects/i2v-evaluation": "#b9ff43", "/projects/project-02": "#9d8cff", "/projects/project-03": "#51d6ff", "/projects/project-04": "#ff6d57" };
    const accent = Object.entries(accents).find(([route]) => location.pathname.startsWith(route))?.[1] || "#b9ff43";
    cursor?.style.setProperty("--cursor-accent", accent);
    let pointerX = innerWidth / 2, pointerY = innerHeight / 2, ringX = pointerX, ringY = pointerY, frame = 0;
    const render = () => {
      ringX += (pointerX - ringX) * 0.16; ringY += (pointerY - ringY) * 0.16;
      if (dot && ring) { dot.style.transform = `translate3d(${pointerX}px,${pointerY}px,0)`; ring.style.transform = `translate3d(${ringX}px,${ringY}px,0)`; }
      if (Math.abs(pointerX - ringX) < 0.1 && Math.abs(pointerY - ringY) < 0.1) {
        ringX = pointerX; ringY = pointerY; frame = 0; return;
      }
      frame = requestAnimationFrame(render);
    };
    const requestRender = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(render);
    };
    addEventListener("pointermove", (event) => { pointerX = event.clientX; pointerY = event.clientY; dot?.setAttribute("data-active", "true"); ring?.setAttribute("data-active", "true"); requestRender(); }, { passive: true });
    document.addEventListener("pointerover", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest("a,button,[data-cursor='interactive'],[data-cursor='video']");
      const videoStage = target?.closest("[data-cursor='video']");
      ring?.setAttribute("data-hover", interactive ? "true" : "false");
      ring?.setAttribute("data-video", videoStage ? "true" : "false");
      cursor?.style.setProperty("--cursor-accent", videoStage ? "#b9ff43" : accent);
    }, { passive: true });
    addEventListener("pointerdown", () => ring?.setAttribute("data-pressed", "true"), { passive: true });
    addEventListener("pointerup", () => ring?.setAttribute("data-pressed", "false"), { passive: true });
    addEventListener("pointercancel", () => ring?.setAttribute("data-pressed", "false"), { passive: true });
    addEventListener("pagehide", () => cancelAnimationFrame(frame), { once: true });
  }
})();
