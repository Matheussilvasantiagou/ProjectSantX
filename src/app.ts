type Nullable<T> = T | null | undefined;

type ScheduleItem = { time?: string; label?: string; detail?: string };
type FaqItem = { q?: string; a?: string };

type BackgroundMosaicConfig = {
  tileMin?: number;
  tileMax?: number;
  gap?: number;
  parallax?: number;
  videoChance?: number;
};

type BackgroundConfig = {
  mode?: "slideshow" | "mosaic";
  images?: string[];
  media?: string[];
  intervalMs?: number;
  overlayStrength?: number;
  vignetteStrength?: number;
  filmGrain?: boolean;
  mosaic?: BackgroundMosaicConfig;
};

type ThemeConfig = { accent?: string; accent2?: string };

type MusicConfig = {
  enabled?: boolean;
  src?: string;
  startAtSeconds?: number;
  volume?: number;
  loop?: boolean;
  startLabel?: string;
  hint?: string;
};

type SectionsConfig = {
  about?: { enabled?: boolean; title?: string; text?: string };
  rules?: { enabled?: boolean; title?: string; bullets?: string[] };
  schedule?: { enabled?: boolean; title?: string; items?: ScheduleItem[] };
  whatToBring?: { enabled?: boolean; title?: string; bullets?: string[] };
  gallery?: { enabled?: boolean; title?: string; images?: string[] };
  faq?: { enabled?: boolean; title?: string; items?: FaqItem[] };
};

type EventConfig = {
  title?: string;
  subtitle?: string;
  dateText?: string;
  timeText?: string;
  locationName?: string;
  locationAddress?: string;
  locationImages?: string[];
  mapsUrl?: string;
  rsvp?: {
    enabled?: boolean;
    ctaText?: string;
    whatsappPhoneE164?: string;
    whatsappPrefill?: string;
  };
};

type AppConfig = {
  event?: EventConfig;
  sections?: SectionsConfig;
  background?: BackgroundConfig;
  theme?: ThemeConfig;
  music?: MusicConfig;
};

async function loadConfig(): Promise<AppConfig> {
  const res = await fetch(`./config.json?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao carregar config.json (${res.status})`);
  return (await res.json()) as AppConfig;
}

function qs<T extends Element = Element>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector(sel) as T | null;
}

function setText(id: string, value: Nullable<string>) {
  const el = qs<HTMLElement>(`[data-bind="${id}"]`);
  if (!el) return;
  el.textContent = value ?? "";
}

function setTextAll(id: string, value: Nullable<string>) {
  const els = document.querySelectorAll<HTMLElement>(`[data-bind="${id}"]`);
  for (const el of els) el.textContent = value ?? "";
}

function setHref(id: string, value: Nullable<string>) {
  const el = qs<HTMLAnchorElement>(`[data-href="${id}"]`);
  if (!el) return;
  if (!value) {
    el.setAttribute("aria-disabled", "true");
    el.removeAttribute("href");
    return;
  }
  el.setAttribute("href", value);
}

function setEnabled(sectionId: string, enabled: boolean) {
  const el = qs<HTMLElement>(`[data-section="${sectionId}"]`);
  if (!el) return;
  el.hidden = !enabled;
}

function renderBullets(targetSel: string, bullets: string[] = []) {
  const ul = qs<HTMLUListElement>(targetSel);
  if (!ul) return;
  ul.innerHTML = "";
  for (const b of bullets) {
    const li = document.createElement("li");
    li.textContent = b;
    ul.appendChild(li);
  }
}

function renderSchedule(items: ScheduleItem[] = []) {
  const root = qs<HTMLElement>("[data-schedule]");
  if (!root) return;
  root.innerHTML = "";
  for (const it of items) {
    const div = document.createElement("div");
    div.className = "titem";
    div.innerHTML = `
      <div class="titem__time">${escapeHtml(it.time ?? "")}</div>
      <div>
        <div class="titem__label">${escapeHtml(it.label ?? "")}</div>
        <div class="titem__detail">${escapeHtml(it.detail ?? "")}</div>
      </div>
    `;
    root.appendChild(div);
  }
}

function renderGallery(images: string[] = []) {
  const root = qs<HTMLElement>("[data-gallery]");
  if (!root) return;
  root.innerHTML = "";
  for (const src of images) {
    const a = document.createElement("a");
    a.className = "gimg";
    a.href = src;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.innerHTML = `<img alt="Foto da festa" loading="lazy" src="${escapeAttr(src)}" />`;
    root.appendChild(a);
  }
}

function renderLocationGallery(images: string[] = []) {
  const card = qs<HTMLElement>("[data-location-card]");
  const root = qs<HTMLElement>("[data-location-gallery]");
  if (!card || !root) return;

  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.length) {
    card.hidden = true;
    root.innerHTML = "";
    return;
  }

  card.hidden = false;
  root.innerHTML = "";
  for (const src of list) {
    const a = document.createElement("a");
    a.className = "locallery__img";
    a.href = src;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.innerHTML = `<img alt="Foto do local" loading="lazy" src="${escapeAttr(src)}" />`;
    root.appendChild(a);
  }
}

function renderFaq(items: FaqItem[] = []) {
  const root = qs<HTMLElement>("[data-faq]");
  if (!root) return;
  root.innerHTML = "";
  for (const it of items) {
    const d = document.createElement("details");
    d.className = "qa";
    const q = escapeHtml(it.q ?? "");
    const a = escapeHtml(it.a ?? "");
    d.innerHTML = `<summary>${q}</summary><p>${a}</p>`;
    root.appendChild(d);
  }
}

function escapeHtml(s: unknown) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s: unknown) {
  return String(s).replaceAll('"', "&quot;");
}

function setTheme(theme: Nullable<ThemeConfig>) {
  if (!theme) return;
  const r = document.documentElement;
  if (theme.accent) r.style.setProperty("--accent", theme.accent);
  if (theme.accent2) r.style.setProperty("--accent2", theme.accent2);
}

function setupBackground(bg: Nullable<BackgroundConfig>) {
  const layerA = qs<HTMLElement>("[data-bg-layer='a']");
  const layerB = qs<HTMLElement>("[data-bg-layer='b']");
  const mosaicRoot = qs<HTMLElement>("[data-bg-mosaic]");
  const overlay = qs<HTMLElement>("[data-bg-overlay]");
  const vignette = qs<HTMLElement>("[data-bg-vignette]");
  const grain = qs<HTMLElement>("[data-grain]");
  if (!layerA || !layerB || !overlay || !vignette) return;

  const overlayStrength = clamp01(bg?.overlayStrength ?? 0.62);
  const vignetteStrength = clamp01(bg?.vignetteStrength ?? 0.55);
  overlay.style.opacity = String(overlayStrength);
  vignette.style.opacity = String(vignetteStrength);
  if (grain) grain.style.display = bg?.filmGrain ? "block" : "none";

  const mode = bg?.mode ?? "slideshow";

  if (mode === "mosaic" && mosaicRoot) {
    const media = Array.isArray(bg?.media) ? bg!.media!.filter(Boolean) : [];
    if (!media.length) {
      layerA.style.backgroundImage =
        "linear-gradient(135deg, rgba(var(--c-accent) / 0.22), rgba(var(--c-contrast) / 0.18))";
      layerA.classList.add("is-on");
      layerB.classList.remove("is-on");
      mosaicRoot.innerHTML = "";
      mosaicRoot.style.display = "none";
      return;
    }

    layerA.classList.remove("is-on");
    layerB.classList.remove("is-on");
    mosaicRoot.style.display = "grid";
    renderMosaic(mosaicRoot, media, bg?.mosaic);
    return;
  }

  const images = Array.isArray(bg?.images) ? bg!.images!.filter(Boolean) : [];
  if (!images.length) {
    layerA.style.backgroundImage =
      "linear-gradient(135deg, rgba(var(--c-accent) / 0.22), rgba(var(--c-contrast) / 0.18))";
    layerA.classList.add("is-on");
    layerB.classList.remove("is-on");
    if (mosaicRoot) {
      mosaicRoot.innerHTML = "";
      mosaicRoot.style.display = "none";
    }
    return;
  }

  const intervalMs = Math.max(2500, Number(bg?.intervalMs ?? 6500));
  let idx = 0;
  let onA = true;

  const setLayer = (layer: HTMLElement, src: string) => {
    layer.style.backgroundImage = `url("${src}")`;
  };

  setLayer(layerA, images[idx % images.length]!);
  layerA.classList.add("is-on");
  layerB.classList.remove("is-on");
  if (mosaicRoot) {
    mosaicRoot.innerHTML = "";
    mosaicRoot.style.display = "none";
  }

  if (mode !== "slideshow" || images.length === 1) return;

  window.setInterval(() => {
    idx = (idx + 1) % images.length;
    const nextSrc = images[idx]!;
    if (onA) {
      setLayer(layerB, nextSrc);
      layerB.classList.add("is-on");
      layerA.classList.remove("is-on");
    } else {
      setLayer(layerA, nextSrc);
      layerA.classList.add("is-on");
      layerB.classList.remove("is-on");
    }
    onA = !onA;
  }, intervalMs);
}

function renderMosaic(root: HTMLElement, media: string[], mosaicCfg: Nullable<BackgroundMosaicConfig>) {
  const tileMin = Math.max(80, Number(mosaicCfg?.tileMin ?? 120));
  const tileMax = Math.max(tileMin, Number(mosaicCfg?.tileMax ?? 220));
  const gap = Math.max(0, Number(mosaicCfg?.gap ?? 6));

  const pickTile = () => {
    const r = Math.random();
    const size = Math.round(tileMin + (tileMax - tileMin) * r);
    root.style.setProperty("--tile", `${size}px`);
    root.style.setProperty("--gap", `${gap}px`);
  };
  pickTile();

  root.innerHTML = "";

  const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);
  const isImage = (src: string) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src);
  const isJpegOnly = (src: string) => /\.jpeg$/i.test(src);

  const isMobile = window.matchMedia("(max-width: 560px)").matches;

  const area = Math.max(1, window.innerWidth * window.innerHeight);
  const tileArea = Math.max(1, ((tileMin + tileMax) / 2) ** 2);
  const density = isMobile ? 0.65 : 1.35;
  const minTiles = isMobile ? 10 : 18;
  const maxTiles = isMobile ? 22 : 72;
  const count = clampInt(Math.round((area / tileArea) * density), minTiles, maxTiles);

  const shuffle = (arr: string[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // No mobile, evita peso: remove vídeos por padrão e prioriza imagens
  const baseMedia = isMobile ? media.filter((s) => !isVideo(s)) : media;
  const pool = shuffle([...baseMedia]);
  const chosen = pool.length <= count ? pool : pool.slice(0, count);
  // No desktop, garante 1 vídeo se existir
  if (!isMobile) {
    const videoIdx = media.findIndex((s) => isVideo(s));
    if (videoIdx >= 0 && !chosen.some((s) => isVideo(s))) {
      chosen[0] = media[videoIdx]!;
    }
  }

  for (let i = 0; i < count; i++) {
    const src = chosen[i % chosen.length]!;
    const tile = document.createElement("div");
    tile.className = "bg__tile";

    // regra: tudo que NÃO for .jpeg vira "storie"
    if (!isJpegOnly(src)) tile.classList.add("bg__tile--tall");

    if (isVideo(src)) {
      const v = document.createElement("video");
      v.src = src;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = "metadata";
      tile.appendChild(v);
      v.play().catch(() => {});
    } else if (isImage(src)) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      tile.appendChild(img);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      tile.appendChild(img);
    }

    root.appendChild(tile);
  }

  let t = 0;
  const onResize = () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => renderMosaic(root, media, mosaicCfg), 180);
  };
  window.addEventListener("resize", onResize, { passive: true });
}

function clampInt(n: unknown, min: number, max: number) {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function clamp01(x: unknown) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function buildWhatsappLink(phoneE164: Nullable<string>, prefill: Nullable<string>) {
  const phone = String(phoneE164 ?? "").replaceAll(/[^\d+]/g, "");
  const text = String(prefill ?? "");
  if (!phone) return "";
  const encoded = encodeURIComponent(text).replaceAll("%250A", "%0A");
  const digits = phone.replaceAll("+", "");
  return `https://wa.me/${digits}?text=${encoded}`;
}

function applyConfig(cfg: AppConfig) {
  const ev = cfg?.event ?? {};
  const sections = cfg?.sections ?? {};

  setTheme(cfg?.theme);
  setupBackground(cfg?.background);

  setTextAll("event.title", ev.title);
  setTextAll("event.subtitle", ev.subtitle);
  setTextAll("event.dateText", ev.dateText);
  setTextAll("event.timeText", ev.timeText);
  setTextAll("event.locationName", ev.locationName);
  setTextAll("event.locationAddress", ev.locationAddress);

  setHref("event.mapsUrl", ev.mapsUrl);
  renderLocationGallery(ev.locationImages ?? []);

  const rsvpEnabled = !!ev?.rsvp?.enabled;
  const rsvpCta = ev?.rsvp?.ctaText ?? "Confirmar presença";
  const rsvpLink = buildWhatsappLink(ev?.rsvp?.whatsappPhoneE164, ev?.rsvp?.whatsappPrefill);
  const rsvpBtn = qs<HTMLAnchorElement>("[data-rsvp-btn]");
  if (rsvpBtn) {
    rsvpBtn.textContent = rsvpCta;
    if (rsvpEnabled && rsvpLink) {
      rsvpBtn.href = rsvpLink;
      rsvpBtn.hidden = false;
    } else {
      rsvpBtn.hidden = true;
    }
  }

  setEnabled("about", !!sections?.about?.enabled);
  setText("about.title", sections?.about?.title);
  setText("about.text", sections?.about?.text);

  setEnabled("rules", !!sections?.rules?.enabled);
  setText("rules.title", sections?.rules?.title);
  renderBullets("[data-rules]", sections?.rules?.bullets ?? []);

  setEnabled("schedule", !!sections?.schedule?.enabled);
  setText("schedule.title", sections?.schedule?.title);
  renderSchedule(sections?.schedule?.items ?? []);

  setEnabled("whatToBring", !!sections?.whatToBring?.enabled);
  setText("whatToBring.title", sections?.whatToBring?.title);
  renderBullets("[data-whatToBring]", sections?.whatToBring?.bullets ?? []);

  setEnabled("gallery", !!sections?.gallery?.enabled);
  setText("gallery.title", sections?.gallery?.title);
  renderGallery(sections?.gallery?.images ?? []);

  setEnabled("faq", !!sections?.faq?.enabled);
  setText("faq.title", sections?.faq?.title);
  renderFaq(sections?.faq?.items ?? []);

  for (const chip of document.querySelectorAll<HTMLElement>("[data-nav]")) {
    const id = chip.getAttribute("data-nav");
    const enabled = id ? !qs<HTMLElement>(`[data-section="${id}"]`)?.hidden : true;
    chip.hidden = !enabled;
  }
}

function setupMusic(musicCfg: Nullable<MusicConfig>) {
  const gate = qs<HTMLElement>("[data-gate]");
  const gateBtn = qs<HTMLButtonElement>("[data-gate-btn]");
  const audio = qs<HTMLAudioElement>("[data-audio]");
  const fab = qs<HTMLButtonElement>("[data-musicfab]");
  if (!gate || !gateBtn || !audio || !fab) return;

  const enabled = !!musicCfg?.enabled;
  const src = String(musicCfg?.src ?? "").trim();
  const volume = clamp01(musicCfg?.volume ?? 0.85);
  const loop = musicCfg?.loop !== false;
  const startAtSecondsRaw = Number(musicCfg?.startAtSeconds ?? 0);
  const startAtSeconds = Number.isFinite(startAtSecondsRaw) ? Math.max(0, startAtSecondsRaw) : 0;

  setTextAll("music.hint", musicCfg?.hint ?? "Clique para entrar e iniciar a música");
  gateBtn.textContent = musicCfg?.startLabel ?? "Abrir convite";

  if (!enabled || !src) {
    gate.hidden = true;
    fab.hidden = true;
    return;
  }

  audio.src = src;
  audio.loop = loop;
  audio.volume = typeof volume === "number" ? volume : 0.85;

  const setFab = (isPlaying: boolean) => {
    fab.textContent = isPlaying ? "⏸" : "▶";
    fab.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    fab.setAttribute("aria-label", isPlaying ? "Pausar música" : "Tocar música");
  };

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
      setFab(true);
    } catch {
      setFab(false);
    }
  };

  const pause = () => {
    audio.pause();
    setFab(false);
  };

  audio.addEventListener("loadedmetadata", seekToStart, { once: true });

  gateBtn.addEventListener("click", async () => {
    gate.hidden = true;
    fab.hidden = false;
    await play();
  });

  fab.addEventListener("click", async () => {
    if (audio.paused) await play();
    else pause();
  });

  audio.addEventListener("play", () => setFab(true));
  audio.addEventListener("pause", () => setFab(false));
}

function showError(err: unknown) {
  const box = qs<HTMLElement>("[data-error]");
  if (!box) return;
  box.hidden = false;
  box.textContent = `Erro: ${err instanceof Error ? err.message : String(err)}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const cfg = await loadConfig();
    applyConfig(cfg);
    setupMusic(cfg?.music);
    document.title = cfg?.event?.title ? `${cfg.event.title}` : "Convite";
  } catch (e) {
    console.error(e);
    showError(e);
  }
});

