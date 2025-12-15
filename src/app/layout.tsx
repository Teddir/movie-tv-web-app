import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";
import { RootProvider } from "@/components/providers/root-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WebsiteStructuredData } from "@/components/seo/structured-data";
import { GoogleAdSense } from "@/components/ads/google-adsense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elemescinema.vercel.app"),
  title: {
    default: "ElemesCinema - Discover Movies, TV Shows & People",
    template: "%s | ElemesCinema",
  },
  description:
    "Discover top-rated, trending, and upcoming movies, TV shows, and people. Browse popular films, TV series, and explore actor profiles powered by TMDB API.",
  keywords: [
    "movies",
    "TV shows",
    "television series",
    "actors",
    "directors",
    "entertainment",
    "film database",
    "movie ratings",
    "TV ratings",
    "watchlist",
    "movie discovery",
    "TV discovery",
  ],
  authors: [{ name: "ElemesCinema" }],
  creator: "ElemesCinema",
  publisher: "ElemesCinema",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elemescinema.vercel.app",
    siteName: "ElemesCinema",
    title: "ElemesCinema - Discover Movies, TV Shows & People",
    description:
      "Discover top-rated, trending, and upcoming movies, TV shows, and people. Browse popular films, TV series, and explore actor profiles.",
    images: [
      {
        url: "https://elemescinema.vercel.app/vercel.svg",
        width: 1200,
        height: 630,
        alt: "ElemesCinema - Movie and TV Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ElemesCinema - Discover Movies, TV Shows & People",
    description:
      "Discover top-rated, trending, and upcoming movies, TV shows, and people. Browse popular films, TV series, and explore actor profiles.",
    creator: "@elemescinema",
  },
  alternates: {
    canonical: "https://elemescinema.vercel.app",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = "https://elemescinema.vercel.app";

  const adsensePublisherId = process.env.GOOGLE_ADSENSE_PUBLISHER_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        {adsensePublisherId && (
          <GoogleAdSense publisherId={adsensePublisherId} />
        )}
        <WebsiteStructuredData
          url={baseUrl}
          name="ElemesCinema"
          description="Discover top-rated, trending, and upcoming movies, TV shows, and people powered by the TMDB API."
        />
        <RootProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <div className="pointer-events-none absolute inset-0 -z-10 gradient-bg" />
            <Suspense fallback={null}>
              <SiteHeader />
            </Suspense>
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
              {children}
            </main>
            <SiteFooter />
          </div>
        </RootProvider>
      </body>
    </html>
  );
}
