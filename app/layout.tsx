import type { Metadata, Viewport } from "next";
import "./globals.css";
import { config } from "../lib/config";

const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const title = config.event?.title ?? "Convite";
const description = config.event?.subtitle ?? "Convite de festa.";
const ogImage = "/assets/partyImages/14.jpeg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/assets/logosbpng.png",
    apple: "/assets/logosbpng.png",
  },
  openGraph: {
    title,
    description,
    images: [ogImage],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B2E33",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
