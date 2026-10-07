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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://echo-ledger.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Echo Ledger — Never lose a promise again",
    template: "%s · Echo Ledger",
  },
  description:
    "Turn calls, voice notes, and chat into tracked commitments. Who promised what, by when — your daily follow-up inbox.",
  keywords: [
    "commitment tracker",
    "follow-up",
    "voice to tasks",
    "promise ledger",
    "Echo Ledger",
  ],
  authors: [{ name: "Echo Ledger" }],
  openGraph: {
    title: "Echo Ledger — Never lose a promise again",
    description:
      "Turn voice and chat into tracked commitments. Built by a founder who lived the follow-up chaos.",
    url: siteUrl,
    siteName: "Echo Ledger",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Echo Ledger — Never lose a promise again",
    description:
      "Turn voice and chat into tracked commitments. Who promised what, by when.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2ff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
