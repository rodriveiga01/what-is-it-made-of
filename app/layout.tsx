import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serifD = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-d",
  display: "swap",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const monoL = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-l",
  display: "swap",
});

export const metadata: Metadata = {
  title: "What Is It Made Of? — Take anything apart",
  description:
    "Type any physical thing. AI takes it apart layer by layer. How deep can you go?",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23080908'/%3E%3Ccircle cx='16' cy='16' r='6' fill='none' stroke='%23EDE7DB' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='%23FF4D00'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#080908",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serifD.variable} ${sans.variable} ${monoL.variable}`}>
      <body className="grain vignette min-h-screen">{children}</body>
    </html>
  );
}
