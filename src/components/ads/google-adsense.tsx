"use client";

import Script from "next/script";

interface GoogleAdSenseProps {
  publisherId: string;
}

export function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
  if (!publisherId) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      onError={(e) => {
        console.error("AdSense script failed to load", e);
      }}
    />
  );
}

