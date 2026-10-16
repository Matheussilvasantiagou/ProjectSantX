"use client";

import Image from "next/image";
import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

export default function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const open = index !== null;
  const count = images.length;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + count) % count);
  }, [index, count, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % count);
  }, [index, count, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, goNext, goPrev]);

  if (!mounted || !open || index === null) return null;
  const src = images[index];

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Fechar">
        ✕
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Foto anterior"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="Próxima foto"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            ›
          </button>
        </>
      )}
      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt="" fill sizes="94vw" style={{ objectFit: "contain" }} />
      </div>
    </div>,
    document.body,
  );
}
