"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { BackgroundConfig } from "../lib/config";
import { clamp01, isVideo } from "../lib/config";
import { useMosaicTiles, type MosaicTile } from "../lib/useMosaicTiles";

function setMutedInline(v: HTMLVideoElement | null) {
  if (!v) return;
  v.muted = true;
  v.defaultMuted = true;
  v.volume = 0;
  v.play().catch(() => {});
}

function MosaicGrid({ tiles, priority }: { tiles: MosaicTile[]; priority?: boolean }) {
  return (
    <>
      {tiles.map((tile, i) => (
        <div key={tile.key} className={`bg__tile${tile.tall ? " bg__tile--tall" : ""}`}>
          {isVideo(tile.src) ? (
            <video
              src={tile.src}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              ref={setMutedInline}
            />
          ) : (
            <Image
              src={tile.src}
              alt=""
              fill
              sizes="(max-width: 560px) 30vw, 220px"
              loading={priority && i < 6 ? "eager" : "lazy"}
              priority={priority && i < 6}
            />
          )}
        </div>
      ))}
    </>
  );
}

function MosaicBackground({ media, mosaicCfg }: { media: string[]; mosaicCfg: BackgroundConfig["mosaic"] }) {
  const layout = useMosaicTiles(media, mosaicCfg);
  if (!layout || !layout.tiles.length) return null;

  const style = {
    "--tile": `${layout.tileSize}px`,
    "--gap": `${layout.gap}px`,
  } as React.CSSProperties;

  return (
    <div className="bg__mosaicTrack" data-bg-mosaic-track>
      <div className="bg__mosaic" style={style}>
        <MosaicGrid tiles={layout.tiles} priority />
      </div>
      <div className="bg__mosaic" style={style} aria-hidden="true">
        <MosaicGrid tiles={layout.tiles} />
      </div>
    </div>
  );
}

function SlideshowBackground({ images, intervalMs }: { images: string[]; intervalMs: number }) {
  const [idx, setIdx] = useState(0);
  const [onA, setOnA] = useState(true);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
      setOnA((a) => !a);
    }, Math.max(2500, intervalMs));
    return () => window.clearInterval(id);
  }, [images, intervalMs]);

  const current = images[idx % images.length];
  const next = images[(idx + 1) % images.length];

  return (
    <>
      <div
        className={`bg__layer${onA ? " is-on" : ""}`}
        style={{ backgroundImage: `url("${current}")` }}
      />
      <div
        className={`bg__layer${!onA ? " is-on" : ""}`}
        style={{ backgroundImage: `url("${next}")` }}
      />
    </>
  );
}

export default function Background({ bg }: { bg: BackgroundConfig | undefined }) {
  const overlayStrength = clamp01(bg?.overlayStrength ?? 0.62);
  const vignetteStrength = clamp01(bg?.vignetteStrength ?? 0.55);
  const mode = bg?.mode ?? "slideshow";

  const media = mode === "mosaic" ? (bg?.media ?? []).filter(Boolean) : [];
  const images = mode !== "mosaic" ? (bg?.images ?? []).filter(Boolean) : [];
  const hasMedia = mode === "mosaic" ? media.length > 0 : images.length > 0;

  return (
    <div className="bg" aria-hidden="true">
      {mode === "mosaic" && hasMedia && <MosaicBackground media={media} mosaicCfg={bg?.mosaic} />}
      {mode !== "mosaic" && hasMedia && (
        <SlideshowBackground images={images} intervalMs={bg?.intervalMs ?? 6500} />
      )}
      {!hasMedia && (
        <div
          className="bg__layer is-on"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(var(--c-accent) / 0.22), rgba(var(--c-contrast) / 0.18))",
          }}
        />
      )}
      <div className="bg__overlay" style={{ opacity: overlayStrength }} />
      <div className="bg__vignette" style={{ opacity: vignetteStrength }} />
      {bg?.filmGrain && <div className="grain" />}
    </div>
  );
}
