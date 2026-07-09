import type { Metadata, Viewport } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

// Display: usada en marcadores, números de estadísticas y titulares -> personalidad "deportiva"
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

// Body: usada en texto general, muy legible en pantallas pequeñas
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://therealshow.vercel.app"),
  title: "The Real Show",
  description: "TRS es para siempre ⚽ — organiza los partidos, equipos, goles y rankings del grupo.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Real Show",
  },
  openGraph: {
    title: "The Real Show",
    description: "TRS es para siempre ⚽",
    siteName: "The Real Show",
    locale: "es_ES",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "The Real Show" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Real Show",
    description: "TRS es para siempre ⚽",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1215",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${rajdhani.variable} ${inter.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
