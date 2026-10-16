"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS: { id: string; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "important", label: "Importante" },
  { id: "about", label: "Rolê" },
  { id: "whatToBring", label: "Levar" },
  { id: "rules", label: "Regras" },
  { id: "gallery", label: "Fotos" },
  { id: "faq", label: "FAQ" },
];

export default function SiteNav({ enabledSections }: { enabledSections: Set<string> }) {
  const items = NAV_ITEMS.filter((it) => it.id === "info" || enabledSections.has(it.id));
  const [active, setActive] = useState(items[0]?.id ?? "info");

  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visible[0]?.target as HTMLElement | undefined;
        if (top?.id) setActive(top.id);
      },
      { root: null, rootMargin: "-90px 0px -55% 0px", threshold: [0.12, 0.25, 0.35, 0.5, 0.7] },
    );

    for (const el of sections) io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.id).join(",")]);

  return (
    <nav className="nav" aria-label="Seções">
      {items.map((it) => (
        <a
          key={it.id}
          className={`chip${active === it.id ? " is-active" : ""}`}
          href={`#${it.id}`}
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
