(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  const card = document.querySelector(".weisses-feld");
  const canTilt =
    !prefersReducedMotion &&
    window.matchMedia?.("(hover: hover)")?.matches === true &&
    window.matchMedia?.("(pointer: fine)")?.matches === true;

  let tiltRaf = 0;
  let lastTilt = { x: 0, y: 0 };
  let tiltPaused = false;

  const resetTilt = () => {
    if (!card) return;
    card.style.transform = "";
  };

  const applyTilt = () => {
    tiltRaf = 0;
    if (!card) return;
    const maxDeg = 7;
    const rotateY = lastTilt.x * maxDeg;
    const rotateX = -lastTilt.y * maxDeg;
    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
      2
    )}deg) scale(1.01)`;
  };

  if (card && canTilt) {
    window.setTimeout(() => {
      card.addEventListener("mousemove", (event) => {
        if (tiltPaused) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        lastTilt = {
          x: (x - 0.5) * 2,
          y: (y - 0.5) * 2,
        };

        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(applyTilt);
      });

      card.addEventListener("mouseleave", () => {
        resetTilt();
      });
    }, 560);
  }

  const trigger = document.getElementById("profilbild");
  const overlay = document.getElementById("bild-overlay");
  const image = overlay?.querySelector(".grossbild");

  if (!trigger || !overlay || !image) return;

  let lastActiveElement = null;

  const setExpanded = (isOpen) => {
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const focusOverlay = () => {
    if (!overlay.hasAttribute("tabindex")) overlay.setAttribute("tabindex", "-1");
    overlay.focus();
  };

  const openOverlay = () => {
    tiltPaused = true;
    resetTilt();
    lastActiveElement = document.activeElement;
    overlay.hidden = false;

    setExpanded(true);

    requestAnimationFrame(() => {
      overlay.classList.add("is-open");
    });

    document.body.style.overflow = "hidden";
    focusOverlay();
  };

  const closeOverlay = () => {
    overlay.classList.remove("is-open");
    setExpanded(false);

    const finish = () => {
      overlay.hidden = true;
      document.body.style.overflow = "";
      tiltPaused = false;
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    };

    if (prefersReducedMotion) {
      finish();
      return;
    }

    let done = false;
    const onEnd = (event) => {
      if (event.target !== overlay) return;
      if (done) return;
      done = true;
      overlay.removeEventListener("transitionend", onEnd);
      finish();
    };

    overlay.addEventListener("transitionend", onEnd);

    window.setTimeout(() => {
      if (done) return;
      done = true;
      overlay.removeEventListener("transitionend", onEnd);
      finish();
    }, 220);
  };

  const isOpen = () => !overlay.hidden;

  trigger.addEventListener("click", openOverlay);
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openOverlay();
    }
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeOverlay();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeOverlay();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      focusOverlay();
    }
  });

  setExpanded(false);
})();
