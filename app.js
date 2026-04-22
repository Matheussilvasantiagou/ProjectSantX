async function loadConfig() {
  const res = await fetch(`./config.json?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao carregar config.json (${res.status})`);
  return await res.json();
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function setText(id, value) {
  const el = qs(`[data-bind="${id}"]`);
  if (!el) return;
  el.textContent = value ?? "";
}

function setTextAll(id, value) {
  const els = document.querySelectorAll(`[data-bind="${id}"]`);
  for (const el of els) el.textContent = value ?? "";
}

function setHref(id, value) {
  const el = qs(`[data-href="${id}"]`);
  if (!el) return;
  if (!value) {
    el.setAttribute("aria-disabled", "true");
    el.removeAttribute("href");
    return;
  }
  el.setAttribute("href", value);
}

function setEnabled(sectionId, enabled) {
  const el = qs(`[data-section="${sectionId}"]`);
  if (!el) return;
  el.hidden = !enabled;
}

function renderBullets(targetSel, bullets = []) {
  const ul = qs(targetSel);
  if (!ul) return;
  ul.innerHTML = "";
  for (const b of bullets) {
    const li = document.createElement("li");
    li.textContent = b;
    ul.appendChild(li);
  }
}

function renderSchedule(items = []) {
  const root = qs("[data-schedule]");
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

function renderGallery(images = []) {
  const root = qs("[data-gallery]");
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

function renderLocationGallery(images = []) {
  const card = qs("[data-location-card]");
  const root = qs("[data-location-gallery]");
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

function renderFaq(items = []) {
  const root = qs("[data-faq]");
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

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s) {
  return String(s).replaceAll('"', "&quot;");
}

function setTheme(theme) {
  if (!theme) return;
  const r = document.documentElement;
  if (theme.accent) r.style.setProperty("--accent", theme.accent);
  if (theme.accent2) r.style.setProperty("--accent2", theme.accent2);
}

function setupBackground(bg) {
  const layerA = qs("[data-bg-layer='a']");
  const layerB = qs("[data-bg-layer='b']");
  const mosaicRoot = qs("[data-bg-mosaic]");
  const overlay = qs("[data-bg-overlay]");
  const vignette = qs("[data-bg-vignette]");
  const grain = qs("[data-grain]");
  if (!layerA || !layerB || !overlay || !vignette) return;

  const overlayStrength = clamp01(bg?.overlayStrength ?? 0.62);
  const vignetteStrength = clamp01(bg?.vignetteStrength ?? 0.55);
  overlay.style.opacity = String(overlayStrength);
  vignette.style.opacity = String(vignetteStrength);
  if (grain) grain.style.display = bg?.filmGrain ? "block" : "none";

  const mode = bg?.mode ?? "slideshow";

  // MODO MOSAICO (fotos/vídeos)
  if (mode === "mosaic" && mosaicRoot) {
    const media = Array.isArray(bg?.media) ? bg.media.filter(Boolean) : [];
    if (!media.length) {
      // fallback suave
      layerA.style.backgroundImage =
        "linear-gradient(135deg, rgba(var(--c-accent) / 0.22), rgba(var(--c-contrast) / 0.18))";
      layerA.classList.add("is-on");
      layerB.classList.remove("is-on");
      mosaicRoot.innerHTML = "";
      mosaicRoot.style.display = "none";
      return;
    }

    // esconde slideshow
    layerA.classList.remove("is-on");
    layerB.classList.remove("is-on");
    mosaicRoot.style.display = "grid";
    renderMosaic(mosaicRoot, media, bg?.mosaic);
    return;
  }

  // MODO SLIDESHOW (legado)
  const images = Array.isArray(bg?.images) ? bg.images.filter(Boolean) : [];
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

  const setLayer = (layer, src) => {
    layer.style.backgroundImage = `url("${src}")`;
  };

  setLayer(layerA, images[idx % images.length]);
  layerA.classList.add("is-on");
  layerB.classList.remove("is-on");
  if (mosaicRoot) {
    mosaicRoot.innerHTML = "";
    mosaicRoot.style.display = "none";
  }

  if (mode !== "slideshow" || images.length === 1) return;

  window.setInterval(() => {
    idx = (idx + 1) % images.length;
    const nextSrc = images[idx];
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

function renderMosaic(root, media, mosaicCfg) {
  // Config com defaults bons
  const tileMin = Math.max(80, Number(mosaicCfg?.tileMin ?? 120));
  const tileMax = Math.max(tileMin, Number(mosaicCfg?.tileMax ?? 220));
  const gap = Math.max(0, Number(mosaicCfg?.gap ?? 6));

  const pickTile = () => {
    const r = Math.random();
    // tile size aleatório dentro do range
    const size = Math.round(tileMin + (tileMax - tileMin) * r);
    root.style.setProperty("--tile", `${size}px`);
    root.style.setProperty("--gap", `${gap}px`);
  };
  pickTile();

  root.innerHTML = "";

  const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);
  const isImage = (src) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src);

  // Define uma quantidade de tiles baseada na tela
  const area = Math.max(1, window.innerWidth * window.innerHeight);
  const tileArea = Math.max(1, ((tileMin + tileMax) / 2) ** 2);
  const count = clampInt(Math.round((area / tileArea) * 1.35), 18, 72);

  for (let i = 0; i < count; i++) {
    const src = media[i % media.length];
    const tile = document.createElement("div");
    tile.className = "bg__tile";

    if (isVideo(src)) {
      const v = document.createElement("video");
      v.src = src;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = "metadata";
      tile.appendChild(v);
      // tenta tocar (alguns browsers só permitem se muted)
      v.play().catch(() => {});
    } else if (isImage(src)) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      tile.appendChild(img);
    } else {
      // fallback: trata como imagem
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      tile.appendChild(img);
    }

    root.appendChild(tile);
  }

  // Recria em resize (debounced)
  let t = 0;
  const onResize = () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => renderMosaic(root, media, mosaicCfg), 180);
  };
  window.addEventListener("resize", onResize, { passive: true });
}

function clampInt(n, min, max) {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function clamp01(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function buildWhatsappLink(phoneE164, prefill) {
  const phone = String(phoneE164 ?? "").replaceAll(/[^\d+]/g, "");
  const text = String(prefill ?? "");
  if (!phone) return "";
  const encoded = encodeURIComponent(text).replaceAll("%250A", "%0A");
  // wa.me aceita apenas dígitos no phone, sem +
  const digits = phone.replaceAll("+", "");
  return `https://wa.me/${digits}?text=${encoded}`;
}

function applyConfig(cfg) {
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
  renderLocationGallery(ev.locationImages);

  const rsvpEnabled = !!ev?.rsvp?.enabled;
  const rsvpCta = ev?.rsvp?.ctaText ?? "Confirmar presença";
  const rsvpLink = buildWhatsappLink(ev?.rsvp?.whatsappPhoneE164, ev?.rsvp?.whatsappPrefill);
  const rsvpBtn = qs("[data-rsvp-btn]");
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
  renderBullets("[data-rules]", sections?.rules?.bullets);

  setEnabled("schedule", !!sections?.schedule?.enabled);
  setText("schedule.title", sections?.schedule?.title);
  renderSchedule(sections?.schedule?.items);

  setEnabled("whatToBring", !!sections?.whatToBring?.enabled);
  setText("whatToBring.title", sections?.whatToBring?.title);
  renderBullets("[data-whatToBring]", sections?.whatToBring?.bullets);

  setEnabled("gallery", !!sections?.gallery?.enabled);
  setText("gallery.title", sections?.gallery?.title);
  renderGallery(sections?.gallery?.images);

  setEnabled("faq", !!sections?.faq?.enabled);
  setText("faq.title", sections?.faq?.title);
  renderFaq(sections?.faq?.items);

  // Nav: esconde chips de seções desabilitadas
  for (const chip of document.querySelectorAll("[data-nav]")) {
    const id = chip.getAttribute("data-nav");
    const enabled = id ? !qs(`[data-section="${id}"]`)?.hidden : true;
    chip.hidden = !enabled;
  }
}

function setupMusic(musicCfg) {
  const gate = qs("[data-gate]");
  const gateBtn = qs("[data-gate-btn]");
  const audio = qs("[data-audio]");
  const fab = qs("[data-musicfab]");
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
  audio.volume = volume;

  const setFab = (isPlaying) => {
    fab.textContent = isPlaying ? "⏸" : "▶";
    fab.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    fab.setAttribute("aria-label", isPlaying ? "Pausar música" : "Tocar música");
  };

  const seekToStart = () => {
    if (!startAtSeconds) return;
    try {
      // Só tenta setar se o browser já sabe a duração/metadata.
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = Math.min(startAtSeconds, Math.max(0, audio.duration - 0.25));
      }
    } catch {
      // Ignora (alguns browsers bloqueiam até a primeira interação)
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

function showError(err) {
  const box = qs("[data-error]");
  if (!box) return;
  box.hidden = false;
  box.textContent = `Erro: ${err?.message ?? String(err)}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const cfg = await loadConfig();
    applyConfig(cfg);
    setupMusic(cfg?.music);
    // coloca o título no <title> do browser
    document.title = cfg?.event?.title ? `${cfg.event.title}` : "Convite";
  } catch (e) {
    console.error(e);
    showError(e);
  }
});

