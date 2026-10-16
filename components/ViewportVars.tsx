"use client";

import { useEffect } from "react";

export default function ViewportVars() {
  useEffect(() => {
    const setVars = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const vvh = Math.max(1, vh) / 100;
      document.documentElement.style.setProperty("--vvh", `${vvh}px`);

      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vvw = Math.max(1, vw) / 100;
      document.documentElement.style.setProperty("--vvw", `${vvw}px`);
    };
    const setVarsRaf = () => requestAnimationFrame(setVars);

    setVars();
    const t = window.setTimeout(setVars, 60);

    window.addEventListener("resize", setVarsRaf, { passive: true });
    window.addEventListener("orientationchange", setVarsRaf, { passive: true });
    window.addEventListener("scroll", setVarsRaf, { passive: true });
    window.visualViewport?.addEventListener("resize", setVarsRaf, { passive: true });
    window.visualViewport?.addEventListener("scroll", setVarsRaf, { passive: true });

    const onVis = () => {
      document.documentElement.style.setProperty("--mosaic-play", document.hidden ? "paused" : "running");
    };
    document.addEventListener("visibilitychange", onVis, { passive: true } as AddEventListenerOptions);
    onVis();

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", setVarsRaf);
      window.removeEventListener("orientationchange", setVarsRaf);
      window.removeEventListener("scroll", setVarsRaf);
      window.visualViewport?.removeEventListener("resize", setVarsRaf);
      window.visualViewport?.removeEventListener("scroll", setVarsRaf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
