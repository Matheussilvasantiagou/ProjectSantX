"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollAnimations() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero__title", { y: 28, opacity: 0, duration: 0.9 })
        .from(".hero__subtitle", { y: 18, opacity: 0, duration: 0.8 }, "-=0.55")
        .from(".topbar", { y: -16, opacity: 0, duration: 0.6 }, "-=0.7");

      gsap.utils.toArray<HTMLElement>(".section").forEach((section) => {
        const heading = section.querySelector(".section__hd");
        const items = section.querySelectorAll(
          ".card, .panel, .list li, .qa, .gimg",
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          defaults: { ease: "power3.out" },
        });

        if (heading) tl.from(heading, { y: 24, opacity: 0, duration: 0.6 });
        if (items.length) {
          tl.from(
            items,
            { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 },
            heading ? "-=0.35" : 0,
          );
        }
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
