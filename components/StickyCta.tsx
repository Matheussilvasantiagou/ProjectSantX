"use client";

import { useEffect, useRef, useState } from "react";

export default function StickyCta({ href, label }: { href: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const footerInView = useRef(false);

  useEffect(() => {
    if (!href) return;
    const footer = document.querySelector(".footer");
    const onMobile = () => window.matchMedia("(max-width: 560px)").matches;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setVisible(onMobile() && !footerInView.current && y > 240);
    };

    let io: IntersectionObserver | undefined;
    if (footer) {
      io = new IntersectionObserver(
        (entries) => {
          footerInView.current = !!entries[0]?.isIntersecting;
          update();
        },
        { root: null, threshold: 0.01 },
      );
      io.observe(footer);
    }

    const onScroll = () => requestAnimationFrame(update);
    const onResize = () => requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    update();

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [href]);

  if (!href) return null;

  return (
    <div className="stickycta" hidden={!visible}>
      <div className="stickycta__in">
        <a className="btn btn--primary stickycta__btn" href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      </div>
    </div>
  );
}
