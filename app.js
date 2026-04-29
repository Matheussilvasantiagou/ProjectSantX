"use strict";
(() => {
  // src/app.ts
  var mosaicResizeControllers = /* @__PURE__ */ new WeakMap();
  var mosaicLastViewport = /* @__PURE__ */ new WeakMap();
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
      const img = a.querySelector("img");
      if (img) setImageFallback(img, "assets/partyImages/1.jpeg");
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
      const img = a.querySelector("img");
      if (img) setImageFallback(img, "assets/local/1.jpeg");
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
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }
  function setImageFallback(img, fallbackSrc) {
    const fb = String(fallbackSrc != null ? fallbackSrc : "").trim();
    if (!fb) return;
    img.addEventListener(
      "error",
      () => {
        var _a;
        if (((_a = img.dataset) == null ? void 0 : _a.fallbackApplied) === "1") return;
        img.dataset.fallbackApplied = "1";
        img.src = fb;
      },
      { once: true }
    );
  }
  function setVisualVhCssVar() {
    var _a, _b, _c, _d;
    const vh = (_b = (_a = window.visualViewport) == null ? void 0 : _a.height) != null ? _b : window.innerHeight;
    const vvh = Math.max(1, vh) / 100;
    document.documentElement.style.setProperty("--vvh", `${vvh}px`);
    const vw = (_d = (_c = window.visualViewport) == null ? void 0 : _c.width) != null ? _d : window.innerWidth;
    const vvw = Math.max(1, vw) / 100;
    document.documentElement.style.setProperty("--vvw", `${vvw}px`);
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
    const mosaicClone = qs("[data-bg-mosaic-clone]");
    const mosaicTrack = qs("[data-bg-mosaic-track]");
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
        if (mosaicClone) mosaicClone.innerHTML = "";
        return;
      }
      layerA.classList.remove("is-on");
      layerB.classList.remove("is-on");
      mosaicRoot.style.display = "grid";
      renderMosaic(mosaicRoot, media, bg == null ? void 0 : bg.mosaic);
      if (mosaicClone) {
        mosaicClone.style.display = "grid";
        mosaicClone.innerHTML = mosaicRoot.innerHTML;
        const tile = mosaicRoot.style.getPropertyValue("--tile");
        const gap = mosaicRoot.style.getPropertyValue("--gap");
        if (tile) mosaicClone.style.setProperty("--tile", tile);
        if (gap) mosaicClone.style.setProperty("--gap", gap);
      }
      if (mosaicTrack) {
        mosaicTrack.style.animation = "none";
        mosaicTrack.getBoundingClientRect();
        mosaicTrack.style.animation = "";
      }
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
      if (mosaicClone) mosaicClone.innerHTML = "";
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const isMobile = window.matchMedia("(max-width: 560px)").matches;
    const tileMinRaw = isMobile ? Number((_b = (_a = mosaicCfg == null ? void 0 : mosaicCfg.tileMinMobile) != null ? _a : mosaicCfg == null ? void 0 : mosaicCfg.tileMin) != null ? _b : 50) : Number((_d = (_c = mosaicCfg == null ? void 0 : mosaicCfg.tileMinDesktop) != null ? _c : mosaicCfg == null ? void 0 : mosaicCfg.tileMin) != null ? _d : 120);
    const tileMin = Math.max(16, tileMinRaw);
    const tileMax = Math.max(tileMin, Number((_e = mosaicCfg == null ? void 0 : mosaicCfg.tileMax) != null ? _e : 220));
    const gap = Math.max(0, Number((_f = mosaicCfg == null ? void 0 : mosaicCfg.gap) != null ? _f : 6));
    const pickTile = () => {
      const size = isMobile ? Math.round(tileMin) : Math.round(tileMin + (tileMax - tileMin) * Math.random());
      root.style.setProperty("--tile", `${size}px`);
      root.style.setProperty("--gap", `${gap}px`);
    };
    pickTile();
    root.innerHTML = "";
    const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);
    const isImage = (src) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src);
    const isJpegOnly = (src) => /\.jpeg$/i.test(src);
    const vh = (_h = (_g = window.visualViewport) == null ? void 0 : _g.height) != null ? _h : window.innerHeight;
    const vw = (_j = (_i = window.visualViewport) == null ? void 0 : _i.width) != null ? _j : window.innerWidth;
    const tile = Math.max(16, Math.round(Number(root.style.getPropertyValue("--tile").replace("px", "")) || tileMin));
    const step = Math.max(1, tile + gap);
    const cols = Math.max(2, Math.floor((vw + gap) / step));
    const rows = Math.max(2, Math.ceil((vh + gap) / step));
    const base = cols * rows;
    const slack = isMobile ? 1.55 : 1.8;
    const minTiles = Math.max(base, isMobile ? 14 : 26);
    const maxTiles = isMobile ? Math.max(40, base * 3) : Math.max(120, base * 4);
    const count = clampInt(Math.round(base * slack), minTiles, maxTiles);
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
      const tile2 = document.createElement("div");
      tile2.className = "bg__tile";
      if (!isJpegOnly(src)) tile2.classList.add("bg__tile--tall");
      if (isVideo(src)) {
        const v = document.createElement("video");
        v.src = src;
        forceMutedInline(v);
        v.loop = true;
        v.autoplay = true;
        v.preload = "metadata";
        tile2.appendChild(v);
        v.play().catch(() => {
        });
      } else if (isImage(src)) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        tile2.appendChild(img);
      } else {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        tile2.appendChild(img);
      }
      root.appendChild(tile2);
    }
    (_k = mosaicResizeControllers.get(root)) == null ? void 0 : _k.abort();
    const controller = new AbortController();
    mosaicResizeControllers.set(root, controller);
    let t = 0;
    const onResize = () => {
      var _a2, _b2;
      const w = window.innerWidth;
      const h = (_b2 = (_a2 = window.visualViewport) == null ? void 0 : _a2.height) != null ? _b2 : window.innerHeight;
      const last = mosaicLastViewport.get(root);
      mosaicLastViewport.set(root, { w, h });
      if (isMobile && last) {
        const dw = Math.abs(w - last.w);
        const dh = Math.abs(h - last.h);
        if (dw < 2 && dh < 120) return;
      }
      window.clearTimeout(t);
      t = window.setTimeout(() => renderMosaic(root, media, mosaicCfg), 220);
    };
    window.addEventListener("resize", onResize, { passive: true, signal: controller.signal });
  }
  function setupActiveNav() {
    var _a, _b;
    const chips = Array.from(document.querySelectorAll(".chip[data-nav]"));
    if (!chips.length) return;
    const byId = /* @__PURE__ */ new Map();
    for (const chip of chips) {
      const id = chip.getAttribute("data-nav");
      if (id) byId.set(id, chip);
    }
    const sectionIds = Array.from(byId.keys());
    const sections = sectionIds.map((id) => document.getElementById(id)).filter((el) => !!el);
    if (!sections.length) return;
    const setActive = (id) => {
      for (const [k, chip] of byId) chip.classList.toggle("is-active", k === id);
    };
    setActive((_b = (_a = sections[0]) == null ? void 0 : _a.id) != null ? _b : "info");
    const io = new IntersectionObserver(
      (entries) => {
        var _a2;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => {
          var _a3, _b2;
          return ((_a3 = b.intersectionRatio) != null ? _a3 : 0) - ((_b2 = a.intersectionRatio) != null ? _b2 : 0);
        });
        const top = (_a2 = visible[0]) == null ? void 0 : _a2.target;
        if (top == null ? void 0 : top.id) setActive(top.id);
      },
      {
        root: null,
        rootMargin: "-90px 0px -55% 0px",
        threshold: [0.12, 0.25, 0.35, 0.5, 0.7]
      }
    );
    for (const el of sections) io.observe(el);
  }
  function setupStickyCta() {
    const sticky = qs("[data-sticky-cta]");
    if (!sticky) return null;
    const footer = qs(".footer");
    const onMobile = () => window.matchMedia("(max-width: 560px)").matches;
    let rsvpAvailable = false;
    let footerInView = false;
    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const shouldShow = onMobile() && rsvpAvailable && !footerInView && y > 240;
      sticky.hidden = !shouldShow;
    };
    if (footer) {
      const io = new IntersectionObserver(
        (entries) => {
          var _a;
          footerInView = !!((_a = entries[0]) == null ? void 0 : _a.isIntersecting);
          update();
        },
        { root: null, threshold: 0.01 }
      );
      io.observe(footer);
    }
    window.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", () => requestAnimationFrame(update), { passive: true });
    update();
    return {
      setAvailable: (available) => {
        rsvpAvailable = available;
        update();
      }
    };
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
  function forceMutedInline(v) {
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
  }
  function buildWhatsappLink(phoneE164, prefill) {
    const phone = String(phoneE164 != null ? phoneE164 : "").replace(/[^\d+]/g, "");
    const text = String(prefill != null ? prefill : "");
    if (!phone) return "";
    const encoded = encodeURIComponent(text).replace(/%250A/g, "%0A");
    const digits = phone.replace(/\+/g, "");
    return `https://wa.me/${digits}?text=${encoded}`;
  }
  function applyConfig(cfg) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H;
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
    const rsvpBtns = document.querySelectorAll("[data-rsvp-btn]");
    for (const rsvpBtn of rsvpBtns) {
      rsvpBtn.textContent = rsvpCta;
      if (rsvpEnabled && rsvpLink) {
        rsvpBtn.href = rsvpLink;
        rsvpBtn.hidden = false;
      } else {
        rsvpBtn.hidden = true;
      }
    }
    (_j = (_i = globalThis.__stickyCta) == null ? void 0 : _i.setAvailable) == null ? void 0 : _j.call(_i, !!(rsvpEnabled && rsvpLink));
    setEnabled("about", !!((_k = sections == null ? void 0 : sections.about) == null ? void 0 : _k.enabled));
    setText("about.title", (_l = sections == null ? void 0 : sections.about) == null ? void 0 : _l.title);
    setText("about.text", (_m = sections == null ? void 0 : sections.about) == null ? void 0 : _m.text);
    setEnabled("important", !!((_n = sections == null ? void 0 : sections.important) == null ? void 0 : _n.enabled));
    setText("important.title", (_o = sections == null ? void 0 : sections.important) == null ? void 0 : _o.title);
    renderBullets("[data-important]", (_q = (_p = sections == null ? void 0 : sections.important) == null ? void 0 : _p.bullets) != null ? _q : []);
    setEnabled("rules", !!((_r = sections == null ? void 0 : sections.rules) == null ? void 0 : _r.enabled));
    setText("rules.title", (_s = sections == null ? void 0 : sections.rules) == null ? void 0 : _s.title);
    renderBullets("[data-rules]", (_u = (_t = sections == null ? void 0 : sections.rules) == null ? void 0 : _t.bullets) != null ? _u : []);
    setEnabled("whatToBring", !!((_v = sections == null ? void 0 : sections.whatToBring) == null ? void 0 : _v.enabled));
    setText("whatToBring.title", (_w = sections == null ? void 0 : sections.whatToBring) == null ? void 0 : _w.title);
    renderBullets("[data-whatToBring]", (_y = (_x = sections == null ? void 0 : sections.whatToBring) == null ? void 0 : _x.bullets) != null ? _y : []);
    setEnabled("gallery", !!((_z = sections == null ? void 0 : sections.gallery) == null ? void 0 : _z.enabled));
    setText("gallery.title", (_A = sections == null ? void 0 : sections.gallery) == null ? void 0 : _A.title);
    renderGallery((_C = (_B = sections == null ? void 0 : sections.gallery) == null ? void 0 : _B.images) != null ? _C : []);
    setEnabled("faq", !!((_D = sections == null ? void 0 : sections.faq) == null ? void 0 : _D.enabled));
    setText("faq.title", (_E = sections == null ? void 0 : sections.faq) == null ? void 0 : _E.title);
    renderFaq((_G = (_F = sections == null ? void 0 : sections.faq) == null ? void 0 : _F.items) != null ? _G : []);
    for (const chip of document.querySelectorAll("[data-nav]")) {
      const id = chip.getAttribute("data-nav");
      const enabled = id ? !((_H = qs(`[data-section="${id}"]`)) == null ? void 0 : _H.hidden) : true;
      chip.hidden = !enabled;
    }
  }
  function setupMusic(musicCfg) {
    var _a, _b, _c, _d, _e;
    const gate = qs("[data-gate]");
    const gateBtn = qs("[data-gate-btn]");
    const audio = qs("[data-audio]");
    const fab = qs("[data-musicfab]");
    if (!audio || !fab) return;
    const enabled = !!(musicCfg == null ? void 0 : musicCfg.enabled);
    const src = String((_a = musicCfg == null ? void 0 : musicCfg.src) != null ? _a : "").trim();
    const volume = clamp01((_b = musicCfg == null ? void 0 : musicCfg.volume) != null ? _b : 0.85);
    const loop = (musicCfg == null ? void 0 : musicCfg.loop) !== false;
    const startAtSecondsRaw = Number((_c = musicCfg == null ? void 0 : musicCfg.startAtSeconds) != null ? _c : 0);
    const startAtSeconds = Number.isFinite(startAtSecondsRaw) ? Math.max(0, startAtSecondsRaw) : 0;
    setTextAll("music.hint", (_d = musicCfg == null ? void 0 : musicCfg.hint) != null ? _d : "Toque para iniciar a m\xFAsica");
    if (gateBtn) gateBtn.textContent = (_e = musicCfg == null ? void 0 : musicCfg.startLabel) != null ? _e : "Abrir convite";
    if (!enabled || !src) {
      if (gate) gate.hidden = true;
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
    if (gate && gateBtn) {
      gateBtn.addEventListener("click", async () => {
        gate.hidden = true;
        fab.hidden = false;
        await play();
      });
    } else {
      fab.hidden = true;
      const unlock = async () => {
        fab.hidden = false;
        await play();
      };
      const onPointer = () => void unlock();
      const onKey = (e) => {
        if (e.key === "Tab") return;
        void unlock();
      };
      window.addEventListener("pointerdown", onPointer, { once: true, passive: true });
      window.addEventListener("keydown", onKey, { once: true });
    }
    fab.addEventListener("click", async () => {
      if (audio.paused) await play();
      else pause();
    });
    audio.addEventListener("play", () => setFab(true));
    audio.addEventListener("pause", () => setFab(false));
  }
  function preloadAssets(cfg) {
    var _a, _b, _c, _d;
    const isMobile = window.matchMedia("(max-width: 560px)").matches;
    const bg = (_a = cfg == null ? void 0 : cfg.background) != null ? _a : {};
    const sections = (_b = cfg == null ? void 0 : cfg.sections) != null ? _b : {};
    const ev = (_c = cfg == null ? void 0 : cfg.event) != null ? _c : {};
    const dedupe = (arr) => [...new Set(arr.filter(Boolean))];
    const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);
    const isImage = (src) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src);
    const backgroundMedia = Array.isArray(bg == null ? void 0 : bg.media) ? bg.media : [];
    const backgroundImages = Array.isArray(bg == null ? void 0 : bg.images) ? bg.images : [];
    const galleryImages = Array.isArray((_d = sections == null ? void 0 : sections.gallery) == null ? void 0 : _d.images) ? sections.gallery.images : [];
    const locationImages = Array.isArray(ev == null ? void 0 : ev.locationImages) ? ev.locationImages : [];
    const all = dedupe([...backgroundMedia, ...backgroundImages, ...locationImages, ...galleryImages]);
    const images = all.filter((s) => isImage(s));
    const videos = all.filter((s) => isVideo(s));
    for (const src of images) {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = src;
    }
    for (const src of videos) {
      const v = document.createElement("video");
      v.preload = "metadata";
      forceMutedInline(v);
      v.src = src;
      try {
        v.load();
      } catch (e) {
      }
    }
  }
  function showError(err) {
    const box = qs("[data-error]");
    if (!box) return;
    box.hidden = false;
    box.textContent = `Erro: ${err instanceof Error ? err.message : String(err)}`;
  }
  document.addEventListener("DOMContentLoaded", async () => {
    var _a, _b, _c;
    try {
      const syncViewportVars = () => setVisualVhCssVar();
      const syncViewportVarsRaf = () => requestAnimationFrame(syncViewportVars);
      syncViewportVars();
      setTimeout(syncViewportVars, 60);
      window.addEventListener("resize", syncViewportVarsRaf, { passive: true });
      window.addEventListener("orientationchange", syncViewportVarsRaf, { passive: true });
      window.addEventListener("scroll", syncViewportVarsRaf, { passive: true });
      (_a = window.visualViewport) == null ? void 0 : _a.addEventListener("resize", syncViewportVarsRaf, { passive: true });
      (_b = window.visualViewport) == null ? void 0 : _b.addEventListener("scroll", syncViewportVarsRaf, { passive: true });
      setupActiveNav();
      globalThis.__stickyCta = setupStickyCta();
      const onVis = () => {
        document.documentElement.style.setProperty("--mosaic-play", document.hidden ? "paused" : "running");
      };
      document.addEventListener("visibilitychange", onVis, { passive: true });
      onVis();
      const cfg = await loadConfig();
      applyConfig(cfg);
      setupMusic(cfg == null ? void 0 : cfg.music);
      const start = () => preloadAssets(cfg);
      if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 1200 });
      else globalThis.setTimeout(start, 250);
      document.title = ((_c = cfg == null ? void 0 : cfg.event) == null ? void 0 : _c.title) ? `${cfg.event.title}` : "Convite";
    } catch (e) {
      console.error(e);
      showError(e);
    }
  });
})();
//# sourceMappingURL=app.js.map
