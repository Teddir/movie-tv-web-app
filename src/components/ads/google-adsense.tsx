"use client";

import { useEffect } from "react";

interface GoogleAdSenseProps {
  publisherId: string;
}

export function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
  useEffect(() => {
    if (!publisherId) return;

    // Check if script already exists
    const existingScript = document.querySelector(
      `script[src*="adsbygoogle.js"]`
    );
    if (existingScript) return;

    // Create and inject the AdSense script
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = (e) => {
      console.error("AdSense script failed to load", e);
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector(
        `script[src*="adsbygoogle.js"]`
      );
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [publisherId]);

  return null;
}

