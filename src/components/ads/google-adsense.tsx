"use client";

import { useEffect } from "react";

interface GoogleAdSenseProps {
  publisherId: string;
}

export function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
  useEffect(() => {
    if (!publisherId) return;

    // Check if script already exists to avoid duplicates
    const existingScript = document.querySelector(
      'script[src*="adsbygoogle.js"]'
    );
    if (existingScript) return;

    try {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onerror = (e) => {
        console.error("AdSense script failed to load", e);
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error("Error appending AdSense script:", err);
    }
  }, [publisherId]);

  // This component only loads the script, it doesn't render anything
  return null;
}

