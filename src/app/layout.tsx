import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";
import { RootProvider } from "@/components/providers/root-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
    default: "ElemesCinema",
    template: "%s | ElemesCinema",
  },
  description:
    "Discover top-rated, trending, and upcoming movies, TV shows, and people powered by the TMDB API.",
  openGraph: {
    title: "ElemesCinema",
    description:
      "Discover top-rated, trending, and upcoming movies, TV shows, and people powered by the TMDB API.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElemesCinema",
    description:
      "Discover top-rated, trending, and upcoming movies, TV shows, and people powered by the TMDB API.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
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
