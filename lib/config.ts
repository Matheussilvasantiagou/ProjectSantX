import rawConfig from "../config.json";

export type ScheduleItem = { time?: string; label?: string; detail?: string };
export type FaqItem = { q?: string; a?: string };

export type BackgroundMosaicConfig = {
  tileMinMobile?: number;
  tileMinDesktop?: number;
  tileMax?: number;
  gap?: number;
  parallax?: number;
  videoChance?: number;
};

export type BackgroundConfig = {
  mode?: "slideshow" | "mosaic";
  images?: string[];
  media?: string[];
  intervalMs?: number;
  overlayStrength?: number;
  vignetteStrength?: number;
  filmGrain?: boolean;
  mosaic?: BackgroundMosaicConfig;
};

export type ThemeConfig = { accent?: string; accent2?: string };

export type MusicConfig = {
  enabled?: boolean;
  src?: string;
  startAtSeconds?: number;
  volume?: number;
  loop?: boolean;
  startLabel?: string;
  hint?: string;
};

export type SectionsConfig = {
  about?: { enabled?: boolean; title?: string; text?: string };
  important?: { enabled?: boolean; title?: string; bullets?: string[] };
  rules?: { enabled?: boolean; title?: string; bullets?: string[] };
  schedule?: { enabled?: boolean; title?: string; items?: ScheduleItem[] };
  whatToBring?: { enabled?: boolean; title?: string; bullets?: string[] };
  gallery?: { enabled?: boolean; title?: string; images?: string[] };
  faq?: { enabled?: boolean; title?: string; items?: FaqItem[] };
};

export type EventConfig = {
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

export type AppConfig = {
  event?: EventConfig;
  sections?: SectionsConfig;
  background?: BackgroundConfig;
  theme?: ThemeConfig;
  music?: MusicConfig;
};

export const config = rawConfig as AppConfig;

export function buildWhatsappLink(phoneE164?: string | null, prefill?: string | null) {
  const phone = String(phoneE164 ?? "").replace(/[^\d+]/g, "");
  const text = String(prefill ?? "");
  if (!phone) return "";
  const encoded = encodeURIComponent(text).replace(/%250A/g, "%0A");
  const digits = phone.replace(/\+/g, "");
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function clamp01(x: unknown) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function clampInt(n: unknown, min: number, max: number) {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

export const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);
export const isImage = (src: string) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src);
