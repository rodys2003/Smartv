import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getR2Url } from "@/lib/r2";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Smart TV Like a Pro | Optimización y Personalización Global",
  description: "Servicio global de optimización de Smart TVs, launchers ultra-livianos de bajo consumo y personalización temática (Anime, Gamer, Cine). Toma tu turno y te atendemos 1 a 1 por WhatsApp.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Smart TV Like a Pro | Optimización y Personalización Global",
    description: "Convierte tu Smart TV en una máquina rápida con launchers de bajo consumo y temas premium.",
    images: [{ url: getR2Url('/images/logo.jpg') }],
  },
};

export const viewport: Viewport = {
  themeColor: "#060913",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100">
        {children}
      </body>
    </html>
  );
}
