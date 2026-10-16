"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function MosaicShowcase() {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.documentElement.classList.toggle("mosaic-only", active);
    return () => document.documentElement.classList.remove("mosaic-only");
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <button type="button" className="mosaicview__trigger" onClick={() => setActive(true)}>
        Ver mosaico
      </button>
      {mounted &&
        active &&
        createPortal(
          <div className="mosaicview__overlay" onClick={() => setActive(false)}>
            <button
              type="button"
              className="mosaicview__close"
              onClick={() => setActive(false)}
              aria-label="Fechar mosaico"
            >
              ✕ Fechar
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
