"use client";

import { useEffect, useState } from "react";
import { isImage, isVideo, type BackgroundMosaicConfig } from "./config";

export type MosaicTile = { src: string; tall: boolean; key: string };
export type MosaicLayout = { tiles: MosaicTile[]; tileSize: number; gap: number };

const MOBILE_QUERY = "(max-width: 560px)";

function computeLayout(media: string[], mosaicCfg: BackgroundMosaicConfig | undefined): MosaicLayout {
  const isMobile = window.matchMedia(MOBILE_QUERY).matches;
  const tileMinRaw = isMobile
    ? Number(mosaicCfg?.tileMinMobile ?? 50)
    : Number(mosaicCfg?.tileMinDesktop ?? 120);
  const tileMin = Math.max(16, tileMinRaw);
  const tileMax = Math.max(tileMin, Number(mosaicCfg?.tileMax ?? 220));
  const gap = Math.max(0, Number(mosaicCfg?.gap ?? 6));

  // No mobile, mantém estável pra evitar "pulos" enquanto o viewport muda durante o loading.
  const tileSize = isMobile ? Math.round(tileMin) : Math.round(tileMin + (tileMax - tileMin) * Math.random());

  const vh = window.visualViewport?.height ?? window.innerHeight;
  const vw = window.visualViewport?.width ?? window.innerWidth;

  const step = Math.max(1, tileSize + gap);
  const cols = Math.max(2, Math.floor((vw + gap) / step));
  const rows = Math.max(2, Math.ceil((vh + gap) / step));
  const base = cols * rows;

  const minTiles = Math.max(base, isMobile ? 14 : 26);

  const shuffle = (arr: string[]) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const chosen = shuffle(media);
  // Mostra todas pelo menos 1x e completa a grade repetindo se precisar.
  const count = Math.max(chosen.length, minTiles);

  const tiles: MosaicTile[] = [];
  for (let i = 0; i < count; i++) {
    const src = chosen[i % chosen.length];
    if (!src) continue;
    const jpegOnly = /\.jpeg$/i.test(src);
    tiles.push({ src, tall: !jpegOnly, key: `${i}-${src}` });
  }

  return { tiles, tileSize, gap };
}

export function useMosaicTiles(media: string[], mosaicCfg: BackgroundMosaicConfig | undefined) {
  const [layout, setLayout] = useState<MosaicLayout | null>(null);

  useEffect(() => {
    if (!media.length) {
      setLayout({ tiles: [], tileSize: 160, gap: 6 });
      return;
    }

    setLayout(computeLayout(media, mosaicCfg));

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    let lastW = window.innerWidth;
    let lastH = window.visualViewport?.height ?? window.innerHeight;
    let t = 0;

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.visualViewport?.height ?? window.innerHeight;

      // No mobile, ignora "micro resizes" comuns durante o loading (barra do navegador).
      if (isMobile) {
        const dw = Math.abs(w - lastW);
        const dh = Math.abs(h - lastH);
        if (dw < 2 && dh < 120) return;
      }
      lastW = w;
      lastH = h;

      window.clearTimeout(t);
      t = window.setTimeout(() => setLayout(computeLayout(media, mosaicCfg)), 220);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.join("|"), JSON.stringify(mosaicCfg ?? {})]);

  return layout;
}

export function isImageSrc(src: string) {
  return isImage(src);
}
export function isVideoSrc(src: string) {
  return isVideo(src);
}
