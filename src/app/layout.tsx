import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist, Geist_Mono, Jost, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fifaFutureBold = Jost({
  variable: "--font-fifa-future-bold",
  subsets: ["latin"],
});

const fifaMontserrat = Montserrat({
  variable: "--font-fifa-montserrat",
  subsets: ["latin"],
});

const fifaProximaNova = DM_Sans({
  variable: "--font-fifa-proxima-nova",
  subsets: ["latin"],
});

const fifaFontVariables = [
  fifaFutureBold.variable,
  fifaMontserrat.variable,
  fifaProximaNova.variable,
].join(" ");

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
      className={`${geistSans.variable} ${geistMono.variable} ${fifaFontVariables} h-full min-h-dvh bg-background antialiased`}
    >
      <body className="flex min-h-dvh h-full w-full flex-col bg-background">{children}</body>
    </html>
  );
}
