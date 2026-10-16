"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";

export default function Gallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (!images.length) return null;

  return (
    <div className="gallery" data-gallery>
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          className="gimg"
          onClick={() => setIndex(i)}
          aria-label="Ver foto da festa"
        >
          <Image
            src={src}
            alt="Foto da festa"
            fill
            loading="lazy"
            sizes="(max-width: 560px) 100vw, 50vw"
          />
        </button>
      ))}
      <Lightbox images={images} index={index} onClose={() => setIndex(null)} onNavigate={setIndex} />
    </div>
  );
}
