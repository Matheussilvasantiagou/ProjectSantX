"use strict";
(() => {
  // src/app.ts
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
    el.textContent = value != null ? value : "";
  }
  function setTextAll(id, value) {
    const els = document.querySelectorAll(`[data-bind="${id}"]`);
    for (const el of els) el.textContent = value != null ? value : "";
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
    var _a, _b, _c;
    const root = qs("[data-schedule]");
    if (!root) return;
    root.innerHTML = "";
    for (const it of items) {
      const div = document.createElement("div");
      div.className = "titem";
      div.innerHTML = `
      <div class="titem__time">${escapeHtml((_a = it.time) != null ? _a : "")}</div>
      <div>
        <div class="titem__label">${escapeHtml((_b = it.label) != null ? _b : "")}</div>
        <div class="titem__detail">${escapeHtml((_c = it.detail) != null ? _c : "")}</div>
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
    var _a, _b;
    const root = qs("[data-faq]");
    if (!root) return;
    root.innerHTML = "";
    for (const it of items) {
      const d = document.createElement("details");
      d.className = "qa";
      const q = escapeHtml((_a = it.q) != null ? _a : "");
      const a = escapeHtml((_b = it.a) != null ? _b : "");
      d.innerHTML = `<summary>${q}</summary><p>${a}</p>`;
      root.appendChild(d);
    }
  }
  function escapeHtml(s) {
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
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
    var _a, _b, _c, _d;
    const layerA = qs("[data-bg-layer='a']");
    const layerB = qs("[data-bg-layer='b']");
    const mosaicRoot = qs("[data-bg-mosaic]");
    const overlay = qs("[data-bg-overlay]");
    const vignette = qs("[data-bg-vignette]");
    const grain = qs("[data-grain]");
    if (!layerA || !layerB || !overlay || !vignette) return;
    const overlayStrength = clamp01((_a = bg == null ? void 0 : bg.overlayStrength) != null ? _a : 0.62);
    const vignetteStrength = clamp01((_b = bg == null ? void 0 : bg.vignetteStrength) != null ? _b : 0.55);
    overlay.style.opacity = String(overlayStrength);
    vignette.style.opacity = String(vignetteStrength);
    if (grain) grain.style.display = (bg == null ? void 0 : bg.filmGrain) ? "block" : "none";
    const mode = (_c = bg == null ? void 0 : bg.mode) != null ? _c : "slideshow";
    if (mode === "mosaic" && mosaicRoot) {
      const media = Array.isArray(bg == null ? void 0 : bg.media) ? bg.media.filter(Boolean) : [];
      if (!media.length) {
        layerA.style.backgroundImage = "linear-gradient(135deg, rgba(var(--c-accent) / 0.22), rgba(var(--c-contrast) / 0.18))";
        layerA.classList.add("is-on");
        layerB.classList.remove("is-on");
        mosaicRoot.innerHTML = "";
        mosaicRoot.style.display = "none";
        return;
      }
      layerA.classList.remove("is-on");
      layerB.classList.remove("is-on");
      mosaicRoot.style.display = "grid";
      renderMosaic(mosaicRoot, media, bg == null ? void 0 : bg.mosaic);
      return;
    }
    const images = Array.isArray(bg == null ? void 0 : bg.images) ? bg.images.filter(Boolean) : [];
    if (!images.length) {
      layerA.style.backgroundImage = "linear-gradient(135deg, rgba(var(--c-accent) / 0.22), rgba(var(--c-contrast) / 0.18))";
      layerA.classList.add("is-on");
      layerB.classList.remove("is-on");
      if (mosaicRoot) {
        mosaicRoot.innerHTML = "";
        mosaicRoot.style.display = "none";
      }
      return;
    }
    const intervalMs = Math.max(2500, Number((_d = bg == null ? void 0 : bg.intervalMs) != null ? _d : 6500));
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
    var _a, _b, _c;
    const tileMin = Math.max(80, Number((_a = mosaicCfg == null ? void 0 : mosaicCfg.tileMin) != null ? _a : 120));
    const tileMax = Math.max(tileMin, Number((_b = mosaicCfg == null ? void 0 : mosaicCfg.tileMax) != null ? _b : 220));
    const gap = Math.max(0, Number((_c = mosaicCfg == null ? void 0 : mosaicCfg.gap) != null ? _c : 6));
    const pickTile = () => {
      const r = Math.random();
      const size = Math.round(tileMin + (tileMax - tileMin) * r);
      root.style.setProperty("--tile", `${size}px`);
      root.style.setProperty("--gap", `${gap}px`);
    };
    pickTile();
    root.innerHTML = "";
    const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);
    const isImage = (src) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src);
    const isJpegOnly = (src) => /\.jpeg$/i.test(src);
    const isMobile = window.matchMedia("(max-width: 560px)").matches;
    const area = Math.max(1, window.innerWidth * window.innerHeight);
    const tileArea = Math.max(1, ((tileMin + tileMax) / 2) ** 2);
    const density = isMobile ? 0.65 : 1.35;
    const minTiles = isMobile ? 10 : 18;
    const maxTiles = isMobile ? 22 : 72;
    const count = clampInt(Math.round(area / tileArea * density), minTiles, maxTiles);
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const baseMedia = isMobile ? media.filter((s) => !isVideo(s)) : media;
    const pool = shuffle([...baseMedia]);
    const chosen = pool.length <= count ? pool : pool.slice(0, count);
    if (!isMobile) {
      const videoIdx = media.findIndex((s) => isVideo(s));
      if (videoIdx >= 0 && !chosen.some((s) => isVideo(s))) {
        chosen[0] = media[videoIdx];
      }
    }
    for (let i = 0; i < count; i++) {
      const src = chosen[i % chosen.length];
      const tile = document.createElement("div");
      tile.className = "bg__tile";
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
        v.play().catch(() => {
        });
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
    const phone = String(phoneE164 != null ? phoneE164 : "").replaceAll(/[^\d+]/g, "");
    const text = String(prefill != null ? prefill : "");
    if (!phone) return "";
    const encoded = encodeURIComponent(text).replaceAll("%250A", "%0A");
    const digits = phone.replaceAll("+", "");
    return `https://wa.me/${digits}?text=${encoded}`;
  }
  function applyConfig(cfg) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F;
    const ev = (_a = cfg == null ? void 0 : cfg.event) != null ? _a : {};
    const sections = (_b = cfg == null ? void 0 : cfg.sections) != null ? _b : {};
    setTheme(cfg == null ? void 0 : cfg.theme);
    setupBackground(cfg == null ? void 0 : cfg.background);
    setTextAll("event.title", ev.title);
    setTextAll("event.subtitle", ev.subtitle);
    setTextAll("event.dateText", ev.dateText);
    setTextAll("event.timeText", ev.timeText);
    setTextAll("event.locationName", ev.locationName);
    setTextAll("event.locationAddress", ev.locationAddress);
    setHref("event.mapsUrl", ev.mapsUrl);
    renderLocationGallery((_c = ev.locationImages) != null ? _c : []);
    const rsvpEnabled = !!((_d = ev == null ? void 0 : ev.rsvp) == null ? void 0 : _d.enabled);
    const rsvpCta = (_f = (_e = ev == null ? void 0 : ev.rsvp) == null ? void 0 : _e.ctaText) != null ? _f : "Confirmar presen\xE7a";
    const rsvpLink = buildWhatsappLink((_g = ev == null ? void 0 : ev.rsvp) == null ? void 0 : _g.whatsappPhoneE164, (_h = ev == null ? void 0 : ev.rsvp) == null ? void 0 : _h.whatsappPrefill);
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
    setEnabled("about", !!((_i = sections == null ? void 0 : sections.about) == null ? void 0 : _i.enabled));
    setText("about.title", (_j = sections == null ? void 0 : sections.about) == null ? void 0 : _j.title);
    setText("about.text", (_k = sections == null ? void 0 : sections.about) == null ? void 0 : _k.text);
    setEnabled("rules", !!((_l = sections == null ? void 0 : sections.rules) == null ? void 0 : _l.enabled));
    setText("rules.title", (_m = sections == null ? void 0 : sections.rules) == null ? void 0 : _m.title);
    renderBullets("[data-rules]", (_o = (_n = sections == null ? void 0 : sections.rules) == null ? void 0 : _n.bullets) != null ? _o : []);
    setEnabled("schedule", !!((_p = sections == null ? void 0 : sections.schedule) == null ? void 0 : _p.enabled));
    setText("schedule.title", (_q = sections == null ? void 0 : sections.schedule) == null ? void 0 : _q.title);
    renderSchedule((_s = (_r = sections == null ? void 0 : sections.schedule) == null ? void 0 : _r.items) != null ? _s : []);
    setEnabled("whatToBring", !!((_t = sections == null ? void 0 : sections.whatToBring) == null ? void 0 : _t.enabled));
    setText("whatToBring.title", (_u = sections == null ? void 0 : sections.whatToBring) == null ? void 0 : _u.title);
    renderBullets("[data-whatToBring]", (_w = (_v = sections == null ? void 0 : sections.whatToBring) == null ? void 0 : _v.bullets) != null ? _w : []);
    setEnabled("gallery", !!((_x = sections == null ? void 0 : sections.gallery) == null ? void 0 : _x.enabled));
    setText("gallery.title", (_y = sections == null ? void 0 : sections.gallery) == null ? void 0 : _y.title);
    renderGallery((_A = (_z = sections == null ? void 0 : sections.gallery) == null ? void 0 : _z.images) != null ? _A : []);
    setEnabled("faq", !!((_B = sections == null ? void 0 : sections.faq) == null ? void 0 : _B.enabled));
    setText("faq.title", (_C = sections == null ? void 0 : sections.faq) == null ? void 0 : _C.title);
    renderFaq((_E = (_D = sections == null ? void 0 : sections.faq) == null ? void 0 : _D.items) != null ? _E : []);
    for (const chip of document.querySelectorAll("[data-nav]")) {
      const id = chip.getAttribute("data-nav");
      const enabled = id ? !((_F = qs(`[data-section="${id}"]`)) == null ? void 0 : _F.hidden) : true;
      chip.hidden = !enabled;
    }
  }
  function setupMusic(musicCfg) {
    var _a, _b, _c, _d, _e;
    const gate = qs("[data-gate]");
    const gateBtn = qs("[data-gate-btn]");
    const audio = qs("[data-audio]");
    const fab = qs("[data-musicfab]");
    if (!gate || !gateBtn || !audio || !fab) return;
    const enabled = !!(musicCfg == null ? void 0 : musicCfg.enabled);
    const src = String((_a = musicCfg == null ? void 0 : musicCfg.src) != null ? _a : "").trim();
    const volume = clamp01((_b = musicCfg == null ? void 0 : musicCfg.volume) != null ? _b : 0.85);
    const loop = (musicCfg == null ? void 0 : musicCfg.loop) !== false;
    const startAtSecondsRaw = Number((_c = musicCfg == null ? void 0 : musicCfg.startAtSeconds) != null ? _c : 0);
    const startAtSeconds = Number.isFinite(startAtSecondsRaw) ? Math.max(0, startAtSecondsRaw) : 0;
    setTextAll("music.hint", (_d = musicCfg == null ? void 0 : musicCfg.hint) != null ? _d : "Clique para entrar e iniciar a m\xFAsica");
    gateBtn.textContent = (_e = musicCfg == null ? void 0 : musicCfg.startLabel) != null ? _e : "Abrir convite";
    if (!enabled || !src) {
      gate.hidden = true;
      fab.hidden = true;
      return;
    }
    audio.src = src;
    audio.loop = loop;
    audio.volume = typeof volume === "number" ? volume : 0.85;
    const setFab = (isPlaying) => {
      fab.textContent = isPlaying ? "\u23F8" : "\u25B6";
      fab.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      fab.setAttribute("aria-label", isPlaying ? "Pausar m\xFAsica" : "Tocar m\xFAsica");
    };
    const seekToStart = () => {
      if (!startAtSeconds) return;
      try {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          audio.currentTime = Math.min(startAtSeconds, Math.max(0, audio.duration - 0.25));
        }
      } catch (e) {
      }
    };
    const play = async () => {
      try {
        seekToStart();
        await audio.play();
        setFab(true);
      } catch (e) {
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
    box.textContent = `Erro: ${err instanceof Error ? err.message : String(err)}`;
  }
  document.addEventListener("DOMContentLoaded", async () => {
    var _a;
    try {
      const cfg = await loadConfig();
      applyConfig(cfg);
      setupMusic(cfg == null ? void 0 : cfg.music);
      document.title = ((_a = cfg == null ? void 0 : cfg.event) == null ? void 0 : _a.title) ? `${cfg.event.title}` : "Convite";
    } catch (e) {
      console.error(e);
      showError(e);
    }
  });
})();
//# sourceMappingURL=app.js.map
