import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";

import "./globals.css";

/**
 * `next/font` downloads these at build time and serves them from our own
 * origin, so a visitor's browser never talks to Google. Nothing to fetch at
 * runtime, and the print pipeline always has the font available.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Assignment Cover Generator",
  description:
    "Build a professional university assignment cover page, preview it live, then print, save as PDF, or email it. Free, no account, everything stays in your browser.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The preview is a fixed-width page; users need to pinch-zoom it on phones.
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
