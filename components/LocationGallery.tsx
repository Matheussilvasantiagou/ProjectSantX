"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";

export default function LocationGallery({ images }: { images: string[] }) {
  const list = images.filter(Boolean);
  const [index, setIndex] = useState<number | null>(null);
  if (!list.length) return null;

  return (
    <div className="card" data-location-card>
      <div className="section__hd" style={{ marginBottom: 10 }}>
        <h3 className="section__title" style={{ fontSize: 14 }}>
          Local
        </h3>
        <p className="section__hint">Janga, Paulista/PE</p>
      </div>
      <div className="locallery">
        {list.map((src, i) => (
          <button
            key={src}
            type="button"
            className="locallery__img"
            onClick={() => setIndex(i)}
            aria-label="Ver foto do local"
          >
            <Image
              src={src}
              alt="Foto do local"
              fill
              loading="lazy"
              sizes="(max-width: 560px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>
      <Lightbox images={list} index={index} onClose={() => setIndex(null)} onNavigate={setIndex} />
    </div>
  );
}
