import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "FIFA26 visualizer",
  description:
    "Interactive visualisation of FIFA World Cup win probabilities across the tournament.",
  openGraph: {
    title: "FIFA26 visualizer",
    description:
      "Interactive visualisation of FIFA World Cup win probabilities across the tournament.",
    type: "website",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(max-width: 767px)", color: "#ffffff" },
    { media: "(prefers-color-scheme: light) and (min-width: 768px)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark) and (min-width: 768px)", color: "#474A4A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-dvh bg-background antialiased`}
    >
      <body className="flex min-h-dvh h-full w-full flex-col bg-background">{children}</body>
    </html>
  );
}
