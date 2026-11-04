import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Schriften liegen lokal in design/fonts (Inter und JetBrains Mono, beide SIL Open Font License 1.1).
const inter = localFont({
  src: [
    { path: "../design/fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../design/fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});
const jbMono = localFont({
  src: [{ path: "../design/fonts/jetbrains-mono-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-jb-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WORLDMONITOR",
  description: "Persönliches Geopolitik-Briefing aus öffentlichen Quellen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${jbMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
