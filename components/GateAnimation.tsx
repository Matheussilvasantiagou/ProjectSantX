"use client";

import { useEffect } from "react";
import gsap from "gsap";

export default function GateAnimation() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".gate__card", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.15,
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
