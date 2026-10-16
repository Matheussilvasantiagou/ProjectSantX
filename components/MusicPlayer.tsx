"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicConfig } from "../lib/config";
import { clamp01 } from "../lib/config";

export default function MusicPlayer({ music }: { music: MusicConfig | undefined }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  const enabled = !!music?.enabled;
  const src = String(music?.src ?? "").trim();

  useEffect(() => {
    const audio = audioRef.current;
    if (!enabled || !src || !audio) return;

    const volume = clamp01(music?.volume ?? 0.85);
    const startAtSecondsRaw = Number(music?.startAtSeconds ?? 0);
    const startAtSeconds = Number.isFinite(startAtSecondsRaw) ? Math.max(0, startAtSecondsRaw) : 0;

    audio.volume = volume;

    const seekToStart = () => {
      if (!startAtSeconds) return;
      try {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          audio.currentTime = Math.min(startAtSeconds, Math.max(0, audio.duration - 0.25));
        }
      } catch {
        // ignore
      }
    };

    const play = async () => {
      try {
        seekToStart();
        await audio.play();
      } catch {
        // autoplay bloqueado: usuário pode tocar no fab manualmente
      }
    };

    audio.addEventListener("loadedmetadata", seekToStart, { once: true });
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));

    const unlock = () => {
      setVisible(true);
      void play();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return;
      unlock();
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", onKey, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", onKey);
    };
  }, [enabled, src, music?.volume, music?.startAtSeconds]);

  if (!enabled || !src) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop={music?.loop !== false} preload="auto" />
      <button
        className="musicfab"
        type="button"
        hidden={!visible}
        aria-label={playing ? "Pausar música" : "Tocar música"}
        aria-pressed={playing}
        onClick={toggle}
      >
        {playing ? "⏸" : "▶"}
      </button>
    </>
  );
}
